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
  normalizePaymentFormForNostr,
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
  MarketplacePaymentRoutesApi,
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
  paymentPolicies,
  requireArbitrationPublisher,
} from './runtime-common.ts'
import { canonicalPolicyHash } from './runtime-routes.ts'

export function uniqueSorted(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
    .sort((a, b) => a.localeCompare(b))
}

export function normalizeTrustInput(input: string | string[] | undefined): string[] {
  return Array.isArray(input) ? input : input ? [input] : []
}

export function paymentFormKey(form: AcceptedPaymentForm): string {
  const normalized = normalizePaymentFormForNostr(form)
  return [
    normalized.denomination,
    canonicalAssetId(normalized.assetId),
    normalized.appId ?? '',
  ].join('\u0000')
}

export function uniquePaymentForms(forms: AcceptedPaymentForm[]): AcceptedPaymentForm[] {
  const byKey = new Map<string, AcceptedPaymentForm>()
  for (const form of forms) {
    const normalized = normalizePaymentFormForNostr(form)
    byKey.set(paymentFormKey(normalized), {
      denomination: normalized.denomination,
      assetId: canonicalAssetId(normalized.assetId),
      ...(normalized.appId ? { appId: normalized.appId } : {}),
    })
  }
  return [...byKey.values()].sort((a, b) => paymentFormKey(a).localeCompare(paymentFormKey(b)))
}

type PaymentMethodSnapshot = {
  trustedArbiterPubkeys: string[]
  supportedContractBytecodeHashes: string[]
  acceptedPaymentForms: AcceptedPaymentForm[]
  evmAddress?: string
  evmAddressProof?: string
  cashuPubkey?: string
}

export function snapshotPaymentMethod(method: ParsedPaymentMethod): PaymentMethodSnapshot {
  return {
    trustedArbiterPubkeys: uniqueSorted(method.trustedArbiterPubkeys),
    supportedContractBytecodeHashes: uniqueSorted(method.supportedContractBytecodeHashes.map(canonicalPolicyHash)),
    acceptedPaymentForms: uniquePaymentForms(method.acceptedPaymentForms),
    ...(method.evmAddress ? { evmAddress: method.evmAddress.toLowerCase() } : {}),
    ...(method.evmAddressProof ? { evmAddressProof: method.evmAddressProof } : {}),
    ...(method.cashuPubkey ? { cashuPubkey: method.cashuPubkey } : {}),
  }
}

export function paymentMethodSnapshotsEqual(left: PaymentMethodSnapshot, right: PaymentMethodSnapshot): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function paymentMethodPolicyHashes(policies: MarketplacePaymentPolicyImplementation[]): string[] {
  return uniqueSorted(allPolicyDescriptors(policies).map(policy => canonicalPolicyHash(policy.hash)))
}

export function paymentMethodPaymentForms(policies: MarketplacePaymentPolicyImplementation[]): AcceptedPaymentForm[] {
  return uniquePaymentForms(allPolicyAssets(policies).map(asset => ({
    denomination: asset.denomination,
    assetId: asset.assetId,
    ...(asset.appId ? { appId: asset.appId } : {}),
  })))
}

export async function ensurePaymentMethodUpToDate(
  opts: MarketplaceRuntimeOptions,
  options: MarketplacePaymentMethodEnsureOptions = {},
): Promise<MarketplacePaymentMethodEnsureResult> {
  const pubkey = opts.identity?.pubkey
  if (!pubkey) throw new Error('Marketplace seller method requires an identity pubkey')

  if (options.requireListings ?? true) {
    const listings = await searchListings(opts.pool, opts.relays, {
      ...(options.listingsQuery ?? {}),
      authors: [pubkey],
      limit: options.listingsQuery?.limit ?? 1,
    })
    if (listings.length === 0) return { status: 'skipped', reason: 'no_listings' }
  }

  const current = await findPaymentMethod(opts.pool, opts.relays, { author: pubkey })
  const trustedArbiterPubkeys = uniqueSorted([
    ...normalizeTrustInput(opts.autoTrustArbiter),
    ...(opts.paymentMethod?.trustedArbiterPubkeys ?? []),
    ...(options.trustedArbiterPubkeys ?? []),
  ])
  if (trustedArbiterPubkeys.length === 0) return { status: 'skipped', reason: 'no_trusted_arbiters' }

  const policies = paymentPolicies(opts)
  const supportedContractBytecodeHashes = paymentMethodPolicyHashes(policies)
  const acceptedPaymentForms = paymentMethodPaymentForms(policies)
  if (supportedContractBytecodeHashes.length === 0 && acceptedPaymentForms.length === 0) {
    return { status: 'skipped', reason: 'no_policy_contributions' }
  }

  const desired: PaymentMethodSnapshot = {
    trustedArbiterPubkeys,
    supportedContractBytecodeHashes,
    acceptedPaymentForms,
    ...(options.evmAddress ?? opts.paymentMethod?.evmAddress ?? current?.evmAddress
      ? { evmAddress: (options.evmAddress ?? opts.paymentMethod?.evmAddress ?? current?.evmAddress)!.toLowerCase() }
      : {}),
    ...(options.evmAddressProof ?? opts.paymentMethod?.evmAddressProof ?? current?.evmAddressProof
      ? { evmAddressProof: (options.evmAddressProof ?? opts.paymentMethod?.evmAddressProof ?? current?.evmAddressProof)! }
      : {}),
    ...(options.cashuPubkey ?? opts.paymentMethod?.cashuPubkey ?? current?.cashuPubkey
      ? { cashuPubkey: (options.cashuPubkey ?? opts.paymentMethod?.cashuPubkey ?? current?.cashuPubkey)! }
      : {}),
  }

  if (!options.force && current && paymentMethodSnapshotsEqual(desired, snapshotPaymentMethod(current))) {
    return { status: 'unchanged', event: current.event }
  }

  const template = generatePaymentMethodEventTemplate({
    trustedArbiterPubkeys: desired.trustedArbiterPubkeys,
    supportedContractBytecodeHashes: desired.supportedContractBytecodeHashes,
    acceptedPaymentForms: desired.acceptedPaymentForms,
    ...(desired.evmAddress ? { evmAddress: desired.evmAddress } : {}),
    ...(desired.evmAddressProof ? { evmAddressProof: desired.evmAddressProof } : {}),
    ...(desired.cashuPubkey ? { cashuPubkey: desired.cashuPubkey } : {}),
    ...(options.createdAt !== undefined ? { createdAt: options.createdAt } : {}),
  })
  const { signer, publish } = requireArbitrationPublisher(opts)
  const event = await signer.signEvent(template)
  await publish(event)
  return current
    ? { status: 'updated', previousEvent: current.event, event }
    : { status: 'created', event }
}
