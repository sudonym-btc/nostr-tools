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

export function runtimeSeed(opts: MarketplaceRuntimeOptions, seed?: string): string {
  const resolved = seed ?? opts.seed
  if (!resolved) throw new Error('Marketplace seed is required for payment policy lifecycle and watermark discovery')
  return normalizeMarketplaceSeed(resolved)
}

export function runtimeIdentity(
  opts: MarketplaceRuntimeOptions,
  identity: MarketplaceOrderIdentity = {},
): MarketplaceOrderIdentity {
  const pubkey = identity.pubkey ?? opts.identity?.pubkey
  const seed = identity.seed ?? opts.seed
  if (!pubkey) throw new Error('Marketplace identity pubkey is required')
  return {
    ...identity,
    pubkey,
    ...(seed ? { seed } : {}),
  }
}

export function runtimeMyOrderQuery(
  opts: MarketplaceRuntimeOptions,
  query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
): MyOrderGroupQuery {
  const identity = runtimeIdentity(opts, query.identity)
  return { ...query, identity }
}

export function requireSubscribePool(
  pool: MarketplaceRuntimePool,
): Pick<AbstractSimplePool, 'subscribeMap'> {
  if (!pool.subscribeMap) throw new Error('Marketplace order subscriptions require a pool with subscribeMap')
  return pool as Pick<AbstractSimplePool, 'subscribeMap'>
}

export function safeWatermark(value: number | undefined): number {
  if (value === undefined) return -1
  if (!Number.isSafeInteger(value) || value < -1) throw new Error(`Invalid highWaterMark: ${value}`)
  return value
}

export function safeWindow(value: number | undefined): number {
  const window = value ?? 50
  if (!Number.isSafeInteger(window) || window < 1) throw new Error(`Invalid unusedWindow: ${value}`)
  return window
}

export function paymentPolicies(opts: MarketplaceRuntimeOptions): MarketplacePaymentPolicyImplementation[] {
  return [...(opts.orderPolicies ?? []), ...(opts.bidPolicies ?? [])]
}

export function policyName(policy: MarketplacePaymentPolicyImplementation): string {
  return policy.id ?? policy.method
}

export function normalizePolicyWatermark(
  policy: MarketplacePaymentPolicyImplementation,
  result: MarketplacePolicyWatermarkDiscovery,
): MarketplacePolicyWatermarkDiscovery {
  if (!Number.isSafeInteger(result.maxUsedIndex) || result.maxUsedIndex < -1) {
    throw new Error(`Policy ${policyName(policy)} returned invalid maxUsedIndex`)
  }
  return {
    ...result,
    policy: result.policy || policyName(policy),
  }
}

export function policyDescriptors(policyImpl: MarketplacePaymentPolicyImplementation): MarketplacePaymentPolicy[] {
  return policyImpl.policies().map(policy => ({
    ...policy,
    method: policy.method || policyImpl.method,
    id: policy.id || policyName(policyImpl),
  }))
}

export function policyAssets(policy: MarketplacePaymentPolicyImplementation): MarketplacePaymentAsset[] {
  return policy.assets().map(asset => ({
    ...asset,
    method: asset.method || policy.method,
  }))
}

export function allPolicyDescriptors(policies: MarketplacePaymentPolicyImplementation[]): MarketplacePaymentPolicy[] {
  return policies.flatMap(policyDescriptors)
}

export function allPolicyAssets(policies: MarketplacePaymentPolicyImplementation[]): MarketplacePaymentAsset[] {
  return policies.flatMap(policyAssets)
}


export function paymentValidationPolicies(
  policies: MarketplacePaymentPolicyImplementation[],
): MarketplacePaymentValidationPolicy[] {
  return policies.filter((policy): policy is MarketplacePaymentPolicyImplementation & MarketplacePaymentValidationPolicy =>
    typeof policy.validatePayment === 'function',
  )
}

export async function validateGroupsWithRuntimePolicies(
  opts: MarketplaceRuntimeOptions,
  groups: ParsedOrderGroup[],
  reduceOptions: ReduceOrderGroupOptions = {},
): Promise<ParsedOrderGroup[]> {
  const policies = paymentValidationPolicies(paymentPolicies(opts))
  if (policies.length === 0) return groups
  return Promise.all(groups.map(async group => {
    const validated = await validateOrderGroupPayments(group, { policies, reduceOptions })
    return validated.group
  }))
}

export function paymentRecoveryItemForGroup(
  group: ParsedOrderGroup,
  payment: ParsedOrderPayment = group.payment!,
  now?: number,
): MarketplacePaymentRecoveryItem | undefined {
  const order = group.buyerOrder ?? group.orders[0]
  const paymentProof = payment?.content.proof.paymentProof ?? undefined
  if (!order || !payment || !paymentProof) return undefined
  const request = paymentValidationRequest({
    group,
    order,
    paymentProof,
    ...(payment.content.proof.escrow?.escrowService
      ? { escrowService: payment.content.proof.escrow.escrowService as Event }
      : {}),
    ...(now !== undefined ? { now } : {}),
  })
  return {
    subject: payment.content.purpose === 'auction_bid' || paymentProof.params.subject === 'bid' ? 'bid' : 'order',
    group,
    payment,
    proof: paymentProof,
    expected: request.expected,
  }
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

export function sameMethod(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase()
}

export function paymentPolicyMatchesDescriptor(
  descriptor: MarketplacePaymentPolicy,
  item: { proof: PaymentProofEvidence; expected: MarketplacePaymentValidationRequest['expected'] },
): boolean {
  if (!sameMethod(descriptor.method, item.proof.method)) return false
  const params = item.proof.params
  const policyId = typeof params.policyId === 'string' ? params.policyId : undefined
  if (policyId && descriptor.id !== policyId) return false
  const policyType = typeof params.policyType === 'string' ? params.policyType : undefined
  if (policyType && descriptor.type && descriptor.type !== policyType) return false
  const policyHash =
    typeof params.policyHash === 'string'
      ? params.policyHash
      : typeof params.contractBytecodeHash === 'string'
        ? params.contractBytecodeHash
        : item.expected.contract?.bytecodeHash
  if (descriptor.hash && policyHash && !samePolicyHash(descriptor.hash, policyHash)) return false
  const chainId =
    typeof params.chainId === 'number'
      ? params.chainId
      : item.expected.contract?.chainId
  if (descriptor.chainId !== undefined && chainId !== undefined && descriptor.chainId !== chainId) return false
  const contractAddress =
    typeof params.contractAddress === 'string'
      ? params.contractAddress
      : item.expected.contract?.address
  if (
    descriptor.contractAddress &&
    contractAddress &&
    descriptor.contractAddress.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    return false
  }
  return true
}

export function policyForPayment(
  opts: MarketplaceRuntimeOptions,
  item: MarketplacePaymentRecoveryItem,
): MarketplacePaymentPolicyImplementation | undefined {
  return paymentPolicies(opts).find(policy =>
    policy.subject === item.subject &&
    policy.method === item.proof.method &&
    policyDescriptors(policy).some(descriptor => paymentPolicyMatchesDescriptor(descriptor, item)),
  )
}

export async function paymentItemsForMyOrderGroups(
  opts: MarketplaceRuntimeOptions,
  query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
  options: OrderGroupSearchOptions & { now?: number } = {},
): Promise<MarketplacePaymentRecoveryItem[]> {
  const buckets = await searchMyOrderGroups(opts.pool, opts.relays, runtimeMyOrderQuery(opts, query), options)
  const items: MarketplacePaymentRecoveryItem[] = []
  for (const group of buckets.all) {
    for (const payment of group.payments) {
      const item = paymentRecoveryItemForGroup(group, payment, options.now)
      if (item) items.push(item)
    }
  }
  return items
}

export async function* recoverMarketplacePayment(
  opts: MarketplaceRuntimeOptions,
  item: MarketplacePaymentRecoveryItem,
): AsyncIterable<MarketplacePaymentRecoveryState> {
  const policy = policyForPayment(opts, item)
  if (!policy?.recover) {
    yield {
      type: 'noop',
      data: {
        reason: policy ? 'policy has no recover hook' : 'no matching payment policy',
        method: item.proof.method,
        paymentId: item.payment.event.id,
      },
    }
    return
  }
  const stream = await policy.recover(item)
  yield* stream
}

export async function validateMarketplacePayment(
  opts: MarketplaceRuntimeOptions,
  payment: MarketplacePaymentRecoveryItem,
): Promise<MarketplacePaymentValidationResult> {
  const policy = policyForPayment(opts, payment)
  if (!policy?.validatePayment) {
    return {
      method: payment.proof.method,
      status: 'unverifiable',
      proofEventId: payment.payment.event.id,
      error: policy ? 'Policy has no payment validator' : 'No matching payment policy',
    }
  }
  return policy.validatePayment({
    method: payment.proof.method,
    proof: payment.proof,
    expected: payment.expected,
  })
}

export function requireEscrowPublisher(opts: MarketplaceRuntimeOptions): {
  signer: MarketplaceSeedSigner
  publish: (event: Event) => unknown | Promise<unknown>
} {
  if (!opts.signer) throw new Error('Marketplace escrow mode requires a signer')
  if (!opts.publish) throw new Error('Marketplace escrow mode requires a publish function')
  return { signer: opts.signer, publish: opts.publish }
}

export function requireMarketplacePublisher(opts: MarketplaceRuntimeOptions): (event: Event) => unknown | Promise<unknown> {
  if (!opts.publish) throw new Error('Marketplace high-level create/bid requires a publish function')
  return opts.publish
}

export async function publishMarketplaceTemplate(
  opts: MarketplaceRuntimeOptions,
  template: EventTemplate,
): Promise<Event> {
  const { signer, publish } = requireEscrowPublisher(opts)
  const event = await signer.signEvent(template)
  await publish(event)
  return event
}

export async function publishMarketplaceEvent(opts: MarketplaceRuntimeOptions, event: Event): Promise<Event> {
  const publish = requireMarketplacePublisher(opts)
  await publish(event)
  return event
}
