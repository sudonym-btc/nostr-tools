import type { Event, EventTemplate } from '../core.ts'
import {
  MarketplaceOrderCancel,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
} from '../kinds.ts'
import {
  normalizeMarketplaceAmount,
  now,
  parseAmount,
  parseJsonObject,
  requireString,
  type MarketplaceAmount,
  type PaymentAckStatus,
  type PaymentNackStatus,
  type PaymentProof,
  type PaymentSettlementAction,
  type PaymentMethod,
} from './helper.ts'
import {
  parseParticipantTag,
  participantTag,
  type MarketplaceParticipantTag,
} from './participant.ts'
import { orderGroupIdForRoleParticipants } from './order-id.ts'
import {
  parsePaymentAmountKeyTag,
  parseSealedPaymentAmount,
  paymentAmountKeyTag,
  type PaymentAmountKeyTag,
  type SealedPaymentAmount,
} from './payment-amount.ts'
import {
  parsePaymentProof,
  parsePaymentProofKeyTag,
  parseSealedPaymentProof,
  paymentProofKeyTag,
  type PaymentProofKeyTag,
  type SealedPaymentProof,
} from './payment-proof.ts'

export type PaymentLifecycleAnchorMarker = 'listing' | 'auction'

export type PaymentLifecycleAnchor = {
  value: string
  marker: PaymentLifecycleAnchorMarker
}

export type PaymentLifecycleAnchors = {
  all: PaymentLifecycleAnchor[]
  listing?: string
  auction?: string
}

export type PaymentLifecycleRefs = {
  orders: string[]
  auctionBids: string[]
  auctionCompletes: string[]
  payments: string[]
  paymentAcks: string[]
  paymentNacks: string[]
  settlements: string[]
  cancels: string[]
}

export type ParsedPaymentLifecycleFields = {
  orderGroupId: string
  tradeId: string
  anchors: PaymentLifecycleAnchors
  participants: MarketplaceParticipantTag[]
  refs: PaymentLifecycleRefs
}

export type PaymentLifecycleTemplate = {
  orderGroupId?: string
  tradeId: string
  anchors: PaymentLifecycleAnchor[]
  participants?: MarketplaceParticipantTag[]
  refs?: Partial<PaymentLifecycleRefs>
  extraTags?: string[][]
  createdAt?: number
}

export type PaymentContent = {
  amount?: MarketplaceAmount
  sealedAmount?: SealedPaymentAmount
  proof?: PaymentProof
  sealedProof?: SealedPaymentProof
}

export type ParsedPayment = ParsedPaymentLifecycleFields & {
  event: Event
  content: PaymentContent
  paymentAmountKeys: PaymentAmountKeyTag[]
  paymentProofKeys: PaymentProofKeyTag[]
}

export type PaymentTemplate = PaymentLifecycleTemplate & {
  amount?: MarketplaceAmount
  sealedAmount?: SealedPaymentAmount
  proof: PaymentProof | SealedPaymentProof
  paymentAmountKeys?: PaymentAmountKeyTag[]
  paymentProofKeys?: PaymentProofKeyTag[]
}

export type PaymentAckContent = {
  status: PaymentAckStatus
  message?: string
}

export type ParsedPaymentAck = ParsedPaymentLifecycleFields & {
  event: Event
  content: PaymentAckContent
}

export type PaymentAckTemplate = PaymentLifecycleTemplate & PaymentAckContent

export type PaymentNackContent = {
  status: PaymentNackStatus
  message?: string
}

export type ParsedPaymentNack = ParsedPaymentLifecycleFields & {
  event: Event
  content: PaymentNackContent
}

export type PaymentNackTemplate = PaymentLifecycleTemplate & PaymentNackContent

export type PaymentSettlementOutput = {
  role?: string
  pubkey?: string
  amount?: string
  proofYs?: string[]
  data?: Record<string, unknown>
}

export type PaymentSettlementContent = {
  method: PaymentMethod
  action: PaymentSettlementAction
  inputs?: Array<Record<string, unknown>>
  outputs?: PaymentSettlementOutput[]
  /** Public settlement proof, when the driver explicitly permits disclosure. */
  proof?: PaymentProof
  /** Whole-proof ciphertext for confidential or bearer settlement results. */
  sealedProof?: SealedPaymentProof
  data?: Record<string, unknown>
}

export type ParsedPaymentSettlement = ParsedPaymentLifecycleFields & {
  event: Event
  content: PaymentSettlementContent
  paymentProofKeys: PaymentProofKeyTag[]
}

export type PaymentSettlementTemplate = PaymentLifecycleTemplate & PaymentSettlementContent & {
  paymentProofKeys?: PaymentProofKeyTag[]
}

export type OrderCancelContent = {
  reason?: string
}

export type ParsedOrderCancel = ParsedPaymentLifecycleFields & {
  event: Event
  content: OrderCancelContent
}

export type OrderCancelTemplate = PaymentLifecycleTemplate & OrderCancelContent

function referenceTags(refs: Partial<PaymentLifecycleRefs> | undefined): string[][] {
  return [
    ...(refs?.orders ?? []).map(id => ['e', id, '', 'order']),
    ...(refs?.auctionBids ?? []).map(id => ['e', id, '', 'auction-bid']),
    ...(refs?.auctionCompletes ?? []).map(id => ['e', id, '', 'auction-complete']),
    ...(refs?.payments ?? []).map(id => ['e', id, '', 'payment']),
    ...(refs?.paymentAcks ?? []).map(id => ['e', id, '', 'payment-ack']),
    ...(refs?.paymentNacks ?? []).map(id => ['e', id, '', 'payment-nack']),
    ...(refs?.settlements ?? []).map(id => ['e', id, '', 'settlement']),
    ...(refs?.cancels ?? []).map(id => ['e', id, '', 'cancel']),
  ]
}

function linkedTags(template: PaymentLifecycleTemplate): string[][] {
  const orderGroupId =
    template.orderGroupId ?? orderGroupIdForRoleParticipants(template.tradeId, template.participants ?? [])
  if (!orderGroupId) throw new Error('Payment lifecycle event requires a group id')
  if (template.anchors.length === 0) throw new Error('Payment lifecycle event requires at least one anchor')
  return [
    ...template.anchors.map(anchor => ['a', anchor.value, '', anchor.marker]),
    ['d', orderGroupId],
    ['trade', template.tradeId],
    ...(template.participants ?? []).map(participantTag),
    ...referenceTags(template.refs),
    ...(template.extraTags ?? []),
  ]
}

function parsePaymentLifecycleAnchors(event: Event, label: string): PaymentLifecycleAnchors {
  const anchors: PaymentLifecycleAnchor[] = []
  for (const tag of event.tags) {
    if (tag[0] !== 'a' || !tag[1]) continue
    const marker = tag[3]
    if (marker !== 'listing' && marker !== 'auction') {
      throw new Error(`${label} anchor marker must be listing or auction`)
    }
    anchors.push({ value: tag[1], marker })
  }
  if (anchors.length === 0) throw new Error(`${label} requires at least one anchor`)
  return {
    all: anchors,
    listing: anchors.find(anchor => anchor.marker === 'listing')?.value,
    auction: anchors.find(anchor => anchor.marker === 'auction')?.value,
  }
}

export function paymentLifecycleHasAnchor(
  event: ParsedPaymentLifecycleFields,
  value: string,
  marker?: PaymentLifecycleAnchorMarker,
): boolean {
  return event.anchors.all.some(anchor => anchor.value === value && (!marker || anchor.marker === marker))
}

function linkedFields(event: Event, label: string): ParsedPaymentLifecycleFields {
  const refs: PaymentLifecycleRefs = {
    orders: [],
    auctionBids: [],
    auctionCompletes: [],
    payments: [],
    paymentAcks: [],
    paymentNacks: [],
    settlements: [],
    cancels: [],
  }
  for (const tag of event.tags) {
    if (tag[0] !== 'e' || !tag[1]) continue
    if (tag[3] === 'order') refs.orders.push(tag[1])
    else if (tag[3] === 'auction-bid' || tag[3] === 'bid') refs.auctionBids.push(tag[1])
    else if (tag[3] === 'auction-complete' || tag[3] === 'auction-close') refs.auctionCompletes.push(tag[1])
    else if (tag[3] === 'payment') refs.payments.push(tag[1])
    else if (tag[3] === 'payment-ack') refs.paymentAcks.push(tag[1])
    else if (tag[3] === 'payment-nack') refs.paymentNacks.push(tag[1])
    else if (tag[3] === 'settlement') refs.settlements.push(tag[1])
    else if (tag[3] === 'cancel') refs.cancels.push(tag[1])
  }
  return {
    orderGroupId: requireString(event.tags.find(tag => tag[0] === 'd')?.[1], `${label} order group id`),
    tradeId: requireString(event.tags.find(tag => tag[0] === 'trade')?.[1], `${label} trade id`),
    anchors: parsePaymentLifecycleAnchors(event, label),
    participants: event.tags
      .map(parseParticipantTag)
      .filter((tag): tag is MarketplaceParticipantTag => tag !== null),
    refs,
  }
}

function parsePaymentContent(content: string): PaymentContent {
  const json = parseJsonObject(content, 'payment content')
  const amount = parseAmount(json.amount)
  const sealedAmount = amount ? undefined : parseSealedPaymentAmount(json.amount)
  if (!amount && !sealedAmount) throw new Error('Payment event requires an amount')
  const sealedProof = parseSealedPaymentProof(json.proof)
  if (sealedProof) {
    return {
      ...(amount ? { amount } : {}),
      ...(sealedAmount ? { sealedAmount } : {}),
      sealedProof,
    }
  }
  const proof = parsePaymentProof(json.proof)
  if (!proof) throw new Error('Payment event requires a payment proof')
  return {
    ...(amount ? { amount } : {}),
    ...(sealedAmount ? { sealedAmount } : {}),
    proof,
  }
}

function parsePaymentAckContent(content: string): PaymentAckContent {
  const json = parseJsonObject(content, 'payment ack content')
  const status = requireString(json.status, 'payment ack status') as PaymentAckStatus
  if (status !== 'accepted') throw new Error('Invalid payment ack status')
  return {
    status,
    ...(typeof json.message === 'string' ? { message: json.message } : {}),
  }
}

function parsePaymentNackContent(content: string): PaymentNackContent {
  const json = parseJsonObject(content, 'payment nack content')
  const status = requireString(json.status, 'payment nack status') as PaymentNackStatus
  if (status !== 'rejected') throw new Error('Invalid payment nack status')
  return {
    status,
    ...(typeof json.message === 'string' ? { message: json.message } : {}),
  }
}

function parseSettlementContent(content: string): PaymentSettlementContent {
  const json = parseJsonObject(content, 'payment settlement content')
  const sealedProof = parseSealedPaymentProof(json.proof)
  const proof = sealedProof ? undefined : parsePaymentProof(json.proof)
  if (json.proof !== undefined && !sealedProof && !proof) {
    throw new Error('Invalid payment settlement proof')
  }
  return {
    method: requireString(json.method, 'payment settlement method'),
    action: requireString(json.action, 'payment settlement action'),
    ...(Array.isArray(json.inputs) ? { inputs: json.inputs as Array<Record<string, unknown>> } : {}),
    ...(Array.isArray(json.outputs) ? { outputs: json.outputs as PaymentSettlementOutput[] } : {}),
    ...(proof ? { proof } : {}),
    ...(sealedProof ? { sealedProof } : {}),
    ...(json.data && typeof json.data === 'object' && !Array.isArray(json.data)
      ? { data: json.data as Record<string, unknown> }
      : {}),
  }
}

function parseCancelContent(content: string): OrderCancelContent {
  const json = parseJsonObject(content || '{}', 'order cancel content')
  return {
    ...(typeof json.reason === 'string' ? { reason: json.reason } : {}),
  }
}

export function parsePaymentEvent(event: Event): ParsedPayment {
  if (event.kind !== MarketplacePayment) throw new Error('Invalid payment kind')
  const content = parsePaymentContent(event.content)
  return {
    event,
    ...linkedFields(event, 'payment'),
    paymentAmountKeys: event.tags
      .map(parsePaymentAmountKeyTag)
      .filter((tag): tag is PaymentAmountKeyTag => tag !== null),
    paymentProofKeys: event.tags
      .map(parsePaymentProofKeyTag)
      .filter((tag): tag is PaymentProofKeyTag => tag !== null),
    content,
  }
}

export function parsePaymentAckEvent(event: Event): ParsedPaymentAck {
  if (event.kind !== MarketplacePaymentAck) throw new Error('Invalid payment ack kind')
  return {
    event,
    ...linkedFields(event, 'payment ack'),
    content: parsePaymentAckContent(event.content),
  }
}

export function parsePaymentNackEvent(event: Event): ParsedPaymentNack {
  if (event.kind !== MarketplacePaymentNack) throw new Error('Invalid payment nack kind')
  return {
    event,
    ...linkedFields(event, 'payment nack'),
    content: parsePaymentNackContent(event.content),
  }
}

export function parsePaymentSettlementEvent(event: Event): ParsedPaymentSettlement {
  if (event.kind !== MarketplacePaymentSettlement) throw new Error('Invalid payment settlement kind')
  return {
    event,
    ...linkedFields(event, 'payment settlement'),
    paymentProofKeys: event.tags
      .map(parsePaymentProofKeyTag)
      .filter((tag): tag is PaymentProofKeyTag => tag !== null),
    content: parseSettlementContent(event.content),
  }
}

export function parseOrderCancelEvent(event: Event): ParsedOrderCancel {
  if (event.kind !== MarketplaceOrderCancel) throw new Error('Invalid order cancel kind')
  return {
    event,
    ...linkedFields(event, 'order cancel'),
    content: parseCancelContent(event.content),
  }
}

export function generatePaymentEventTemplate(payment: PaymentTemplate): EventTemplate {
  if (!payment.amount && !payment.sealedAmount) throw new Error('Payment event requires an amount')
  return {
    kind: MarketplacePayment,
    created_at: payment.createdAt ?? now(),
    content: JSON.stringify({
      amount: payment.amount ? normalizeMarketplaceAmount(payment.amount) : payment.sealedAmount,
      proof: payment.proof,
    }),
    tags: [
      ...linkedTags(payment),
      ...(payment.paymentAmountKeys ?? []).map(paymentAmountKeyTag),
      ...(payment.paymentProofKeys ?? []).map(paymentProofKeyTag),
    ],
  }
}

export function generatePaymentAckEventTemplate(ack: PaymentAckTemplate): EventTemplate {
  return {
    kind: MarketplacePaymentAck,
    created_at: ack.createdAt ?? now(),
    content: JSON.stringify({
      status: ack.status,
      ...(ack.message ? { message: ack.message } : {}),
    }),
    tags: linkedTags(ack),
  }
}

export function generatePaymentNackEventTemplate(nack: PaymentNackTemplate): EventTemplate {
  return {
    kind: MarketplacePaymentNack,
    created_at: nack.createdAt ?? now(),
    content: JSON.stringify({
      status: nack.status,
      ...(nack.message ? { message: nack.message } : {}),
    }),
    tags: linkedTags(nack),
  }
}

export function generatePaymentSettlementEventTemplate(
  settlement: PaymentSettlementTemplate,
): EventTemplate {
  if (settlement.proof && settlement.sealedProof) {
    throw new Error('Payment settlement cannot contain both public and sealed proofs')
  }
  return {
    kind: MarketplacePaymentSettlement,
    created_at: settlement.createdAt ?? now(),
    content: JSON.stringify({
      method: settlement.method,
      action: settlement.action,
      ...(settlement.inputs ? { inputs: settlement.inputs } : {}),
      ...(settlement.outputs ? { outputs: settlement.outputs } : {}),
      ...(settlement.proof ? { proof: settlement.proof } : {}),
      ...(settlement.sealedProof ? { proof: settlement.sealedProof } : {}),
      ...(settlement.data ? { data: settlement.data } : {}),
    }),
    tags: [
      ...linkedTags(settlement),
      ...(settlement.paymentProofKeys ?? []).map(paymentProofKeyTag),
    ],
  }
}

export function generateOrderCancelEventTemplate(cancel: OrderCancelTemplate): EventTemplate {
  return {
    kind: MarketplaceOrderCancel,
    created_at: cancel.createdAt ?? now(),
    content: JSON.stringify({
      ...(cancel.reason ? { reason: cancel.reason } : {}),
    }),
    tags: linkedTags(cancel),
  }
}

export const paymentLifecycle = {
  paymentTemplate: generatePaymentEventTemplate,
  paymentAckTemplate: generatePaymentAckEventTemplate,
  paymentNackTemplate: generatePaymentNackEventTemplate,
  paymentSettlementTemplate: generatePaymentSettlementEventTemplate,
  cancelTemplate: generateOrderCancelEventTemplate,
  parsePayment: parsePaymentEvent,
  parsePaymentAck: parsePaymentAckEvent,
  parsePaymentNack: parsePaymentNackEvent,
  parsePaymentSettlement: parsePaymentSettlementEvent,
  parseCancel: parseOrderCancelEvent,
}
