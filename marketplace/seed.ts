import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate, VerifiedEvent } from '../core.ts'
import type { Filter } from '../filter.ts'
import { MarketplaceSeed } from '../kinds.ts'
import { decrypt, encrypt, getConversationKey } from '../nip44.ts'
import { finalizeEvent, getPublicKey } from '../pure.ts'
import { bytesToHex, hexToBytes, utf8Encoder } from '../utils.ts'
import { now, parseJsonObject, requireString, sha256Hex, sortedJson } from './helper.ts'
import { schnorr } from '@noble/curves/secp256k1.js'
import { sha512 } from '@noble/hashes/sha2.js'
import { randomBytes } from '@noble/hashes/utils.js'

export type MarketplaceSeedPayload = {
  v: 1
  seed: string
}

export type MarketplaceSeedTemplate = {
  encryptedContent: string
  createdAt?: number
}

export type CreateMarketplaceSeedEventOptions = {
  identitySecretKey: Uint8Array
  identityPubkey?: string
  seed?: string
  createdAt?: number
  nonce?: Uint8Array
}

export type DecryptMarketplaceSeedEventOptions = {
  event: Event
  identitySecretKey: Uint8Array
  identityPubkey?: string
}

export type MarketplaceSeedDerivationContext = {
  index?: number | string
  nonce?: string
  listingAnchor?: string
  role?: string
  extra?: string
}

export type MarketplaceTradeMaterial = {
  tradeId: string
  tradeSecretKey: Uint8Array
  tradePubkey: string
}

export type EnsureMarketplaceSeedOptions = {
  pool: Pick<AbstractSimplePool, 'querySync'>
  relays: string[]
  pubkey: string
  decrypt(event: Event): MarketplaceSeedPayload | Promise<MarketplaceSeedPayload>
  create():
    | { event: Event; payload: MarketplaceSeedPayload }
    | Promise<{ event: Event; payload: MarketplaceSeedPayload }>
  publish?(event: Event): unknown | Promise<unknown>
}

export type GetOrCreateMarketplaceSeedOptions = {
  pool: Pick<AbstractSimplePool, 'querySync'>
  relays: string[]
  identitySecretKey: Uint8Array
  createdAt?: number
  publish?(event: Event): unknown | Promise<unknown>
}

export type MarketplaceSeedSigner = {
  getPublicKey?: () => string | Promise<string>
  nip44Encrypt: (pubkey: string, plaintext: string) => string | Promise<string>
  nip44Decrypt: (pubkey: string, ciphertext: string) => string | Promise<string>
  signEvent: (event: EventTemplate) => Event | VerifiedEvent | Promise<Event | VerifiedEvent>
}

export type GetOrCreateMarketplaceSeedWithSignerOptions = {
  pool: Pick<AbstractSimplePool, 'querySync'>
  relays: string[]
  pubkey?: string
  signer: MarketplaceSeedSigner
  createdAt?: number
  publish?(event: Event): unknown | Promise<unknown>
}

export type MarketplaceSeedResolution = {
  event: Event
  payload: MarketplaceSeedPayload
  seed: string
  created: boolean
}

const seedHex = /^[a-f0-9]{64}$/

export function generateMarketplaceSeed(): string {
  return bytesToHex(randomBytes(32))
}

export function normalizeMarketplaceSeed(seed: string): string {
  const normalized = seed.toLowerCase()
  if (!seedHex.test(normalized)) throw new Error('Invalid marketplace seed')
  return normalized
}

export function marketplaceSeedPayload(seed: string): MarketplaceSeedPayload {
  return { v: 1, seed: normalizeMarketplaceSeed(seed) }
}

export function encodeMarketplaceSeedPayload(seed: string | MarketplaceSeedPayload): string {
  const payload = typeof seed === 'string' ? marketplaceSeedPayload(seed) : marketplaceSeedPayload(seed.seed)
  return JSON.stringify(payload)
}

export function parseMarketplaceSeedPayload(content: string): MarketplaceSeedPayload {
  const json = parseJsonObject(content, 'marketplace seed')
  if (json.v !== 1) throw new Error('Invalid marketplace seed version')
  return marketplaceSeedPayload(requireString(json.seed, 'marketplace seed'))
}

export function validateMarketplaceSeedEvent(event: Event): boolean {
  return event.kind === MarketplaceSeed && event.content.length > 0
}

export function generateMarketplaceSeedEventTemplate(seed: MarketplaceSeedTemplate): EventTemplate {
  return {
    kind: MarketplaceSeed,
    created_at: seed.createdAt ?? now(),
    content: seed.encryptedContent,
    tags: [],
  }
}

export function createMarketplaceSeedEvent(opts: CreateMarketplaceSeedEventOptions): Event {
  const identityPubkey = opts.identityPubkey ?? getPublicKey(opts.identitySecretKey)
  const seed = opts.seed ?? generateMarketplaceSeed()
  const conversationKey = getConversationKey(opts.identitySecretKey, identityPubkey)
  const encryptedContent = encrypt(encodeMarketplaceSeedPayload(seed), conversationKey, opts.nonce)
  return finalizeEvent(
    generateMarketplaceSeedEventTemplate({ encryptedContent, createdAt: opts.createdAt }),
    opts.identitySecretKey,
  )
}

export function decryptMarketplaceSeedEvent(opts: DecryptMarketplaceSeedEventOptions): MarketplaceSeedPayload {
  if (!validateMarketplaceSeedEvent(opts.event)) throw new Error('Invalid marketplace seed event')
  const identityPubkey = opts.identityPubkey ?? getPublicKey(opts.identitySecretKey)
  const conversationKey = getConversationKey(opts.identitySecretKey, identityPubkey)
  return parseMarketplaceSeedPayload(decrypt(opts.event.content, conversationKey))
}

export function marketplaceSeedFilter(pubkey: string): Filter {
  return { kinds: [MarketplaceSeed], authors: [pubkey], limit: 1 }
}

export async function fetchMarketplaceSeedEvent(
  pool: Pick<AbstractSimplePool, 'querySync'>,
  relays: string[],
  pubkey: string,
): Promise<Event | null> {
  const events = await pool.querySync(relays, { ...marketplaceSeedFilter(pubkey), limit: 50 })
  return events
    .filter(validateMarketplaceSeedEvent)
    .sort((a, b) => b.created_at - a.created_at || b.id.localeCompare(a.id))[0] ?? null
}

export async function ensureMarketplaceSeed(opts: EnsureMarketplaceSeedOptions): Promise<MarketplaceSeedResolution> {
  const existing = await fetchMarketplaceSeedEvent(opts.pool, opts.relays, opts.pubkey)
  if (existing) {
    const payload = await opts.decrypt(existing)
    return { event: existing, payload, seed: payload.seed, created: false }
  }

  const created = await opts.create()
  if (!validateMarketplaceSeedEvent(created.event)) throw new Error('Invalid created marketplace seed event')
  if (created.event.pubkey !== opts.pubkey) throw new Error('Created marketplace seed event pubkey mismatch')
  await opts.publish?.(created.event)
  return { event: created.event, payload: created.payload, seed: created.payload.seed, created: true }
}

export async function getOrCreateMarketplaceSeed(
  opts: GetOrCreateMarketplaceSeedOptions | GetOrCreateMarketplaceSeedWithSignerOptions,
): Promise<MarketplaceSeedResolution> {
  if ('signer' in opts) {
    const pubkey = opts.pubkey ?? (await opts.signer.getPublicKey?.())
    if (!pubkey) throw new Error('Marketplace seed signer pubkey is required')
    return ensureMarketplaceSeed({
      pool: opts.pool,
      relays: opts.relays,
      pubkey,
      decrypt: async event => parseMarketplaceSeedPayload(await opts.signer.nip44Decrypt(pubkey, event.content)),
      create: async () => {
        const seed = generateMarketplaceSeed()
        const payload = marketplaceSeedPayload(seed)
        const encryptedContent = await opts.signer.nip44Encrypt(pubkey, encodeMarketplaceSeedPayload(payload))
        return {
          event: await opts.signer.signEvent(
            generateMarketplaceSeedEventTemplate({ encryptedContent, createdAt: opts.createdAt }),
          ),
          payload,
        }
      },
      publish: opts.publish,
    })
  }

  const pubkey = getPublicKey(opts.identitySecretKey)
  return ensureMarketplaceSeed({
    pool: opts.pool,
    relays: opts.relays,
    pubkey,
    decrypt: event =>
      decryptMarketplaceSeedEvent({ event, identitySecretKey: opts.identitySecretKey, identityPubkey: pubkey }),
    create: () => {
      const seed = generateMarketplaceSeed()
      return {
        event: createMarketplaceSeedEvent({
          identitySecretKey: opts.identitySecretKey,
          identityPubkey: pubkey,
          seed,
          createdAt: opts.createdAt,
        }),
        payload: marketplaceSeedPayload(seed),
      }
    },
    publish: opts.publish,
  })
}

function derivationContext(context: MarketplaceSeedDerivationContext = {}): string {
  return sortedJson(context)
}

export function deriveMarketplaceTradeId(seed: string, context: MarketplaceSeedDerivationContext = {}): string {
  return sha256Hex(
    `nostr-tools/marketplace/trade-id/v1\n${normalizeMarketplaceSeed(seed)}\n${derivationContext(context)}`,
  )
}

export function deriveMarketplaceTradeSecretKey(
  seed: string,
  context: MarketplaceSeedDerivationContext = {},
): Uint8Array {
  const material = sha512(
    utf8Encoder.encode(
      `nostr-tools/marketplace/trade-key/v1\n${normalizeMarketplaceSeed(seed)}\n${derivationContext(context)}`,
    ),
  )
  return schnorr.utils.randomSecretKey(material.subarray(0, 48))
}

export function deriveMarketplaceTradeMaterial(
  seed: string,
  context: MarketplaceSeedDerivationContext = {},
): MarketplaceTradeMaterial {
  const tradeSecretKey = deriveMarketplaceTradeSecretKey(seed, context)
  return {
    tradeId: deriveMarketplaceTradeId(seed, context),
    tradeSecretKey,
    tradePubkey: getPublicKey(tradeSecretKey),
  }
}

export function marketplaceSeedFromBytes(seed: Uint8Array): string {
  if (seed.length !== 32) throw new Error('Marketplace seed must be 32 bytes')
  return normalizeMarketplaceSeed(bytesToHex(seed))
}

export function marketplaceSeedToBytes(seed: string): Uint8Array {
  return hexToBytes(normalizeMarketplaceSeed(seed))
}

export const seed = {
  generate: generateMarketplaceSeed,
  normalize: normalizeMarketplaceSeed,
  payload: marketplaceSeedPayload,
  encodePayload: encodeMarketplaceSeedPayload,
  parsePayload: parseMarketplaceSeedPayload,
  validate: validateMarketplaceSeedEvent,
  template: generateMarketplaceSeedEventTemplate,
  createEvent: createMarketplaceSeedEvent,
  decryptEvent: decryptMarketplaceSeedEvent,
  filter: marketplaceSeedFilter,
  fetchEvent: fetchMarketplaceSeedEvent,
  ensure: ensureMarketplaceSeed,
  getOrCreate: getOrCreateMarketplaceSeed,
  deriveTradeId: deriveMarketplaceTradeId,
  deriveTradeSecretKey: deriveMarketplaceTradeSecretKey,
  deriveTradeMaterial: deriveMarketplaceTradeMaterial,
  fromBytes: marketplaceSeedFromBytes,
  toBytes: marketplaceSeedToBytes,
}
