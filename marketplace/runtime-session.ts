import type { Event } from '../core.ts'
import { findPaymentMethod } from './paymentmethod.ts'
import {
  encodeMarketplaceSeedPayload,
  ensureMarketplaceSeed,
  generateMarketplaceSeed,
  generateMarketplaceSeedEventTemplate,
  marketplaceSeedPayload,
  normalizeMarketplaceSeed,
  parseMarketplaceSeedPayload,
  type MarketplaceSeedSigner,
} from './seed.ts'
import { bind } from './runtime-client.ts'
import { ensurePaymentMethodUpToDate } from './runtime-payment-method.ts'
import type {
  MarketplaceRuntimeOptions,
  MarketplaceRuntimePool,
  MarketplaceSession,
  MarketplaceSessionOptions,
  MarketplaceSessionSeedApi,
  MarketplaceSessionSeedEnsureOptions,
  MarketplaceSessionSeedEnsureResult,
  MarketplaceSessionPaymentMethodApi,
} from './runtime-types.ts'

export async function session(
  pool: MarketplaceRuntimePool,
  relays: string[],
  signer: MarketplaceSeedSigner,
  opts: MarketplaceSessionOptions = {},
): Promise<MarketplaceSession> {
  const pubkey = opts.pubkey ?? (await signer.getPublicKey?.())
  if (!pubkey) throw new Error('Marketplace identity pubkey is required')

  let seedValue = opts.seed ? normalizeMarketplaceSeed(opts.seed) : undefined

  const ensureSeedCreated = async (
    options: MarketplaceSessionSeedEnsureOptions = {},
  ): Promise<MarketplaceSessionSeedEnsureResult & { seed: string }> => {
    const expectedSeed = seedValue
    const resolved = await ensureMarketplaceSeed({
      pool,
      relays,
      pubkey,
      decrypt: async event => parseMarketplaceSeedPayload(await signer.nip44Decrypt(pubkey, event.content)),
      create: async () => {
        const seed = seedValue ?? generateMarketplaceSeed()
        const payload = marketplaceSeedPayload(seed)
        const encryptedContent = await signer.nip44Encrypt(pubkey, encodeMarketplaceSeedPayload(payload))
        return {
          event: await signer.signEvent(
            generateMarketplaceSeedEventTemplate({
              encryptedContent,
              createdAt: options.createdAt ?? opts.createdAt,
            }),
          ),
          payload,
        }
      },
      publish: opts.publish,
    })
    if (expectedSeed && resolved.seed !== expectedSeed) {
      throw new Error('Existing marketplace seed event does not match the configured session seed')
    }
    seedValue = resolved.seed
    return {
      seed: resolved.seed,
      created: resolved.created,
      event: resolved.event,
    }
  }

  const initialSeed = await ensureSeedCreated({ createdAt: opts.createdAt })
  const runtimeOptions: MarketplaceRuntimeOptions = {
    pool,
    relays,
    seed: initialSeed.seed,
    identity: { pubkey },
    signer,
    publish: opts.publish,
    orderPolicies: opts.orderPolicies,
    bidPolicies: opts.bidPolicies,
    autoTrustArbiter: opts.autoTrustArbiter,
    paymentMethod: opts.paymentMethod,
    locationProvider: opts.locationProvider,
    logger: opts.logger,
  }
  const market = bind(pool, relays, {
    seed: initialSeed.seed,
    identity: { pubkey },
    signer,
    publish: opts.publish,
    orderPolicies: opts.orderPolicies,
    bidPolicies: opts.bidPolicies,
    autoTrustArbiter: opts.autoTrustArbiter,
    paymentMethod: opts.paymentMethod,
    locationProvider: opts.locationProvider,
    logger: opts.logger,
  })

  const seedApi: MarketplaceSessionSeedApi = {
    created: initialSeed.created,
    event: initialSeed.event,
    async ensureCreated(options = {}) {
      const result = await ensureSeedCreated(options)
      runtimeOptions.seed = result.seed
      seedApi.created = result.created
      seedApi.event = result.event
      return {
        created: result.created,
        event: result.event,
      }
    },
  }

  const paymentMethod: MarketplaceSessionPaymentMethodApi = {
    ...market.paymentMethod,
    find: () => findPaymentMethod(pool, relays, { author: pubkey }),
    ensureUpToDate: options => ensurePaymentMethodUpToDate(runtimeOptions, options),
  }

  if (opts.ensurePaymentMethod ?? true) {
    await paymentMethod.ensureUpToDate()
  }

  const sessionApi = {
    ...market,
    identity: { pubkey },
    seed: seedApi,
    paymentMethod,
  } satisfies MarketplaceSession

  return sessionApi
}
