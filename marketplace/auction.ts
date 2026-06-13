import type { Event, EventTemplate } from '../core.ts'
import { MarketplaceAuction, MarketplaceAuctionBid, MarketplaceAuctionComplete } from '../kinds.ts'
import {
  amountFromTag,
  amountToTag,
  canonicalCurrency,
  currencyDecimals,
  now,
  normalizeMarketplaceAmount,
  parseJsonObject,
  parseOptionalInt,
  requireString,
  scaleAmountValue,
  sha256Hex,
  tagValue,
  type MarketplaceAmount,
} from './helper.ts'
import {
  parseParticipantTag,
  participantTag,
  type MarketplaceParticipantTag,
} from './participant.ts'
import {
  parseParticipantProofKeyTag,
  parseParticipantProofTag,
  participantProofKeyTag,
  participantProofTag,
  type ParticipantProofKeyTag,
  type OrderTemplate,
  type ParticipantProofTag,
} from './order.ts'
import { normalizeMarketplaceSeed } from './seed.ts'

export type MarketplaceAuctionTemplate = {
  d: string
  listingAnchor: string
  arbiterPubkey: string
  currency: string
  decimals: number
  auctionType?: 'english' | string
  startAt?: number
  endAt?: number
  maxEndAt?: number
  settlementGrace?: number
  startingBid?: string
  minIncrement?: string
  reserve?: string
  content?: Record<string, unknown>
  extraTags?: string[][]
  createdAt?: number
}

export type ParsedMarketplaceAuction = {
  event: Event
  d: string
  auctionAnchor: string
  listingAnchor: string
  arbiterPubkey: string
  currency: string
  decimals: number
  auctionType?: string
  startAt?: number
  endAt?: number
  maxEndAt?: number
  settlementGrace?: number
  startingBid?: string
  minIncrement?: string
  reserve?: string
  content: Record<string, unknown>
}

export type MarketplaceAuctionBidContent = {
  type: 'auction_bid'
  targetOrder?: Partial<OrderTemplate>
  data?: Record<string, unknown>
}

export type MarketplaceAuctionBidTemplate = {
  tradeId: string
  auctionAnchor: string
  listingAnchor: string
  bidChainId?: string
  amount: MarketplaceAmount
  participants?: MarketplaceParticipantTag[]
  participantProofs?: ParticipantProofTag[]
  participantProofKeys?: ParticipantProofKeyTag[]
  targetOrder?: Partial<OrderTemplate>
  data?: Record<string, unknown>
  extraTags?: string[][]
  createdAt?: number
}

export type ParsedMarketplaceAuctionBid = {
  event: Event
  tradeId: string
  auctionAnchor: string
  listingAnchor: string
  bidChainId?: string
  amount: MarketplaceAmount
  participants: MarketplaceParticipantTag[]
  participantProofs: ParticipantProofTag[]
  participantProofKeys: ParticipantProofKeyTag[]
  content: MarketplaceAuctionBidContent
}

export type MarketplaceAuctionCompleteStatus = 'closed' | 'reserve_not_met' | 'cancelled' | string

export type MarketplaceAuctionCompleteTemplate = {
  auctionAnchor: string
  listingAnchor?: string
  status: MarketplaceAuctionCompleteStatus
  winningBidId?: string
  winningPaymentId?: string
  promotedSettlementId?: string
  promotedOrderId?: string
  promotedPaymentId?: string
  winnerPubkey?: string
  finalAmount?: MarketplaceAmount
  data?: Record<string, unknown>
  extraTags?: string[][]
  createdAt?: number
}

export type ParsedMarketplaceAuctionComplete = {
  event: Event
  auctionAnchor: string
  listingAnchor?: string
  status: MarketplaceAuctionCompleteStatus
  winningBidId?: string
  winningPaymentId?: string
  promotedSettlementId?: string
  promotedOrderId?: string
  promotedPaymentId?: string
  winnerPubkey?: string
  finalAmount?: MarketplaceAmount
  content: Record<string, unknown>
}

export function auctionCompleteAppliesToAuction(
  auction: ParsedMarketplaceAuction,
  complete: ParsedMarketplaceAuctionComplete,
): boolean {
  if (complete.auctionAnchor !== auction.auctionAnchor) return false
  if (complete.event.pubkey !== auction.arbiterPubkey) return false
  if (
    complete.status !== 'cancelled' &&
    auction.endAt !== undefined &&
    complete.event.created_at < auction.endAt
  ) {
    return false
  }
  return true
}

function anchor(kind: number, pubkey: string, d: string): string {
  return `${kind}:${pubkey}:${d}`
}

function pubkeyFromAnchor(value: string, label: string): string {
  const [, pubkey] = value.split(':')
  if (!pubkey || !/^[a-f0-9]{64}$/.test(pubkey)) throw new Error(`Invalid ${label}`)
  return pubkey
}

function tagWithMarker(event: Event, name: string, marker: string): string | undefined {
  return event.tags.find(tag => tag[0] === name && tag[3] === marker)?.[1]
}

function amountFromEvent(event: Event, label: string): MarketplaceAmount {
  const amount = amountFromTag(event.tags.find(tag => tag[0] === 'amount'))
  if (amount) return amount
  const value = requireString(tagValue(event, 'amount'), `${label} amount`)
  const denomination = requireString(tagValue(event, 'currency'), `${label} currency`)
  const decimals = parseOptionalInt(tagValue(event, 'decimals'), `${label} decimals`)
  if (decimals === undefined || decimals < 0) throw new Error(`Invalid ${label} decimals`)
  return normalizeMarketplaceAmount({ value, denomination, decimals })
}

function maybeJson(content: string, label: string): Record<string, unknown> {
  if (!content) return {}
  return parseJsonObject(content, label)
}

function targetOrderFrom(value: unknown): Partial<OrderTemplate> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return value as Partial<OrderTemplate>
}

function buyerParticipant(participants: MarketplaceParticipantTag[]): MarketplaceParticipantTag | undefined {
  return participants.find(participant => participant.role === 'buyer')
}

const bidChainIdPattern = /^[a-f0-9]{64}$/

export function auctionAddress(auction: Event | ParsedMarketplaceAuction): string {
  if ('event' in auction) return auction.auctionAnchor
  if (auction.kind !== MarketplaceAuction) throw new Error('Invalid auction kind')
  const d = requireString(tagValue(auction, 'd'), 'auction d tag')
  return anchor(auction.kind, auction.pubkey, d)
}

export function auctionBidChainId(seed: string, auctionAnchor: string): string {
  return sha256Hex(`${normalizeMarketplaceSeed(seed)}${auctionAnchor}`)
}

export function generateAuctionEventTemplate(auction: MarketplaceAuctionTemplate): EventTemplate {
  const currency = canonicalCurrency(auction.currency)
  const decimals = currencyDecimals(currency) ?? auction.decimals
  const auctionAnchor = anchor(MarketplaceAuction, pubkeyFromAnchor(auction.listingAnchor, 'auction listing anchor'), auction.d)
  return {
    kind: MarketplaceAuction,
    created_at: auction.createdAt ?? now(),
    content: JSON.stringify(auction.content ?? {}),
    tags: [
      ['d', auction.d],
      ['a', auction.listingAnchor, '', 'listing'],
      ['a', auctionAnchor, '', 'auction'],
      ['p', auction.arbiterPubkey, '', 'auction-arbiter'],
      ['currency', currency],
      ['decimals', decimals.toString()],
      ['auction_type', auction.auctionType ?? 'english'],
      ...(auction.startAt !== undefined ? [['start_at', auction.startAt.toString()]] : []),
      ...(auction.endAt !== undefined ? [['end_at', auction.endAt.toString()]] : []),
      ...(auction.maxEndAt !== undefined ? [['max_end_at', auction.maxEndAt.toString()]] : []),
      ...(auction.settlementGrace !== undefined ? [['settlement_grace', auction.settlementGrace.toString()]] : []),
      ...(auction.startingBid ? [['starting_bid', auction.startingBid]] : []),
      ...(auction.minIncrement ? [['min_increment', auction.minIncrement]] : []),
      ...(auction.reserve ? [['reserve', auction.reserve]] : []),
      ...(auction.extraTags ?? []),
    ],
  }
}

export function parseAuctionEvent(event: Event): ParsedMarketplaceAuction {
  if (event.kind !== MarketplaceAuction) throw new Error('Invalid auction kind')
  const d = requireString(tagValue(event, 'd'), 'auction d tag')
  const auctionAnchor = anchor(event.kind, event.pubkey, d)
  const taggedAuctionAnchor = requireString(tagWithMarker(event, 'a', 'auction'), 'auction self anchor')
  if (taggedAuctionAnchor !== auctionAnchor) throw new Error('Auction self anchor does not match event address')
  const listingAnchor = requireString(tagWithMarker(event, 'a', 'listing') ?? tagValue(event, 'a'), 'auction listing anchor')
  const arbiterPubkey = requireString(
    event.tags.find(tag => tag[0] === 'p' && tag[3] === 'auction-arbiter')?.[1],
    'auction arbiter pubkey',
  )
  const rawDecimals = parseOptionalInt(tagValue(event, 'decimals'), 'auction decimals')
  if (rawDecimals === undefined || rawDecimals < 0) throw new Error('Invalid auction decimals')
  const currency = canonicalCurrency(requireString(tagValue(event, 'currency'), 'auction currency'))
  const decimals = currencyDecimals(currency) ?? rawDecimals
  const amountValue = (value: string | undefined): string | undefined => {
    if (value === undefined || rawDecimals === decimals) return value
    return scaleAmountValue(value, rawDecimals, decimals).toString()
  }
  return {
    event,
    d,
    auctionAnchor,
    listingAnchor,
    arbiterPubkey,
    currency,
    decimals,
    auctionType: tagValue(event, 'auction_type'),
    startAt: parseOptionalInt(tagValue(event, 'start_at'), 'auction start_at'),
    endAt: parseOptionalInt(tagValue(event, 'end_at'), 'auction end_at'),
    maxEndAt: parseOptionalInt(tagValue(event, 'max_end_at'), 'auction max_end_at'),
    settlementGrace: parseOptionalInt(tagValue(event, 'settlement_grace'), 'auction settlement_grace'),
    startingBid: amountValue(tagValue(event, 'starting_bid')),
    minIncrement: amountValue(tagValue(event, 'min_increment')),
    reserve: amountValue(tagValue(event, 'reserve')),
    content: maybeJson(event.content, 'auction content'),
  }
}

export function validateAuctionEvent(event: Event): boolean {
  try {
    parseAuctionEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function generateAuctionBidEventTemplate(bid: MarketplaceAuctionBidTemplate): EventTemplate {
  const amount = normalizeMarketplaceAmount(bid.amount)
  return {
    kind: MarketplaceAuctionBid,
    created_at: bid.createdAt ?? now(),
    content: JSON.stringify({
      type: 'auction_bid',
      ...(bid.targetOrder ? { targetOrder: bid.targetOrder } : {}),
      ...(bid.data ? { data: bid.data } : {}),
    } satisfies MarketplaceAuctionBidContent),
    tags: [
      ['a', bid.auctionAnchor, '', 'auction'],
      ['a', bid.listingAnchor, '', 'listing'],
      ['d', bid.tradeId],
      ...(bid.bidChainId ? [['bid_chain', bid.bidChainId]] : []),
      amountToTag('amount', amount),
      ['currency', amount.denomination],
      ['decimals', amount.decimals.toString()],
      ...(bid.participants ?? []).map(participantTag),
      ...(bid.participantProofs ?? []).map(participantProofTag),
      ...(bid.participantProofKeys ?? []).map(participantProofKeyTag),
      ...(bid.extraTags ?? []),
    ],
  }
}

export function parseAuctionBidEvent(event: Event): ParsedMarketplaceAuctionBid {
  if (event.kind !== MarketplaceAuctionBid) throw new Error('Invalid auction bid kind')
  const auctionAnchor = requireString(tagWithMarker(event, 'a', 'auction') ?? tagValue(event, 'a'), 'bid auction anchor')
  const listingAnchor = requireString(tagWithMarker(event, 'a', 'listing'), 'bid listing anchor')
  const participants = event.tags.map(parseParticipantTag).filter((tag): tag is MarketplaceParticipantTag => tag !== null)
  const buyer = buyerParticipant(participants)
  if (buyer && buyer.pubkey !== event.pubkey) throw new Error('Auction bid author must be the buyer trade key')
  const json = maybeJson(event.content, 'auction bid content')
  const type = json.type === undefined ? 'auction_bid' : json.type
  if (type !== 'auction_bid') throw new Error('Invalid auction bid content type')
  const tradeId = requireString(tagValue(event, 'd'), 'bid trade id')
  const bidChainId = tagValue(event, 'bid_chain')
  if (bidChainId !== undefined && !bidChainIdPattern.test(bidChainId)) {
    throw new Error('Invalid bid_chain tag')
  }
  if (tagValue(event, 'trade')) throw new Error('Auction bid trade tag is not supported; use d tag')
  return {
    event,
    tradeId,
    auctionAnchor,
    listingAnchor,
    ...(bidChainId ? { bidChainId } : {}),
    amount: amountFromEvent(event, 'bid'),
    participants,
    participantProofs: event.tags
      .map(parseParticipantProofTag)
      .filter((tag): tag is ParticipantProofTag => tag !== null),
    participantProofKeys: event.tags
      .map(parseParticipantProofKeyTag)
      .filter((tag): tag is ParticipantProofKeyTag => tag !== null),
    content: {
      type: 'auction_bid',
      ...(targetOrderFrom(json.targetOrder) ? { targetOrder: targetOrderFrom(json.targetOrder) } : {}),
      ...(json.data && typeof json.data === 'object' && !Array.isArray(json.data)
        ? { data: json.data as Record<string, unknown> }
        : {}),
    },
  }
}

export function validateAuctionBidEvent(event: Event): boolean {
  try {
    parseAuctionBidEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function generateAuctionCompleteEventTemplate(
  complete: MarketplaceAuctionCompleteTemplate,
): EventTemplate {
  return {
    kind: MarketplaceAuctionComplete,
    created_at: complete.createdAt ?? now(),
    content: JSON.stringify({
      type: 'auction_complete',
      status: complete.status,
      ...(complete.data ? { data: complete.data } : {}),
    }),
    tags: [
      ['a', complete.auctionAnchor, '', 'auction'],
      ...(complete.listingAnchor ? [['a', complete.listingAnchor, '', 'listing']] : []),
      ['status', complete.status],
      ...(complete.finalAmount ? [amountToTag('final_amount', complete.finalAmount)] : []),
      ...(complete.finalAmount ? [['currency', complete.finalAmount.denomination]] : []),
      ...(complete.winnerPubkey ? [['winner', complete.winnerPubkey]] : []),
      ...(complete.winningBidId ? [['e', complete.winningBidId, '', 'winning-bid']] : []),
      ...(complete.winningPaymentId ? [['e', complete.winningPaymentId, '', 'winning-payment']] : []),
      ...(complete.promotedSettlementId ? [['e', complete.promotedSettlementId, '', 'auction-promote']] : []),
      ...(complete.promotedOrderId ? [['e', complete.promotedOrderId, '', 'promoted-order']] : []),
      ...(complete.promotedPaymentId ? [['e', complete.promotedPaymentId, '', 'promoted-payment']] : []),
      ...(complete.extraTags ?? []),
    ],
  }
}

export function parseAuctionCompleteEvent(event: Event): ParsedMarketplaceAuctionComplete {
  if (event.kind !== MarketplaceAuctionComplete) throw new Error('Invalid auction complete kind')
  const refs = new Map<string, string>()
  for (const tag of event.tags) {
    if (tag[0] === 'e' && tag[1] && tag[3]) refs.set(tag[3], tag[1])
  }
  const content = maybeJson(event.content, 'auction complete content')
  return {
    event,
    auctionAnchor: requireString(tagWithMarker(event, 'a', 'auction') ?? tagValue(event, 'a'), 'auction complete anchor'),
    listingAnchor: tagWithMarker(event, 'a', 'listing'),
    status: requireString(tagValue(event, 'status'), 'auction complete status'),
    winningBidId: refs.get('winning-bid'),
    winningPaymentId: refs.get('winning-payment'),
    promotedSettlementId: refs.get('auction-promote'),
    promotedOrderId: refs.get('promoted-order'),
    promotedPaymentId: refs.get('promoted-payment'),
    winnerPubkey: tagValue(event, 'winner'),
    finalAmount: amountFromTag(event.tags.find(tag => tag[0] === 'final_amount')),
    content,
  }
}

export function validateAuctionCompleteEvent(event: Event): boolean {
  try {
    parseAuctionCompleteEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export const auctions = {
  template: generateAuctionEventTemplate,
  parse: parseAuctionEvent,
  validate: validateAuctionEvent,
  address: auctionAddress,
  bidChainId: auctionBidChainId,
  bidTemplate: generateAuctionBidEventTemplate,
  parseBid: parseAuctionBidEvent,
  validateBid: validateAuctionBidEvent,
  completeTemplate: generateAuctionCompleteEventTemplate,
  parseComplete: parseAuctionCompleteEvent,
  validateComplete: validateAuctionCompleteEvent,
}
