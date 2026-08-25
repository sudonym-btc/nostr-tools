import type { Event } from '../core.ts'
import type { MarketplaceListing } from './listing.ts'
import type { ParsedMarketplaceAuction } from './auction.ts'
import { findPaymentMethod } from './paymentmethod.ts'
import {
  encodeMarketplaceSeedPayload,
  ensureMarketplaceSeed,
  generateMarketplaceSeed,
  generateMarketplaceSeedEventTemplate,
  marketplaceSeedPayload,
  normalizeMarketplaceSeed,
  parseMarketplaceSeedPayload,
  deriveMarketplaceTradeMaterial,
  type MarketplaceSeedSigner,
} from './seed.ts'
import { ensurePaymentMethodUpToDate } from './runtime-payment-method.ts'
import { createMarketplaceEscrowApi } from './runtime-escrow.ts'
import { policyName } from './runtime-common.ts'
import { MarketplaceStream, ReplayStream } from './stream.ts'
import type {
  MarketplaceClient,
  MarketplaceDriverRuntimeReporter,
  MarketplacePaymentPolicyImplementation,
  MarketplacePolicyStartResult,
  MarketplacePolicySwapResumeState,
  MarketplaceRuntimeOptions,
  MarketplaceRuntimePool,
  MarketplaceSession,
  MarketplaceSessionDriver,
  MarketplaceSessionDriverKind,
  MarketplaceSessionDriverRecoveryEvent,
  MarketplaceSessionDriverRecoveryFailure,
  MarketplaceSessionDriverRecoveryState,
  MarketplaceSessionDriverState,
  MarketplaceSessionDriversApi,
  MarketplaceSessionOptions,
  MarketplaceSessionSeedApi,
  MarketplaceSessionSeedEnsureOptions,
  MarketplaceSessionSeedEnsureResult,
  MarketplaceSessionPaymentMethodApi,
  MarketplacePaymentRouteOptions,
  MarketplaceSessionOrdersApi,
  MarketplaceSessionAuctionsApi,
  MarketplaceSessionSeedOwnershipPath,
} from './runtime-types.ts'
import {
  auctionPaymentRoutesForListing,
  orderPaymentRoutesForListing,
} from './runtime-routes.ts'

type MarketplaceSessionClientFactory = (options: MarketplaceRuntimeOptions) => MarketplaceClient

function seedOwnershipContexts(index: number) {
  return [
    { index },
    { index, role: 'buyer' },
    { index, role: 'seller' },
    { index, role: 'arbiter' },
  ]
}

function checkedOwnershipBound(value: number | undefined, label: string): number | undefined {
  if (value === undefined) return undefined
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid marketplace seed ownership ${label}: ${value}`)
  return value
}

function emptyDriverRecoveryState(): MarketplaceSessionDriverRecoveryState {
  return {
    active: 0,
    resumed: 0,
    settled: 0,
    failed: 0,
    failures: [],
    updatedAt: Date.now(),
  }
}

function stringFromUnknown(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  if (value === undefined || value === null) return 'Unknown error'
  return String(value)
}

function numberFromData(data: Record<string, unknown> | undefined, ...keys: string[]): number | undefined {
  if (!data) return undefined
  for (const key of keys) {
    const value = data[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (Array.isArray(value)) return value.length
  }
  return undefined
}

function failureFromUnknown(value: unknown, fallbackError = 'Driver recovery failed'): MarketplaceSessionDriverRecoveryFailure {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    const operationId = typeof record.operationId === 'string'
      ? record.operationId
      : typeof record.id === 'string'
        ? record.id
        : undefined
    const error = stringFromUnknown(record.error ?? record.message ?? fallbackError)
    return {
      ...(operationId ? { operationId } : {}),
      error,
    }
  }
  return { error: stringFromUnknown(value ?? fallbackError) }
}

function failuresFromData(
  data: Record<string, unknown> | undefined,
  fallbackError?: string,
): MarketplaceSessionDriverRecoveryFailure[] | undefined {
  const value = data?.failed ?? data?.failures
  if (Array.isArray(value)) return value.map(item => failureFromUnknown(item, fallbackError))
  if (value && typeof value === 'object') return [failureFromUnknown(value, fallbackError)]
  return undefined
}

function recoveryCountsFromData(
  data: Record<string, unknown> | undefined,
): Partial<Pick<MarketplaceSessionDriverRecoveryState, 'active' | 'resumed' | 'settled' | 'failed'>> {
  const active = numberFromData(data, 'activeOperations', 'active')
  const resumed = numberFromData(data, 'resumed')
  const settled = numberFromData(data, 'settled')
  const failed = numberFromData(data, 'failed', 'failures')
  return {
    ...(active !== undefined ? { active } : {}),
    ...(resumed !== undefined ? { resumed } : {}),
    ...(settled !== undefined ? { settled } : {}),
    ...(failed !== undefined ? { failed } : {}),
  }
}

type DriverRuntimeRecord = {
  policy: MarketplacePaymentPolicyImplementation
  driver: MarketplaceSessionDriver
  state: ReplayStream<MarketplaceSessionDriverState>
  recovery: ReplayStream<MarketplaceSessionDriverRecoveryState>
  recoveryStream: MarketplaceStream<MarketplaceSessionDriverRecoveryEvent, MarketplaceSessionDriverRecoveryEvent[]>
  recoveryLog: MarketplaceSessionDriverRecoveryEvent[]
}

function createDriverRecord(
  kind: MarketplaceSessionDriverKind,
  policy: MarketplacePaymentPolicyImplementation,
): DriverRuntimeRecord {
  const id = policyName(policy)
  const label = policy.label ?? id
  const state = new ReplayStream<MarketplaceSessionDriverState>({ replayLimit: 1 })
  const recovery = new ReplayStream<MarketplaceSessionDriverRecoveryState>({ replayLimit: 1 })
  const recoveryStream = new MarketplaceStream<MarketplaceSessionDriverRecoveryEvent, MarketplaceSessionDriverRecoveryEvent[]>({
    eventReplayLimit: 50,
    snapshotReplayLimit: 1,
  })
  const recoveryLog: MarketplaceSessionDriverRecoveryEvent[] = []

  state.next({
    id,
    label,
    kind,
    status: 'idle',
    updatedAt: Date.now(),
  })
  recovery.next(emptyDriverRecoveryState())
  recoveryStream.emitSnapshot(recoveryLog)

  const driver = {
    id,
    label,
    kind,
    state,
    recovery,
    recoveryStream,
  } satisfies MarketplaceSessionDriver

  return {
    policy,
    driver,
    state,
    recovery,
    recoveryStream,
    recoveryLog,
  }
}

function createSessionDrivers(
  orderPolicies: MarketplacePaymentPolicyImplementation[] = [],
  auctionPolicies: MarketplacePaymentPolicyImplementation[] = [],
): { api: MarketplaceSessionDriversApi; reporter: MarketplaceDriverRuntimeReporter } {
  const orderRecords = orderPolicies.map(policy => createDriverRecord('order', policy))
  const auctionRecords = auctionPolicies.map(policy => createDriverRecord('auction', policy))
  const records = [...orderRecords, ...auctionRecords]
  const byPolicy = new Map<MarketplacePaymentPolicyImplementation, DriverRuntimeRecord>()
  const byId = new Map<string, MarketplaceSessionDriver>()

  for (const record of records) {
    byPolicy.set(record.policy, record)
    byId.set(record.driver.id, record.driver)
  }

  function recordFor(policy: MarketplacePaymentPolicyImplementation): DriverRuntimeRecord | undefined {
    return byPolicy.get(policy)
  }

  function setDriverState(
    record: DriverRuntimeRecord | undefined,
    status: MarketplaceSessionDriverState['status'],
    error?: unknown,
  ): void {
    if (!record) return
    record.state.next({
      id: record.driver.id,
      label: record.driver.label,
      kind: record.driver.kind,
      status,
      updatedAt: Date.now(),
      ...(error ? { error: stringFromUnknown(error) } : {}),
    })
  }

  function mergeRecovery(
    record: DriverRuntimeRecord | undefined,
    patch: Partial<Omit<MarketplaceSessionDriverRecoveryState, 'updatedAt'>>,
  ): void {
    if (!record) return
    const previous = record.recovery.value ?? emptyDriverRecoveryState()
    record.recovery.next({
      ...previous,
      ...patch,
      failures: patch.failures ?? previous.failures,
      updatedAt: Date.now(),
    })
  }

  function emitRecoveryEvent(record: DriverRuntimeRecord | undefined, event: MarketplaceSessionDriverRecoveryEvent): void {
    if (!record) return
    record.recoveryLog.push(event)
    if (record.recoveryLog.length > 50) record.recoveryLog.splice(0, record.recoveryLog.length - 50)
    record.recoveryStream.emitEvent(event)
    record.recoveryStream.emitSnapshot([...record.recoveryLog])
  }

  function applyRecoveryData(
    record: DriverRuntimeRecord | undefined,
    data: Record<string, unknown> | undefined,
    fallbackError?: string,
  ): void {
    if (!record || !data) return
    const failures = failuresFromData(data, fallbackError)
    mergeRecovery(record, {
      ...recoveryCountsFromData(data),
      ...(failures ? { failures } : {}),
    })
  }

  const reporter = {
    starting(policy) {
      setDriverState(recordFor(policy), 'starting')
    },
    started(policy, result) {
      const record = recordFor(policy)
      applyRecoveryData(record, result?.data)
      setDriverState(record, 'ready')
    },
    ready(policy) {
      setDriverState(recordFor(policy), 'ready')
    },
    recovering(policy) {
      const record = recordFor(policy)
      setDriverState(record, 'recovering')
      emitRecoveryEvent(record, { type: 'started', at: Date.now() })
    },
    failed(policy, error) {
      const record = recordFor(policy)
      setDriverState(record, 'error', error)
      const failure = failureFromUnknown(error)
      const previous = record?.recovery.value ?? emptyDriverRecoveryState()
      mergeRecovery(record, {
        failed: previous.failed + 1,
        failures: [...previous.failures, failure],
      })
      emitRecoveryEvent(record, {
        type: 'failed',
        at: Date.now(),
        error: failure.error,
      })
    },
    swapResumeState(policy, state) {
      const record = recordFor(policy)
      if (!record) return
      applyRecoveryData(record, state.data, state.type === 'failed' ? state.error : undefined)
      if (state.type === 'noop') return
      if (state.type === 'progress') {
        emitRecoveryEvent(record, {
          type: 'progress',
          at: Date.now(),
          status: state.status,
          ...(state.data ? { data: state.data } : {}),
        })
        return
      }
      if (state.type === 'resumed') {
        const current = record.recovery.value ?? emptyDriverRecoveryState()
        const nextResumed = numberFromData(state.data, 'resumed') ?? current.resumed + 1
        mergeRecovery(record, {
          resumed: nextResumed,
          ...recoveryCountsFromData(state.data),
        })
        emitRecoveryEvent(record, {
          type: 'resumed',
          at: Date.now(),
          ...(state.data ? { data: state.data } : {}),
        })
        return
      }
      const current = record.recovery.value ?? emptyDriverRecoveryState()
      const failures = failuresFromData(state.data, state.error) ?? [failureFromUnknown(state.error)]
      mergeRecovery(record, {
        failed: numberFromData(state.data, 'failed', 'failures') ?? current.failed + failures.length,
        failures,
      })
      emitRecoveryEvent(record, {
        type: 'failed',
        at: Date.now(),
        error: state.error,
        ...(state.data ? { data: state.data } : {}),
      })
    },
    swapResumeComplete(policy) {
      const record = recordFor(policy)
      emitRecoveryEvent(record, { type: 'complete', at: Date.now() })
      setDriverState(record, 'ready')
    },
  } satisfies MarketplaceDriverRuntimeReporter

  const all = records.map(record => record.driver)
  const api = {
    all,
    orders: orderRecords.map(record => record.driver),
    auctions: auctionRecords.map(record => record.driver),
    byId: id => byId.get(id),
    each(callback) {
      for (const driver of all) callback(driver)
    },
  } satisfies MarketplaceSessionDriversApi

  return { api, reporter }
}

export async function createMarketplaceSession(
  pool: MarketplaceRuntimePool,
  relays: string[],
  signer: MarketplaceSeedSigner,
  opts: MarketplaceSessionOptions = {},
  bindClient: MarketplaceSessionClientFactory,
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
  const sessionDrivers = createSessionDrivers(opts.orderDrivers, opts.auctionDrivers)
  const runtimeOptions: MarketplaceRuntimeOptions = {
    pool,
    relays,
    seed: initialSeed.seed,
    identity: { pubkey },
    signer,
    publish: opts.publish,
    orderPolicies: opts.orderDrivers,
    bidPolicies: opts.auctionDrivers,
    driverRuntime: sessionDrivers.reporter,
    autoTrustArbiter: opts.autoTrustArbiter,
    paymentMethod: opts.paymentMethod,
    locationProvider: opts.locationProvider,
    logger: opts.logger,
  }
  const market = bindClient(runtimeOptions)

  const seedApi: MarketplaceSessionSeedApi = {
    created: initialSeed.created,
    event: initialSeed.event,
    owns(pubkey: string, path: MarketplaceSessionSeedOwnershipPath = {}) {
      const from = checkedOwnershipBound(path.from, 'from') ?? 0
      const explicitThrough = checkedOwnershipBound(path.through, 'through')
      const lookahead = checkedOwnershipBound(path.lookahead, 'lookahead') ?? 500
      const discoveredThrough = (market.nextTradeIndex.value ?? 0) + lookahead
      const through = explicitThrough ?? discoveredThrough
      if (through < from) return false

      for (let index = from; index <= through; index += 1) {
        for (const context of seedOwnershipContexts(index)) {
          const material = deriveMarketplaceTradeMaterial(seedValue ?? initialSeed.seed, context)
          if (material.tradePubkey === pubkey) return true
        }
      }
      return false
    },
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

  const orders = {
    ...market.orders,
    paymentRoutes: (listing, options = null) =>
      orderPaymentRoutesForListing(runtimeOptions, listing, options),
    paymentRoute: async (listing, options = null) =>
      (await orderPaymentRoutesForListing(runtimeOptions, listing, options))[0],
  } satisfies MarketplaceSessionOrdersApi

  function isAuctionPaymentRouteTarget(
    value: Event | ParsedMarketplaceAuction | MarketplacePaymentRouteOptions | null | undefined,
  ): value is Event | ParsedMarketplaceAuction {
    return Boolean(value && typeof value === 'object' && ('kind' in value || 'auctionAnchor' in value))
  }

  function sessionAuctionPaymentRoutes(
    listing: Event | MarketplaceListing,
    auction: Event | ParsedMarketplaceAuction,
    options?: MarketplacePaymentRouteOptions | null,
  ): ReturnType<MarketplaceSessionAuctionsApi['paymentRoutes']>
  function sessionAuctionPaymentRoutes(
    listing: Event | MarketplaceListing,
    options?: MarketplacePaymentRouteOptions | null,
  ): ReturnType<MarketplaceSessionAuctionsApi['paymentRoutes']>
  function sessionAuctionPaymentRoutes(
    listing: Event | MarketplaceListing,
    auctionOrOptions?: Event | ParsedMarketplaceAuction | MarketplacePaymentRouteOptions | null,
    options: MarketplacePaymentRouteOptions | null = null,
  ) {
    const auction = isAuctionPaymentRouteTarget(auctionOrOptions) ? auctionOrOptions : undefined
    const routeOptions = auction ? options : auctionOrOptions as MarketplacePaymentRouteOptions | null | undefined
    return auctionPaymentRoutesForListing(runtimeOptions, listing, auction, routeOptions ?? null)
  }

  function sessionAuctionPaymentRoute(
    listing: Event | MarketplaceListing,
    auction: Event | ParsedMarketplaceAuction,
    options?: MarketplacePaymentRouteOptions | null,
  ): ReturnType<MarketplaceSessionAuctionsApi['paymentRoute']>
  function sessionAuctionPaymentRoute(
    listing: Event | MarketplaceListing,
    options?: MarketplacePaymentRouteOptions | null,
  ): ReturnType<MarketplaceSessionAuctionsApi['paymentRoute']>
  async function sessionAuctionPaymentRoute(
    listing: Event | MarketplaceListing,
    auctionOrOptions?: Event | ParsedMarketplaceAuction | MarketplacePaymentRouteOptions | null,
    options: MarketplacePaymentRouteOptions | null = null,
  ) {
    const routes = isAuctionPaymentRouteTarget(auctionOrOptions)
      ? await sessionAuctionPaymentRoutes(listing, auctionOrOptions, options)
      : await sessionAuctionPaymentRoutes(listing, auctionOrOptions as MarketplacePaymentRouteOptions | null | undefined)
    return routes[0]
  }

  const auctions = {
    ...market.auctions,
    paymentRoutes: sessionAuctionPaymentRoutes,
    paymentRoute: sessionAuctionPaymentRoute,
  } satisfies MarketplaceSessionAuctionsApi

  const sessionApi = {
    ...market,
    identity: { pubkey },
    orders,
    auctions,
    seed: seedApi,
    paymentMethod,
    drivers: sessionDrivers.api,
    escrow: createMarketplaceEscrowApi(runtimeOptions, market, sessionDrivers.api),
  } satisfies MarketplaceSession

  return sessionApi
}
