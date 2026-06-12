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
import type { MarketplaceAmount } from './helper.ts'
import { marketplaceAuctionBidIdentity } from './identity.ts'
import type { MarketplaceParticipantTag } from './participant.ts'
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
import {
  orderIdentityPubkeys,
  type MarketplaceOrderIdentity,
} from './order-query.ts'

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
  tradeId: string
  auctionAnchor: string
  listingAnchor: string
  amount: MarketplaceAmount
  participants: MarketplaceParticipantTag[]
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

export type ParsedAuctionBidChain = {
  id: string
  auctionAnchor: string
  listingAnchor: string
  amount: MarketplaceAmount
  head: ParsedAuctionBidGroup
  groups: ParsedAuctionBidGroup[]
  bidEventIds: string[]
  paymentEventIds: string[]
  complete: boolean
}

export type AuctionBidGroupQuery = {
  auctionAnchor?: string
  tradeIds?: string[]
  authors?: string[]
  participantPubkeys?: string[]
  identity?: MarketplaceOrderIdentity
  since?: number
  until?: number
  limit?: number
}

export type MyAuctionBidGroupQuery =
  Omit<AuctionBidGroupQuery, 'identity'> & { identity?: MarketplaceOrderIdentity }

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
const defaultPubkeyChunkSize = 200

function unique(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function chunks<T>(values: T[], size = defaultPubkeyChunkSize): T[][] {
  const output: T[][] = []
  for (let i = 0; i < values.length; i += size) output.push(values.slice(i, i + size))
  return output
}

function latestEvent<T extends AuctionBidGroupEvent>(left: T | undefined, right: T): T {
  if (!left) return right
  if (right.event.created_at !== left.event.created_at) {
    return right.event.created_at > left.event.created_at ? right : left
  }
  return right.event.id.localeCompare(left.event.id) > 0 ? right : left
}

type ParsedAuctionBidPaymentDecision = ParsedOrderPaymentAck | ParsedOrderPaymentNack

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

function auctionBidPrevBidId(bid: ParsedMarketplaceAuctionBid): string | undefined {
  const prevBid = bid.event.tags.find(tag => tag[0] === 'prev_bid')?.[1]
  if (prevBid) return prevBid
  return bid.event.tags.find(tag => tag[0] === 'e' && (tag[3] === 'prev-bid' || tag[3] === 'prev_bid'))?.[1]
}

function sameBidGroup(event: AuctionBidGroupEvent, bid: ParsedMarketplaceAuctionBid): boolean {
  if (isParsedBid(event)) {
    return event.auctionAnchor === bid.auctionAnchor && event.tradeId === bid.tradeId
  }
  const sameSyntheticGroup =
    event.listingAnchor === bid.auctionAnchor &&
    event.orderGroupId === bid.tradeId &&
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

function isActiveBidGroup(group: ParsedAuctionBidGroup): boolean {
  if (group.paymentNack) return false
  if (group.settlement?.content.action === 'auction_refund') return false
  return true
}

function amountUnits(amount: MarketplaceAmount): bigint {
  return amount.value && /^\d+$/.test(amount.value) ? BigInt(amount.value) : 0n
}

function sumBidGroupAmounts(groups: ParsedAuctionBidGroup[]): MarketplaceAmount {
  const amount = groups[0]?.amount ?? { value: '0', denomination: '', decimals: 0 }
  const value = groups.reduce((sum, group) => {
    if (group.amount.denomination !== amount.denomination || group.amount.decimals !== amount.decimals) return sum
    return sum + amountUnits(group.amount)
  }, 0n)
  return {
    value: value.toString(),
    ...(amount.currency ? { currency: amount.currency } : {}),
    denomination: amount.denomination,
    decimals: amount.decimals,
  }
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

function auctionBidGroupBaseFilter(query: AuctionBidGroupQuery): Filter {
  return {
    kinds: auctionBidGroupEventKinds,
    ...(query.auctionAnchor ? { '#a': [query.auctionAnchor] } : {}),
    ...(query.tradeIds && query.tradeIds.length > 0 ? { '#d': unique(query.tradeIds) } : {}),
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
  }
}

function auctionBidParticipantPubkeys(query: AuctionBidGroupQuery): string[] {
  return unique([
    ...(query.participantPubkeys ?? []),
    ...(query.identity ? orderIdentityPubkeys(query.identity) : []),
  ])
}

export function auctionBidGroupFilter(query: AuctionBidGroupQuery): Filter {
  const participantPubkeys = auctionBidParticipantPubkeys(query)
  return {
    ...auctionBidGroupBaseFilter(query),
    ...(query.authors && query.authors.length > 0 ? { authors: unique(query.authors) } : {}),
    ...(participantPubkeys.length > 0 ? { '#p': participantPubkeys } : {}),
  }
}

export function auctionBidGroupFilters(query: AuctionBidGroupQuery): Filter[] {
  const base = auctionBidGroupBaseFilter(query)
  const authors = unique(query.authors ?? [])
  const participantPubkeys = auctionBidParticipantPubkeys(query)
  const filters: Filter[] = []

  for (const authorChunk of chunks(authors)) {
    filters.push({ ...base, authors: authorChunk })
  }
  for (const participantChunk of chunks(participantPubkeys)) {
    filters.push({ ...base, '#p': participantChunk })
  }

  return filters.length > 0 ? filters : [base]
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
      (
        payment.refs.auctionBids.some(id => bidEventIds.has(id)) ||
        (
          payment.listingAnchor === bid.auctionAnchor &&
          payment.orderGroupId === bid.tradeId &&
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
      ack.orderGroupId === bid.tradeId &&
      ack.tradeId === bid.tradeId
    )
    if (!valid) ignoredEvents.push(ack)
    return valid
  })

  const paymentNacks = groupEvents.filter(isParsedPaymentNack).filter(nack => {
    const valid = refsPayment(nack, paymentIds) || (
      nack.listingAnchor === bid.auctionAnchor &&
      nack.orderGroupId === bid.tradeId &&
      nack.tradeId === bid.tradeId
    )
    if (!valid) ignoredEvents.push(nack)
    return valid
  })
  const latestPaymentDecision = [...paymentAcks, ...paymentNacks]
    .reduce<ParsedAuctionBidPaymentDecision | undefined>(latestEvent, undefined)
  const paymentAck =
    latestPaymentDecision && isParsedPaymentAck(latestPaymentDecision) && latestPaymentDecision.content.status === 'accepted'
      ? latestPaymentDecision
      : undefined
  const paymentNack =
    latestPaymentDecision && isParsedPaymentNack(latestPaymentDecision) && latestPaymentDecision.content.status === 'rejected'
      ? latestPaymentDecision
      : undefined

  const settlements = groupEvents.filter(isParsedSettlement).filter(settlement => {
    const valid = refsPayment(settlement, paymentIds) || settlement.refs.auctionBids.some(id => bidEventIds.has(id))
    if (!valid) ignoredEvents.push(settlement)
    return valid
  })
  const settlement = settlements.reduce<ParsedOrderPaymentSettlement | undefined>(latestEvent, undefined)
  const participantPubkeys = unique(bid.participants.map(participant => participant.pubkey)).sort((a, b) => a.localeCompare(b))

  return {
    id: bid.tradeId,
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
    const key = `${bid.auctionAnchor}:${bid.tradeId}`
    buckets.set(key, parsed.filter(event => sameBidGroup(event, bid)))
  }
  return [...buckets.values()].map(reduceAuctionBidGroup)
}

export function buildAuctionBidChains(groups: Iterable<ParsedAuctionBidGroup>): ParsedAuctionBidChain[] {
  const activeGroups = [...groups].filter(isActiveBidGroup)
  const groupByBidId = new Map(activeGroups.map(group => [group.bid.event.id, group]))
  const childBidIds = new Set<string>()
  for (const group of activeGroups) {
    const previousBidId = auctionBidPrevBidId(group.bid)
    if (previousBidId && groupByBidId.has(previousBidId)) childBidIds.add(previousBidId)
  }

  const heads = activeGroups.filter(group => !childBidIds.has(group.bid.event.id))
  const visited = new Set<string>()
  const chains: ParsedAuctionBidChain[] = []

  function collect(head: ParsedAuctionBidGroup): ParsedAuctionBidChain {
    const reversed: ParsedAuctionBidGroup[] = []
    const seen = new Set<string>()
    let complete = true
    let current: ParsedAuctionBidGroup | undefined = head

    while (current && !seen.has(current.bid.event.id)) {
      reversed.push(current)
      seen.add(current.bid.event.id)
      visited.add(current.bid.event.id)
      const previousBidId = auctionBidPrevBidId(current.bid)
      if (!previousBidId) break
      const previous = groupByBidId.get(previousBidId)
      if (!previous) {
        complete = false
        break
      }
      current = previous
    }

    const chainGroups = reversed.reverse()
    const amount = sumBidGroupAmounts(chainGroups)
    return {
      id: head.bid.event.id,
      auctionAnchor: head.auctionAnchor,
      listingAnchor: head.listingAnchor,
      amount,
      head,
      groups: chainGroups,
      bidEventIds: chainGroups.map(group => group.bid.event.id),
      paymentEventIds: chainGroups.flatMap(group => group.payments.map(payment => payment.event.id)),
      complete,
    }
  }

  for (const head of heads) chains.push(collect(head))
  for (const group of activeGroups) {
    if (!visited.has(group.bid.event.id)) chains.push(collect(group))
  }

  return chains.sort((left, right) => {
    const rightAmount = amountUnits(right.amount)
    const leftAmount = amountUnits(left.amount)
    if (rightAmount !== leftAmount) return rightAmount > leftAmount ? 1 : -1
    if (right.head.bid.event.created_at !== left.head.bid.event.created_at) {
      return right.head.bid.event.created_at - left.head.bid.event.created_at
    }
    return right.head.bid.event.id.localeCompare(left.head.bid.event.id)
  })
}

export async function fetchAuctionBidGroups(
  pool: AuctionBidGroupQueryPool,
  relays: string[],
  query: AuctionBidGroupQuery,
  options: AuctionBidGroupSearchOptions = {},
): Promise<ParsedAuctionBidGroup[]> {
  const uniqueEvents = new Map<string, Event>()
  await Promise.all(auctionBidGroupFilters(query).map(async filter => {
    const events = await pool.querySync(relays, filter, options)
    for (const event of events) uniqueEvents.set(event.id, event)
  }))
  return groupAuctionBidEvents(uniqueEvents.values())
}

function auctionBidGroupHasBuyerIdentity(group: ParsedAuctionBidGroup, pubkeys: Set<string>): boolean {
  if (pubkeys.has(group.bid.event.pubkey)) return true
  if (group.participants.some(participant => participant.role === 'buyer' && pubkeys.has(participant.pubkey))) return true
  return group.payments.some(payment =>
    pubkeys.has(payment.event.pubkey) ||
    payment.participants.some(participant => participant.role === 'buyer' && pubkeys.has(participant.pubkey)),
  )
}

export async function fetchMyAuctionBidGroups(
  pool: AuctionBidGroupQueryPool,
  relays: string[],
  query: MyAuctionBidGroupQuery,
  options: AuctionBidGroupSearchOptions = {},
): Promise<ParsedAuctionBidGroup[]> {
  const identity = marketplaceAuctionBidIdentity(query.identity)
  const groups = await fetchAuctionBidGroups(pool, relays, { ...query, identity }, options)
  const pubkeys = new Set(orderIdentityPubkeys(identity))
  return groups.filter(group => auctionBidGroupHasBuyerIdentity(group, pubkeys))
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
  const filters = auctionBidGroupFilters(query)
  const requests = relays.flatMap(url => filters.map(filter => ({ url, filter })))
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
          (candidate.tradeId === parsed.orderGroupId && candidate.tradeId === parsed.tradeId),
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
  filters: auctionBidGroupFilters,
  parseEvent: parseAuctionBidGroupEvent,
  reduce: reduceAuctionBidGroup,
  group: groupAuctionBidEvents,
  chains: buildAuctionBidChains,
  fetch: fetchAuctionBidGroups,
  fetchMine: fetchMyAuctionBidGroups,
  subscribe: subscribeAuctionBidGroups,
}
