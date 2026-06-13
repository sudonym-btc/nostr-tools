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
  parsePaymentAckEvent,
  parsePaymentEvent,
  parsePaymentNackEvent,
  parsePaymentSettlementEvent,
  paymentLifecycleHasAnchor,
  type ParsedPayment,
  type ParsedPaymentAck,
  type ParsedPaymentNack,
  type ParsedPaymentSettlement,
} from './payment-lifecycle.ts'
import {
  orderIdentityPubkeys,
  type MarketplaceOrderIdentity,
} from './order-query.ts'
import type { OrderGroupRole } from './order-id.ts'
import { pubkeyFromListingAnchor } from './order-group-core.ts'
import { resolvePublicParticipantProof } from './participant-proof.ts'
import {
  decodeMarketplaceEvent,
  type MarketplaceInvalidEventHandler,
} from './event-decoder.ts'

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
  | ParsedPayment
  | ParsedPaymentAck
  | ParsedPaymentNack
  | ParsedPaymentSettlement

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
  payments: ParsedPayment[]
  paymentAcks: ParsedPaymentAck[]
  paymentNacks: ParsedPaymentNack[]
  settlements: ParsedPaymentSettlement[]
  events: AuctionBidGroupEvent[]
  ignoredEvents: AuctionBidGroupEvent[]
  payment?: ParsedPayment
  paymentAck?: ParsedPaymentAck
  paymentNack?: ParsedPaymentNack
  settlement?: ParsedPaymentSettlement
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

export type AuctionBidGroupBuyerQuery =
  Omit<AuctionBidGroupQuery, 'identity'> & { identity?: MarketplaceOrderIdentity }

export type AuctionBidGroupIdentityQuery = Omit<AuctionBidGroupQuery, 'identity'> & {
  identity: MarketplaceOrderIdentity
}

export type AuctionBidGroupRoles = {
  buyer: ParsedAuctionBidGroup[]
  seller: ParsedAuctionBidGroup[]
  arbiter: ParsedAuctionBidGroup[]
  all: ParsedAuctionBidGroup[]
}

export type AuctionBidGroupSearchOptions = {
  maxWait?: number
  oninvalid?: MarketplaceInvalidEventHandler
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

type ParsedAuctionBidPaymentDecision = ParsedPaymentAck | ParsedPaymentNack

function isParsedBid(event: AuctionBidGroupEvent): event is ParsedMarketplaceAuctionBid {
  return event.event.kind === MarketplaceAuctionBid
}

function isParsedPayment(event: AuctionBidGroupEvent): event is ParsedPayment {
  return event.event.kind === MarketplacePayment
}

function isParsedPaymentAck(event: AuctionBidGroupEvent): event is ParsedPaymentAck {
  return event.event.kind === MarketplacePaymentAck
}

function isParsedPaymentNack(event: AuctionBidGroupEvent): event is ParsedPaymentNack {
  return event.event.kind === MarketplacePaymentNack
}

function isParsedSettlement(event: AuctionBidGroupEvent): event is ParsedPaymentSettlement {
  return event.event.kind === MarketplacePaymentSettlement
}

function refsPayment(event: ParsedPaymentAck | ParsedPaymentNack | ParsedPaymentSettlement, ids: Set<string>): boolean {
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
    paymentLifecycleHasAnchor(event, bid.auctionAnchor, 'auction') &&
    event.orderGroupId === bid.tradeId &&
    event.tradeId === bid.tradeId
  return sameSyntheticGroup || event.refs.auctionBids.includes(bid.event.id)
}

function groupStage(input: {
  payment?: ParsedPayment
  paymentAck?: ParsedPaymentAck
  paymentNack?: ParsedPaymentNack
  settlement?: ParsedPaymentSettlement
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
  if (event.kind === MarketplacePayment) return parsePaymentEvent(event)
  if (event.kind === MarketplacePaymentAck) return parsePaymentAckEvent(event)
  if (event.kind === MarketplacePaymentNack) return parsePaymentNackEvent(event)
  if (event.kind === MarketplacePaymentSettlement) return parsePaymentSettlementEvent(event)
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
          paymentLifecycleHasAnchor(payment, bid.auctionAnchor, 'auction') &&
          payment.orderGroupId === bid.tradeId &&
          payment.tradeId === bid.tradeId
        )
      )
    if (!valid) ignoredEvents.push(payment)
    return valid
  })
  const payment = payments.reduce<ParsedPayment | undefined>(latestEvent, undefined)
  const paymentIds = new Set(payments.map(item => item.event.id))

  const paymentAcks = groupEvents.filter(isParsedPaymentAck).filter(ack => {
    const valid = refsPayment(ack, paymentIds) || (
      paymentLifecycleHasAnchor(ack, bid.auctionAnchor, 'auction') &&
      ack.orderGroupId === bid.tradeId &&
      ack.tradeId === bid.tradeId
    )
    if (!valid) ignoredEvents.push(ack)
    return valid
  })

  const paymentNacks = groupEvents.filter(isParsedPaymentNack).filter(nack => {
    const valid = refsPayment(nack, paymentIds) || (
      paymentLifecycleHasAnchor(nack, bid.auctionAnchor, 'auction') &&
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
  const settlement = settlements.reduce<ParsedPaymentSettlement | undefined>(latestEvent, undefined)
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
  const eventGroups = new Map<string, AuctionBidGroupEvent[]>()
  for (const bid of bids) {
    const key = `${bid.auctionAnchor}:${bid.tradeId}`
    eventGroups.set(key, parsed.filter(event => sameBidGroup(event, bid)))
  }
  return [...eventGroups.values()].map(reduceAuctionBidGroup)
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
  const parsed: AuctionBidGroupEvent[] = []
  for (const event of uniqueEvents.values()) {
    const decoded = decodeMarketplaceEvent(event, parseAuctionBidGroupEvent, {
      source: 'auctionBidGroups.fetch',
      oninvalid: options.oninvalid,
    })
    if (decoded.ok) parsed.push(decoded.value)
  }
  return groupAuctionBidEvents(parsed)
}

export function filterAuctionBidGroupsByBuyerIdentity(
  groups: Iterable<ParsedAuctionBidGroup>,
  identity: MarketplaceOrderIdentity,
): ParsedAuctionBidGroup[] {
  const resolvedIdentity = marketplaceAuctionBidIdentity(identity)
  return roleAuctionBidGroups([...groups], resolvedIdentity).buyer
}

function participantRoleMatches(
  participants: MarketplaceParticipantTag[],
  role: OrderGroupRole,
  pubkeys: Set<string>,
): boolean {
  return participants.some(participant => participant.role === role && pubkeys.has(participant.pubkey))
}

function listingOwnerMatches(group: ParsedAuctionBidGroup, pubkeys: Set<string>): boolean {
  try {
    return pubkeys.has(pubkeyFromListingAnchor(group.listingAnchor))
  } catch (_) {
    return false
  }
}

function publicBuyerProofMatches(group: ParsedAuctionBidGroup, pubkeys: Set<string>): boolean {
  for (const proof of group.bid.participantProofs) {
    if (proof.mode !== 'public' || proof.role !== 'buyer') continue
    const resolved = resolvePublicParticipantProof(proof, {
      listingAnchor: group.listingAnchor,
      tradeId: group.tradeId,
      role: 'buyer',
      participantPubkey: proof.participantPubkey,
    })
    if (resolved.status === 'resolved' && resolved.role === 'buyer' && resolved.realPubkey && pubkeys.has(resolved.realPubkey)) {
      return true
    }
  }
  return false
}

function auctionBidGroupHasIdentityRole(
  group: ParsedAuctionBidGroup,
  role: OrderGroupRole,
  pubkeys: Set<string>,
): boolean {
  if (participantRoleMatches(group.participants, role, pubkeys)) return true
  if (participantRoleMatches(group.bid.participants, role, pubkeys)) return true
  if (group.payments.some(payment => participantRoleMatches(payment.participants, role, pubkeys))) return true
  if (group.paymentAcks.some(ack => participantRoleMatches(ack.participants, role, pubkeys))) return true
  if (group.paymentNacks.some(nack => participantRoleMatches(nack.participants, role, pubkeys))) return true
  if (group.settlements.some(settlement => participantRoleMatches(settlement.participants, role, pubkeys))) return true

  if (role === 'buyer') {
    if (pubkeys.has(group.bid.event.pubkey)) return true
    if (group.payments.some(payment => pubkeys.has(payment.event.pubkey))) return true
    if (publicBuyerProofMatches(group, pubkeys)) return true
  }
  if (role === 'seller' && listingOwnerMatches(group, pubkeys)) return true
  if (role === 'arbiter') {
    if (group.paymentAcks.some(ack => pubkeys.has(ack.event.pubkey))) return true
    if (group.paymentNacks.some(nack => pubkeys.has(nack.event.pubkey))) return true
    if (group.settlements.some(settlement => pubkeys.has(settlement.event.pubkey))) return true
  }
  return false
}

export function roleAuctionBidGroups(
  groups: ParsedAuctionBidGroup[],
  identity: MarketplaceOrderIdentity,
): AuctionBidGroupRoles {
  const pubkeys = new Set(orderIdentityPubkeys(identity))
  const buyer = groups.filter(group => auctionBidGroupHasIdentityRole(group, 'buyer', pubkeys))
  const seller = groups.filter(group => auctionBidGroupHasIdentityRole(group, 'seller', pubkeys))
  const arbiter = groups.filter(group => auctionBidGroupHasIdentityRole(group, 'arbiter', pubkeys))
  return { buyer, seller, arbiter, all: groups }
}

export async function fetchAuctionBidGroupsByBuyerIdentity(
  pool: AuctionBidGroupQueryPool,
  relays: string[],
  query: AuctionBidGroupBuyerQuery,
  options: AuctionBidGroupSearchOptions = {},
): Promise<ParsedAuctionBidGroup[]> {
  const identity = marketplaceAuctionBidIdentity(query.identity)
  const groups = await fetchAuctionBidGroups(pool, relays, { ...query, identity }, options)
  return filterAuctionBidGroupsByBuyerIdentity(groups, identity)
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
      const decoded = decodeMarketplaceEvent(event, parseAuctionBidGroupEvent, {
        source: 'auctionBidGroups.subscribe',
        oninvalid: invalid => handlers.oninvalid?.(invalid.event, invalid.error),
      })
      if (!decoded.ok) return
      const parsed = decoded.value
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
  filterByBuyerIdentity: filterAuctionBidGroupsByBuyerIdentity,
  roles: roleAuctionBidGroups,
  fetch: fetchAuctionBidGroups,
  subscribe: subscribeAuctionBidGroups,
}
