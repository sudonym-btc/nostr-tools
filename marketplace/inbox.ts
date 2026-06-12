import type { AbstractSimplePool, SubCloser, SubscribeManyParams } from '../abstract-pool.ts'
import type { Event, EventTemplate, VerifiedEvent } from '../core.ts'
import type { Filter } from '../filter.ts'
import { GiftWrap, Seal } from '../kinds.ts'
import {
  MarketplaceStream,
  StreamClosed,
  StreamEose,
  StreamLive,
} from './stream.ts'

export type MarketplaceInboxSigner = {
  getPublicKey?: () => string | Promise<string>
  nip44Decrypt: (pubkey: string, ciphertext: string) => string | Promise<string>
}

export type MarketplaceInboxItem = {
  wrap: Event
  seal?: Event
  rumor?: Event
  error?: string
}

export type MarketplaceInboxQuery = {
  pubkey?: string
  limit?: number
  since?: number
  until?: number
}

export type MarketplaceInboxFetchOptions = Pick<SubscribeManyParams, 'id' | 'label' | 'maxWait'>

export type MarketplaceInboxSubscribeOptions =
  Pick<SubscribeManyParams, 'id' | 'label' | 'maxWait' | 'onauth'>

export type MarketplaceInboxStream =
  MarketplaceStream<MarketplaceInboxItem, MarketplaceInboxItem[]>

type InboxFetchPool = Pick<AbstractSimplePool, 'querySync'>
type InboxSubscribePool = Pick<AbstractSimplePool, 'subscribeMap'>

function parseEventJson(value: string): Event {
  return JSON.parse(value) as Event
}

function sortInboxItems(items: Iterable<MarketplaceInboxItem>): MarketplaceInboxItem[] {
  return [...items].sort((a, b) => {
    const left = a.rumor?.created_at ?? a.seal?.created_at ?? a.wrap.created_at
    const right = b.rumor?.created_at ?? b.seal?.created_at ?? b.wrap.created_at
    return right - left || b.wrap.id.localeCompare(a.wrap.id)
  })
}

async function inboxPubkey(
  signer: MarketplaceInboxSigner,
  query: MarketplaceInboxQuery = {},
): Promise<string> {
  if (query.pubkey) return query.pubkey
  const pubkey = await signer.getPublicKey?.()
  if (!pubkey) throw new Error('Marketplace inbox requires a pubkey or signer getPublicKey')
  return pubkey
}

export function marketplaceInboxFilter(
  query: MarketplaceInboxQuery & { pubkey: string },
): Filter {
  return {
    kinds: [GiftWrap],
    '#p': [query.pubkey],
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
  }
}

export async function unwrapMarketplaceInboxItem(
  wrap: Event,
  signer: MarketplaceInboxSigner,
): Promise<MarketplaceInboxItem> {
  if (wrap.kind !== GiftWrap) return { wrap, error: 'Not a gift wrap event' }
  try {
    const seal = parseEventJson(await signer.nip44Decrypt(wrap.pubkey, wrap.content))
    if (seal.kind !== Seal) return { wrap, seal, error: 'Gift wrap did not contain a seal' }
    const rumor = parseEventJson(await signer.nip44Decrypt(seal.pubkey, seal.content))
    return { wrap, seal, rumor }
  } catch (err) {
    return { wrap, error: err instanceof Error ? err.message : 'Unable to unwrap event' }
  }
}

export async function fetchMarketplaceInbox(
  pool: InboxFetchPool,
  relays: string[],
  signer: MarketplaceInboxSigner,
  query: MarketplaceInboxQuery = {},
  options: MarketplaceInboxFetchOptions = {},
): Promise<MarketplaceInboxItem[]> {
  const pubkey = await inboxPubkey(signer, query)
  const wraps = await pool.querySync(relays, marketplaceInboxFilter({ ...query, pubkey }), options)
  const items = await Promise.all(wraps.map(wrap => unwrapMarketplaceInboxItem(wrap, signer)))
  return sortInboxItems(items)
}

export function streamMarketplaceInbox(
  pool: InboxSubscribePool,
  relays: string[],
  signer: MarketplaceInboxSigner,
  query: MarketplaceInboxQuery & { pubkey: string },
  options: MarketplaceInboxSubscribeOptions = {},
): MarketplaceInboxStream {
  const items = new Map<string, MarketplaceInboxItem>()
  let eventCount = 0
  let sub: SubCloser | undefined
  const stream = new MarketplaceStream<MarketplaceInboxItem, MarketplaceInboxItem[]>({
    onClose: reason => sub?.close(reason),
  })
  stream.emitSnapshot([])
  stream.markQuerying({ requestCount: relays.length })
  sub = pool.subscribeMap(relays.map(url => ({
    url,
    filter: marketplaceInboxFilter(query),
  })), {
    ...options,
    onevent(event) {
      eventCount += 1
      void unwrapMarketplaceInboxItem(event, signer).then(item => {
        items.set(item.wrap.id, item)
        stream.emitEvent(item)
        stream.emitSnapshot(sortInboxItems(items.values()))
      }).catch(err => {
        stream.fail(err instanceof Error ? err : new Error('Unable to unwrap inbox event'))
      })
    },
    oneose() {
      stream.markEose({ eventCount })
      stream.markLive({ eventCount })
    },
    onclose(reasons) {
      stream.emitStatus(new StreamClosed({ reasons }))
    },
  })
  return stream
}

export async function queryMarketplaceInboxStream(
  stream: MarketplaceInboxStream,
): Promise<MarketplaceInboxItem[]> {
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

export function signerAuth(
  signer: MarketplaceInboxSigner & { signEvent?: (event: EventTemplate) => Event | VerifiedEvent | Promise<Event | VerifiedEvent> },
): ((event: EventTemplate) => Promise<VerifiedEvent>) | undefined {
  if (!signer.signEvent) return undefined
  return async event => signer.signEvent!(event) as Promise<VerifiedEvent>
}

export const inbox = {
  filter: marketplaceInboxFilter,
  unwrap: unwrapMarketplaceInboxItem,
  fetch: fetchMarketplaceInbox,
  stream: streamMarketplaceInbox,
  query: queryMarketplaceInboxStream,
}
