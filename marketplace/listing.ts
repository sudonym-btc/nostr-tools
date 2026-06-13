import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import type { Filter } from '../filter.ts'
import { ClassifiedListing, DraftClassifiedListing } from '../kinds.ts'
import {
  amountFromTag,
  amountToTag,
  cancellationPolicyTag,
  firstTag,
  isIsoDuration,
  now,
  normalizeMarketplaceAmount,
  parseCancellationPolicy,
  parseOptionalInt,
  parsePositiveInt,
  parseStrictBool,
  tagForBoolean,
  tagValue,
  tagValues,
  requireString,
  type CancellationPolicy,
  type MarketplaceAmount,
  type MarketplacePrice,
  type RentOrBuy,
} from './helper.ts'
import { decodeMarketplaceEvent, type MarketplaceInvalidEventHandler } from './event-decoder.ts'
import { promotedTags, tagPromotion, type TagPromotion } from './tag-promotion.ts'

export type ListingImage = {
  url: string
  dimensions?: string
}

export type MarketplaceListing = {
  event: Event
  d: string
  title: string
  summary?: string
  description: string
  publishedAt?: number
  location?: string
  status?: string
  profiles: string[]
  images: ListingImage[]
  prices: MarketplacePrice[]
  active: boolean
  autoAccept: boolean
  negotiable: boolean
  rentOrBuy: RentOrBuy
  minDuration?: string
  quantity: number
  securityDeposit?: MarketplaceAmount
  minPaymentAmount?: MarketplaceAmount
  maxDisputePeriod?: number
  cancellationPolicies: CancellationPolicy[]
}

export type MarketplaceListingTemplate = {
  d: string
  title: string
  summary?: string
  description?: string
  publishedAt?: number
  location?: string
  status?: string
  profiles?: string[]
  images?: ListingImage[]
  prices: MarketplacePrice[]
  active?: boolean
  autoAccept?: boolean
  negotiable?: boolean
  rentOrBuy?: RentOrBuy
  minDuration?: string
  quantity?: number
  securityDeposit?: MarketplaceAmount
  minPaymentAmount?: MarketplaceAmount
  maxDisputePeriod?: number
  cancellationPolicies?: CancellationPolicy[]
  extraTags?: string[][]
  createdAt?: number
  draft?: boolean
}

export type ListingSearchQuery = {
  authors?: string[]
  query?: string
  profiles?: string[]
  kinds?: number[]
  locations?: string[]
  autoAccept?: boolean
  negotiable?: boolean
  rentOrBuy?: RentOrBuy
  tagFilters?: Record<string, string[]>
  limit?: number
  since?: number
  until?: number
}

export type MarketplaceListingPriceOptions = {
  end?: Date | number | string
  price?: MarketplacePrice
  priceIndex?: number
  start?: Date | number | string
}

export type ListingSearchOptions = {
  maxWait?: number
  oninvalid?: MarketplaceInvalidEventHandler
}

export const marketplaceListingTagPromotions: readonly TagPromotion[] = [
  tagPromotion.direct('autoAccept', 'I'),
  tagPromotion.direct('rentOrBuy', 'M'),
  tagPromotion.direct('negotiable', 'N'),
]

function priceTag(price: MarketplacePrice): string[] {
  return ['price', price.amount, price.currency, ...(price.frequency ? [price.frequency] : [])]
}

function parsePrices(event: Event): MarketplacePrice[] {
  return event.tags
    .filter(tag => tag[0] === 'price' && tag.length >= 3)
    .map(tag => ({ amount: tag[1], currency: tag[2], ...(tag[3] ? { frequency: tag[3] } : {}) }))
}

function rentOrBuyForPrices(prices: MarketplacePrice[]): RentOrBuy {
  return prices.some(price => price.frequency) ? 'rent' : 'buy'
}

function parseDecimalAmount(value: string): { units: bigint; decimals: number } {
  const match = value.trim().match(/^(\d+)(?:\.(\d+))?$/)
  if (!match) throw new Error(`Invalid decimal amount: ${value}`)
  const [, whole, fraction = ''] = match
  return {
    units: BigInt(`${whole}${fraction}`),
    decimals: fraction.length,
  }
}

function timeValue(value: Date | number | string | undefined): number | undefined {
  if (value === undefined) return undefined
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime()
  return Number.isFinite(time) ? time : undefined
}

function daysBetween(start: Date | number | string | undefined, end: Date | number | string | undefined): number {
  const left = timeValue(start)
  const right = timeValue(end)
  if (left === undefined || right === undefined || right <= left) return 1
  return Math.max(1, Math.ceil((right - left) / 86_400_000))
}

function listingPriceMultiplier(
  frequency: string | undefined,
  options: Pick<MarketplaceListingPriceOptions, 'end' | 'start'>,
): bigint {
  if (!frequency) return 1n
  const normalized = frequency.trim().toLowerCase()
  if (normalized === 'p1d' || normalized.includes('day')) return BigInt(daysBetween(options.start, options.end))
  return 1n
}

function selectListingPrice(listing: MarketplaceListing, options: MarketplaceListingPriceOptions): MarketplacePrice {
  const price = options.price ?? listing.prices[options.priceIndex ?? 0]
  if (!price) throw new Error('Listing price not found')
  return price
}

export function listingPriceAmount(
  listing: MarketplaceListing,
  options: MarketplaceListingPriceOptions = {},
): MarketplaceAmount {
  const price = selectListingPrice(listing, options)
  const parsed = parseDecimalAmount(price.amount)
  const multiplier = listingPriceMultiplier(price.frequency, options)
  return {
    ...normalizeMarketplaceAmount({
      value: (parsed.units * multiplier).toString(),
      denomination: price.currency,
      decimals: parsed.decimals,
    }),
  }
}

export function validateListingEvent(event: Event): boolean {
  try {
    parseListingEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseListingEvent(event: Event): MarketplaceListing {
  if (![ClassifiedListing, DraftClassifiedListing].includes(event.kind)) throw new Error('Invalid listing kind')
  const d = requireString(tagValue(event, 'd'), 'listing d tag')
  const title = requireString(tagValue(event, 'title'), 'listing title')
  const prices = parsePrices(event)
  if (prices.length === 0) throw new Error('Listing requires at least one price tag')

  const active = parseStrictBool(tagValue(event, 'active'), event.kind === ClassifiedListing)
  const autoAccept = parseStrictBool(tagValue(event, 'autoAccept'), false)
  const negotiable = parseStrictBool(tagValue(event, 'negotiable'), false)
  const rentOrBuyTag = tagValue(event, 'rentOrBuy') as RentOrBuy | undefined
  if (rentOrBuyTag !== undefined && rentOrBuyTag !== 'rent' && rentOrBuyTag !== 'buy')
    throw new Error('Invalid rentOrBuy')
  const minDuration = tagValue(event, 'minDuration')
  if (minDuration !== undefined && !isIsoDuration(minDuration)) throw new Error('Invalid minDuration')

  return {
    event,
    d,
    title,
    summary: tagValue(event, 'summary'),
    description: event.content,
    publishedAt: parseOptionalInt(tagValue(event, 'published_at'), 'published_at'),
    location: tagValue(event, 'location'),
    status: tagValue(event, 'status'),
    profiles: tagValues(event, 't'),
    images: event.tags
      .filter(tag => tag[0] === 'image' && tag[1])
      .map(tag => ({ url: tag[1], ...(tag[2] ? { dimensions: tag[2] } : {}) })),
    prices,
    active,
    autoAccept,
    negotiable,
    rentOrBuy: rentOrBuyTag ?? rentOrBuyForPrices(prices),
    minDuration,
    quantity: parsePositiveInt(tagValue(event, 'quantity'), 'quantity', 1),
    securityDeposit: amountFromTag(firstTag(event, 'securityDeposit')),
    minPaymentAmount: amountFromTag(firstTag(event, 'minPaymentAmount')),
    maxDisputePeriod: parseOptionalInt(tagValue(event, 'maxDisputePeriod'), 'maxDisputePeriod'),
    cancellationPolicies: event.tags.filter(tag => tag[0] === 'cancellationPolicy').map(parseCancellationPolicy),
  }
}

export function generateListingEventTemplate(listing: MarketplaceListingTemplate): EventTemplate {
  const createdAt = listing.createdAt ?? now()
  const prices = listing.prices
  const rentOrBuy = listing.rentOrBuy ?? rentOrBuyForPrices(prices)
  const active = listing.active ?? !listing.draft
  const autoAccept = listing.autoAccept ?? false
  const negotiable = listing.negotiable ?? false
  const canonicalTags: string[][] = [
    ['d', listing.d],
    ['title', listing.title],
    ...(listing.summary ? [['summary', listing.summary]] : []),
    ['published_at', (listing.publishedAt ?? createdAt).toString()],
    ...(listing.location ? [['location', listing.location]] : []),
    ...(listing.status ? [['status', listing.status]] : []),
    ...(listing.profiles ?? []).map(profile => ['t', profile]),
    ...prices.map(priceTag),
    ['quantity', (listing.quantity ?? 1).toString()],
    tagForBoolean('active', active),
    tagForBoolean('autoAccept', autoAccept),
    tagForBoolean('negotiable', negotiable),
    ['rentOrBuy', rentOrBuy],
  ]
  const tags = [
    ...canonicalTags,
    ...promotedTags(canonicalTags, marketplaceListingTagPromotions),
    ...(listing.minDuration ? [['minDuration', listing.minDuration]] : []),
    ...(listing.securityDeposit ? [amountToTag('securityDeposit', listing.securityDeposit)] : []),
    ...(listing.minPaymentAmount ? [amountToTag('minPaymentAmount', listing.minPaymentAmount)] : []),
    ...(listing.maxDisputePeriod !== undefined ? [['maxDisputePeriod', listing.maxDisputePeriod.toString()]] : []),
    ...(listing.cancellationPolicies ?? []).map(cancellationPolicyTag),
    ...(listing.images ?? []).map(image => ['image', image.url, ...(image.dimensions ? [image.dimensions] : [])]),
    ...(listing.extraTags ?? []),
  ]

  return {
    kind: listing.draft ? DraftClassifiedListing : ClassifiedListing,
    created_at: createdAt,
    content: listing.description ?? '',
    tags,
  }
}

export function listingAnchor(listing: Event | MarketplaceListing): string {
  const parsed = 'event' in listing ? listing : parseListingEvent(listing)
  return `${parsed.event.kind}:${parsed.event.pubkey}:${parsed.d}`
}

export function listingAnchorParts(anchor: string): { kind: number; pubkey: string; d: string } {
  const [kindValue, pubkey, ...rest] = anchor.split(':')
  const kind = Number.parseInt(kindValue, 10)
  if (!Number.isSafeInteger(kind) || !pubkey || rest.length === 0) {
    throw new Error(`Invalid listing anchor: ${anchor}`)
  }
  return { kind, pubkey, d: rest.join(':') }
}

export function listingSearchFilter(query: ListingSearchQuery = {}): Filter {
  const filter: Filter = {
    kinds: query.kinds ?? [ClassifiedListing],
    limit: query.limit,
    since: query.since,
    until: query.until,
    authors: query.authors,
    search: query.query,
  }
  if (query.profiles?.length) filter['#t'] = query.profiles
  if (query.locations?.length) filter['#location'] = query.locations
  if (query.autoAccept !== undefined) filter['#I'] = [query.autoAccept ? 'true' : 'false']
  if (query.negotiable !== undefined) filter['#N'] = [query.negotiable ? 'true' : 'false']
  if (query.rentOrBuy !== undefined) filter['#M'] = [query.rentOrBuy]
  for (const [tagName, values] of Object.entries(query.tagFilters ?? {})) {
    if (values.length > 0) filter[`#${tagName}`] = values
  }
  return filter
}

export async function searchListings(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  query: ListingSearchQuery = {},
  options: ListingSearchOptions = {},
): Promise<MarketplaceListing[]> {
  const events = await pool.querySync(relays, listingSearchFilter(query), options)
  const listings: MarketplaceListing[] = []
  for (const event of events) {
    const decoded = decodeMarketplaceEvent(event, parseListingEvent, {
      source: 'listings.search',
      oninvalid: options.oninvalid,
    })
    if (decoded.ok) listings.push(decoded.value)
  }
  return listings
}

export async function findListing(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  pubkey: string,
  query: Omit<ListingSearchQuery, 'authors' | 'limit'> = {},
  options: ListingSearchOptions = {},
): Promise<MarketplaceListing | null> {
  const listings = await searchListings(pool, relays, {
    ...query,
    authors: [pubkey],
    limit: 1,
  }, options)
  return listings[0] ?? null
}

export async function findListingById(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  id: string,
  options: ListingSearchOptions = {},
): Promise<MarketplaceListing | null> {
  const [event] = await pool.querySync(relays, { ids: [id], limit: 1 }, options)
  if (!event) return null
  const decoded = decodeMarketplaceEvent(event, parseListingEvent, {
    source: 'listings.findById',
    oninvalid: options.oninvalid,
  })
  return decoded.ok ? decoded.value : null
}

export async function findListingByAnchor(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  anchor: string,
  options: ListingSearchOptions = {},
): Promise<MarketplaceListing | null> {
  const { kind, pubkey, d } = listingAnchorParts(anchor)
  return findListing(pool, relays, pubkey, {
    kinds: [kind],
    tagFilters: { d: [d] },
  }, options)
}

export const listings = {
  anchor: listingAnchor,
  parse: parseListingEvent,
  validate: validateListingEvent,
  template: generateListingEventTemplate,
  filters: { search: listingSearchFilter },
  price: listingPriceAmount,
  findOne: findListing,
  findById: findListingById,
  findByAnchor: findListingByAnchor,
  search: searchListings,
}
