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
import { deriveMarketplaceTradeMaterial, normalizeMarketplaceSeed } from './seed.ts'
import { parseOrderEvent, type ParsedOrder } from './order.ts'
import type { OrderGroupRole } from './order-id.ts'

export type MarketplaceOrderIdentity = {
  pubkey?: string
  seed?: string
  roles?: OrderGroupRole[]
  tempKeyWindow?: number
}

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

function filterSummary(filter: Filter): Record<string, unknown> {
  return {
    kinds: filter.kinds,
    authors: filter.authors?.length ?? 0,
    participantPubkeys: filter['#p']?.length ?? 0,
    tradeIds: filter['#trade']?.length ?? 0,
    orderGroupIds: filter['#d']?.length ?? 0,
    listingAnchors: filter['#a']?.length ?? 0,
    limit: filter.limit,
    since: filter.since,
    until: filter.until,
  }
}

function unique(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function chunks<T>(values: T[], size = defaultPubkeyChunkSize): T[][] {
  const output: T[][] = []
  for (let i = 0; i < values.length; i += size) output.push(values.slice(i, i + size))
  return output
}

function safeTempKeyWindow(value: number | undefined): number {
  const window = value ?? 0
  if (!Number.isSafeInteger(window) || window < 0) throw new Error(`Invalid tempKeyWindow: ${value}`)
  return window
}

function identityRoles(identity: MarketplaceOrderIdentity): OrderGroupRole[] {
  return identity.roles && identity.roles.length > 0 ? identity.roles : ['buyer']
}

export function orderIdentityPubkeys(identity: MarketplaceOrderIdentity = {}): string[] {
  const pubkeys: string[] = []
  if (identity.pubkey) pubkeys.push(identity.pubkey)
  const tempKeyWindow = safeTempKeyWindow(identity.tempKeyWindow)
  if (identity.seed && tempKeyWindow > 0) {
    const seed = normalizeMarketplaceSeed(identity.seed)
    for (const role of identityRoles(identity)) {
      for (let index = 0; index < tempKeyWindow; index += 1) {
        pubkeys.push(deriveMarketplaceTradeMaterial(seed, { index, role }).tradePubkey)
        if (role === 'buyer') {
          pubkeys.push(deriveMarketplaceTradeMaterial(seed, { index, role, extra: 'auction-bid' }).tradePubkey)
        }
      }
    }
  }
  const derived = unique(pubkeys)
  console.debug('[nostr-tools/marketplace] derived order identity pubkeys', {
    hasPubkey: Boolean(identity.pubkey),
    hasSeed: Boolean(identity.seed),
    roles: identityRoles(identity),
    tempKeyWindow,
    pubkeyCount: derived.length,
  })
  return derived
}

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
  const resolved = filters.length > 0 ? filters : [base]
  console.debug('[nostr-tools/marketplace] built order filters', {
    filterCount: resolved.length,
    authorPubkeys: authors.length,
    participantPubkeys: participantPubkeys.length,
    tradeIds: query.tradeIds?.length ?? 0,
    orderGroupIds: query.orderGroupIds?.length ?? 0,
    listingAnchors: query.listingAnchors?.length ?? 0,
    limit: query.limit,
  })
  return resolved
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
  console.debug('[nostr-tools/marketplace] searching orders', {
    relayCount: relays.length,
    filterCount: filters.length,
    maxWait: options.maxWait,
  })
  await Promise.all(filters.map(async filter => {
    try {
      const events = await pool.querySync(relays, filter, options)
      console.debug('[nostr-tools/marketplace] order filter returned events', {
        ...filterSummary(filter),
        eventCount: events.length,
      })
      for (const event of events) uniqueEvents.set(event.id, event)
    } catch (err) {
      console.warn('[nostr-tools/marketplace] order filter query failed', filterSummary(filter), err)
      throw err
    }
  }))
  const events = [...uniqueEvents.values()]
  const orders: ParsedOrder[] = []
  const invalid: { eventId: string; kind: number; error: string }[] = []
  for (const event of events) {
    try {
      orders.push(parseOrderEvent(event))
    } catch (err) {
      invalid.push({
        eventId: event.id,
        kind: event.kind,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  if (invalid.length > 0) {
    console.warn('[nostr-tools/marketplace] ignoring invalid order events', { invalid })
  }
  console.debug('[nostr-tools/marketplace] order search complete', {
    eventCount: events.length,
    validOrderCount: orders.length,
    invalidCount: invalid.length,
  })
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
  console.debug('[nostr-tools/marketplace] subscribing to orders', {
    relayCount: relays.length,
    filterCount: filters.length,
    requestCount: requests.length,
    label: options.label,
  })
  return pool.subscribeMap(requests, {
    ...options,
    onevent(event: Event) {
      if (seen.has(event.id)) return
      seen.add(event.id)
      try {
        handlers.onevent?.(parseOrderEvent(event))
      } catch (err) {
        console.warn('[nostr-tools/marketplace] subscription received invalid order event', {
          eventId: event.id,
          kind: event.kind,
        }, err)
        handlers.oninvalid?.(event, err instanceof Error ? err : new Error('Invalid marketplace order'))
      }
    },
    oneose() {
      console.debug('[nostr-tools/marketplace] order subscription received EOSE', {
        seenEvents: seen.size,
      })
      handlers.oneose?.()
    },
    onclose(reasons) {
      console.debug('[nostr-tools/marketplace] order subscription closed', { reasons })
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
