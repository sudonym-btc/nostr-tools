import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import { MarketplaceAuctionBid, MarketplacePayment } from '../kinds.ts'
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
  escrowServiceFilter,
  findEscrowService,
  generateEscrowServiceEventTemplate,
  parseEscrowServiceEvent,
  parseEscrowServiceSelectionEvent,
  searchEscrowServices,
  validateEscrowServiceEvent,
  validateEscrowServiceSelectionEvent,
  generateEscrowServiceSelectionEventTemplate,
  calculateEscrowFee,
  type EscrowServiceFindQuery,
  type ParsedEscrowService,
} from './escrowservice.ts'
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
  generateOrderPaymentAckEventTemplate,
  generateOrderPaymentEventTemplate,
  generateOrderPaymentNackEventTemplate,
  generateOrderPaymentSettlementEventTemplate,
  parseOrderPaymentEvent,
  type OrderPaymentSettlementOutput,
  type ParsedOrderPayment,
} from './order-lifecycle.ts'
import { paymentValidationRequest } from './order-group-payment.ts'
import {
  fetchOrderGroups,
  bucketOrderGroups,
  searchMyOrderGroups,
  searchOrderGroups,
  subscribeMyOrderGroups,
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
  type MyOrderGroupQuery,
  type OrderGroupBuckets,
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
  MarketplacePaymentRecoveryItem,
  MarketplacePaymentRecoveryState,
  MarketplaceEscrowArbitrationIntent,
  MarketplaceEscrowArbitrationState,
  MarketplaceEscrowArbitrationRequest,
  MarketplaceEscrowArbitrationRuntimeState,
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
  MarketplaceEscrowStartEvent,
  MarketplaceEscrowStartOptions,
  MarketplaceEscrowRuntime,
  MarketplaceSessionIdentity,
  MarketplaceBindOptions,
  MarketplaceSessionOptions,
  MarketplaceListingsApi,
  MarketplacePaymentMethodApi,
  MarketplaceEscrowServicesApi,
  MarketplaceEscrowServiceSelectionsApi,
  MarketplaceOrderGroupsApi,
  MarketplaceOrdersApi,
  MarketplaceReviewsApi,
  MarketplaceStructuredMessagesApi,
  MarketplacePaymentRoutesApi,
  MarketplaceAuctionsApi,
  MarketplaceAuctionBidGroupsApi,
  MarketplacePaymentsApi,
  MarketplaceEscrowApi,
  MarketplaceClient,
  MarketplaceSessionSeedEnsureOptions,
  MarketplaceSessionSeedEnsureResult,
  MarketplaceSessionSeedApi,
  MarketplaceSession,
} from './runtime-types.ts'
import {
  allPolicyAssets,
  allPolicyDescriptors,
  normalizePolicyWatermark,
  paymentPolicies,
  policyName,
  runtimeSeed,
  safeWatermark,
  safeWindow,
} from './runtime-common.ts'

export async function discoverMarketplaceHighWatermark(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceHighWatermarkOptions = {},
): Promise<MarketplaceHighWatermarkDiscovery> {
  const seed = runtimeSeed(opts, options.seed)
  const unusedWindow = safeWindow(options.unusedWindow)
  const maxPasses = options.maxPasses ?? 16
  if (!Number.isSafeInteger(maxPasses) || maxPasses < 1) throw new Error(`Invalid maxPasses: ${options.maxPasses}`)

  let highWaterMark = safeWatermark(options.highWaterMark)
  const passes: MarketplaceHighWatermarkPass[] = []
  let latestPolicyResults: MarketplacePolicyWatermarkDiscovery[] = []
  const recoveryActions: unknown[] = []

  const policies = paymentPolicies(opts)

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
        }),
      )
      policyResults.push(result)
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

  for (const policy of policies) {
    if (!policy.startup) continue
    const started = await policy.startup({
      seed: discovery.seed,
      highWaterMark: discovery.maxUsedIndex,
      nextUnusedIndex: discovery.nextUnusedIndex,
      unusedWindow: discovery.unusedWindow,
      discovery,
      ...(options.now !== undefined ? { now: options.now } : {}),
    })
    if (started) policyResults.push({ ...started, policy: started.policy || policyName(policy) })
  }

  return {
    discovery,
    policyResults,
    policies: allPolicyDescriptors(policies),
    assets: allPolicyAssets(policies),
  }
}
