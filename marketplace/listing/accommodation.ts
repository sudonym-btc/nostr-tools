import type { AbstractSimplePool } from '../../abstract-pool.ts'
import type { Event, EventTemplate } from '../../core.ts'
import type { Filter } from '../../filter.ts'
import { ClassifiedListing } from '../../kinds.ts'
import {
  generateListingEventTemplate,
  listingSearchFilter,
  parseListingEvent,
  type ListingImage,
  type ListingSearchQuery,
  type MarketplaceListing,
  type MarketplaceListingTemplate,
} from '../listing.ts'
import { promotedBooleanCombinations, promotedTags, tagPromotion, type TagPromotion } from '../tag-promotion.ts'

export const marketplaceProfileAccommodation = 'accommodation'

export type AccommodationListing = {
  type?: string
  checkIn?: string
  checkOut?: string
  h3: string[]
  specs: Record<string, true | string | number>
}

export type AccommodationMarketplaceListing = MarketplaceListing & {
  accommodation: AccommodationListing
}

export type AccommodationListingTemplate = MarketplaceListingTemplate & {
  profiles?: string[]
  images?: ListingImage[]
  accommodation?: {
    type?: string
    checkIn?: string
    checkOut?: string
    h3?: string[]
    specs?: Record<string, true | string | number>
  }
}

export type AccommodationListingSearchQuery = Omit<ListingSearchQuery, 'profiles' | 'tagFilters'> & {
  profiles?: string[]
  h3?: string[]
  accommodationTypes?: string[]
  features?: string[]
  minGuests?: number
  beds?: number
  bedrooms?: number
  bathrooms?: number
}

export const accommodationTagPromotions: readonly TagPromotion[] = [
  tagPromotion.direct('type', 'T'),
  tagPromotion.boolean('spec', 's'),
  tagPromotion.valued('spec', 'max_guests', 'c'),
  tagPromotion.valued('spec', 'beds', 'b'),
  tagPromotion.valued('spec', 'bedrooms', 'B'),
  tagPromotion.valued('spec', 'bathrooms', 'R'),
]

function parseSpecs(event: Event): Record<string, true | string | number> {
  const specs: Record<string, true | string | number> = {}
  for (const tag of event.tags) {
    if ((tag[0] !== 'spec' && tag[0] !== 'amenity') || tag.length < 2) continue
    if (tag.length === 2) {
      specs[tag[1]] = true
    } else {
      const parsed = Number.parseInt(tag[2], 10)
      specs[tag[1]] = Number.isFinite(parsed) && parsed.toString() === tag[2] ? parsed : tag[2]
    }
  }
  return specs
}

function accommodationTags(accommodation: AccommodationListingTemplate['accommodation'] = {}): string[][] {
  const specs = accommodation.specs ?? {}
  const canonicalTags: string[][] = [
    ...(accommodation.type ? [['type', accommodation.type]] : []),
    ...(accommodation.checkIn ? [['checkIn', accommodation.checkIn]] : []),
    ...(accommodation.checkOut ? [['checkOut', accommodation.checkOut]] : []),
    ...(accommodation.h3 ?? []).map(cell => ['g', cell]),
    ...Object.entries(specs).map(([key, value]) => (value === true ? ['spec', key] : ['spec', key, value.toString()])),
  ]
  const booleanSpecs = Object.entries(specs)
    .filter(([, value]) => value === true)
    .map(([key]) => key)
  return [
    ...canonicalTags,
    ...promotedTags(canonicalTags, accommodationTagPromotions),
    ...promotedBooleanCombinations(booleanSpecs),
  ]
}

export function validateAccommodationListingEvent(event: Event): boolean {
  try {
    parseAccommodationListingEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseAccommodationListingEvent(event: Event): AccommodationMarketplaceListing {
  const listing = parseListingEvent(event)
  if (!listing.profiles.includes(marketplaceProfileAccommodation)) {
    throw new Error('Invalid accommodation listing profile')
  }
  return {
    ...listing,
    accommodation: {
      type: event.tags.find(tag => tag[0] === 'type')?.[1],
      checkIn: event.tags.find(tag => tag[0] === 'checkIn')?.[1],
      checkOut: event.tags.find(tag => tag[0] === 'checkOut')?.[1],
      h3: event.tags.filter(tag => tag[0] === 'g' && tag[1]).map(tag => tag[1]),
      specs: parseSpecs(event),
    },
  }
}

export function generateAccommodationListingEventTemplate(listing: AccommodationListingTemplate): EventTemplate {
  const profiles = [...new Set([...(listing.profiles ?? []), marketplaceProfileAccommodation])]
  return generateListingEventTemplate({
    ...listing,
    profiles,
    extraTags: [...accommodationTags(listing.accommodation), ...(listing.extraTags ?? [])],
  })
}

export function accommodationListingSearchFilter(query: AccommodationListingSearchQuery = {}): Filter {
  const tagFilters: Record<string, string[]> = {
    ...(query.h3?.length ? { g: query.h3 } : {}),
    ...(query.accommodationTypes?.length ? { T: query.accommodationTypes } : {}),
    ...(query.features?.length ? { s: query.features } : {}),
    ...(query.minGuests !== undefined ? { c: [query.minGuests.toString()] } : {}),
    ...(query.beds !== undefined ? { b: [query.beds.toString()] } : {}),
    ...(query.bedrooms !== undefined ? { B: [query.bedrooms.toString()] } : {}),
    ...(query.bathrooms !== undefined ? { R: [query.bathrooms.toString()] } : {}),
  }
  return listingSearchFilter({
    ...query,
    kinds: query.kinds ?? [ClassifiedListing],
    profiles: query.profiles ?? [marketplaceProfileAccommodation],
    tagFilters,
  })
}

export async function searchAccommodationListings(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  query: AccommodationListingSearchQuery = {},
): Promise<AccommodationMarketplaceListing[]> {
  const events = await pool.querySync(relays, accommodationListingSearchFilter(query))
  return events.filter(validateAccommodationListingEvent).map(parseAccommodationListingEvent)
}

export const accommodationListings = {
  parse: parseAccommodationListingEvent,
  validate: validateAccommodationListingEvent,
  template: generateAccommodationListingEventTemplate,
  filters: { search: accommodationListingSearchFilter },
  search: searchAccommodationListings,
}
