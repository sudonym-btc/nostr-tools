import type { Event } from '../core.ts'
import { marketplaceOrderIdentity } from './identity.ts'
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
  const events = await pool.querySync(relays, orderGroupFilter(query))
  return groupOrderEvents(events, options)
}

export async function searchOrderGroups(
  pool: OrderGroupQueryPool,
  relays: string[],
  query: OrderQuery = {},
  options: OrderGroupSearchOptions = {},
): Promise<ParsedOrderGroup[]> {
  const filters = orderGroupEventFilters(query)
  const uniqueEvents = new Map<string, Event>()
  await Promise.all(filters.map(async filter => {
    const events = await pool.querySync(relays, filter, options)
    for (const event of events) uniqueEvents.set(event.id, event)
  }))
  const parsed: OrderGroupEvent[] = []
  for (const event of uniqueEvents.values()) {
    try {
      parsed.push(parseOrderGroupEvent(event))
    } catch (_) {}
  }
  return groupOrderEvents(parsed, options)
}

function groupHasIdentityRole(group: ParsedOrderGroup, role: OrderGroupRole, pubkeys: Set<string>): boolean {
  if (group.validOrders.some(order => order.role === role && pubkeys.has(order.order.event.pubkey))) return true
  if (group.participants.some(participant => participant.role === role && pubkeys.has(participant.pubkey))) return true
  if (role === 'seller' && pubkeys.has(group.sellerPubkey)) return true
  if (role === 'arbiter' && group.arbiterPubkeys.some(pubkey => pubkeys.has(pubkey))) return true
  return false
}

export function bucketOrderGroups(
  groups: ParsedOrderGroup[],
  identity: MarketplaceOrderIdentity,
): OrderGroupBuckets {
  const pubkeys = new Set(orderIdentityPubkeys(identity))
  const buyer = groups.filter(group => groupHasIdentityRole(group, 'buyer', pubkeys))
  const seller = groups.filter(group => groupHasIdentityRole(group, 'seller', pubkeys))
  const arbiter = groups.filter(group => groupHasIdentityRole(group, 'arbiter', pubkeys))
  return { buyer, seller, arbiter, all: groups }
}

export const defaultMyOrderIdentity = marketplaceOrderIdentity

export async function searchMyOrderGroups(
  pool: OrderGroupQueryPool,
  relays: string[],
  query: MyOrderGroupQuery,
  options: OrderGroupSearchOptions = {},
): Promise<OrderGroupBuckets> {
  const identity = defaultMyOrderIdentity(query.identity)
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
        handlers.oninvalid?.(event, error)
        return
      }
      events.set(parsed.event.id, parsed)
      handlers.onevent?.(parsed)
      const groups = groupOrderEvents(events.values(), options)
      handlers.ongroups?.(groups)
      const group = groups.find(candidate => candidate.id === parsed.orderGroupId && candidate.listingAnchor === parsed.listingAnchor)
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
  return subscribeOrderGroups(pool, relays, { ...query, identity }, {
    ...handlers,
    ongroups(groups) {
      handlers.ongroups?.(groups)
      const buckets = bucketOrderGroups(groups, identity)
      handlers.onbuckets?.(buckets)
    },
  }, options)
}
