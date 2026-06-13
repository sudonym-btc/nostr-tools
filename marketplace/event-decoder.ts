import type { Event } from '../core.ts'
import type { Filter } from '../filter.ts'

export type MarketplaceInvalidEvent = {
  event: Event
  error: Error
  source: string
  relay?: string
  filter?: Filter
}

export type MarketplaceInvalidEventHandler = (invalid: MarketplaceInvalidEvent) => void

export type MarketplaceEventDecodeOptions = {
  source: string
  relay?: string
  filter?: Filter
  oninvalid?: MarketplaceInvalidEventHandler
}

export type MarketplaceEventParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; invalid: MarketplaceInvalidEvent }

export function decodeMarketplaceEvent<T>(
  event: Event,
  parse: (event: Event) => T,
  options: MarketplaceEventDecodeOptions,
): MarketplaceEventParseResult<T> {
  try {
    return { ok: true, value: parse(event) }
  } catch (err) {
    const invalid = {
      event,
      error: err instanceof Error ? err : new Error('Invalid marketplace event'),
      source: options.source,
      ...(options.relay ? { relay: options.relay } : {}),
      ...(options.filter ? { filter: options.filter } : {}),
    }
    options.oninvalid?.(invalid)
    return { ok: false, invalid }
  }
}

export const marketplaceEventDecoder = {
  decode: decodeMarketplaceEvent,
}
