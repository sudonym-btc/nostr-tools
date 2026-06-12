import type { AbstractSimplePool, SubCloser, SubscribeManyParams } from '../abstract-pool.ts'
import type { Event } from '../core.ts'
import type { Filter } from '../filter.ts'
import {
  MarketplaceAuction,
  MarketplaceAuctionBid,
  MarketplaceAuctionComplete,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
} from '../kinds.ts'
import {
  auctionCompleteAppliesToAuction,
  parseAuctionBidEvent,
  parseAuctionCompleteEvent,
  parseAuctionEvent,
  type ParsedMarketplaceAuction,
  type ParsedMarketplaceAuctionBid,
  type ParsedMarketplaceAuctionComplete,
} from './auction.ts'
import { auctionCompleteSearchFilter } from './auction-query.ts'
import {
  auctionBidGroupFilter,
  buildAuctionBidChains,
  groupAuctionBidEvents,
  type AuctionBidGroupEvent,
  type ParsedAuctionBidChain,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
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
import {
  MarketplaceStream,
  StreamClosed,
  StreamEose,
  StreamLive,
} from './stream.ts'

export type MarketplaceAuctionScopeQuery = {
  auctionAnchor: string
  since?: number
  until?: number
  limit?: number
  completeLimit?: number
  lifecycleLimit?: number
}

export type MarketplaceAuctionScopeOptions =
  Pick<SubscribeManyParams, 'maxWait' | 'id' | 'label' | 'abort'>

export type MarketplaceAuctionScopeSnapshot = {
  auctionAnchor: string
  auction?: ParsedMarketplaceAuction
  complete?: ParsedMarketplaceAuctionComplete
  status: string
  bids: ParsedMarketplaceAuctionBid[]
  completes: ParsedMarketplaceAuctionComplete[]
  payments: ParsedOrderPayment[]
  paymentAcks: ParsedOrderPaymentAck[]
  paymentNacks: ParsedOrderPaymentNack[]
  paymentSettlements: ParsedOrderPaymentSettlement[]
  bidGroups: ParsedAuctionBidGroup[]
  bidChains: ParsedAuctionBidChain[]
  highestBid?: ParsedAuctionBidChain
  winningBid?: ParsedAuctionBidGroup
}

export type MarketplaceAuctionScopeEvent =
  | ParsedMarketplaceAuction
  | ParsedMarketplaceAuctionBid
  | ParsedMarketplaceAuctionComplete
  | ParsedOrderPayment
  | ParsedOrderPaymentAck
  | ParsedOrderPaymentNack
  | ParsedOrderPaymentSettlement

export type MarketplaceAuctionScopeStream =
  MarketplaceStream<MarketplaceAuctionScopeEvent, MarketplaceAuctionScopeSnapshot>

export type MarketplaceAuctionScope = {
  filters(): Filter[]
  query(options?: MarketplaceAuctionScopeOptions): Promise<MarketplaceAuctionScopeSnapshot>
  stream(options?: MarketplaceAuctionScopeOptions): MarketplaceAuctionScopeStream
}

type AuctionScopePool = Pick<AbstractSimplePool, 'subscribeMap'>

function auctionAnchorParts(anchor: string): { pubkey: string; d: string } {
  const [kind, pubkey, ...rest] = anchor.split(':')
  if (Number(kind) !== MarketplaceAuction || !pubkey || rest.length === 0) {
    throw new Error(`Invalid marketplace auction anchor: ${anchor}`)
  }
  return { pubkey, d: rest.join(':') }
}

function sortParsed<T extends { event: Event }>(items: Iterable<T>): T[] {
  return [...items].sort((a, b) => b.event.created_at - a.event.created_at || b.event.id.localeCompare(a.event.id))
}

function latestParsed<T extends { event: Event }>(items: Iterable<T>): T | undefined {
  return sortParsed(items)[0]
}

function scopeStatus(snapshot: Omit<MarketplaceAuctionScopeSnapshot, 'status'>): string {
  if (snapshot.complete) return snapshot.complete.status
  const now = Math.floor(Date.now() / 1000)
  if (snapshot.auction?.endAt && now >= snapshot.auction.endAt) return 'ended'
  if (snapshot.auction?.startAt && now < snapshot.auction.startAt) return 'scheduled'
  return snapshot.auction ? 'live' : 'unknown'
}

function hasAuctionAnchor(event: Event, auctionAnchor: string): boolean {
  return event.tags.some(tag => tag[0] === 'a' && tag[1] === auctionAnchor)
}

export function auctionScopeFilters(query: MarketplaceAuctionScopeQuery): Filter[] {
  const { pubkey, d } = auctionAnchorParts(query.auctionAnchor)
  const time = {
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
  }
  return [
    {
      kinds: [MarketplaceAuction],
      authors: [pubkey],
      '#d': [d],
      limit: 1,
      ...time,
    },
    auctionCompleteSearchFilter({
      auctionAnchor: query.auctionAnchor,
      limit: query.completeLimit ?? 50,
      ...time,
    }),
    auctionBidGroupFilter({
      auctionAnchor: query.auctionAnchor,
      limit: query.lifecycleLimit ?? query.limit ?? 500,
      ...time,
    }),
  ]
}

function createState(auctionAnchor: string) {
  const auctions = new Map<string, ParsedMarketplaceAuction>()
  const bids = new Map<string, ParsedMarketplaceAuctionBid>()
  const completes = new Map<string, ParsedMarketplaceAuctionComplete>()
  const payments = new Map<string, ParsedOrderPayment>()
  const paymentAcks = new Map<string, ParsedOrderPaymentAck>()
  const paymentNacks = new Map<string, ParsedOrderPaymentNack>()
  const paymentSettlements = new Map<string, ParsedOrderPaymentSettlement>()
  const bidGroupEvents = new Map<string, AuctionBidGroupEvent>()

  function snapshot(): MarketplaceAuctionScopeSnapshot {
    const auction = latestParsed(auctions.values())
    const complete = latestParsed(
      auction
        ? [...completes.values()].filter(candidate => auctionCompleteAppliesToAuction(auction, candidate))
        : completes.values(),
    )
    const bidGroups = groupAuctionBidEvents(bidGroupEvents.values())
      .sort((a, b) => b.bid.event.created_at - a.bid.event.created_at || b.bid.event.id.localeCompare(a.bid.event.id))
    const bidChains = buildAuctionBidChains(bidGroups)
    const winningBid = complete?.winningBidId
      ? bidGroups.find(group => group.bid.event.id === complete.winningBidId)
      : undefined
    const base = {
      auctionAnchor,
      ...(auction ? { auction } : {}),
      ...(complete ? { complete } : {}),
      bids: sortParsed(bids.values()),
      completes: sortParsed(completes.values()),
      payments: sortParsed(payments.values()),
      paymentAcks: sortParsed(paymentAcks.values()),
      paymentNacks: sortParsed(paymentNacks.values()),
      paymentSettlements: sortParsed(paymentSettlements.values()),
      bidGroups,
      bidChains,
      ...(bidChains[0] ? { highestBid: bidChains[0] } : {}),
      ...(winningBid ? { winningBid } : {}),
    }
    return {
      ...base,
      status: scopeStatus(base),
    }
  }

  return {
    addAuction(auction: ParsedMarketplaceAuction) {
      auctions.set(auction.event.id, auction)
    },
    addBid(bid: ParsedMarketplaceAuctionBid) {
      bids.set(bid.event.id, bid)
      bidGroupEvents.set(bid.event.id, bid)
    },
    addComplete(complete: ParsedMarketplaceAuctionComplete) {
      completes.set(complete.event.id, complete)
    },
    addPayment(payment: ParsedOrderPayment) {
      payments.set(payment.event.id, payment)
      bidGroupEvents.set(payment.event.id, payment)
    },
    addPaymentAck(ack: ParsedOrderPaymentAck) {
      paymentAcks.set(ack.event.id, ack)
      bidGroupEvents.set(ack.event.id, ack)
    },
    addPaymentNack(nack: ParsedOrderPaymentNack) {
      paymentNacks.set(nack.event.id, nack)
      bidGroupEvents.set(nack.event.id, nack)
    },
    addPaymentSettlement(settlement: ParsedOrderPaymentSettlement) {
      paymentSettlements.set(settlement.event.id, settlement)
      bidGroupEvents.set(settlement.event.id, settlement)
    },
    snapshot,
  }
}

export function isAuctionScopeAuction(event: MarketplaceAuctionScopeEvent): event is ParsedMarketplaceAuction {
  return event.event.kind === MarketplaceAuction
}

export function isAuctionScopeBid(event: MarketplaceAuctionScopeEvent): event is ParsedMarketplaceAuctionBid {
  return event.event.kind === MarketplaceAuctionBid
}

export function isAuctionScopeComplete(event: MarketplaceAuctionScopeEvent): event is ParsedMarketplaceAuctionComplete {
  return event.event.kind === MarketplaceAuctionComplete
}

export function isAuctionScopePayment(event: MarketplaceAuctionScopeEvent): event is ParsedOrderPayment {
  return event.event.kind === MarketplacePayment
}

export function isAuctionScopePaymentAck(event: MarketplaceAuctionScopeEvent): event is ParsedOrderPaymentAck {
  return event.event.kind === MarketplacePaymentAck
}

export function isAuctionScopePaymentNack(event: MarketplaceAuctionScopeEvent): event is ParsedOrderPaymentNack {
  return event.event.kind === MarketplacePaymentNack
}

export function isAuctionScopePaymentSettlement(
  event: MarketplaceAuctionScopeEvent,
): event is ParsedOrderPaymentSettlement {
  return event.event.kind === MarketplacePaymentSettlement
}

export function streamAuctionScope(
  pool: AuctionScopePool,
  relays: string[],
  query: MarketplaceAuctionScopeQuery,
  options: MarketplaceAuctionScopeOptions = {},
): MarketplaceAuctionScopeStream {
  const state = createState(query.auctionAnchor)
  const seen = new Set<string>()
  let emitted = 0
  let sub: SubCloser | undefined
  const stream = new MarketplaceStream<MarketplaceAuctionScopeEvent, MarketplaceAuctionScopeSnapshot>({
    onClose: reason => sub?.close(reason),
  })

  function emitSnapshot(): MarketplaceAuctionScopeSnapshot {
    const snapshot = state.snapshot()
    stream.emitSnapshot(snapshot)
    return snapshot
  }

  function emitEvent(event: MarketplaceAuctionScopeEvent): void {
    emitted += 1
    stream.emitEvent(event)
    emitSnapshot()
  }

  const filters = auctionScopeFilters(query)
  const requests = relays.flatMap(url => filters.map(filter => ({ url, filter })))
  stream.emitSnapshot(state.snapshot())
  stream.markQuerying({ requestCount: requests.length })

  if (requests.length === 0) {
    queueMicrotask(() => {
      emitSnapshot()
      stream.markEose({ eventCount: emitted })
      stream.markLive({ eventCount: emitted })
      stream.emitStatus(new StreamClosed({ reasons: ['no relays'] }))
    })
    return stream
  }

  sub = pool.subscribeMap(requests, {
    ...options,
    onevent(event: Event) {
      if (seen.has(event.id)) return
      seen.add(event.id)
      try {
        if (event.kind === MarketplaceAuction) {
          const auction = parseAuctionEvent(event)
          if (auction.auctionAnchor !== query.auctionAnchor) return
          state.addAuction(auction)
          emitEvent(auction)
          return
        }
        if (event.kind === MarketplaceAuctionBid) {
          const bid = parseAuctionBidEvent(event)
          if (bid.auctionAnchor !== query.auctionAnchor) return
          state.addBid(bid)
          emitEvent(bid)
          return
        }
        if (event.kind === MarketplaceAuctionComplete) {
          const complete = parseAuctionCompleteEvent(event)
          if (complete.auctionAnchor !== query.auctionAnchor) return
          state.addComplete(complete)
          emitEvent(complete)
          return
        }
        if (!hasAuctionAnchor(event, query.auctionAnchor)) return
        if (event.kind === MarketplacePayment) {
          const payment = parseOrderPaymentEvent(event)
          state.addPayment(payment)
          emitEvent(payment)
          return
        }
        if (event.kind === MarketplacePaymentAck) {
          const ack = parseOrderPaymentAckEvent(event)
          state.addPaymentAck(ack)
          emitEvent(ack)
          return
        }
        if (event.kind === MarketplacePaymentNack) {
          const nack = parseOrderPaymentNackEvent(event)
          state.addPaymentNack(nack)
          emitEvent(nack)
          return
        }
        if (event.kind === MarketplacePaymentSettlement) {
          const settlement = parseOrderPaymentSettlementEvent(event)
          state.addPaymentSettlement(settlement)
          emitEvent(settlement)
        }
      } catch (err) {
        stream.fail(err instanceof Error ? err : new Error('Invalid marketplace auction scope event'))
      }
    },
    oneose() {
      emitSnapshot()
      stream.markEose({ eventCount: emitted })
      stream.markLive({ eventCount: emitted })
    },
    onclose(reasons) {
      emitSnapshot()
      stream.emitStatus(new StreamClosed({ reasons }))
    },
  })

  return stream
}

export async function queryAuctionScope(
  pool: AuctionScopePool,
  relays: string[],
  query: MarketplaceAuctionScopeQuery,
  options: MarketplaceAuctionScopeOptions = {},
): Promise<MarketplaceAuctionScopeSnapshot> {
  const stream = streamAuctionScope(pool, relays, query, options)
  if (
    !(stream.currentStatus instanceof StreamEose) &&
    !(stream.currentStatus instanceof StreamLive) &&
    !(stream.currentStatus instanceof StreamClosed)
  ) {
    await Promise.race([
      stream.until(StreamEose),
      stream.until(StreamLive),
      stream.until(StreamClosed),
    ])
  }
  const snapshot = stream.currentSnapshot ?? createState(query.auctionAnchor).snapshot()
  stream.close('auction scope query complete')
  return snapshot
}

export function createAuctionScope(
  pool: AuctionScopePool,
  relays: string[],
  query: MarketplaceAuctionScopeQuery,
): MarketplaceAuctionScope {
  return {
    filters: () => auctionScopeFilters(query),
    query: (options: MarketplaceAuctionScopeOptions = {}) => queryAuctionScope(pool, relays, query, options),
    stream: (options: MarketplaceAuctionScopeOptions = {}) => streamAuctionScope(pool, relays, query, options),
  }
}

export const auctionScopes = {
  filters: auctionScopeFilters,
  query: queryAuctionScope,
  stream: streamAuctionScope,
  create: createAuctionScope,
  isAuction: isAuctionScopeAuction,
  isBid: isAuctionScopeBid,
  isComplete: isAuctionScopeComplete,
  isPayment: isAuctionScopePayment,
  isPaymentAck: isAuctionScopePaymentAck,
  isPaymentNack: isAuctionScopePaymentNack,
  isPaymentSettlement: isAuctionScopePaymentSettlement,
}
