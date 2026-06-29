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
import { normalizePaymentValidationResult } from './payment-validation.ts'
import { resolvePaymentAmount } from './payment-amount.ts'
import { paymentProofParamsDecryptor, resolvePaymentProofEvidence } from './payment-proof.ts'
import { isMarketplaceDriverEncryptedPaymentProofParams } from '@sudonym-btc/marketplace-driver-interface'
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
  MarketplacePaymentSweepInput,
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
  MarketplaceLogEntry,
  MarketplaceLogger,
} from './runtime-types.ts'

const noopMarketplaceLogger: MarketplaceLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

export function marketplaceLogger(
  opts: MarketplaceRuntimeOptions,
  scope: string,
  data?: MarketplaceLogEntry['data'],
): MarketplaceLogger {
  if (!opts.logger) return noopMarketplaceLogger
  return opts.logger.child?.({ scope, ...(data ? { data } : {}) }) ?? opts.logger
}

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
): OrderGroupIdentityQuery {
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
  const window = value ?? 25
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
    const validated = await validateOrderGroupPayments(group, {
      policies,
      reduceOptions,
      ...(opts.signer ? { signer: opts.signer } : {}),
    })
    return validated.group
  }))
}

export function paymentValidationItemForGroup(
  group: ParsedOrderGroup,
  payment: ParsedPayment = group.payment!,
  now?: number,
  amount = payment?.content.amount,
): MarketplacePaymentValidationItem | undefined {
  const order = group.buyerOrder ?? group.orders[0]
  const paymentProof = payment?.content.proof?.paymentProof ?? undefined
  if (!order || !payment || !paymentProof || !amount) return undefined
  const request = paymentValidationRequest({
    group,
    order,
    payment,
    amount,
    paymentProof,
    ...(payment.content.proof?.arbitration?.arbitrationService
      ? { arbitrationService: payment.content.proof.arbitration.arbitrationService as Event }
      : {}),
    ...(now !== undefined ? { now } : {}),
  })
  return {
    purpose: payment.refs.auctionBids.length > 0 ? 'bid' : 'order',
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
  item: { proof: PaymentProofEvidence; expected?: MarketplacePaymentValidationRequest['expected'] },
): boolean {
  const params = isMarketplaceDriverEncryptedPaymentProofParams(item.proof.params)
    ? {}
    : item.proof.params as Record<string, unknown>
  const policyId = typeof params.policyId === 'string' ? params.policyId : undefined
  if (policyId && descriptor.id !== policyId) return false
  const policyType = typeof params.policyType === 'string' ? params.policyType : undefined
  if (policyType && descriptor.type && descriptor.type !== policyType) return false
  const policyHash =
    typeof params.policyHash === 'string'
      ? params.policyHash
      : typeof params.contractBytecodeHash === 'string'
        ? params.contractBytecodeHash
        : item.expected?.contract?.bytecodeHash
  if (descriptor.hash && policyHash && !samePolicyHash(descriptor.hash, policyHash)) return false
  const chainId =
    typeof params.chainId === 'number'
      ? params.chainId
      : item.expected?.contract?.chainId
  if (descriptor.chainId !== undefined && chainId !== undefined && descriptor.chainId !== chainId) return false
  const contractAddress =
    typeof params.contractAddress === 'string'
      ? params.contractAddress
      : item.expected?.contract?.address
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
  item: MarketplacePaymentValidationItem,
): MarketplacePaymentPolicyImplementation | undefined {
  return paymentPolicies(opts).find(policy => policyName(policy) === item.proof.driver)
}

export function policyForPaymentSweep(
  opts: MarketplaceRuntimeOptions,
  payment: MarketplacePaymentSweepInput,
): MarketplacePaymentPolicyImplementation | undefined {
  const params = isMarketplaceDriverEncryptedPaymentProofParams(payment.proof.params)
    ? {}
    : payment.proof.params as Record<string, unknown>
  const policyId = typeof params.policyId === 'string' ? params.policyId : undefined
  return paymentPolicies(opts).find(policy => {
    if (policy.policies().some(descriptor => paymentPolicyMatchesDescriptor(descriptor, {
      proof: payment.proof,
      ...(payment.expected ? { expected: payment.expected } : {}),
    }))) return true
    if (policyId !== undefined) return policy.id === policyId
    return policyName(policy) === payment.proof.driver || policy.method === payment.proof.driver
  })
}

export async function paymentValidationItemsForMyOrderGroups(
  opts: MarketplaceRuntimeOptions,
  query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
  options: OrderGroupSearchOptions & { now?: number } = {},
): Promise<MarketplacePaymentValidationItem[]> {
  const roles = await searchOrderGroupsForIdentity(opts.pool, opts.relays, runtimeMyOrderQuery(opts, query), options)
  const items: MarketplacePaymentValidationItem[] = []
  for (const group of roles.all) {
    for (const payment of group.payments) {
      const amount = await resolvePaymentAmount(payment, { signer: opts.signer })
      if (amount.status !== 'resolved' || !amount.amount) continue
      const item = paymentValidationItemForGroup(group, payment, options.now, amount.amount)
      if (item) items.push(item)
    }
  }
  return items
}

export async function* sweepMarketplacePayment(
  opts: MarketplaceRuntimeOptions,
  payment: MarketplacePaymentSweepInput,
): AsyncIterable<MarketplacePaymentSweepState> {
  const policy = policyForPaymentSweep(opts, payment)
  if (!policy?.sweepPayment) {
    yield {
      type: 'noop',
      data: {
        reason: policy ? 'policy has no payment sweep hook' : 'no matching payment policy',
        driver: payment.proof.driver,
        paymentId: payment.paymentId,
      },
    }
    return
  }
  const stream = await policy.sweepPayment(payment)
  yield* stream
}

export async function validateMarketplacePayment(
  opts: MarketplaceRuntimeOptions,
  payment: MarketplacePaymentValidationItem,
): Promise<MarketplacePaymentValidationResult> {
  const policy = policyForPayment(opts, payment)
  if (!policy?.validatePayment) {
    return {
      driver: payment.proof.driver,
      status: 'unverifiable',
      proofEventId: payment.payment.event.id,
      error: policy ? 'Policy has no payment validator' : 'No matching payment policy',
    }
  }
  const amount = await resolvePaymentAmount(payment.payment, { signer: opts.signer })
  if (amount.status !== 'resolved' || !amount.amount) {
    return {
      driver: payment.proof.driver,
      status: 'unverifiable',
      proofEventId: payment.payment.event.id,
      error: amount.error ?? 'Payment amount could not be resolved',
    }
  }
  const proofResolution = await resolvePaymentProofEvidence(payment.proof, {
    keys: payment.payment.paymentProofKeys,
    signer: opts.signer,
  })
  if (proofResolution.status !== 'resolved' || !proofResolution.proof) {
    return {
      driver: payment.proof.driver,
      status: 'unverifiable',
      proofEventId: payment.payment.event.id,
      error: proofResolution.error ?? 'Payment proof could not be resolved',
    }
  }
  const result = await policy.validatePayment({
    driver: proofResolution.proof.driver,
    proof: proofResolution.proof,
    ...(payment.expected ? { expected: payment.expected } : {}),
    decryptParams: paymentProofParamsDecryptor({
      keys: payment.payment.paymentProofKeys,
      signer: opts.signer,
    }),
  })
  return normalizePaymentValidationResult(result, amount.amount)
}

export function requireArbitrationPublisher(opts: MarketplaceRuntimeOptions): {
  signer: MarketplaceSeedSigner
  publish: (event: Event) => unknown | Promise<unknown>
} {
  if (!opts.signer) throw new Error('Marketplace arbitration mode requires a signer')
  if (!opts.publish) throw new Error('Marketplace arbitration mode requires a publish function')
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
  const { signer, publish } = requireArbitrationPublisher(opts)
  const event = await signer.signEvent(template)
  await publish(event)
  return event
}

export async function publishMarketplaceEvent(opts: MarketplaceRuntimeOptions, event: Event): Promise<Event> {
  const publish = requireMarketplacePublisher(opts)
  const logger = marketplaceLogger(opts, 'marketplace.runtime.publish', {
    kind: event.kind,
    eventId: event.id,
    pubkey: event.pubkey,
  })
  const run = async (spanLogger: MarketplaceLogger) => {
    spanLogger.debug('Publishing marketplace event')
    await publish(event)
    spanLogger.info('Marketplace event published')
    return event
  }
  return logger.span
    ? logger.span('publish marketplace event', undefined, run)
    : run(logger)
}
