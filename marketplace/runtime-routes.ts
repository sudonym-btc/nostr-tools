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
import {
  amountCurrency,
  canonicalCurrency,
  normalizeMarketplaceAmount,
  parseEventJson,
  scaleAmountValue as scaleMarketplaceAmountValue,
} from './helper.ts'
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
  policyAssets,
  policyDescriptors,
} from './runtime-common.ts'

export function serviceMethod(service: ParsedArbitrationService): PaymentMethod {
  return service.content.type.toLowerCase()
}

export function servicePolicyHash(service: ParsedArbitrationService): string | undefined {
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

export function serviceChainId(service: ParsedArbitrationService): number | undefined {
  const chainId = service.content.params.chainId
  return typeof chainId === 'number' ? chainId : undefined
}

export function serviceContractAddress(service: ParsedArbitrationService): string | undefined {
  const address = service.content.params.contractAddress
  return typeof address === 'string' ? address : undefined
}

export function sameMethod(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase()
}

export function denomination(value: string | undefined): string {
  return canonicalCurrency(value)
}

export function isBtcSatPair(left: string | undefined, right: string | undefined): boolean {
  const a = denomination(left)
  const b = denomination(right)
  return (a === 'BTC' && b === 'SAT') || (a === 'SAT' && b === 'BTC')
}

export function amountCompatibleWithAsset(amount: MarketplaceAmount | undefined, asset: MarketplacePaymentAsset): boolean {
  if (!amount) return true
  return amountCurrency(amount) === assetCurrency(asset)
}

export function scaleAmountValue(value: string, fromDecimals: number, toDecimals: number): bigint {
  return scaleMarketplaceAmountValue(value, fromDecimals, toDecimals)
}

export function normalizeBtcSatAmount(amount: MarketplaceAmount, targetDenomination: 'BTC' | 'SAT'): MarketplaceAmount {
  if (targetDenomination === 'SAT') {
    const value = denomination(amount.denomination) === 'BTC'
      ? scaleAmountValue(amount.value, amount.decimals, 8)
      : scaleAmountValue(amount.value, amount.decimals, 0)
    return { value: value.toString(), currency: 'BTC', denomination: 'SAT', decimals: 0 }
  }
  const value = denomination(amount.denomination) === 'SAT'
    ? scaleAmountValue(amount.value, amount.decimals, 0)
    : scaleAmountValue(amount.value, amount.decimals, 8)
  return { value: value.toString(), currency: 'BTC', denomination: 'BTC', decimals: 8 }
}

export function assetCurrency(asset: { currency?: string; denomination: string }): string {
  return canonicalCurrency(asset.currency ?? asset.denomination)
}

function paymentFormCurrency(form: { currency?: string; denomination: string }): string {
  return canonicalCurrency(form.currency ?? form.denomination)
}

function assetDecimalsForCurrency(asset: MarketplacePaymentAsset): number {
  const rawDenomination = (asset.denomination ?? '').toUpperCase()
  if (assetCurrency(asset) === 'BTC' && (rawDenomination === 'SAT' || rawDenomination === 'SATS')) {
    return asset.decimals + 8
  }
  return asset.decimals
}

function assertAmountMatchesAsset(amount: MarketplaceAmount, asset: MarketplacePaymentAsset): string {
  const currency = amountCurrency(amount)
  const routeCurrency = assetCurrency(asset)
  if (currency !== routeCurrency) {
    throw new Error(`Payment route asset ${asset.denomination} cannot settle ${currency}`)
  }
  return currency
}

export function normalizeAmountForRouteEvent(amount: MarketplaceAmount, asset: MarketplacePaymentAsset): MarketplaceAmount {
  assertAmountMatchesAsset(amount, asset)
  return normalizeMarketplaceAmount(amount)
}

export function normalizeAmountForPaymentAsset(amount: MarketplaceAmount, asset: MarketplacePaymentAsset): MarketplaceAmount {
  const currency = assertAmountMatchesAsset(amount, asset)
  const normalized = normalizeMarketplaceAmount(amount)
  const targetDecimals = assetDecimalsForCurrency(asset)
  return {
    value: scaleAmountValue(normalized.value, normalized.decimals, targetDecimals).toString(),
    currency,
    denomination: asset.denomination,
    decimals: asset.decimals,
  }
}

export function policyMatchesService(policy: MarketplacePaymentPolicy, service: ParsedArbitrationService): boolean {
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
  form: { currency?: string; denomination: string; assetId: string; appId?: string },
): boolean {
  if (assetCurrency(asset) !== paymentFormCurrency(form)) return false
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

async function paymentRoutesForListing(
  opts: MarketplaceRuntimeOptions,
  listing: Event | MarketplaceListing,
  options: MarketplacePaymentRouteOptions | null = null,
  policies?: MarketplacePaymentPolicyImplementation[],
): Promise<MarketplacePaymentRoute[]> {
  const routeOptions = options ?? {}
  const parsedListing = 'event' in listing ? listing : parseListingEvent(listing)
  const sellerPubkey = parsedListing.event.pubkey
  const method = await findPaymentMethod(opts.pool, opts.relays, { author: sellerPubkey })
  if (!method) return []

  const services: ParsedArbitrationService[] = []
  for (const arbiterPubkey of method.trustedArbiterPubkeys) {
    const arbitrationServices = await searchArbitrationServices(opts.pool, opts.relays, { author: arbiterPubkey, limit: 20 })
    for (const service of arbitrationServices) {
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
  const routePolicies = policies ?? []
  if (routePolicies.length === 0) return []

  for (const arbitrationService of services) {
    for (const paymentPolicy of routePolicies) {
      const descriptors = policyDescriptors(paymentPolicy).filter(policy => policyMatchesService(policy, arbitrationService))
      if (descriptors.length === 0) continue
      const assets = policyAssets(paymentPolicy)
      for (const descriptor of descriptors) {
        for (const asset of assets.filter(candidate =>
          assetMatchesPolicyDescriptor(candidate, descriptor) &&
          amountCompatibleWithAsset(routeOptions.amount, candidate)
        )) {
          const paymentForm = method.acceptedPaymentForms.find(form => assetMatchesForm(asset, form))
          if (!paymentForm) continue
          routes.push({
            policy: paymentPolicy,
            listing: parsedListing,
            paymentMethod: method,
            arbitrationService,
            descriptor,
            asset,
            paymentForm,
            score: routeScore(asset, descriptor),
          })
        }
      }
    }
  }
  return routes.sort((a, b) => b.score - a.score)
}

export function orderPaymentRoutesForListing(
  opts: MarketplaceRuntimeOptions,
  listing: Event | MarketplaceListing,
  options: MarketplacePaymentRouteOptions | null = null,
): Promise<MarketplacePaymentRoute[]> {
  return paymentRoutesForListing(opts, listing, options, opts.orderPolicies)
}

export async function auctionPaymentRoutesForListing(
  opts: MarketplaceRuntimeOptions,
  listing: Event | MarketplaceListing,
  auction?: Event | ParsedMarketplaceAuction,
  options: MarketplacePaymentRouteOptions | null = null,
): Promise<MarketplacePaymentRoute[]> {
  const parsedAuction = auction ? ('event' in auction ? auction : parseAuctionEvent(auction)) : undefined
  const routes = await paymentRoutesForListing(opts, listing, options, opts.bidPolicies)
  return parsedAuction ? routes.filter(route => routeMatchesAuction(route, parsedAuction)) : routes
}

export function routeMatchesAuction(route: MarketplacePaymentRoute, auction: ParsedMarketplaceAuction): boolean {
  return route.arbitrationService.event.pubkey === auction.arbiterPubkey &&
    assetCurrency(route.asset) === canonicalCurrency(auction.currency)
}
