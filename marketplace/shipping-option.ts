import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import type { Filter } from '../filter.ts'
import { MarketplaceShippingOption } from '../kinds.ts'
import { decodeMarketplaceEvent, type MarketplaceInvalidEventHandler } from './event-decoder.ts'
import { now, requireString, tagValue } from './helper.ts'

export type ShippingOptionService = 'standard' | 'express' | 'overnight' | 'pickup' | string
export type ShippingOptionDurationUnit = 'H' | 'D' | 'W' | string

export type ShippingOptionPrice = {
  amount: string
  currency: string
}

export type ShippingOptionDuration = {
  min: string
  max: string
  unit: ShippingOptionDurationUnit
}

export type ShippingOptionMeasurement = {
  value: string
  unit: string
}

export type ShippingOptionDimensions = {
  dimensions: string
  unit: string
}

export type ShippingOptionRate = {
  amount: string
  currency?: string
  unit: string
}

export type ParsedMarketplaceShippingOption = {
  event: Event
  d: string
  title: string
  description: string
  price: ShippingOptionPrice
  countries: string[]
  service: ShippingOptionService
  carrier?: string
  regions: string[]
  duration?: ShippingOptionDuration
  location?: string
  geohash?: string
  weightMin?: ShippingOptionMeasurement
  weightMax?: ShippingOptionMeasurement
  dimMin?: ShippingOptionDimensions
  dimMax?: ShippingOptionDimensions
  priceWeight?: ShippingOptionRate
  priceVolume?: ShippingOptionRate
  priceDistance?: ShippingOptionRate
}

export type MarketplaceShippingOptionTemplate = {
  d: string
  title: string
  price: ShippingOptionPrice
  countries: string[]
  service: ShippingOptionService
  description?: string
  carrier?: string
  regions?: string[]
  duration?: ShippingOptionDuration
  location?: string
  geohash?: string
  weightMin?: ShippingOptionMeasurement
  weightMax?: ShippingOptionMeasurement
  dimMin?: ShippingOptionDimensions
  dimMax?: ShippingOptionDimensions
  priceWeight?: ShippingOptionRate
  priceVolume?: ShippingOptionRate
  priceDistance?: ShippingOptionRate
  extraTags?: string[][]
  createdAt?: number
}

export type ShippingOptionSearchQuery = {
  authors?: string[]
  ds?: string[]
  countries?: string[]
  regions?: string[]
  services?: string[]
  carriers?: string[]
  limit?: number
  since?: number
  until?: number
}

export type ShippingOptionSearchOptions = {
  maxWait?: number
  oninvalid?: MarketplaceInvalidEventHandler
}

function tagValuesFromAllFields(event: Event, name: string): string[] {
  return event.tags.filter(tag => tag[0] === name).flatMap(tag => tag.slice(1).filter(Boolean))
}

function unique(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function priceFromTag(tag: string[] | undefined): ShippingOptionPrice {
  if (!tag || tag.length < 3) throw new Error('Invalid shipping option price')
  return { amount: requireString(tag[1], 'shipping option price amount'), currency: requireString(tag[2], 'shipping option currency') }
}

function durationFromTag(tag: string[] | undefined): ShippingOptionDuration | undefined {
  if (!tag) return undefined
  if (tag.length < 4) throw new Error('Invalid shipping option duration')
  return {
    min: requireString(tag[1], 'shipping option duration min'),
    max: requireString(tag[2], 'shipping option duration max'),
    unit: requireString(tag[3], 'shipping option duration unit'),
  }
}

function measurementFromTag(tag: string[] | undefined, label: string): ShippingOptionMeasurement | undefined {
  if (!tag) return undefined
  if (tag.length < 3) throw new Error(`Invalid ${label}`)
  return { value: requireString(tag[1], `${label} value`), unit: requireString(tag[2], `${label} unit`) }
}

function dimensionsFromTag(tag: string[] | undefined, label: string): ShippingOptionDimensions | undefined {
  if (!tag) return undefined
  if (tag.length < 3) throw new Error(`Invalid ${label}`)
  return { dimensions: requireString(tag[1], `${label} dimensions`), unit: requireString(tag[2], `${label} unit`) }
}

function rateFromTag(tag: string[] | undefined, label: string): ShippingOptionRate | undefined {
  if (!tag) return undefined
  if (tag.length < 3) throw new Error(`Invalid ${label}`)
  const amount = requireString(tag[1], `${label} amount`)
  if (tag.length >= 4) {
    return {
      amount,
      currency: requireString(tag[2], `${label} currency`),
      unit: requireString(tag[3], `${label} unit`),
    }
  }
  return { amount, unit: requireString(tag[2], `${label} unit`) }
}

function durationTag(duration: ShippingOptionDuration): string[] {
  return ['duration', duration.min, duration.max, duration.unit]
}

function measurementTag(name: string, measurement: ShippingOptionMeasurement): string[] {
  return [name, measurement.value, measurement.unit]
}

function dimensionsTag(name: string, dimensions: ShippingOptionDimensions): string[] {
  return [name, dimensions.dimensions, dimensions.unit]
}

function rateTag(name: string, rate: ShippingOptionRate): string[] {
  return [name, rate.amount, ...(rate.currency ? [rate.currency] : []), rate.unit]
}

export function shippingOptionAddress(option: Event | ParsedMarketplaceShippingOption): string {
  const parsed = 'event' in option ? option : parseShippingOptionEvent(option)
  return `${parsed.event.kind}:${parsed.event.pubkey}:${parsed.d}`
}

export function validateShippingOptionEvent(event: Event): boolean {
  try {
    parseShippingOptionEvent(event)
    return true
  } catch (_) {
    return false
  }
}

export function parseShippingOptionEvent(event: Event): ParsedMarketplaceShippingOption {
  if (event.kind !== MarketplaceShippingOption) throw new Error('Invalid shipping option kind')
  const d = requireString(tagValue(event, 'd'), 'shipping option d tag')
  const title = requireString(tagValue(event, 'title'), 'shipping option title')
  const price = priceFromTag(event.tags.find(tag => tag[0] === 'price'))
  const countries = tagValuesFromAllFields(event, 'country')
  if (countries.length === 0) throw new Error('Shipping option requires at least one country')
  const service = requireString(tagValue(event, 'service'), 'shipping option service')

  return {
    event,
    d,
    title,
    description: event.content,
    price,
    countries,
    service,
    carrier: tagValue(event, 'carrier'),
    regions: tagValuesFromAllFields(event, 'region'),
    duration: durationFromTag(event.tags.find(tag => tag[0] === 'duration')),
    location: tagValue(event, 'location'),
    geohash: tagValue(event, 'g'),
    weightMin: measurementFromTag(event.tags.find(tag => tag[0] === 'weight-min'), 'shipping option weight-min'),
    weightMax: measurementFromTag(event.tags.find(tag => tag[0] === 'weight-max'), 'shipping option weight-max'),
    dimMin: dimensionsFromTag(event.tags.find(tag => tag[0] === 'dim-min'), 'shipping option dim-min'),
    dimMax: dimensionsFromTag(event.tags.find(tag => tag[0] === 'dim-max'), 'shipping option dim-max'),
    priceWeight: rateFromTag(event.tags.find(tag => tag[0] === 'price-weight'), 'shipping option price-weight'),
    priceVolume: rateFromTag(event.tags.find(tag => tag[0] === 'price-volume'), 'shipping option price-volume'),
    priceDistance: rateFromTag(event.tags.find(tag => tag[0] === 'price-distance'), 'shipping option price-distance'),
  }
}

export function generateShippingOptionEventTemplate(option: MarketplaceShippingOptionTemplate): EventTemplate {
  if (option.countries.length === 0) throw new Error('Shipping option requires at least one country')
  return {
    kind: MarketplaceShippingOption,
    created_at: option.createdAt ?? now(),
    content: option.description ?? '',
    tags: [
      ['d', option.d],
      ['title', option.title],
      ['price', option.price.amount, option.price.currency],
      ['country', ...option.countries],
      ['service', option.service],
      ...(option.carrier ? [['carrier', option.carrier]] : []),
      ...(option.regions?.length ? [['region', ...option.regions]] : []),
      ...(option.duration ? [durationTag(option.duration)] : []),
      ...(option.location ? [['location', option.location]] : []),
      ...(option.geohash ? [['g', option.geohash]] : []),
      ...(option.weightMin ? [measurementTag('weight-min', option.weightMin)] : []),
      ...(option.weightMax ? [measurementTag('weight-max', option.weightMax)] : []),
      ...(option.dimMin ? [dimensionsTag('dim-min', option.dimMin)] : []),
      ...(option.dimMax ? [dimensionsTag('dim-max', option.dimMax)] : []),
      ...(option.priceWeight ? [rateTag('price-weight', option.priceWeight)] : []),
      ...(option.priceVolume ? [rateTag('price-volume', option.priceVolume)] : []),
      ...(option.priceDistance ? [rateTag('price-distance', option.priceDistance)] : []),
      ...(option.extraTags ?? []),
    ],
  }
}

export function shippingOptionSearchFilter(query: ShippingOptionSearchQuery = {}): Filter {
  return {
    kinds: [MarketplaceShippingOption],
    ...(query.authors && query.authors.length > 0 ? { authors: unique(query.authors) } : {}),
    ...(query.ds && query.ds.length > 0 ? { '#d': unique(query.ds) } : {}),
    ...(query.countries && query.countries.length > 0 ? { '#country': unique(query.countries) } : {}),
    ...(query.regions && query.regions.length > 0 ? { '#region': unique(query.regions) } : {}),
    ...(query.services && query.services.length > 0 ? { '#service': unique(query.services) } : {}),
    ...(query.carriers && query.carriers.length > 0 ? { '#carrier': unique(query.carriers) } : {}),
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
  }
}

export async function searchShippingOptions(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  query: ShippingOptionSearchQuery = {},
  options: ShippingOptionSearchOptions = {},
): Promise<ParsedMarketplaceShippingOption[]> {
  const events = await pool.querySync(relays, shippingOptionSearchFilter(query), options)
  const shippingOptions: ParsedMarketplaceShippingOption[] = []
  for (const event of events) {
    const decoded = decodeMarketplaceEvent(event, parseShippingOptionEvent, {
      source: 'shippingOption.search',
      oninvalid: options.oninvalid,
    })
    if (!decoded.ok) continue
    shippingOptions.push(decoded.value)
  }
  return shippingOptions
}

export const shippingOption = {
  kind: MarketplaceShippingOption,
  parse: parseShippingOptionEvent,
  validate: validateShippingOptionEvent,
  address: shippingOptionAddress,
  template: generateShippingOptionEventTemplate,
  filter: shippingOptionSearchFilter,
  filters: { search: shippingOptionSearchFilter },
  search: searchShippingOptions,
}
