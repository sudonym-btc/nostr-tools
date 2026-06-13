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
import {
  buildAuctionBidChains,
  groupAuctionBidEvents,
  type AuctionBidGroupEvent,
  type ParsedAuctionBidChain,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
import {
  parsePaymentAckEvent,
  parsePaymentEvent,
  parsePaymentNackEvent,
  parsePaymentSettlementEvent,
  type ParsedPayment,
  type ParsedPaymentAck,
  type ParsedPaymentNack,
  type ParsedPaymentSettlement,
} from './payment-lifecycle.ts'
import {
  MarketplaceStream,
  StreamClosed,
  StreamEose,
  StreamLive,
} from './stream.ts'
import {
  decodeMarketplaceEvent,
  type MarketplaceInvalidEventHandler,
} from './event-decoder.ts'

export type MarketplaceAuctionScopeQuery = {
  auctionAnchor?: string
  listingAnchor?: string
  since?: number
  until?: number
}

export type MarketplaceAuctionScopeOptions =
  Pick<SubscribeManyParams, 'maxWait' | 'id' | 'label' | 'abort'> & {
    oninvalid?: MarketplaceInvalidEventHandler
  }

export type MarketplaceAuctionScopeSnapshot = {
  auctionAnchor: string
  auction?: ParsedMarketplaceAuction
  complete?: ParsedMarketplaceAuctionComplete
  status: string
  bids: ParsedMarketplaceAuctionBid[]
  completes: ParsedMarketplaceAuctionComplete[]
  payments: ParsedPayment[]
  paymentAcks: ParsedPaymentAck[]
  paymentNacks: ParsedPaymentNack[]
  paymentSettlements: ParsedPaymentSettlement[]
  bidGroups: ParsedAuctionBidGroup[]
  bidChains: ParsedAuctionBidChain[]
  highestBid?: ParsedAuctionBidChain
  winningBid?: ParsedAuctionBidGroup
}

export type MarketplaceAuctionScopesSnapshot = Record<string, MarketplaceAuctionScopeSnapshot>

export type MarketplaceAuctionScopeEvent =
  | ParsedMarketplaceAuction
  | ParsedMarketplaceAuctionBid
  | ParsedMarketplaceAuctionComplete
  | ParsedPayment
  | ParsedPaymentAck
  | ParsedPaymentNack
  | ParsedPaymentSettlement

export type MarketplaceAuctionScopeStream =
  MarketplaceStream<MarketplaceAuctionScopeEvent, MarketplaceAuctionScopesSnapshot>

export type MarketplaceAuctionScope = {
  filters(): Filter[]
  query(options?: MarketplaceAuctionScopeOptions): Promise<MarketplaceAuctionScopesSnapshot>
  stream(options?: MarketplaceAuctionScopeOptions): MarketplaceAuctionScopeStream
}

type AuctionScopePool = Pick<AbstractSimplePool, 'subscribeMap'>

export const auctionScopeEventKinds = [
  MarketplaceAuction,
  MarketplaceAuctionBid,
  MarketplaceAuctionComplete,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
]

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

export function auctionScopeFilters(query: MarketplaceAuctionScopeQuery): Filter[] {
  const anchor = query.auctionAnchor ?? query.listingAnchor
  if (!anchor) throw new Error('Auction scope query requires an auctionAnchor or listingAnchor')
  const time = {
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
  }
  return [
    {
      kinds: auctionScopeEventKinds,
      '#a': [anchor],
      ...time,
    },
  ]
}

function createState(auctionAnchor: string) {
  const auctions = new Map<string, ParsedMarketplaceAuction>()
  const bids = new Map<string, ParsedMarketplaceAuctionBid>()
  const completes = new Map<string, ParsedMarketplaceAuctionComplete>()
  const payments = new Map<string, ParsedPayment>()
  const paymentAcks = new Map<string, ParsedPaymentAck>()
  const paymentNacks = new Map<string, ParsedPaymentNack>()
  const paymentSettlements = new Map<string, ParsedPaymentSettlement>()
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
    addPayment(payment: ParsedPayment) {
      payments.set(payment.event.id, payment)
      bidGroupEvents.set(payment.event.id, payment)
    },
    addPaymentAck(ack: ParsedPaymentAck) {
      paymentAcks.set(ack.event.id, ack)
      bidGroupEvents.set(ack.event.id, ack)
    },
    addPaymentNack(nack: ParsedPaymentNack) {
      paymentNacks.set(nack.event.id, nack)
      bidGroupEvents.set(nack.event.id, nack)
    },
    addPaymentSettlement(settlement: ParsedPaymentSettlement) {
      paymentSettlements.set(settlement.event.id, settlement)
      bidGroupEvents.set(settlement.event.id, settlement)
    },
    snapshot,
  }
}

function createScopesState() {
  const scopes = new Map<string, ReturnType<typeof createState>>()

  function scope(auctionAnchor: string) {
    const current = scopes.get(auctionAnchor)
    if (current) return current
    const next = createState(auctionAnchor)
    scopes.set(auctionAnchor, next)
    return next
  }

  return {
    add(auctionAnchor: string, event: MarketplaceAuctionScopeEvent) {
      const state = scope(auctionAnchor)
      if (isAuctionScopeAuction(event)) state.addAuction(event)
      else if (isAuctionScopeBid(event)) state.addBid(event)
      else if (isAuctionScopeComplete(event)) state.addComplete(event)
      else if (isAuctionScopePayment(event)) state.addPayment(event)
      else if (isAuctionScopePaymentAck(event)) state.addPaymentAck(event)
      else if (isAuctionScopePaymentNack(event)) state.addPaymentNack(event)
      else if (isAuctionScopePaymentSettlement(event)) state.addPaymentSettlement(event)
    },
    snapshot(): MarketplaceAuctionScopesSnapshot {
      return Object.fromEntries([...scopes.entries()].map(([auctionAnchor, state]) => [auctionAnchor, state.snapshot()]))
    },
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

export function isAuctionScopePayment(event: MarketplaceAuctionScopeEvent): event is ParsedPayment {
  return event.event.kind === MarketplacePayment
}

export function isAuctionScopePaymentAck(event: MarketplaceAuctionScopeEvent): event is ParsedPaymentAck {
  return event.event.kind === MarketplacePaymentAck
}

export function isAuctionScopePaymentNack(event: MarketplaceAuctionScopeEvent): event is ParsedPaymentNack {
  return event.event.kind === MarketplacePaymentNack
}

export function isAuctionScopePaymentSettlement(
  event: MarketplaceAuctionScopeEvent,
): event is ParsedPaymentSettlement {
  return event.event.kind === MarketplacePaymentSettlement
}

function parseAuctionScopeEvent(event: Event): MarketplaceAuctionScopeEvent {
  if (event.kind === MarketplaceAuction) return parseAuctionEvent(event)
  if (event.kind === MarketplaceAuctionBid) return parseAuctionBidEvent(event)
  if (event.kind === MarketplaceAuctionComplete) return parseAuctionCompleteEvent(event)
  if (event.kind === MarketplacePayment) return parsePaymentEvent(event)
  if (event.kind === MarketplacePaymentAck) return parsePaymentAckEvent(event)
  if (event.kind === MarketplacePaymentNack) return parsePaymentNackEvent(event)
  if (event.kind === MarketplacePaymentSettlement) return parsePaymentSettlementEvent(event)
  throw new Error('Invalid marketplace auction scope event kind')
}

function auctionScopeEventAuctionAnchor(event: MarketplaceAuctionScopeEvent): string | undefined {
  if (isAuctionScopeAuction(event)) return event.auctionAnchor
  if (isAuctionScopeBid(event)) return event.auctionAnchor
  if (isAuctionScopeComplete(event)) return event.auctionAnchor
  return event.anchors.auction
}

function auctionScopeEventListingAnchor(event: MarketplaceAuctionScopeEvent): string | undefined {
  if (isAuctionScopeAuction(event)) return event.listingAnchor
  if (isAuctionScopeBid(event)) return event.listingAnchor
  if (isAuctionScopeComplete(event)) return event.listingAnchor
  return event.anchors.listing
}

function auctionScopeEventMatchesQuery(
  event: MarketplaceAuctionScopeEvent,
  auctionAnchor: string,
  query: MarketplaceAuctionScopeQuery,
): boolean {
  if (query.auctionAnchor && auctionAnchor !== query.auctionAnchor) return false
  if (query.listingAnchor && auctionScopeEventListingAnchor(event) !== query.listingAnchor) return false
  return true
}

export function streamAuctionScope(
  pool: AuctionScopePool,
  relays: string[],
  query: MarketplaceAuctionScopeQuery,
  options: MarketplaceAuctionScopeOptions = {},
): MarketplaceAuctionScopeStream {
  const state = createScopesState()
  const seen = new Set<string>()
  let emitted = 0
  let sub: SubCloser | undefined
  const stream = new MarketplaceStream<MarketplaceAuctionScopeEvent, MarketplaceAuctionScopesSnapshot>({
    onClose: reason => sub?.close(reason),
  })

  function emitSnapshot(): MarketplaceAuctionScopesSnapshot {
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
      const decoded = decodeMarketplaceEvent(event, parseAuctionScopeEvent, {
        source: 'auctionScopes.stream',
        oninvalid: options.oninvalid,
      })
      if (!decoded.ok) return
      const parsed = decoded.value
      const auctionAnchor = auctionScopeEventAuctionAnchor(parsed)
      if (!auctionAnchor || !auctionScopeEventMatchesQuery(parsed, auctionAnchor, query)) return
      state.add(auctionAnchor, parsed)
      emitEvent(parsed)
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
): Promise<MarketplaceAuctionScopesSnapshot> {
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
  const snapshot = stream.currentSnapshot ?? createScopesState().snapshot()
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
  eventKinds: auctionScopeEventKinds,
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
