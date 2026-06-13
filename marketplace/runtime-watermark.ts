import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import type { Filter } from '../filter.ts'
import { MarketplaceAuctionBid, MarketplaceOrder, MarketplacePayment } from '../kinds.ts'
import { finalizeEvent } from '../pure.ts'
import {
  findPaymentMethod,
  generatePaymentMethodEventTemplate,
  parsePaymentMethodEvent,
  validatePaymentMethodEvent,
  canonicalAssetId,
  paymentMethodFilter,
  type PaymentMethodFindQuery,
  type AcceptedPaymentForm,
  type ParsedPaymentMethod,
} from './paymentmethod.ts'
import {
  arbitrationServiceFilter,
  findArbitrationService,
  generateArbitrationServiceEventTemplate,
  parseArbitrationServiceEvent,
  parseArbitrationServiceSelectionEvent,
  searchArbitrationServices,
  validateArbitrationServiceEvent,
  validateArbitrationServiceSelectionEvent,
  generateArbitrationServiceSelectionEventTemplate,
  calculateArbitrationFee,
  type ArbitrationServiceFindQuery,
  type ParsedArbitrationService,
} from './arbitrationservice.ts'
import {
  generateListingEventTemplate,
  listingSearchFilter,
  parseListingEvent,
  searchListings,
  validateListingEvent,
  type ListingSearchQuery,
  type MarketplaceListing,
} from './listing.ts'
import {
  generateOrderEventTemplate,
  orderCommitHash,
  parseOrderEvent,
  parseStructuredMessageEvent,
  validateOrderEvent,
  validateStructuredMessageEvent,
  generateStructuredMessageEventTemplate,
  type OrderContent,
  type ParsedOrder,
  type ParsedStructuredMessage,
  type OrderTemplate,
} from './order.ts'
import {
  auctionAddress,
  generateAuctionEventTemplate,
  generateAuctionBidEventTemplate,
  generateAuctionCompleteEventTemplate,
  parseAuctionBidEvent,
  parseAuctionCompleteEvent,
  parseAuctionEvent,
  validateAuctionBidEvent,
  validateAuctionCompleteEvent,
  validateAuctionEvent,
  type MarketplaceAuctionBidTemplate,
  type ParsedMarketplaceAuction,
  type ParsedMarketplaceAuctionBid,
} from './auction.ts'
import {
  auctionSearchFilters,
  searchAuctions,
  subscribeAuctions,
  type MarketplaceAuctionSearchOptions,
  type MarketplaceAuctionSearchQuery,
  type MarketplaceAuctionSubscribeHandlers,
  type MarketplaceAuctionSubscribeOptions,
} from './auction-query.ts'
import {
  auctionBidGroupFilter,
  fetchAuctionBidGroups,
  groupAuctionBidEvents,
  reduceAuctionBidGroup,
  subscribeAuctionBidGroups,
  type AuctionBidGroupQuery,
  type AuctionBidGroupSearchOptions,
  type AuctionBidGroupSubscribeHandlers,
  type AuctionBidGroupSubscribeOptions,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
import {
  generatePaymentAckEventTemplate,
  generatePaymentEventTemplate,
  generatePaymentNackEventTemplate,
  generatePaymentSettlementEventTemplate,
  parsePaymentEvent,
  type PaymentSettlementOutput,
  type ParsedPayment,
} from './payment-lifecycle.ts'
import { paymentValidationRequest } from './order-group-payment.ts'
import {
  fetchOrderGroups,
  roleOrderGroups,
  searchOrderGroupsForIdentity,
  searchOrderGroups,
  subscribeOrderGroupsForIdentity,
  subscribeOrderGroups,
  groupOrderEvents,
  orderGroupFilter,
  orderGroupIdForOrder,
  orderGroupIdForParticipants,
  orderGroupParticipantPubkeys,
  reduceOrderGroup,
  resolveAndValidateOrderGroup,
  resolveOrderGroupParticipants,
  validateOrderGroupPayments,
  type OrderGroupFilterQuery,
  type OrderGroupIdentityQuery,
  type OrderGroupRoles,
  type OrderGroupSearchOptions,
  type OrderGroupSubscribeHandlers,
  type ResolveAndValidateOrderGroupOptions,
  type ReduceOrderGroupOptions,
  type ParsedOrderGroup,
} from './order-group.ts'
import {
  orderFilters,
  searchOrders,
  subscribeOrders,
  type MarketplaceOrderIdentity,
  type OrderQuery,
  type OrderSearchOptions,
  type OrderSubscribeHandlers,
  type OrderSubscribeOptions,
} from './order-query.ts'
import { generateReviewEventTemplate, parseReviewEvent, validateReviewEvent } from './review.ts'
import { parseEventJson } from './helper.ts'
import { fetchMarketplaceInbox } from './inbox.ts'
import type {
  MarketplaceAmount,
  OrderParticipantRole,
  PaymentSettlementAction,
  PaymentMethod,
  PaymentProof,
  PaymentProofEvidence,
  PTag,
} from './helper.ts'
import {
  deriveMarketplaceTradeId,
  deriveMarketplaceTradeMaterial,
  getOrCreateMarketplaceSeed,
  normalizeMarketplaceSeed,
  type MarketplaceSeedSigner,
} from './seed.ts'
import type {
  MarketplacePaymentValidationPolicy,
  MarketplacePaymentValidationRequest,
  MarketplacePaymentValidationResult,
} from './payment-validation.ts'
import type {
  MarketplaceLogger,
  MarketplacePolicyWatermarkRecoveryAction,
  MarketplacePolicyWatermarkContext,
  MarketplacePolicyWatermarkDiscovery,
  MarketplacePolicyStartContext,
  MarketplacePolicyStartResult,
  MarketplaceHighWatermarkOptions,
  MarketplaceHighWatermarkPass,
  MarketplaceHighWatermarkDiscovery,
  MarketplaceStartOptions,
  MarketplaceStartResult,
  MarketplacePaymentMethodDefaults,
  MarketplacePaymentMethodEnsureOptions,
  MarketplacePaymentMethodEnsureResult,
  MarketplaceSessionPaymentMethodApi,
  MarketplacePaymentRoute,
  MarketplacePaymentPolicy,
  MarketplacePaymentAsset,
  MarketplacePaymentIdentity,
  MarketplacePaymentContract,
  MarketplacePaymentIntent,
  MarketplacePaymentValidationItem,
  MarketplacePaymentSweepState,
  MarketplacePaymentArbitrationIntent,
  MarketplacePaymentArbitrationState,
  MarketplacePaymentArbitrationRequest,
  MarketplacePaymentArbitrationRuntimeState,
  MarketplaceAuctionSettlementRequest,
  MarketplaceAuctionBidSettlementInput,
  MarketplaceAuctionBidValidation,
  MarketplaceAuctionPaymentSettlementIntent,
  MarketplaceAuctionPaymentSettlementResult,
  MarketplaceAuctionSettlementState,
  MarketplaceBolt11PaymentRequest,
  MarketplacePaymentRequest,
  MarketplacePolicyPaymentRequiredState,
  MarketplacePolicyPaymentProgressState,
  MarketplacePolicyPaymentPaidState,
  MarketplacePolicyPaymentCompletedState,
  MarketplacePolicyPaymentState,
  MarketplacePaymentRequiredState,
  MarketplacePaymentProgressState,
  MarketplaceOrderPublishedState,
  MarketplacePaymentPublishedState,
  MarketplacePaymentCompletedState,
  MarketplacePaymentState,
  MarketplaceAuctionBidPublishedState,
  MarketplaceAuctionBidPaymentPublishedState,
  MarketplaceAuctionBidCompletedState,
  MarketplaceAuctionBidState,
  MarketplacePaymentPolicyImplementation,
  MarketplaceOrderPolicy,
  MarketplaceBidPolicy,
  MarketplacePayOptions,
  MarketplaceResolvedPayOptions,
  MarketplacePaymentRouteOptions,
  MarketplaceOrderCreateParams,
  MarketplaceRuntimeIdentity,
  MarketplaceRuntimePool,
  MarketplaceRuntimeOptions,
  MarketplaceArbitrationStartEvent,
  MarketplaceArbitrationStartOptions,
  MarketplaceArbitrationRuntime,
  MarketplaceSessionIdentity,
  MarketplaceBindOptions,
  MarketplaceSessionOptions,
  MarketplaceListingsApi,
  MarketplacePaymentMethodApi,
  MarketplaceArbitrationServicesApi,
  MarketplaceArbitrationServiceSelectionsApi,
  MarketplaceOrderGroupsApi,
  MarketplaceOrdersApi,
  MarketplaceReviewsApi,
  MarketplaceStructuredMessagesApi,
  MarketplaceAuctionsApi,
  MarketplaceAuctionBidGroupsApi,
  MarketplacePaymentsApi,
  MarketplaceArbitrationApi,
  MarketplaceClient,
  MarketplaceSessionSeedEnsureOptions,
  MarketplaceSessionSeedEnsureResult,
  MarketplaceSessionSeedApi,
  MarketplaceSession,
} from './runtime-types.ts'
import {
  allPolicyAssets,
  allPolicyDescriptors,
  marketplaceLogger,
  normalizePolicyWatermark,
  paymentPolicies,
  policyName,
  runtimeSeed,
  safeWatermark,
  safeWindow,
} from './runtime-common.ts'

const watermarkPubkeyChunkSize = 200

type NostrHighWatermarkScan = {
  maxUsedIndex: number
  scannedFrom: number
  scannedThrough: number
  orderEventCount: number
  bidEventCount: number
  matchedPubkeyCount: number
}

type InboxHighWatermarkScan = {
  maxUsedIndex: number
  inboxEventCount: number
  sentStructuredMessageCount: number
  matchedTradeIdCount: number
}

function valueChunks<T>(values: T[], size = watermarkPubkeyChunkSize): T[][] {
  const output: T[][] = []
  for (let index = 0; index < values.length; index += size) output.push(values.slice(index, index + size))
  return output
}

function nostrWatermarkPubkeys(seed: string, from: number, through: number): Map<string, number> {
  const pubkeys = new Map<string, number>()
  for (let index = from; index <= through; index += 1) {
    pubkeys.set(deriveMarketplaceTradeMaterial(seed, { index, role: 'buyer' }).tradePubkey, index)
  }
  return pubkeys
}

function eventWatermarkIndexes(event: Event, pubkeyIndexes: Map<string, number>): number[] {
  return [
    pubkeyIndexes.get(event.pubkey),
    ...event.tags
      .filter(tag => tag[0] === 'p')
      .map(tag => pubkeyIndexes.get(tag[1])),
  ].filter((index): index is number => index !== undefined)
}

function tradeIdWatermarkIndexes(seed: string, from: number, through: number): Map<string, number> {
  const tradeIds = new Map<string, number>()
  for (let index = from; index <= through; index += 1) {
    tradeIds.set(deriveMarketplaceTradeId(seed, { index }), index)
  }
  return tradeIds
}

function legacyNegotiationTradeIndex(tradeId: string | undefined): number | undefined {
  const match = tradeId?.match(/:negotiation:(\d+)$/)
  if (!match) return undefined
  const index = Number(match[1])
  return Number.isSafeInteger(index) && index >= 0 ? index : undefined
}

function sentStructuredMessageWatermarkIndexes(
  event: Event,
  senderPubkey: string,
  tradeIdIndexes: Map<string, number>,
): number[] {
  if (event.pubkey !== senderPubkey) return []
  try {
    const message = parseStructuredMessageEvent(event)
    const order = parseOrderEvent(message.childEvent)
    if (order.event.pubkey !== senderPubkey) return []
    return [...new Set([
      tradeIdIndexes.get(message.conversation ?? ''),
      tradeIdIndexes.get(order.tradeId),
      legacyNegotiationTradeIndex(message.conversation),
      legacyNegotiationTradeIndex(order.tradeId),
    ])]
      .filter((index): index is number => index !== undefined)
  } catch {
    return []
  }
}

async function queryNostrWatermarkEvents(
  opts: MarketplaceRuntimeOptions,
  kinds: number[],
  pubkeys: string[],
): Promise<Event[]> {
  const events = new Map<string, Event>()
  const filters: Filter[] = valueChunks(pubkeys).flatMap(chunk => [
    { kinds, authors: chunk },
    { kinds, '#p': chunk },
  ])
  await Promise.all(filters.map(async filter => {
    for (const event of await opts.pool.querySync(opts.relays, filter)) events.set(event.id, event)
  }))
  return [...events.values()]
}

async function scanNostrHighWatermarkWindow(
  opts: MarketplaceRuntimeOptions,
  seed: string,
  highWaterMark: number,
  unusedWindow: number,
): Promise<NostrHighWatermarkScan> {
  const scannedFrom = highWaterMark + 1
  const scannedThrough = highWaterMark + unusedWindow
  const pubkeyIndexes = nostrWatermarkPubkeys(seed, scannedFrom, scannedThrough)
  const pubkeys = [...pubkeyIndexes.keys()]
  const [orderEvents, bidEvents] = await Promise.all([
    queryNostrWatermarkEvents(opts, [MarketplaceOrder], pubkeys),
    queryNostrWatermarkEvents(opts, [MarketplaceAuctionBid], pubkeys),
  ])
  let maxUsedIndex = highWaterMark
  const matchedPubkeys = new Set<string>()
  for (const event of [...orderEvents, ...bidEvents]) {
    const matchedIndexes = eventWatermarkIndexes(event, pubkeyIndexes)
    if (matchedIndexes.length === 0) continue
    maxUsedIndex = Math.max(maxUsedIndex, ...matchedIndexes)
    for (const [pubkey, index] of pubkeyIndexes) {
      if (matchedIndexes.includes(index) && (event.pubkey === pubkey || event.tags.some(tag => tag[0] === 'p' && tag[1] === pubkey))) {
        matchedPubkeys.add(pubkey)
      }
    }
  }
  return {
    maxUsedIndex,
    scannedFrom,
    scannedThrough,
    orderEventCount: orderEvents.length,
    bidEventCount: bidEvents.length,
    matchedPubkeyCount: matchedPubkeys.size,
  }
}

async function scanInboxHighWatermark(
  opts: MarketplaceRuntimeOptions,
  seed: string,
  highWaterMark: number,
  unusedWindow: number,
): Promise<InboxHighWatermarkScan | undefined> {
  if (!opts.signer) return undefined
  const pubkey = opts.identity?.pubkey ?? await opts.signer.getPublicKey?.()
  if (!pubkey) return undefined
  const scannedFrom = highWaterMark + 1
  const scannedThrough = highWaterMark + unusedWindow
  const tradeIdIndexes = tradeIdWatermarkIndexes(seed, scannedFrom, scannedThrough)
  const items = await fetchMarketplaceInbox(
    opts.pool,
    opts.relays,
    opts.signer,
    { pubkey },
    { label: 'marketplace.runtime.watermark.inbox' },
  )
  let maxUsedIndex = highWaterMark
  let sentStructuredMessageCount = 0
  let matchedTradeIdCount = 0
  for (const item of items) {
    if (!item.rumor) continue
    const indexes = sentStructuredMessageWatermarkIndexes(item.rumor, pubkey, tradeIdIndexes)
    if (indexes.length === 0) continue
    sentStructuredMessageCount += 1
    matchedTradeIdCount += indexes.length
    maxUsedIndex = Math.max(maxUsedIndex, ...indexes)
  }
  return {
    maxUsedIndex,
    inboxEventCount: items.length,
    sentStructuredMessageCount,
    matchedTradeIdCount,
  }
}

async function discoverInboxHighWatermark(
  opts: MarketplaceRuntimeOptions,
  seed: string,
  highWaterMark: number,
  unusedWindow: number,
  maxPasses: number,
  logger: MarketplaceLogger,
): Promise<number> {
  let current = highWaterMark
  for (let pass = 0; pass < maxPasses; pass += 1) {
    const scan = await scanInboxHighWatermark(opts, seed, current, unusedWindow)
    if (!scan) return current
    logger.debug('Marketplace inbox watermark scanned', {
      pass,
      inputHighWaterMark: current,
      maxUsedIndex: scan.maxUsedIndex,
      inboxEventCount: scan.inboxEventCount,
      sentStructuredMessageCount: scan.sentStructuredMessageCount,
      matchedTradeIdCount: scan.matchedTradeIdCount,
    })
    if (scan.maxUsedIndex === current) return current
    current = scan.maxUsedIndex
  }
  return current
}

async function discoverNostrHighWatermark(
  opts: MarketplaceRuntimeOptions,
  seed: string,
  highWaterMark: number,
  unusedWindow: number,
  maxPasses: number,
  logger: MarketplaceLogger,
): Promise<number> {
  let current = highWaterMark
  for (let pass = 0; pass < maxPasses; pass += 1) {
    const scan = await scanNostrHighWatermarkWindow(opts, seed, current, unusedWindow)
    logger.debug('Marketplace Nostr watermark window scanned', {
      pass,
      inputHighWaterMark: current,
      maxUsedIndex: scan.maxUsedIndex,
      scannedFrom: scan.scannedFrom,
      scannedThrough: scan.scannedThrough,
      orderEventCount: scan.orderEventCount,
      bidEventCount: scan.bidEventCount,
      matchedPubkeyCount: scan.matchedPubkeyCount,
    })
    if (scan.maxUsedIndex === current) return current
    current = scan.maxUsedIndex
  }
  return current
}

export async function discoverMarketplaceHighWatermark(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceHighWatermarkOptions = {},
): Promise<MarketplaceHighWatermarkDiscovery> {
  const seed = runtimeSeed(opts, options.seed)
  const unusedWindow = safeWindow(options.unusedWindow)
  const maxPasses = options.maxPasses ?? 16
  if (!Number.isSafeInteger(maxPasses) || maxPasses < 1) throw new Error(`Invalid maxPasses: ${options.maxPasses}`)

  const initialHighWaterMark = safeWatermark(options.highWaterMark)
  let highWaterMark = initialHighWaterMark
  const passes: MarketplaceHighWatermarkPass[] = []
  let latestPolicyResults: MarketplacePolicyWatermarkDiscovery[] = []
  const recoveryActions: unknown[] = []

  const policies = paymentPolicies(opts)
  const logger = marketplaceLogger(opts, 'marketplace.runtime.watermark')
  const nostrHighWaterMark = await discoverNostrHighWatermark(opts, seed, highWaterMark, unusedWindow, maxPasses, logger)
  highWaterMark = await discoverInboxHighWatermark(opts, seed, nostrHighWaterMark, unusedWindow, maxPasses, logger)
  logger.info('Discovering marketplace high watermark', {
    policyCount: policies.length,
    initialHighWaterMark,
    nostrHighWaterMark,
    inboxHighWaterMark: highWaterMark,
    highWaterMark,
    unusedWindow,
    maxPasses,
  })

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const inputHighWaterMark = highWaterMark
    const policyResults: MarketplacePolicyWatermarkDiscovery[] = []

    for (const policy of policies) {
      if (!policy.discoverHighWatermark) continue
      const result = normalizePolicyWatermark(
        policy,
        await policy.discoverHighWatermark({
          seed,
          highWaterMark: inputHighWaterMark,
          unusedWindow,
          ...(options.now !== undefined ? { now: options.now } : {}),
          ...(opts.logger ? { logger: opts.logger } : {}),
        }),
      )
      policyResults.push(result)
      logger.debug('Payment policy watermark discovered', {
        policy: result.policy,
        maxUsedIndex: result.maxUsedIndex,
        nextUnusedIndex: result.nextUnusedIndex,
        recoveryActionCount: result.recoveryActions?.length ?? 0,
      })
      if (result.recoveryActions) recoveryActions.push(...result.recoveryActions)
      highWaterMark = Math.max(highWaterMark, result.maxUsedIndex)
    }

    latestPolicyResults = policyResults
    passes.push({
      pass,
      inputHighWaterMark,
      outputHighWaterMark: highWaterMark,
      policyResults,
    })

    if (highWaterMark === inputHighWaterMark) {
      logger.info('Marketplace high watermark converged', {
        pass,
        maxUsedIndex: highWaterMark,
        nextUnusedIndex: highWaterMark + 1,
        recoveryActionCount: recoveryActions.length,
      })
      return {
        seed,
        maxUsedIndex: highWaterMark,
        nextUnusedIndex: highWaterMark + 1,
        unusedWindow,
        passes,
        policyResults: latestPolicyResults,
        recoveryActions,
        converged: true,
      }
    }
  }

  return {
    seed,
    maxUsedIndex: highWaterMark,
    nextUnusedIndex: highWaterMark + 1,
    unusedWindow,
    passes,
    policyResults: latestPolicyResults,
    recoveryActions,
    converged: false,
  }
}

export async function startMarketplaceRuntime(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceStartOptions = {},
): Promise<MarketplaceStartResult> {
  const discovery = await discoverMarketplaceHighWatermark(opts, options)
  const policyResults: MarketplacePolicyStartResult[] = []
  const policies = paymentPolicies(opts)
  const logger = marketplaceLogger(opts, 'marketplace.runtime.start')
  logger.info('Starting marketplace payment policies', {
    policyCount: policies.length,
    maxUsedIndex: discovery.maxUsedIndex,
    nextUnusedIndex: discovery.nextUnusedIndex,
  })

  for (const policy of policies) {
    const driverRuntime = opts.driverRuntime
    const context = {
      seed: discovery.seed,
      highWaterMark: discovery.maxUsedIndex,
      nextUnusedIndex: discovery.nextUnusedIndex,
      unusedWindow: discovery.unusedWindow,
      discovery,
      ...(options.now !== undefined ? { now: options.now } : {}),
      ...(opts.logger ? { logger: opts.logger } : {}),
    }
    if (policy.startup) {
      driverRuntime?.starting(policy)
      try {
        const started = await policy.startup(context)
        if (started) {
          const result = { ...started, policy: started.policy || policyName(policy) }
          policyResults.push(result)
          driverRuntime?.started(policy, result)
          logger.info('Payment policy started', {
            policy: result.policy,
            data: result.data,
          })
        } else {
          driverRuntime?.started(policy)
        }
      } catch (error) {
        driverRuntime?.failed(policy, error)
        throw error
      }
    } else {
      driverRuntime?.ready(policy)
    }
    if (policy.resumeSwapOperations) {
      driverRuntime?.recovering(policy)
      try {
        const resume = await policy.resumeSwapOperations(context)
        for await (const state of resume) {
          driverRuntime?.swapResumeState(policy, state)
          logger.info('Payment policy swap operations resume state', {
            policy: policyName(policy),
            type: state.type,
            data: state.data,
          })
          if (state.type === 'noop') continue
          policyResults.push({
            policy: policyName(policy),
            data: {
              swapResume: state.type,
              ...(state.type === 'progress' ? { status: state.status } : {}),
              ...(state.type === 'failed' ? { error: state.error } : {}),
              ...(state.data ?? {}),
            },
          })
        }
        driverRuntime?.swapResumeComplete(policy)
      } catch (error) {
        driverRuntime?.failed(policy, error)
        throw error
      }
    }
  }

  return {
    discovery,
    policyResults,
    policies: allPolicyDescriptors(policies),
    assets: allPolicyAssets(policies),
  }
}
