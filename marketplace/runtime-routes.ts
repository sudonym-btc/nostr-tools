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
  policyAssets,
  policyDescriptors,
} from './runtime-common.ts'

export function serviceMethod(service: ParsedEscrowService): PaymentMethod {
  return service.content.type.toLowerCase()
}

export function servicePolicyHash(service: ParsedEscrowService): string | undefined {
  const params = service.content.params
  const hash = params.contractBytecodeHash ?? params.policyHash ?? params.scriptHash
  return typeof hash === 'string' ? canonicalPolicyHash(hash) : undefined
}

export function canonicalPolicyHash(hash: string | undefined): string | undefined {
  if (!hash) return undefined
  const value = hash.startsWith('0x') || hash.startsWith('0X') ? hash.slice(2) : hash
  return /^[a-fA-F0-9]{64}$/.test(value) ? `0x${value.toLowerCase()}` : hash
}

export function samePolicyHash(left: string | undefined, right: string | undefined): boolean {
  if (!left || !right) return false
  return canonicalPolicyHash(left) === canonicalPolicyHash(right)
}

export function serviceChainId(service: ParsedEscrowService): number | undefined {
  const chainId = service.content.params.chainId
  return typeof chainId === 'number' ? chainId : undefined
}

export function serviceContractAddress(service: ParsedEscrowService): string | undefined {
  const address = service.content.params.contractAddress
  return typeof address === 'string' ? address : undefined
}

export function sameMethod(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase()
}

export function denomination(value: string | undefined): string {
  return (value ?? '').toUpperCase()
}

export function isBtcSatPair(left: string | undefined, right: string | undefined): boolean {
  const a = denomination(left)
  const b = denomination(right)
  return (a === 'BTC' && b === 'SAT') || (a === 'SAT' && b === 'BTC')
}

export function amountCompatibleWithAsset(amount: MarketplaceAmount | undefined, asset: MarketplacePaymentAsset): boolean {
  if (!amount) return true
  return amount.denomination === asset.denomination || isBtcSatPair(amount.denomination, asset.denomination)
}

export function scaleAmountValue(value: string, fromDecimals: number, toDecimals: number): bigint {
  const units = BigInt(value)
  if (fromDecimals === toDecimals) return units
  if (fromDecimals < toDecimals) return units * 10n ** BigInt(toDecimals - fromDecimals)
  const scale = 10n ** BigInt(fromDecimals - toDecimals)
  if (units % scale !== 0n) {
    throw new Error(`Amount ${value} cannot be converted from ${fromDecimals} to ${toDecimals} decimals`)
  }
  return units / scale
}

export function normalizeBtcSatAmount(amount: MarketplaceAmount, targetDenomination: 'BTC' | 'SAT'): MarketplaceAmount {
  if (targetDenomination === 'SAT') {
    const value = denomination(amount.denomination) === 'BTC'
      ? scaleAmountValue(amount.value, amount.decimals, 8)
      : scaleAmountValue(amount.value, amount.decimals, 0)
    return { value: value.toString(), denomination: 'SAT', decimals: 0 }
  }
  const value = denomination(amount.denomination) === 'SAT'
    ? scaleAmountValue(amount.value, amount.decimals, 8)
    : scaleAmountValue(amount.value, amount.decimals, 8)
  return { value: value.toString(), denomination: 'BTC', decimals: 8 }
}

export function normalizeAmountForRouteEvent(amount: MarketplaceAmount, asset: MarketplacePaymentAsset): MarketplaceAmount {
  if (isBtcSatPair(amount.denomination, asset.denomination)) {
    return normalizeBtcSatAmount(amount, denomination(amount.denomination) === 'SAT' ? 'SAT' : 'BTC')
  }
  if (amount.denomination === asset.denomination) {
    return {
      value: scaleAmountValue(amount.value, amount.decimals, asset.decimals).toString(),
      denomination: asset.denomination,
      decimals: asset.decimals,
    }
  }
  return amount
}

export function normalizeAmountForPaymentAsset(amount: MarketplaceAmount, asset: MarketplacePaymentAsset): MarketplaceAmount {
  if (isBtcSatPair(amount.denomination, asset.denomination)) {
    return normalizeBtcSatAmount(amount, denomination(asset.denomination) === 'SAT' ? 'SAT' : 'BTC')
  }
  if (amount.denomination === asset.denomination) {
    return {
      value: scaleAmountValue(amount.value, amount.decimals, asset.decimals).toString(),
      denomination: asset.denomination,
      decimals: asset.decimals,
    }
  }
  return amount
}

export function policyMatchesService(policy: MarketplacePaymentPolicy, service: ParsedEscrowService): boolean {
  if (!sameMethod(policy.method, serviceMethod(service))) return false
  const hash = servicePolicyHash(service)
  if (policy.hash && hash && !samePolicyHash(policy.hash, hash)) return false
  const chainId = serviceChainId(service)
  if (policy.chainId !== undefined && chainId !== undefined && policy.chainId !== chainId) return false
  const contractAddress = serviceContractAddress(service)
  if (
    policy.contractAddress &&
    contractAddress &&
    policy.contractAddress.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    return false
  }
  return true
}

export function assetMatchesForm(
  asset: MarketplacePaymentAsset,
  form: { denomination: string; assetId: string; appId?: string },
): boolean {
  if (asset.denomination !== form.denomination) return false
  return canonicalAssetId(asset.assetId) === canonicalAssetId(form.assetId)
}

export function recordString(record: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = record?.[key]
  return typeof value === 'string' ? value : undefined
}

export function assetMatchesPolicyDescriptor(asset: MarketplacePaymentAsset, policy: MarketplacePaymentPolicy): boolean {
  if (!sameMethod(asset.method, policy.method)) return false
  if (policy.chainId !== undefined && asset.chainId !== undefined && policy.chainId !== asset.chainId) return false

  if (asset.method === 'cashu' && policy.method === 'cashu') {
    const assetMintUrl = recordString(asset.data, 'mintUrl')
    const policyMintUrl = recordString(policy.data, 'mintUrl')
    const assetUnit = recordString(asset.data, 'unit')
    const policyUnit = recordString(policy.data, 'unit')
    if (assetMintUrl && policyMintUrl && assetMintUrl !== policyMintUrl) return false
    if (assetUnit && policyUnit && assetUnit !== policyUnit) return false
    if (!assetMintUrl && !policyMintUrl && policy.id.startsWith('cashu:')) {
      return canonicalAssetId(asset.assetId) === canonicalAssetId(policy.id)
    }
  }

  return true
}

export function routeScore(asset: MarketplacePaymentAsset, policy: MarketplacePaymentPolicy): number {
  let score = 0
  if (asset.appId) score += 5
  if (policy.hash) score += 10
  if (policy.contractAddress) score += 5
  return score
}


export async function paymentRoutesForListing(
  opts: MarketplaceRuntimeOptions,
  listing: Event | MarketplaceListing,
  order: Partial<OrderTemplate> | null = null,
  routeOptions: MarketplacePaymentRouteOptions = {},
): Promise<MarketplacePaymentRoute[]> {
  const parsedListing = 'event' in listing ? listing : parseListingEvent(listing)
  const sellerPubkey = parsedListing.event.pubkey
  const method = await findPaymentMethod(opts.pool, opts.relays, { author: sellerPubkey, limit: 5 })
  if (!method) return []

  const services: ParsedEscrowService[] = []
  for (const escrowPubkey of method.trustedEscrowPubkeys) {
    const escrowServices = await searchEscrowServices(opts.pool, opts.relays, { author: escrowPubkey, limit: 20 })
    for (const service of escrowServices) {
      const hash = servicePolicyHash(service)
      if (
        method.supportedContractBytecodeHashes.length > 0 &&
        hash &&
        !method.supportedContractBytecodeHashes.some(methodHash => samePolicyHash(methodHash, hash))
      ) {
        continue
      }
      services.push(service)
    }
  }

  const routes: MarketplacePaymentRoute[] = []
  const routePolicies =
    routeOptions.subject === 'bid'
      ? opts.bidPolicies ?? []
      : opts.orderPolicies ?? []
  for (const escrowService of services) {
    for (const paymentPolicy of routePolicies) {
      const descriptors = policyDescriptors(paymentPolicy).filter(policy => policyMatchesService(policy, escrowService))
      if (descriptors.length === 0) continue
      const assets = policyAssets(paymentPolicy).filter(asset =>
        method.acceptedPaymentForms.some(form => assetMatchesForm(asset, form)) &&
        amountCompatibleWithAsset(order?.amount, asset),
      )
      for (const descriptor of descriptors) {
        for (const asset of assets.filter(candidate => assetMatchesPolicyDescriptor(candidate, descriptor))) {
          routes.push({
            policy: paymentPolicy,
            listing: parsedListing,
            paymentMethod: method,
            escrowService,
            descriptor,
            asset,
            score: routeScore(asset, descriptor),
          })
        }
      }
    }
  }
  return routes.sort((a, b) => b.score - a.score)
}

export function routeMatchesAuction(route: MarketplacePaymentRoute, auction: ParsedMarketplaceAuction): boolean {
  return route.escrowService.event.pubkey === auction.arbiterPubkey &&
    (route.asset.denomination === auction.currency || isBtcSatPair(route.asset.denomination, auction.currency)) &&
    (
      route.asset.decimals === auction.decimals ||
      (denomination(auction.currency) === 'BTC' && auction.decimals === 8 && denomination(route.asset.denomination) === 'SAT') ||
      (denomination(auction.currency) === 'SAT' && auction.decimals === 0 && denomination(route.asset.denomination) === 'BTC')
    )
}
