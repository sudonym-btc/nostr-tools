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
): Promise<MarketplaceListing[]> {
  const events = await pool.querySync(relays, listingSearchFilter(query))
  return events.filter(validateListingEvent).map(parseListingEvent)
}

export const listings = {
  parse: parseListingEvent,
  validate: validateListingEvent,
  template: generateListingEventTemplate,
  filters: { search: listingSearchFilter },
  search: searchListings,
}
