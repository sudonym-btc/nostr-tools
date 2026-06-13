import type { AbstractSimplePool, SubCloser, SubscribeManyParams } from '../abstract-pool.ts'
import type { Event } from '../core.ts'
import type { Filter } from '../filter.ts'
import {
  MarketplaceOrder,
  MarketplaceOrderCancel,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
} from '../kinds.ts'
import { marketplaceIdentityPubkeys, type MarketplaceOrderIdentity } from './identity.ts'
import { parseOrderEvent, type ParsedOrder } from './order.ts'
import {
  decodeMarketplaceEvent,
  type MarketplaceInvalidEventHandler,
} from './event-decoder.ts'

export type { MarketplaceOrderIdentity } from './identity.ts'

export type OrderQuery = {
  tradeIds?: string[]
  orderGroupIds?: string[]
  listingAnchors?: string[]
  authors?: string[]
  participantPubkeys?: string[]
  identity?: MarketplaceOrderIdentity
  since?: number
  until?: number
  limit?: number
}

export type OrderSearchOptions = {
  maxWait?: number
  oninvalid?: MarketplaceInvalidEventHandler
}

export type OrderSubscribeHandlers = {
  onevent?: (order: ParsedOrder) => void
  oninvalid?: (event: Event, error: Error) => void
  oneose?: () => void
  onclose?: (reasons: string[]) => void
}

export type OrderSubscribeOptions = Pick<SubscribeManyParams, 'maxWait' | 'id' | 'label' | 'abort'>

const defaultPubkeyChunkSize = 200
export const MarketplaceOrderGroupKinds = [
  MarketplaceOrder,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
  MarketplaceOrderCancel,
]

type OrderQueryPool = Pick<AbstractSimplePool, 'querySync'>
type OrderSubscribePool = Pick<AbstractSimplePool, 'subscribeMap'>

function unique(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function chunks<T>(values: T[], size = defaultPubkeyChunkSize): T[][] {
  const output: T[][] = []
  for (let i = 0; i < values.length; i += size) output.push(values.slice(i, i + size))
  return output
}

export const orderIdentityPubkeys = marketplaceIdentityPubkeys

function baseOrderFilter(query: OrderQuery, kinds: number[] = [MarketplaceOrder]): Filter {
  return {
    kinds,
    ...(query.tradeIds && query.tradeIds.length > 0 ? { '#trade': unique(query.tradeIds) } : {}),
    ...(query.orderGroupIds && query.orderGroupIds.length > 0 ? { '#d': unique(query.orderGroupIds) } : {}),
    ...(query.listingAnchors && query.listingAnchors.length > 0 ? { '#a': unique(query.listingAnchors) } : {}),
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
  }
}

function filtersForKinds(query: OrderQuery = {}, kinds: number[] = [MarketplaceOrder]): Filter[] {
  const base = baseOrderFilter(query, kinds)
  const identityPubkeys = orderIdentityPubkeys(query.identity)
  const authors = unique(query.authors ?? [])
  const participantPubkeys = unique([...(query.participantPubkeys ?? []), ...identityPubkeys])
  const filters: Filter[] = []

  for (const authorChunk of chunks(authors)) {
    filters.push({ ...base, authors: authorChunk })
  }
  for (const participantChunk of chunks(participantPubkeys)) {
    filters.push({ ...base, '#p': participantChunk })
  }
  return filters.length > 0 ? filters : [base]
}

export function orderFilters(query: OrderQuery = {}): Filter[] {
  return filtersForKinds(query, [MarketplaceOrder])
}

export function orderGroupEventFilters(query: OrderQuery = {}): Filter[] {
  return filtersForKinds(query, MarketplaceOrderGroupKinds)
}

export async function searchOrders(
  pool: OrderQueryPool,
  relays: string[],
  query: OrderQuery = {},
  options: OrderSearchOptions = {},
): Promise<ParsedOrder[]> {
  const uniqueEvents = new Map<string, Event>()
  const filters = orderFilters(query)
  await Promise.all(filters.map(async filter => {
    const events = await pool.querySync(relays, filter, options)
    for (const event of events) uniqueEvents.set(event.id, event)
  }))
  const events = [...uniqueEvents.values()]
  const orders: ParsedOrder[] = []
  for (const event of events) {
    const decoded = decodeMarketplaceEvent(event, parseOrderEvent, {
      source: 'orders.search',
      oninvalid: options.oninvalid,
    })
    if (decoded.ok) orders.push(decoded.value)
  }
  return orders
}

export function subscribeOrders(
  pool: OrderSubscribePool,
  relays: string[],
  query: OrderQuery,
  handlers: OrderSubscribeHandlers,
  options: OrderSubscribeOptions = {},
): SubCloser {
  const filters = orderFilters(query)
  const requests = relays.flatMap(url => filters.map(filter => ({ url, filter })))
  const seen = new Set<string>()
  return pool.subscribeMap(requests, {
    ...options,
    onevent(event: Event) {
      if (seen.has(event.id)) return
      seen.add(event.id)
      const decoded = decodeMarketplaceEvent(event, parseOrderEvent, {
        source: 'orders.subscribe',
        oninvalid: invalid => handlers.oninvalid?.(invalid.event, invalid.error),
      })
      if (decoded.ok) handlers.onevent?.(decoded.value)
    },
    oneose() {
      handlers.oneose?.()
    },
    onclose(reasons) {
      handlers.onclose?.(reasons)
    },
  })
}

export const orderQueries = {
  identityPubkeys: orderIdentityPubkeys,
  filters: orderFilters,
  groupEventFilters: orderGroupEventFilters,
  search: searchOrders,
  subscribe: subscribeOrders,
}
