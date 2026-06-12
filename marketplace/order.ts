import type { Event, EventTemplate } from '../core.ts'
import { CommitAuthorization, MarketplaceOrder, StructuredMessage } from '../kinds.ts'
import { parseListingEvent } from './listing.ts'
import {
  generateOrderCancelEventTemplate,
  generateOrderPaymentAckEventTemplate,
  generateOrderPaymentEventTemplate,
  generateOrderPaymentNackEventTemplate,
  generateOrderPaymentSettlementEventTemplate,
  parseOrderCancelEvent,
  parseOrderPaymentAckEvent,
  parseOrderPaymentEvent,
  parseOrderPaymentNackEvent,
  parseOrderPaymentSettlementEvent,
} from './order-lifecycle.ts'
import { orderGroups } from './order-group.ts'
import { isOrderGroupRole, orderGroupIdForRoleParticipants, type OrderGroupRole } from './order-id.ts'
import { orderQueries } from './order-query.ts'
import {
  eventToArbitrationContextValue,
  isTransactionHash,
  normalizeMarketplaceAmount,
  now,
  parseAmount,
  parseEventJson,
  parseJsonObject,
  parseNonNegativeIntValue,
  parseOptionalInt,
  requireString,
  sha256Hex,
  sortedJson,
  tagValue,
  tagValues,
  type MarketplaceAmount,
  type PaymentProof,
} from './helper.ts'
import {
  parseParticipantTag,
  participantTag,
  type MarketplaceParticipantTag,
} from './participant.ts'
import {
  generateTradeKeyAuthorizationEventTemplate,
  hashParticipantProofPayload,
  parseParticipantProofKeyTag,
  parseParticipantProofTag,
  participantProofKeyTag,
  participantProofTag,
  type ParticipantProofKeyTag,
  type ParticipantProofTag,
} from './participant-proof.ts'

export type {
  ParticipantProofKeyTag,
  ParticipantProofTag,
  TradeKeyAuthorizationContent,
  TradeKeyAuthorizationTemplate,
} from './participant-proof.ts'

export {
  hashParticipantProofPayload,
  parseParticipantProofKeyTag,
  parseParticipantProofTag,
  participantProofKeyTag,
  participantProofTag,
} from './participant-proof.ts'

export type OrderContent = {
  start?: string
  end?: string
  quantity: number
  amount?: MarketplaceAmount
  listing?: Event
  recipient?: string
  commitAuthorization?: Event
}

export type ParsedOrder = {
  event: Event
  orderGroupId: string
  tradeId: string
  listingAnchor: string
  participants: MarketplaceParticipantTag[]
  participantProofs: ParticipantProofTag[]
  participantProofKeys: ParticipantProofKeyTag[]
  authorRole: OrderGroupRole
  publishedAt?: number
  content: OrderContent
}

export type OrderTemplate = Omit<OrderContent, 'quantity'> & {
  tradeId: string
  listingAnchor: string
  quantity?: number
  participants?: MarketplaceParticipantTag[]
  participantProofs?: ParticipantProofTag[]
  participantProofKeys?: ParticipantProofKeyTag[]
  extraTags?: string[][]
  publishedAt?: number
  createdAt?: number
}

export type CommitAuthorizationContent = {
  version: number
  commitHash: string
  hashAlg: 'sha256' | string
  committedFields: string[]
  role: string
}

export type CommitAuthorizationTemplate = {
  listingAnchor: string
  tradeId: string
  orderGroupId?: string
  commitHash: string
  role?: string
  hashAlg?: 'sha256' | string
  committedFields?: string[]
  createdAt?: number
}

export type ParsedStructuredMessage = {
  event: Event
  childEvent: Event
  conversation?: string
  recipients: MarketplaceParticipantTag[]
  alt: string[]
}

export type StructuredMessageTemplate = {
  childEvent: Event | string
  conversation?: string
  recipients?: MarketplaceParticipantTag[]
  alt?: string | string[]
  extraTags?: string[][]
  createdAt?: number
}

const listingAnchorRegex = /^\d+:[a-f0-9]{64}:.+$/
const committedOrderFields = ['amount', 'end', 'quantity', 'recipient', 'start']

function roleCounts(participants: MarketplaceParticipantTag[]): Map<OrderGroupRole, number> {
  const counts = new Map<OrderGroupRole, number>()
  for (const participant of participants) {
    if (!isOrderGroupRole(participant.role)) continue
    counts.set(participant.role, (counts.get(participant.role) ?? 0) + 1)
  }
  return counts
}

function requireSingleRole(counts: Map<OrderGroupRole, number>, role: OrderGroupRole): void {
  if ((counts.get(role) ?? 0) !== 1) throw new Error(`Order requires exactly one ${role} participant`)
}

function authorRole(event: Event, participants: MarketplaceParticipantTag[]): OrderGroupRole {
  const matches = participants.filter(
    participant => participant.pubkey === event.pubkey && isOrderGroupRole(participant.role),
  )
  if (matches.length !== 1) throw new Error('Order author must appear in exactly one role-tagged p tag')
  return matches[0].role as OrderGroupRole
}

function validateOrderParticipants(
  event: Event,
  orderGroupId: string,
  tradeId: string,
  participants: MarketplaceParticipantTag[],
): OrderGroupRole {
  const counts = roleCounts(participants)
  requireSingleRole(counts, 'buyer')
  requireSingleRole(counts, 'seller')
  if ((counts.get('arbiter') ?? 0) > 1) throw new Error('Order can include at most one arbiter participant')
  if (orderGroupIdForRoleParticipants(tradeId, participants) !== orderGroupId) {
    throw new Error('Order group id mismatch')
  }
  return authorRole(event, participants)
}

export function parseOrderContent(content: string): OrderContent {
  const json = parseJsonObject(content, 'order content')
  const quantity = json.quantity === undefined ? 1 : parseNonNegativeIntValue(json.quantity, 'quantity')
  if (quantity < 1) throw new Error('Invalid quantity')
  const amount = parseAmount(json.amount)
  const listing =
    json.listing === undefined ? undefined : parseEventJson(json.listing, 'listing')
  if (listing) parseListingEvent(listing)
  const commitAuthorization =
    json.commitAuthorization === undefined ? undefined : parseEventJson(json.commitAuthorization, 'commitAuthorization')
  return {
    ...(typeof json.start === 'string' ? { start: json.start } : {}),
    ...(typeof json.end === 'string' ? { end: json.end } : {}),
    quantity,
    ...(amount ? { amount } : {}),
    ...(listing ? { listing } : {}),
    ...(typeof json.recipient === 'string' ? { recipient: json.recipient } : {}),
    ...(commitAuthorization ? { commitAuthorization } : {}),
  }
}

export function validateOrderEvent(event: Event): boolean {
  try {
    parseOrderEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseOrderEvent(event: Event): ParsedOrder {
  if (event.kind !== MarketplaceOrder) throw new Error('Invalid order kind')
  const orderGroupId = requireString(tagValue(event, 'd'), 'order group id')
  const tradeId = requireString(tagValue(event, 'trade'), 'order trade id')
  const listingAnchor = requireString(tagValue(event, 'a'), 'order listing anchor')
  if (!listingAnchorRegex.test(listingAnchor)) throw new Error('Invalid listing anchor')
  const participants = event.tags.map(parseParticipantTag).filter((tag): tag is MarketplaceParticipantTag => tag !== null)
  const participantProofs = event.tags
    .map(parseParticipantProofTag)
    .filter((tag): tag is ParticipantProofTag => tag !== null)
  const participantProofKeys = event.tags
    .map(parseParticipantProofKeyTag)
    .filter((tag): tag is ParticipantProofKeyTag => tag !== null)
  const content = parseOrderContent(event.content)
  const role = validateOrderParticipants(event, orderGroupId, tradeId, participants)
  return {
    event,
    orderGroupId,
    tradeId,
    listingAnchor,
    participants,
    participantProofs,
    participantProofKeys,
    authorRole: role,
    publishedAt: parseOptionalInt(tagValue(event, 'published_at'), 'published_at'),
    content,
  }
}

export function generateOrderEventTemplate(order: OrderTemplate): EventTemplate {
  const createdAt = order.createdAt ?? now()
  const publishedAt = order.publishedAt ?? createdAt
  const participants = order.participants ?? []
  const orderGroupId = orderGroupIdForRoleParticipants(order.tradeId, participants)
  const content: OrderContent = {
    ...(order.start ? { start: order.start } : {}),
    ...(order.end ? { end: order.end } : {}),
    quantity: order.quantity ?? 1,
    ...(order.amount ? { amount: normalizeMarketplaceAmount(order.amount) } : {}),
    ...(order.listing ? { listing: order.listing } : {}),
    ...(order.recipient ? { recipient: order.recipient } : {}),
    ...(order.commitAuthorization ? { commitAuthorization: order.commitAuthorization } : {}),
  }
  return {
    kind: MarketplaceOrder,
    created_at: createdAt,
    content: JSON.stringify(content),
    tags: [
      ['a', order.listingAnchor],
      ['d', orderGroupId],
      ['trade', order.tradeId],
      ['published_at', publishedAt.toString()],
      ...participants.map(participantTag),
      ...(order.participantProofs ?? []).map(participantProofTag),
      ...(order.participantProofKeys ?? []).map(participantProofKeyTag),
      ...(order.extraTags ?? []),
    ],
  }
}

export function committedOrderTerms(content: OrderContent): Record<string, unknown> {
  const json: Record<string, unknown> = {
    ...(content.start ? { start: content.start } : {}),
    ...(content.end ? { end: content.end } : {}),
    quantity: content.quantity,
    ...(content.amount ? { amount: content.amount } : {}),
    ...(content.recipient ? { recipient: content.recipient } : {}),
  }
  return Object.fromEntries(
    Object.entries(json)
      .filter(([key]) => committedOrderFields.includes(key))
      .sort(([a], [b]) => a.localeCompare(b)),
  )
}

export function orderCommitHash(content: OrderContent): string {
  return sha256Hex(sortedJson(committedOrderTerms(content)))
}

export function generateCommitAuthorizationEventTemplate(auth: CommitAuthorizationTemplate): EventTemplate {
  return {
    kind: CommitAuthorization,
    created_at: auth.createdAt ?? now(),
    tags: [
      ['a', auth.listingAnchor],
      ['trade', auth.tradeId],
      ...(auth.orderGroupId ? [['d', auth.orderGroupId]] : []),
    ],
    content: JSON.stringify({
      version: 1,
      commitHash: auth.commitHash,
      hashAlg: auth.hashAlg ?? 'sha256',
      committedFields: [...(auth.committedFields ?? committedOrderFields)].sort(),
      role: auth.role ?? 'seller',
    }),
  }
}

export function validateStructuredMessageEvent(event: Event): boolean {
  try {
    parseStructuredMessageEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseStructuredMessageEvent(event: Event): ParsedStructuredMessage {
  if (event.kind !== StructuredMessage) throw new Error('Invalid structured message kind')
  return {
    event,
    childEvent: parseEventJson(event.content, 'structured message child event'),
    conversation: tagValue(event, 'conversation'),
    recipients: event.tags
      .map(parseParticipantTag)
      .filter((tag): tag is MarketplaceParticipantTag => tag !== null),
    alt: tagValues(event, 'alt'),
  }
}

export function generateStructuredMessageEventTemplate(message: StructuredMessageTemplate): EventTemplate {
  const alt = typeof message.alt === 'string' ? [message.alt] : (message.alt ?? [])
  return {
    kind: StructuredMessage,
    created_at: message.createdAt ?? now(),
    content: eventToArbitrationContextValue(message.childEvent),
    tags: [
      ...(message.recipients ?? []).map(participantTag),
      ...(message.conversation ? [['conversation', message.conversation]] : []),
      ...alt.map(value => ['alt', value]),
      ...(message.extraTags ?? []),
    ],
  }
}

export function paymentProofForEvm(opts: {
  driver: string
  txHash: string
  arbitrationService: Event | string
  paymentMethod: Event | string
}): PaymentProof {
  if (!isTransactionHash(opts.txHash)) throw new Error('Invalid EVM txHash')
  return {
    paymentProof: { driver: opts.driver, params: { txHash: opts.txHash } },
    arbitration: {
      arbitrationService: eventToArbitrationContextValue(opts.arbitrationService),
      paymentMethod: eventToArbitrationContextValue(opts.paymentMethod),
    },
  }
}

export function paymentProofForZap(opts: {
  driver: string
  receipt: Event | string
  recipientProfile: Event
}): PaymentProof {
  return {
    paymentProof: {
      driver: opts.driver,
      params: {
        receipt: typeof opts.receipt === 'string' ? opts.receipt : JSON.stringify(opts.receipt),
        recipientProfile: opts.recipientProfile,
      },
    },
  }
}

export const orders = {
  parse: parseOrderEvent,
  validate: validateOrderEvent,
  template: generateOrderEventTemplate,
  paymentTemplate: generateOrderPaymentEventTemplate,
  paymentAckTemplate: generateOrderPaymentAckEventTemplate,
  paymentNackTemplate: generateOrderPaymentNackEventTemplate,
  paymentSettlementTemplate: generateOrderPaymentSettlementEventTemplate,
  cancelTemplate: generateOrderCancelEventTemplate,
  parsePayment: parseOrderPaymentEvent,
  parsePaymentAck: parseOrderPaymentAckEvent,
  parsePaymentNack: parseOrderPaymentNackEvent,
  parsePaymentSettlement: parseOrderPaymentSettlementEvent,
  parseCancel: parseOrderCancelEvent,
  commitHash: orderCommitHash,
  committedTerms: committedOrderTerms,
  participantProofTag,
  parseParticipantProofTag,
  participantProofKeyTag,
  parseParticipantProofKeyTag,
  hashParticipantProofPayload,
  commitAuthorizationTemplate: generateCommitAuthorizationEventTemplate,
  tradeKeyAuthorizationTemplate: generateTradeKeyAuthorizationEventTemplate,
  identityPubkeys: orderQueries.identityPubkeys,
  filters: orderQueries.filters,
  search: orderQueries.search,
  subscribe: orderQueries.subscribe,
  groups: orderGroups,
}

export const structuredMessages = {
  parse: parseStructuredMessageEvent,
  validate: validateStructuredMessageEvent,
  template: generateStructuredMessageEventTemplate,
}
