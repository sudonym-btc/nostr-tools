import type { Event } from '../core.ts'
import { orderGroupEventFilters, orderIdentityPubkeys, type MarketplaceOrderIdentity, type OrderQuery } from './order-query.ts'
import { groupOrderEvents, orderGroupFilter, parseOrderGroupEvent } from './order-group-core.ts'
import type {
  MyOrderGroupQuery,
  OrderGroupBuckets,
  OrderGroupFilterQuery,
  OrderGroupQueryPool,
  OrderGroupSearchOptions,
  OrderGroupSubscribeHandlers,
  OrderGroupSubscribeOptions,
  OrderGroupSubscribePool,
  OrderGroupEvent,
  ParsedOrderGroup,
  ReduceOrderGroupOptions,
} from './order-group-types.ts'
import type { OrderGroupRole } from './order-id.ts'

export async function fetchOrderGroups(
  pool: OrderGroupQueryPool,
  relays: string[],
  query: OrderGroupFilterQuery = {},
  options: ReduceOrderGroupOptions = {},
): Promise<ParsedOrderGroup[]> {
  console.debug('[nostr-tools/marketplace] fetching order groups', {
    relayCount: relays.length,
    hasOrderGroupId: Boolean(query.orderGroupId),
    hasTradeId: Boolean(query.tradeId),
    hasListingAnchor: Boolean(query.listingAnchor),
    hasParticipantPubkey: Boolean(query.participantPubkey),
    authorCount: query.authors?.length ?? 0,
    limit: query.limit,
  })
  const events = await pool.querySync(relays, orderGroupFilter(query))
  const groups = groupOrderEvents(events, options)
  console.debug('[nostr-tools/marketplace] fetched order groups', {
    eventCount: events.length,
    groupCount: groups.length,
  })
  return groups
}

export async function searchOrderGroups(
  pool: OrderGroupQueryPool,
  relays: string[],
  query: OrderQuery = {},
  options: OrderGroupSearchOptions = {},
): Promise<ParsedOrderGroup[]> {
  console.debug('[nostr-tools/marketplace] searching order groups', {
    relayCount: relays.length,
    hasIdentity: Boolean(query.identity),
    tradeIdCount: query.tradeIds?.length ?? 0,
    listingAnchorCount: query.listingAnchors?.length ?? 0,
  })
  const filters = orderGroupEventFilters(query)
  const uniqueEvents = new Map<string, Event>()
  await Promise.all(filters.map(async filter => {
    const events = await pool.querySync(relays, filter, options)
    console.debug('[nostr-tools/marketplace] order group filter returned events', {
      kinds: filter.kinds,
      authors: filter.authors?.length ?? 0,
      participantPubkeys: filter['#p']?.length ?? 0,
      tradeIds: filter['#trade']?.length ?? 0,
      orderGroupIds: filter['#d']?.length ?? 0,
      listingAnchors: filter['#a']?.length ?? 0,
      eventCount: events.length,
    })
    for (const event of events) uniqueEvents.set(event.id, event)
  }))
  const parsed: OrderGroupEvent[] = []
  const invalid: { eventId: string; kind: number; error: string }[] = []
  for (const event of uniqueEvents.values()) {
    try {
      parsed.push(parseOrderGroupEvent(event))
    } catch (err) {
      invalid.push({
        eventId: event.id,
        kind: event.kind,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  if (invalid.length > 0) console.warn('[nostr-tools/marketplace] ignoring invalid order group events', { invalid })
  const groups = groupOrderEvents(parsed, options)
  console.debug('[nostr-tools/marketplace] order group search complete', {
    eventCount: uniqueEvents.size,
    parsedEventCount: parsed.length,
    groupCount: groups.length,
  })
  return groups
}

function groupHasIdentityRole(group: ParsedOrderGroup, role: OrderGroupRole, pubkeys: Set<string>): boolean {
  if (group.validOrders.some(order => order.role === role && pubkeys.has(order.order.event.pubkey))) return true
  if (group.participants.some(participant => participant.role === role && pubkeys.has(participant.pubkey))) return true
  if (role === 'seller' && pubkeys.has(group.sellerPubkey)) return true
  if (role === 'escrow' && group.escrowPubkeys.some(pubkey => pubkeys.has(pubkey))) return true
  return false
}

export function bucketOrderGroups(
  groups: ParsedOrderGroup[],
  identity: MarketplaceOrderIdentity,
): OrderGroupBuckets {
  const pubkeys = new Set(orderIdentityPubkeys(identity))
  const buyer = groups.filter(group => groupHasIdentityRole(group, 'buyer', pubkeys))
  const seller = groups.filter(group => groupHasIdentityRole(group, 'seller', pubkeys))
  const escrow = groups.filter(group => groupHasIdentityRole(group, 'escrow', pubkeys))
  console.debug('[nostr-tools/marketplace] bucketed order groups', {
    groupCount: groups.length,
    identityPubkeyCount: pubkeys.size,
    buyerCount: buyer.length,
    sellerCount: seller.length,
    escrowCount: escrow.length,
  })
  return { buyer, seller, escrow, all: groups }
}

function defaultMyOrderIdentity(identity: MarketplaceOrderIdentity): MarketplaceOrderIdentity {
  return {
    ...identity,
    roles: identity.roles ?? ['buyer', 'seller'],
    tempKeyWindow: identity.tempKeyWindow ?? 500,
  }
}

export async function searchMyOrderGroups(
  pool: OrderGroupQueryPool,
  relays: string[],
  query: MyOrderGroupQuery,
  options: OrderGroupSearchOptions = {},
): Promise<OrderGroupBuckets> {
  const identity = defaultMyOrderIdentity(query.identity)
  console.debug('[nostr-tools/marketplace] searching my order groups', {
    roles: identity.roles,
    tempKeyWindow: identity.tempKeyWindow,
    hasSeed: Boolean(identity.seed),
    hasPubkey: Boolean(identity.pubkey),
  })
  const groups = await searchOrderGroups(pool, relays, { ...query, identity }, options)
  return bucketOrderGroups(groups, identity)
}

export function subscribeOrderGroups(
  pool: OrderGroupSubscribePool,
  relays: string[],
  query: OrderQuery,
  handlers: OrderGroupSubscribeHandlers,
  options: OrderGroupSubscribeOptions = {},
) {
  const events = new Map<string, OrderGroupEvent>()
  const filters = orderGroupEventFilters(query)
  const requests = relays.flatMap(url => filters.map(filter => ({ url, filter })))
  const seen = new Set<string>()
  console.debug('[nostr-tools/marketplace] subscribing to order groups', {
    relayCount: relays.length,
    hasIdentity: Boolean(query.identity),
    filterCount: filters.length,
    requestCount: requests.length,
  })
  return pool.subscribeMap(requests, {
    ...options,
    onevent(event: Event) {
      if (seen.has(event.id)) return
      seen.add(event.id)
      let parsed: OrderGroupEvent
      try {
        parsed = parseOrderGroupEvent(event)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Invalid marketplace order group event')
        console.warn('[nostr-tools/marketplace] subscription received invalid order group event', {
          eventId: event.id,
          kind: event.kind,
        }, error)
        handlers.oninvalid?.(event, error)
        return
      }
      events.set(parsed.event.id, parsed)
      handlers.onevent?.(parsed)
      const groups = groupOrderEvents(events.values(), options)
      console.debug('[nostr-tools/marketplace] regrouped subscribed orders', {
        eventCount: events.size,
        groupCount: groups.length,
        latestEventId: parsed.event.id,
      })
      handlers.ongroups?.(groups)
      const group = groups.find(candidate => candidate.id === parsed.orderGroupId && candidate.listingAnchor === parsed.listingAnchor)
      if (group) handlers.ongroup?.(group)
    },
    oneose() {
      console.debug('[nostr-tools/marketplace] order group subscription received EOSE', {
        seenEvents: seen.size,
      })
      handlers.oneose?.()
    },
    onclose(reasons) {
      console.debug('[nostr-tools/marketplace] order group subscription closed', { reasons })
      handlers.onclose?.(reasons)
    },
  })
}

export function subscribeMyOrderGroups(
  pool: OrderGroupSubscribePool,
  relays: string[],
  query: MyOrderGroupQuery,
  handlers: OrderGroupSubscribeHandlers & {
    onbuckets?: (buckets: OrderGroupBuckets) => void
  },
  options: OrderGroupSubscribeOptions = {},
) {
  const identity = defaultMyOrderIdentity(query.identity)
  console.debug('[nostr-tools/marketplace] subscribing to my order groups', {
    roles: identity.roles,
    tempKeyWindow: identity.tempKeyWindow,
    hasSeed: Boolean(identity.seed),
    hasPubkey: Boolean(identity.pubkey),
  })
  return subscribeOrderGroups(pool, relays, { ...query, identity }, {
    ...handlers,
    ongroups(groups) {
      handlers.ongroups?.(groups)
      const buckets = bucketOrderGroups(groups, identity)
      console.debug('[nostr-tools/marketplace] my order group buckets updated', {
        buyerCount: buckets.buyer.length,
        sellerCount: buckets.seller.length,
        escrowCount: buckets.escrow.length,
        allCount: buckets.all.length,
      })
      handlers.onbuckets?.(buckets)
    },
  }, options)
}
