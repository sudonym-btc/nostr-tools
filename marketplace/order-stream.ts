import type { AbstractSimplePool, SubCloser } from '../abstract-pool.ts'
import type {
  OrderGroupIdentityQuery,
  OrderGroupRoles,
  OrderGroupEvent,
  OrderGroupSubscribeOptions,
  OrderGroupSubscribePool,
  ParsedOrderGroup,
} from './order-group-types.ts'
import type { ParsedOrder } from './order.ts'
import {
  orderFilters,
  orderGroupEventFilters,
  subscribeOrders,
  type OrderQuery,
  type OrderSubscribeOptions,
} from './order-query.ts'
import {
  roleOrderGroups,
  defaultMyOrderIdentity,
  subscribeOrderGroupsForIdentity,
  subscribeOrderGroups,
} from './order-group-query.ts'
import {
  MarketplaceStream,
  StreamClosed,
  StreamEose,
  StreamLive,
} from './stream.ts'

export type MarketplaceOrderGroupStream =
  MarketplaceStream<OrderGroupEvent, ParsedOrderGroup[]>

export type MarketplaceMyOrderGroupStream =
  MarketplaceStream<OrderGroupEvent, OrderGroupRoles>

export type MarketplaceOrderStream =
  MarketplaceStream<ParsedOrder, ParsedOrder[]>

type OrderStreamPool = Pick<AbstractSimplePool, 'subscribeMap'>

function sortOrders(items: Iterable<ParsedOrder>): ParsedOrder[] {
  return [...items].sort((a, b) => b.event.created_at - a.event.created_at || b.event.id.localeCompare(a.event.id))
}

function streamRequestCount(relays: string[], query: OrderQuery): number {
  return relays.length * orderGroupEventFilters(query).length
}

function orderStreamRequestCount(relays: string[], query: OrderQuery): number {
  return relays.length * orderFilters(query).length
}

export function streamOrders(
  pool: OrderStreamPool,
  relays: string[],
  query: OrderQuery = {},
  options: OrderSubscribeOptions = {},
): MarketplaceOrderStream {
  const orders = new Map<string, ParsedOrder>()
  let eventCount = 0
  let sub: SubCloser | undefined
  const stream = new MarketplaceStream<ParsedOrder, ParsedOrder[]>({
    onClose: reason => sub?.close(reason),
  })
  stream.emitSnapshot([])
  stream.markQuerying({ requestCount: orderStreamRequestCount(relays, query) })
  sub = subscribeOrders(pool, relays, query, {
    onevent(order) {
      eventCount += 1
      orders.set(order.event.id, order)
      stream.emitEvent(order)
      stream.emitSnapshot(sortOrders(orders.values()))
    },
    oninvalid() {},
    oneose() {
      stream.markEose({ eventCount })
      stream.markLive({ eventCount })
    },
    onclose(reasons) {
      stream.emitStatus(new StreamClosed({ reasons }))
    },
  }, options)
  return stream
}

export function streamMyOrders(
  pool: OrderStreamPool,
  relays: string[],
  query: OrderQuery = {},
  options: OrderSubscribeOptions = {},
): MarketplaceOrderStream {
  return streamOrders(pool, relays, query, options)
}

export function streamOrderGroups(
  pool: OrderGroupSubscribePool,
  relays: string[],
  query: OrderQuery = {},
  options: OrderGroupSubscribeOptions = {},
): MarketplaceOrderGroupStream {
  let eventCount = 0
  let sub: SubCloser | undefined
  const stream = new MarketplaceStream<OrderGroupEvent, ParsedOrderGroup[]>({
    onClose: reason => sub?.close(reason),
  })
  stream.emitSnapshot([])
  stream.markQuerying({ requestCount: streamRequestCount(relays, query) })
  sub = subscribeOrderGroups(pool, relays, query, {
    onevent(event) {
      eventCount += 1
      stream.emitEvent(event)
    },
    ongroups(groups) {
      stream.emitSnapshot(groups)
    },
    oninvalid() {},
    oneose() {
      stream.markEose({ eventCount })
      stream.markLive({ eventCount })
    },
    onclose(reasons) {
      stream.emitStatus(new StreamClosed({ reasons }))
    },
  }, options)
  return stream
}

export function streamMyOrderGroups(
  pool: OrderGroupSubscribePool,
  relays: string[],
  query: OrderGroupIdentityQuery,
  options: OrderGroupSubscribeOptions = {},
): MarketplaceMyOrderGroupStream {
  const identity = defaultMyOrderIdentity(query.identity)
  const resolvedQuery = { ...query, identity }
  let eventCount = 0
  let sub: SubCloser | undefined
  const stream = new MarketplaceStream<OrderGroupEvent, OrderGroupRoles>({
    onClose: reason => sub?.close(reason),
  })
  stream.emitSnapshot(roleOrderGroups([], identity))
  stream.markQuerying({ requestCount: streamRequestCount(relays, resolvedQuery) })
  sub = subscribeOrderGroupsForIdentity(pool, relays, resolvedQuery, {
    onevent(event) {
      eventCount += 1
      stream.emitEvent(event)
    },
    onroles(roles) {
      stream.emitSnapshot(roles)
    },
    oninvalid() {},
    oneose() {
      stream.markEose({ eventCount })
      stream.markLive({ eventCount })
    },
    onclose(reasons) {
      stream.emitStatus(new StreamClosed({ reasons }))
    },
  }, options)
  return stream
}

export async function queryOrderGroupStream(
  stream: MarketplaceOrderGroupStream,
): Promise<ParsedOrderGroup[]> {
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
  return stream.currentSnapshot ?? []
}

export async function queryOrderStream(
  stream: MarketplaceOrderStream,
): Promise<ParsedOrder[]> {
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
  return stream.currentSnapshot ?? []
}

export async function queryMyOrderGroupStream(
  stream: MarketplaceMyOrderGroupStream,
): Promise<OrderGroupRoles> {
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
  return stream.currentSnapshot ?? roleOrderGroups([], {})
}

export const orderStreams = {
  orders: streamOrders,
  mineOrders: streamMyOrders,
  groups: streamOrderGroups,
  mine: streamMyOrderGroups,
  queryOrders: queryOrderStream,
  queryGroups: queryOrderGroupStream,
  queryMine: queryMyOrderGroupStream,
}
