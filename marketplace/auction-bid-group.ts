import type { AbstractSimplePool, SubCloser, SubscribeManyParams } from '../abstract-pool.ts'
import type { Event } from '../core.ts'
import type { Filter } from '../filter.ts'
import {
  MarketplaceAuctionBid,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
} from '../kinds.ts'
import type { MarketplaceAmount, PTag } from './helper.ts'
import {
  parseAuctionBidEvent,
  type ParsedMarketplaceAuctionBid,
} from './auction.ts'
import {
  parseOrderPaymentAckEvent,
  parseOrderPaymentEvent,
  parseOrderPaymentNackEvent,
  parseOrderPaymentSettlementEvent,
  type ParsedOrderPayment,
  type ParsedOrderPaymentAck,
  type ParsedOrderPaymentNack,
  type ParsedOrderPaymentSettlement,
} from './order-lifecycle.ts'

export const auctionBidGroupEventKinds = [
  MarketplaceAuctionBid,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
]

export type AuctionBidGroupStage =
  | 'bid'
  | 'funded'
  | 'accepted'
  | 'rejected'
  | 'refunded'
  | 'promoted'
  | 'settled'

export type AuctionBidGroupEvent =
  | ParsedMarketplaceAuctionBid
  | ParsedOrderPayment
  | ParsedOrderPaymentAck
  | ParsedOrderPaymentNack
  | ParsedOrderPaymentSettlement

export type ParsedAuctionBidGroup = {
  id: string
  bidId: string
  tradeId: string
  auctionAnchor: string
  listingAnchor: string
  amount: MarketplaceAmount
  participants: PTag[]
  participantPubkeys: string[]
  bids: ParsedMarketplaceAuctionBid[]
  bid: ParsedMarketplaceAuctionBid
  payments: ParsedOrderPayment[]
  paymentAcks: ParsedOrderPaymentAck[]
  paymentNacks: ParsedOrderPaymentNack[]
  settlements: ParsedOrderPaymentSettlement[]
  events: AuctionBidGroupEvent[]
  ignoredEvents: AuctionBidGroupEvent[]
  payment?: ParsedOrderPayment
  paymentAck?: ParsedOrderPaymentAck
  paymentNack?: ParsedOrderPaymentNack
  settlement?: ParsedOrderPaymentSettlement
  stage: AuctionBidGroupStage
}

export type AuctionBidGroupQuery = {
  auctionAnchor: string
  bidIds?: string[]
  tradeIds?: string[]
  authors?: string[]
  participantPubkeys?: string[]
  since?: number
  until?: number
  limit?: number
}

export type AuctionBidGroupSearchOptions = {
  maxWait?: number
}

export type AuctionBidGroupSubscribeOptions =
  Pick<SubscribeManyParams, 'maxWait' | 'id' | 'label' | 'abort'>

export type AuctionBidGroupSubscribeHandlers = {
  onevent?: (event: AuctionBidGroupEvent) => void
  ongroup?: (group: ParsedAuctionBidGroup) => void
  ongroups?: (groups: ParsedAuctionBidGroup[]) => void
  oninvalid?: (event: Event, error: Error) => void
  oneose?: () => void
  onclose?: (reasons: string[]) => void
}

type AuctionBidGroupQueryPool = Pick<AbstractSimplePool, 'querySync'>
type AuctionBidGroupSubscribePool = Pick<AbstractSimplePool, 'subscribeMap'>

function unique(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function latestEvent<T extends AuctionBidGroupEvent>(left: T | undefined, right: T): T {
  if (!left) return right
  if (right.event.created_at !== left.event.created_at) {
    return right.event.created_at > left.event.created_at ? right : left
  }
  return right.event.id.localeCompare(left.event.id) > 0 ? right : left
}

function isParsedBid(event: AuctionBidGroupEvent): event is ParsedMarketplaceAuctionBid {
  return event.event.kind === MarketplaceAuctionBid
}

function isParsedPayment(event: AuctionBidGroupEvent): event is ParsedOrderPayment {
  return event.event.kind === MarketplacePayment
}

function isParsedPaymentAck(event: AuctionBidGroupEvent): event is ParsedOrderPaymentAck {
  return event.event.kind === MarketplacePaymentAck
}

function isParsedPaymentNack(event: AuctionBidGroupEvent): event is ParsedOrderPaymentNack {
  return event.event.kind === MarketplacePaymentNack
}

function isParsedSettlement(event: AuctionBidGroupEvent): event is ParsedOrderPaymentSettlement {
  return event.event.kind === MarketplacePaymentSettlement
}

function refsPayment(event: ParsedOrderPaymentAck | ParsedOrderPaymentNack | ParsedOrderPaymentSettlement, ids: Set<string>): boolean {
  return event.refs.payments.some(id => ids.has(id))
}

function sameBidGroup(event: AuctionBidGroupEvent, bid: ParsedMarketplaceAuctionBid): boolean {
  if (isParsedBid(event)) {
    return event.auctionAnchor === bid.auctionAnchor && event.bidId === bid.bidId
  }
  const sameSyntheticGroup =
    event.listingAnchor === bid.auctionAnchor &&
    event.orderGroupId === bid.bidId &&
    event.tradeId === bid.tradeId
  return sameSyntheticGroup || event.refs.auctionBids.includes(bid.event.id)
}

function groupStage(input: {
  payment?: ParsedOrderPayment
  paymentAck?: ParsedOrderPaymentAck
  paymentNack?: ParsedOrderPaymentNack
  settlement?: ParsedOrderPaymentSettlement
}): AuctionBidGroupStage {
  if (input.settlement) {
    if (input.settlement.content.action === 'auction_refund') return 'refunded'
    if (input.settlement.content.action === 'auction_promote') return 'promoted'
    return 'settled'
  }
  if (input.paymentNack) return 'rejected'
  if (input.paymentAck) return 'accepted'
  if (input.payment) return 'funded'
  return 'bid'
}

export function parseAuctionBidGroupEvent(event: Event | AuctionBidGroupEvent): AuctionBidGroupEvent {
  if ('event' in event) return event
  if (event.kind === MarketplaceAuctionBid) return parseAuctionBidEvent(event)
  if (event.kind === MarketplacePayment) return parseOrderPaymentEvent(event)
  if (event.kind === MarketplacePaymentAck) return parseOrderPaymentAckEvent(event)
  if (event.kind === MarketplacePaymentNack) return parseOrderPaymentNackEvent(event)
  if (event.kind === MarketplacePaymentSettlement) return parseOrderPaymentSettlementEvent(event)
  throw new Error('Invalid auction bid group event kind')
}

export function auctionBidGroupFilter(query: AuctionBidGroupQuery): Filter {
  return {
    kinds: auctionBidGroupEventKinds,
    '#a': [query.auctionAnchor],
    ...(query.bidIds && query.bidIds.length > 0 ? { '#d': unique(query.bidIds) } : {}),
    ...(query.tradeIds && query.tradeIds.length > 0 ? { '#trade': unique(query.tradeIds) } : {}),
    ...(query.authors && query.authors.length > 0 ? { authors: unique(query.authors) } : {}),
    ...(query.participantPubkeys && query.participantPubkeys.length > 0 ? { '#p': unique(query.participantPubkeys) } : {}),
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
  }
}

export function reduceAuctionBidGroup(
  events: Iterable<Event | AuctionBidGroupEvent>,
): ParsedAuctionBidGroup {
  const parsed = [...events].map(parseAuctionBidGroupEvent)
  if (parsed.length === 0) throw new Error('Auction bid group requires at least one event')

  const bidEvents = parsed.filter(isParsedBid)
  if (bidEvents.length === 0) throw new Error('Auction bid group requires a bid anchor')

  const bid = bidEvents.reduce<ParsedMarketplaceAuctionBid | undefined>(latestEvent, undefined)!
  const groupEvents = parsed.filter(event => sameBidGroup(event, bid))
  const ignoredEvents = parsed.filter(event => !sameBidGroup(event, bid))
  const bids = groupEvents.filter(isParsedBid)
  const bidEventIds = new Set(bids.map(item => item.event.id))

  const payments = groupEvents.filter(isParsedPayment).filter(payment => {
    const valid =
      payment.content.purpose === 'auction_bid' &&
      (
        payment.refs.auctionBids.some(id => bidEventIds.has(id)) ||
        (
          payment.listingAnchor === bid.auctionAnchor &&
          payment.orderGroupId === bid.bidId &&
          payment.tradeId === bid.tradeId
        )
      )
    if (!valid) ignoredEvents.push(payment)
    return valid
  })
  const payment = payments.reduce<ParsedOrderPayment | undefined>(latestEvent, undefined)
  const paymentIds = new Set(payments.map(item => item.event.id))

  const paymentAcks = groupEvents.filter(isParsedPaymentAck).filter(ack => {
    const valid = refsPayment(ack, paymentIds) || (
      ack.listingAnchor === bid.auctionAnchor &&
      ack.orderGroupId === bid.bidId &&
      ack.tradeId === bid.tradeId
    )
    if (!valid) ignoredEvents.push(ack)
    return valid
  })
  const paymentAck = paymentAcks.reduce<ParsedOrderPaymentAck | undefined>(latestEvent, undefined)

  const paymentNacks = groupEvents.filter(isParsedPaymentNack).filter(nack => {
    const valid = refsPayment(nack, paymentIds) || (
      nack.listingAnchor === bid.auctionAnchor &&
      nack.orderGroupId === bid.bidId &&
      nack.tradeId === bid.tradeId
    )
    if (!valid) ignoredEvents.push(nack)
    return valid
  })
  const paymentNack = paymentNacks.reduce<ParsedOrderPaymentNack | undefined>(latestEvent, undefined)

  const settlements = groupEvents.filter(isParsedSettlement).filter(settlement => {
    const valid = refsPayment(settlement, paymentIds) || settlement.refs.auctionBids.some(id => bidEventIds.has(id))
    if (!valid) ignoredEvents.push(settlement)
    return valid
  })
  const settlement = settlements.reduce<ParsedOrderPaymentSettlement | undefined>(latestEvent, undefined)
  const participantPubkeys = unique(bid.participants.map(participant => participant.pubkey)).sort((a, b) => a.localeCompare(b))

  return {
    id: bid.bidId,
    bidId: bid.bidId,
    tradeId: bid.tradeId,
    auctionAnchor: bid.auctionAnchor,
    listingAnchor: bid.listingAnchor,
    amount: bid.amount,
    participants: bid.participants,
    participantPubkeys,
    bids,
    bid,
    payments,
    paymentAcks,
    paymentNacks,
    settlements,
    events: groupEvents,
    ignoredEvents,
    ...(payment ? { payment } : {}),
    ...(paymentAck ? { paymentAck } : {}),
    ...(paymentNack ? { paymentNack } : {}),
    ...(settlement ? { settlement } : {}),
    stage: groupStage({ payment, paymentAck, paymentNack, settlement }),
  }
}

export function groupAuctionBidEvents(
  events: Iterable<Event | AuctionBidGroupEvent>,
): ParsedAuctionBidGroup[] {
  const parsed = [...events].map(parseAuctionBidGroupEvent)
  const bids = parsed.filter(isParsedBid)
  const buckets = new Map<string, AuctionBidGroupEvent[]>()
  for (const bid of bids) {
    const key = `${bid.auctionAnchor}:${bid.bidId}`
    buckets.set(key, parsed.filter(event => sameBidGroup(event, bid)))
  }
  return [...buckets.values()].map(reduceAuctionBidGroup)
}

export async function fetchAuctionBidGroups(
  pool: AuctionBidGroupQueryPool,
  relays: string[],
  query: AuctionBidGroupQuery,
  options: AuctionBidGroupSearchOptions = {},
): Promise<ParsedAuctionBidGroup[]> {
  const events = await pool.querySync(relays, auctionBidGroupFilter(query), options)
  return groupAuctionBidEvents(events)
}

export function subscribeAuctionBidGroups(
  pool: AuctionBidGroupSubscribePool,
  relays: string[],
  query: AuctionBidGroupQuery,
  handlers: AuctionBidGroupSubscribeHandlers,
  options: AuctionBidGroupSubscribeOptions = {},
): SubCloser {
  const events = new Map<string, AuctionBidGroupEvent>()
  const seen = new Set<string>()
  const filter = auctionBidGroupFilter(query)
  const requests = relays.map(url => ({ url, filter }))
  return pool.subscribeMap(requests, {
    ...options,
    onevent(event: Event) {
      if (seen.has(event.id)) return
      seen.add(event.id)
      let parsed: AuctionBidGroupEvent
      try {
        parsed = parseAuctionBidGroupEvent(event)
      } catch (err) {
        handlers.oninvalid?.(event, err instanceof Error ? err : new Error('Invalid marketplace auction bid group event'))
        return
      }
      events.set(parsed.event.id, parsed)
      handlers.onevent?.(parsed)
      const groups = groupAuctionBidEvents(events.values())
      handlers.ongroups?.(groups)
      if (!isParsedBid(parsed)) {
        const group = groups.find(candidate =>
          candidate.payments.some(payment => parsed.refs.payments.includes(payment.event.id)) ||
          candidate.bid.event.id === parsed.refs.auctionBids[0] ||
          (candidate.bidId === parsed.orderGroupId && candidate.tradeId === parsed.tradeId),
        )
        if (group) handlers.ongroup?.(group)
        return
      }
      const group = groups.find(candidate => candidate.bid.event.id === parsed.event.id)
      if (group) handlers.ongroup?.(group)
    },
    oneose() {
      handlers.oneose?.()
    },
    onclose(reasons) {
      handlers.onclose?.(reasons)
    },
  })
}

export const auctionBidGroups = {
  eventKinds: auctionBidGroupEventKinds,
  filter: auctionBidGroupFilter,
  parseEvent: parseAuctionBidGroupEvent,
  reduce: reduceAuctionBidGroup,
  group: groupAuctionBidEvents,
  fetch: fetchAuctionBidGroups,
  subscribe: subscribeAuctionBidGroups,
}
