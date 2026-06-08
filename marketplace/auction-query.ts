import type { AbstractSimplePool, SubCloser, SubscribeManyParams } from '../abstract-pool.ts'
import type { Event } from '../core.ts'
import type { Filter } from '../filter.ts'
import { MarketplaceAuction, MarketplaceAuctionComplete } from '../kinds.ts'
import {
  parseAuctionCompleteEvent,
  parseAuctionEvent,
  type ParsedMarketplaceAuction,
  type ParsedMarketplaceAuctionComplete,
} from './auction.ts'

export type MarketplaceAuctionSearchQuery = {
  listingAnchor?: string
  auctionAnchors?: string[]
  authors?: string[]
  arbiterPubkeys?: string[]
  since?: number
  until?: number
  limit?: number
}

export type MarketplaceAuctionSearchOptions = {
  maxWait?: number
}

export type MarketplaceAuctionSubscribeHandlers = {
  onevent?: (auction: ParsedMarketplaceAuction) => void
  onauction?: (auction: ParsedMarketplaceAuction) => void
  onauctions?: (auctions: ParsedMarketplaceAuction[]) => void
  oninvalid?: (event: Event, error: Error) => void
  oneose?: () => void
  onclose?: (reasons: string[]) => void
}

export type MarketplaceAuctionSubscribeOptions =
  Pick<SubscribeManyParams, 'maxWait' | 'id' | 'label' | 'abort'>

export type MarketplaceAuctionCompleteSearchQuery = {
  auctionAnchor?: string
  auctionAnchors?: string[]
  listingAnchor?: string
  authors?: string[]
  statuses?: string[]
  since?: number
  until?: number
  limit?: number
}

export type MarketplaceAuctionCompleteSearchOptions = {
  maxWait?: number
}

export type MarketplaceAuctionCompleteSubscribeHandlers = {
  onevent?: (complete: ParsedMarketplaceAuctionComplete) => void
  oncomplete?: (complete: ParsedMarketplaceAuctionComplete) => void
  oncompletes?: (completes: ParsedMarketplaceAuctionComplete[]) => void
  oninvalid?: (event: Event, error: Error) => void
  oneose?: () => void
  onclose?: (reasons: string[]) => void
}

export type MarketplaceAuctionCompleteSubscribeOptions =
  Pick<SubscribeManyParams, 'maxWait' | 'id' | 'label' | 'abort'>

type AuctionQueryPool = Pick<AbstractSimplePool, 'querySync'>
type AuctionSubscribePool = Pick<AbstractSimplePool, 'subscribeMap'>

function unique(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function latestAuction(
  left: ParsedMarketplaceAuction | undefined,
  right: ParsedMarketplaceAuction,
): ParsedMarketplaceAuction {
  if (!left) return right
  if (right.event.created_at !== left.event.created_at) {
    return right.event.created_at > left.event.created_at ? right : left
  }
  return right.event.id.localeCompare(left.event.id) > 0 ? right : left
}

function auctionAnchorParts(anchor: string): { pubkey: string; d: string } {
  const [kind, pubkey, ...rest] = anchor.split(':')
  if (Number(kind) !== MarketplaceAuction || !pubkey || rest.length === 0) {
    throw new Error(`Invalid marketplace auction anchor: ${anchor}`)
  }
  return { pubkey, d: rest.join(':') }
}

function baseAuctionFilter(query: MarketplaceAuctionSearchQuery = {}): Filter {
  return {
    kinds: [MarketplaceAuction],
    ...(query.listingAnchor ? { '#a': [query.listingAnchor] } : {}),
    ...(query.authors && query.authors.length > 0 ? { authors: unique(query.authors) } : {}),
    ...(query.arbiterPubkeys && query.arbiterPubkeys.length > 0 ? { '#p': unique(query.arbiterPubkeys) } : {}),
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
  }
}

export function auctionSearchFilters(query: MarketplaceAuctionSearchQuery = {}): Filter[] {
  const base = baseAuctionFilter(query)
  const anchors = unique(query.auctionAnchors ?? [])
  if (anchors.length === 0) return [base]

  const authorGate = new Set(query.authors ?? [])
  const filters: Filter[] = []
  for (const anchor of anchors) {
    const { pubkey, d } = auctionAnchorParts(anchor)
    if (authorGate.size > 0 && !authorGate.has(pubkey)) continue
    filters.push({ ...base, authors: [pubkey], '#d': [d] })
  }
  return filters
}

export async function searchAuctions(
  pool: AuctionQueryPool,
  relays: string[],
  query: MarketplaceAuctionSearchQuery = {},
  options: MarketplaceAuctionSearchOptions = {},
): Promise<ParsedMarketplaceAuction[]> {
  const events = new Map<string, Event>()
  const filters = auctionSearchFilters(query)
  await Promise.all(filters.map(async filter => {
    const matches = await pool.querySync(relays, filter, options)
    for (const event of matches) events.set(event.id, event)
  }))

  const latestByAnchor = new Map<string, ParsedMarketplaceAuction>()
  for (const event of events.values()) {
    const auction = parseAuctionEvent(event)
    latestByAnchor.set(auction.auctionAnchor, latestAuction(latestByAnchor.get(auction.auctionAnchor), auction))
  }
  return [...latestByAnchor.values()].sort((a, b) => b.event.created_at - a.event.created_at)
}

export function subscribeAuctions(
  pool: AuctionSubscribePool,
  relays: string[],
  query: MarketplaceAuctionSearchQuery,
  handlers: MarketplaceAuctionSubscribeHandlers,
  options: MarketplaceAuctionSubscribeOptions = {},
): SubCloser {
  const auctions = new Map<string, ParsedMarketplaceAuction>()
  const seen = new Set<string>()
  const filters = auctionSearchFilters(query)
  const requests = relays.flatMap(url => filters.map(filter => ({ url, filter })))
  return pool.subscribeMap(requests, {
    ...options,
    onevent(event: Event) {
      if (seen.has(event.id)) return
      seen.add(event.id)
      let parsed: ParsedMarketplaceAuction
      try {
        parsed = parseAuctionEvent(event)
      } catch (err) {
        handlers.oninvalid?.(event, err instanceof Error ? err : new Error('Invalid marketplace auction'))
        return
      }
      const latest = latestAuction(auctions.get(parsed.auctionAnchor), parsed)
      auctions.set(parsed.auctionAnchor, latest)
      handlers.onevent?.(parsed)
      handlers.onauction?.(latest)
      handlers.onauctions?.([...auctions.values()].sort((a, b) => b.event.created_at - a.event.created_at))
    },
    oneose() {
      handlers.oneose?.()
    },
    onclose(reasons) {
      handlers.onclose?.(reasons)
    },
  })
}

export const auctionQueries = {
  filters: auctionSearchFilters,
  search: searchAuctions,
  subscribe: subscribeAuctions,
}

function latestAuctionComplete(
  left: ParsedMarketplaceAuctionComplete | undefined,
  right: ParsedMarketplaceAuctionComplete,
): ParsedMarketplaceAuctionComplete {
  if (!left) return right
  if (right.event.created_at !== left.event.created_at) {
    return right.event.created_at > left.event.created_at ? right : left
  }
  return right.event.id.localeCompare(left.event.id) > 0 ? right : left
}

function auctionCompleteAnchors(query: MarketplaceAuctionCompleteSearchQuery): string[] {
  return unique([
    query.auctionAnchor,
    query.listingAnchor,
    ...(query.auctionAnchors ?? []),
  ])
}

export function auctionCompleteSearchFilter(query: MarketplaceAuctionCompleteSearchQuery = {}): Filter {
  const anchors = auctionCompleteAnchors(query)
  return {
    kinds: [MarketplaceAuctionComplete],
    ...(anchors.length > 0 ? { '#a': anchors } : {}),
    ...(query.authors && query.authors.length > 0 ? { authors: unique(query.authors) } : {}),
    ...(query.statuses && query.statuses.length > 0 ? { '#status': unique(query.statuses) } : {}),
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
  }
}

function matchesAuctionCompleteQuery(
  complete: ParsedMarketplaceAuctionComplete,
  query: MarketplaceAuctionCompleteSearchQuery,
): boolean {
  const anchors = new Set(unique([query.auctionAnchor, ...(query.auctionAnchors ?? [])]))
  if (anchors.size > 0 && !anchors.has(complete.auctionAnchor)) return false
  if (query.listingAnchor && complete.listingAnchor !== query.listingAnchor) return false
  if (query.authors && query.authors.length > 0 && !query.authors.includes(complete.event.pubkey)) return false
  if (query.statuses && query.statuses.length > 0 && !query.statuses.includes(complete.status)) return false
  return true
}

function sortAuctionCompletes(completes: Iterable<ParsedMarketplaceAuctionComplete>): ParsedMarketplaceAuctionComplete[] {
  return [...completes].sort((a, b) => b.event.created_at - a.event.created_at || b.event.id.localeCompare(a.event.id))
}

export async function searchAuctionCompletes(
  pool: AuctionQueryPool,
  relays: string[],
  query: MarketplaceAuctionCompleteSearchQuery = {},
  options: MarketplaceAuctionCompleteSearchOptions = {},
): Promise<ParsedMarketplaceAuctionComplete[]> {
  const events = await pool.querySync(relays, auctionCompleteSearchFilter(query), options)
  const latestByAuction = new Map<string, ParsedMarketplaceAuctionComplete>()
  for (const event of events) {
    let complete: ParsedMarketplaceAuctionComplete
    try {
      complete = parseAuctionCompleteEvent(event)
    } catch (_) {
      continue
    }
    if (!matchesAuctionCompleteQuery(complete, query)) continue
    latestByAuction.set(complete.auctionAnchor, latestAuctionComplete(latestByAuction.get(complete.auctionAnchor), complete))
  }
  return sortAuctionCompletes(latestByAuction.values())
}

export function subscribeAuctionCompletes(
  pool: AuctionSubscribePool,
  relays: string[],
  query: MarketplaceAuctionCompleteSearchQuery,
  handlers: MarketplaceAuctionCompleteSubscribeHandlers,
  options: MarketplaceAuctionCompleteSubscribeOptions = {},
): SubCloser {
  const completes = new Map<string, ParsedMarketplaceAuctionComplete>()
  const seen = new Set<string>()
  const filter = auctionCompleteSearchFilter(query)
  const requests = relays.map(url => ({ url, filter }))
  return pool.subscribeMap(requests, {
    ...options,
    onevent(event: Event) {
      if (seen.has(event.id)) return
      seen.add(event.id)
      let parsed: ParsedMarketplaceAuctionComplete
      try {
        parsed = parseAuctionCompleteEvent(event)
      } catch (err) {
        handlers.oninvalid?.(event, err instanceof Error ? err : new Error('Invalid marketplace auction complete'))
        return
      }
      if (!matchesAuctionCompleteQuery(parsed, query)) return
      const latest = latestAuctionComplete(completes.get(parsed.auctionAnchor), parsed)
      completes.set(parsed.auctionAnchor, latest)
      handlers.onevent?.(parsed)
      handlers.oncomplete?.(latest)
      handlers.oncompletes?.(sortAuctionCompletes(completes.values()))
    },
    oneose() {
      handlers.oneose?.()
    },
    onclose(reasons) {
      handlers.onclose?.(reasons)
    },
  })
}

export const auctionCompletes = {
  filter: auctionCompleteSearchFilter,
  search: searchAuctionCompletes,
  subscribe: subscribeAuctionCompletes,
}
