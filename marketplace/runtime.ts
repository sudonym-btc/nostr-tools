import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import {
  findEscrowMethod,
  generateEscrowMethodEventTemplate,
  parseEscrowMethodEvent,
  validateEscrowMethodEvent,
  canonicalAssetId,
  escrowMethodFilter,
  type EscrowMethodFindQuery,
  type ParsedEscrowMethod,
} from './escrowmethod.ts'
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
  type OrderTemplate,
} from './order.ts'
import {
  generateOrderPaymentAckEventTemplate,
  generateOrderPaymentEventTemplate,
  generateOrderPaymentNackEventTemplate,
  generateOrderPaymentSettlementEventTemplate,
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
import type {
  MarketplaceAmount,
  OrderParticipantRole,
  PaymentSettlementAction,
  PaymentMethod,
  PaymentProof,
  PaymentProofEvidence,
  PTag,
} from './helper.ts'
import { getOrCreateMarketplaceSeed, normalizeMarketplaceSeed, type MarketplaceSeedSigner } from './seed.ts'
import type {
  MarketplacePaymentValidationPolicy,
  MarketplacePaymentValidationRequest,
  MarketplacePaymentValidationResult,
} from './payment-validation.ts'

export type MarketplacePolicyWatermarkRecoveryAction = {
  policy: string
  type: string
  index?: number
  data?: Record<string, unknown>
}

export type MarketplacePolicyWatermarkContext = {
  seed: string
  highWaterMark: number
  unusedWindow: number
  now?: number
}

export type MarketplacePolicyWatermarkDiscovery = {
  policy: string
  maxUsedIndex: number
  nextUnusedIndex?: number
  highWaterMark?: number
  scannedFrom?: number
  scannedThrough?: number
  unusedWindow?: number
  usedIndexes?: number[]
  recoveryActions?: MarketplacePolicyWatermarkRecoveryAction[] | unknown[]
}

export type MarketplacePolicyStartContext = {
  seed: string
  highWaterMark: number
  nextUnusedIndex: number
  unusedWindow: number
  discovery: MarketplaceHighWatermarkDiscovery
  now?: number
}

export type MarketplacePolicyStartResult = {
  policy: string
  recoveryActions?: MarketplacePolicyWatermarkRecoveryAction[] | unknown[]
  data?: Record<string, unknown>
}

export type MarketplaceHighWatermarkOptions = {
  seed?: string
  highWaterMark?: number
  unusedWindow?: number
  maxPasses?: number
  now?: number
}

export type MarketplaceHighWatermarkPass = {
  pass: number
  inputHighWaterMark: number
  outputHighWaterMark: number
  policyResults: MarketplacePolicyWatermarkDiscovery[]
}

export type MarketplaceHighWatermarkDiscovery = {
  seed: string
  maxUsedIndex: number
  nextUnusedIndex: number
  unusedWindow: number
  passes: MarketplaceHighWatermarkPass[]
  policyResults: MarketplacePolicyWatermarkDiscovery[]
  recoveryActions: unknown[]
  converged: boolean
}

export type MarketplaceStartOptions = MarketplaceHighWatermarkOptions

export type MarketplaceStartResult = {
  discovery: MarketplaceHighWatermarkDiscovery
  policyResults: MarketplacePolicyStartResult[]
  policies: MarketplacePaymentPolicy[]
  assets: MarketplacePaymentAsset[]
}

export type MarketplacePaymentRoute = {
  policy: MarketplacePaymentPolicyImplementation
  listing: MarketplaceListing
  escrowMethod: ParsedEscrowMethod
  escrowService: ParsedEscrowService
  descriptor: MarketplacePaymentPolicy
  asset: MarketplacePaymentAsset
  score: number
}

export type MarketplacePaymentPolicy = {
  method: PaymentMethod
  id: string
  hash?: string
  type?: string
  chainId?: number
  contractAddress?: string
  data?: Record<string, unknown>
}

export type MarketplacePaymentAsset = {
  method: PaymentMethod
  assetId: string
  denomination: string
  decimals: number
  appId?: string
  chainId?: number
  assetAddress?: string
  data?: Record<string, unknown>
}

export type MarketplacePaymentIdentity = {
  pubkey?: string
  address?: string
  data?: Record<string, unknown>
}

export type MarketplacePaymentContract = {
  type: string
  chainId?: number
  address?: string
  bytecodeHash?: string
  params: Record<string, unknown>
}

export type MarketplacePaymentIntent = {
  method: PaymentMethod
  subject: 'order' | 'bid'
  tradeId: string
  settlementId: string
  accountIndex: number
  seed?: string
  amount: MarketplaceAmount
  fee: MarketplaceAmount
  asset: MarketplacePaymentAsset
  policy: MarketplacePaymentPolicy
  contract: MarketplacePaymentContract
  participants: {
    buyer?: MarketplacePaymentIdentity
    seller: MarketplacePaymentIdentity
    escrow: MarketplacePaymentIdentity
  }
  unlockAt: number
  metadata?: Record<string, unknown>
}

export type MarketplacePaymentRecoveryItem = {
  subject: 'order' | 'bid'
  group: ParsedOrderGroup
  payment: ParsedOrderPayment
  proof: PaymentProofEvidence
  expected: MarketplacePaymentValidationRequest['expected']
}

export type MarketplacePaymentRecoveryState =
  | { type: 'noop'; data?: Record<string, unknown> }
  | { type: 'progress'; status: string; data?: Record<string, unknown> }
  | { type: 'recovered'; data?: Record<string, unknown> }
  | { type: 'settlement_ready'; proof: PaymentProofEvidence; data?: Record<string, unknown> }

export type MarketplaceEscrowArbitrationIntent = {
  subject: 'order'
  group: ParsedOrderGroup
  payment: ParsedOrderPayment
  proof: PaymentProofEvidence
  expected: MarketplacePaymentValidationRequest['expected']
  action: PaymentSettlementAction
  outputs?: OrderPaymentSettlementOutput[]
  reason?: string
  data?: Record<string, unknown>
}

export type MarketplaceEscrowArbitrationState =
  | { type: 'progress'; status: string; data?: Record<string, unknown> }
  | {
      type: 'settlement_ready'
      proof: PaymentProofEvidence
      inputs?: Array<Record<string, unknown>>
      outputs?: OrderPaymentSettlementOutput[]
      data?: Record<string, unknown>
    }
  | {
      type: 'completed'
      proof?: PaymentProofEvidence
      inputs?: Array<Record<string, unknown>>
      outputs?: OrderPaymentSettlementOutput[]
      data?: Record<string, unknown>
    }

export type MarketplaceEscrowArbitrationRequest = {
  group: ParsedOrderGroup
  payment?: ParsedOrderPayment
  action: PaymentSettlementAction
  outputs?: OrderPaymentSettlementOutput[]
  reason?: string
  data?: Record<string, unknown>
  now?: number
}

export type MarketplaceEscrowArbitrationRuntimeState =
  | MarketplaceEscrowArbitrationState
  | { type: 'settlement_published'; event: Event; proof?: PaymentProofEvidence; data?: Record<string, unknown> }

export type MarketplaceBolt11PaymentRequest = {
  type: 'bolt11'
  bolt11: string
  amount?: MarketplaceAmount
  description?: string
  expiresAt?: number
  data?: Record<string, unknown>
}

export type MarketplacePaymentRequest = MarketplaceBolt11PaymentRequest

export type MarketplacePolicyPaymentRequiredState = {
  type: 'payment_required'
  request: MarketplacePaymentRequest
  proof?: PaymentProofEvidence | null
  data?: Record<string, unknown>
}

export type MarketplacePolicyPaymentProgressState = {
  type: 'payment_progress'
  status: string
  proof?: PaymentProofEvidence | null
  data?: Record<string, unknown>
}

export type MarketplacePolicyPaymentPaidState = {
  type: 'paid'
  proof: PaymentProofEvidence
  data?: Record<string, unknown>
}

export type MarketplacePolicyPaymentCompletedState = {
  type: 'completed'
  proof?: PaymentProofEvidence | null
  data?: Record<string, unknown>
}

export type MarketplacePolicyPaymentState =
  | MarketplacePolicyPaymentRequiredState
  | MarketplacePolicyPaymentProgressState
  | MarketplacePolicyPaymentPaidState
  | MarketplacePolicyPaymentCompletedState

export type MarketplacePaymentRequiredState = {
  type: 'payment_required'
  request: MarketplacePaymentRequest
  orderDraft?: EventTemplate
  data?: Record<string, unknown>
}

export type MarketplacePaymentProgressState = {
  type: 'payment_progress'
  status: string
  orderDraft?: EventTemplate
  data?: Record<string, unknown>
}

export type MarketplacePaymentOrderReadyState = {
  type: 'order_ready'
  orderDraft: EventTemplate
  paymentDraft: (order: Event) => EventTemplate
  data?: Record<string, unknown>
}

export type MarketplacePaymentCompletedState = {
  type: 'completed'
  orderDraft?: EventTemplate
  data?: Record<string, unknown>
}

export type MarketplacePaymentState =
  | MarketplacePaymentRequiredState
  | MarketplacePaymentProgressState
  | MarketplacePaymentOrderReadyState
  | MarketplacePaymentCompletedState

export type MarketplacePaymentPolicyImplementation<State = MarketplacePolicyPaymentState> = {
  method: PaymentMethod
  id?: string
  subject: 'order' | 'bid'
  family: 'escrow' | 'auction' | string
  policies(): MarketplacePaymentPolicy[]
  assets(): MarketplacePaymentAsset[]
  discoverHighWatermark?: (
    context: MarketplacePolicyWatermarkContext,
  ) => MarketplacePolicyWatermarkDiscovery | Promise<MarketplacePolicyWatermarkDiscovery>
  startup?: (
    context: MarketplacePolicyStartContext,
  ) => void | MarketplacePolicyStartResult | Promise<void | MarketplacePolicyStartResult>
  pay(intent: MarketplacePaymentIntent): AsyncIterable<State> | Promise<AsyncIterable<State>>
  recover?: (
    payment: MarketplacePaymentRecoveryItem,
  ) => AsyncIterable<MarketplacePaymentRecoveryState> | Promise<AsyncIterable<MarketplacePaymentRecoveryState>>
  arbitrate?: (
    intent: MarketplaceEscrowArbitrationIntent,
  ) => AsyncIterable<MarketplaceEscrowArbitrationState> | Promise<AsyncIterable<MarketplaceEscrowArbitrationState>>
  validatePayment?: (request: MarketplacePaymentValidationRequest) => Promise<MarketplacePaymentValidationResult>
}

export type MarketplaceOrderPolicy<State = MarketplacePolicyPaymentState> =
  MarketplacePaymentPolicyImplementation<State> & {
    subject: 'order'
    family: 'escrow'
  }

export type MarketplaceBidPolicy<State = MarketplacePolicyPaymentState> =
  MarketplacePaymentPolicyImplementation<State> & {
    subject: 'bid'
    family: 'auction'
  }

export type MarketplacePayOptions = {
  accountIndex: number
  seed?: string
  now?: number
  route?: MarketplacePaymentRoute
}

export type MarketplaceRuntimeIdentity = {
  pubkey: string
}

export type MarketplaceRuntimePool = Pick<AbstractSimplePool, 'querySync' | 'get'> &
  Partial<Pick<AbstractSimplePool, 'subscribeMap'>>

export type MarketplaceRuntimeOptions = {
  pool: MarketplaceRuntimePool
  relays: string[]
  seed?: string
  identity?: MarketplaceRuntimeIdentity
  signer?: MarketplaceSeedSigner
  publish?: (event: Event) => unknown | Promise<unknown>
  orderPolicies?: MarketplaceOrderPolicy[]
  bidPolicies?: MarketplaceBidPolicy[]
}

export type MarketplaceEscrowStartEvent =
  | { type: 'started'; identity: MarketplaceOrderIdentity }
  | { type: 'group'; group: ParsedOrderGroup }
  | { type: 'payment_seen'; group: ParsedOrderGroup; payment: ParsedOrderPayment }
  | {
      type: 'payment_validated'
      group: ParsedOrderGroup
      payment: ParsedOrderPayment
      validation: MarketplacePaymentValidationResult
    }
  | {
      type: 'payment_ack_published'
      group: ParsedOrderGroup
      payment: ParsedOrderPayment
      validation: MarketplacePaymentValidationResult
      event: Event
    }
  | {
      type: 'payment_nack_published'
      group: ParsedOrderGroup
      payment: ParsedOrderPayment
      validation: MarketplacePaymentValidationResult
      event: Event
    }
  | { type: 'ignored'; group?: ParsedOrderGroup; payment?: ParsedOrderPayment; reason: string }
  | { type: 'error'; group?: ParsedOrderGroup; payment?: ParsedOrderPayment; error: Error }
  | { type: 'eose' }
  | { type: 'closed'; reasons: string[] }

export type MarketplaceEscrowStartOptions =
  Omit<OrderQuery, 'identity'> &
  OrderSubscribeOptions &
  ReduceOrderGroupOptions & {
    identity?: MarketplaceOrderIdentity
    autoAck?: boolean
    autoNack?: boolean
    now?: number
    onstate?: (event: MarketplaceEscrowStartEvent) => void | Promise<void>
  }

export type MarketplaceEscrowRuntime = {
  close(reason?: string): void
  processGroup(group: ParsedOrderGroup): Promise<void>
}

export type MarketplaceInitIdentity = {
  pubkey?: string
  signer: MarketplaceSeedSigner
}

export type MarketplaceInitOptions = Omit<MarketplaceRuntimeOptions, 'identity' | 'seed' | 'signer' | 'publish'> & {
  identity: MarketplaceInitIdentity
  seed?: string
  createdAt?: number
  publish?(event: Event): unknown | Promise<unknown>
}

function runtimeSeed(opts: MarketplaceRuntimeOptions, seed?: string): string {
  const resolved = seed ?? opts.seed
  if (!resolved) throw new Error('Marketplace seed is required for payment policy lifecycle and watermark discovery')
  return normalizeMarketplaceSeed(resolved)
}

function runtimeIdentity(
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

function runtimeMyOrderQuery(
  opts: MarketplaceRuntimeOptions,
  query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
): MyOrderGroupQuery {
  const identity = runtimeIdentity(opts, query.identity)
  return { ...query, identity }
}

function requireSubscribePool(
  pool: MarketplaceRuntimePool,
): Pick<AbstractSimplePool, 'subscribeMap'> {
  if (!pool.subscribeMap) throw new Error('Marketplace order subscriptions require a pool with subscribeMap')
  return pool as Pick<AbstractSimplePool, 'subscribeMap'>
}

function safeWatermark(value: number | undefined): number {
  if (value === undefined) return -1
  if (!Number.isSafeInteger(value) || value < -1) throw new Error(`Invalid highWaterMark: ${value}`)
  return value
}

function safeWindow(value: number | undefined): number {
  const window = value ?? 50
  if (!Number.isSafeInteger(window) || window < 1) throw new Error(`Invalid unusedWindow: ${value}`)
  return window
}

function paymentPolicies(opts: MarketplaceRuntimeOptions): MarketplacePaymentPolicyImplementation[] {
  return [...(opts.orderPolicies ?? []), ...(opts.bidPolicies ?? [])]
}

function policyName(policy: MarketplacePaymentPolicyImplementation): string {
  return policy.id ?? policy.method
}

function normalizePolicyWatermark(
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

function policyDescriptors(policyImpl: MarketplacePaymentPolicyImplementation): MarketplacePaymentPolicy[] {
  return policyImpl.policies().map(policy => ({
    ...policy,
    method: policy.method || policyImpl.method,
    id: policy.id || policyName(policyImpl),
  }))
}

function policyAssets(policy: MarketplacePaymentPolicyImplementation): MarketplacePaymentAsset[] {
  return policy.assets().map(asset => ({
    ...asset,
    method: asset.method || policy.method,
  }))
}

function allPolicyDescriptors(policies: MarketplacePaymentPolicyImplementation[]): MarketplacePaymentPolicy[] {
  return policies.flatMap(policyDescriptors)
}

function allPolicyAssets(policies: MarketplacePaymentPolicyImplementation[]): MarketplacePaymentAsset[] {
  return policies.flatMap(policyAssets)
}

function paymentValidationPolicies(
  policies: MarketplacePaymentPolicyImplementation[],
): MarketplacePaymentValidationPolicy[] {
  return policies.filter((policy): policy is MarketplacePaymentPolicyImplementation & MarketplacePaymentValidationPolicy =>
    typeof policy.validatePayment === 'function',
  )
}

async function validateGroupsWithRuntimePolicies(
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

function paymentRecoveryItemForGroup(
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
    subject: 'order',
    group,
    payment,
    proof: paymentProof,
    expected: request.expected,
  }
}

function paymentPolicyMatchesDescriptor(
  descriptor: MarketplacePaymentPolicy,
  item: MarketplacePaymentRecoveryItem,
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

function policyForPayment(
  opts: MarketplaceRuntimeOptions,
  item: MarketplacePaymentRecoveryItem,
): MarketplacePaymentPolicyImplementation | undefined {
  return paymentPolicies(opts).find(policy =>
    policy.subject === item.subject &&
    policy.method === item.proof.method &&
    policyDescriptors(policy).some(descriptor => paymentPolicyMatchesDescriptor(descriptor, item)),
  )
}

async function paymentItemsForMyOrderGroups(
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

async function* recoverMarketplacePayment(
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

async function validateMarketplacePayment(
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

function requireEscrowPublisher(opts: MarketplaceRuntimeOptions): {
  signer: MarketplaceSeedSigner
  publish: (event: Event) => unknown | Promise<unknown>
} {
  if (!opts.signer) throw new Error('Marketplace escrow mode requires a signer')
  if (!opts.publish) throw new Error('Marketplace escrow mode requires a publish function')
  return { signer: opts.signer, publish: opts.publish }
}

async function publishMarketplaceTemplate(
  opts: MarketplaceRuntimeOptions,
  template: EventTemplate,
): Promise<Event> {
  const { signer, publish } = requireEscrowPublisher(opts)
  const event = await signer.signEvent(template)
  await publish(event)
  return event
}

function hasPaymentAckFrom(group: ParsedOrderGroup, payment: ParsedOrderPayment, pubkey: string): boolean {
  return group.paymentAcks.some(ack =>
    ack.event.pubkey === pubkey && ack.refs.payments.includes(payment.event.id),
  )
}

function hasPaymentNackFrom(group: ParsedOrderGroup, payment: ParsedOrderPayment, pubkey: string): boolean {
  return group.paymentNacks.some(nack =>
    nack.event.pubkey === pubkey && nack.refs.payments.includes(payment.event.id),
  )
}

function escrowStartIdentity(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceEscrowStartOptions,
): MarketplaceOrderIdentity {
  const identity = runtimeIdentity(opts, options.identity)
  return {
    ...identity,
    roles: options.identity?.roles ?? ['escrow'],
    tempKeyWindow: options.identity?.tempKeyWindow ?? 0,
  }
}

function escrowStartQuery(
  options: MarketplaceEscrowStartOptions,
  identity: MarketplaceOrderIdentity,
): MyOrderGroupQuery {
  const {
    autoAck: _autoAck,
    autoNack: _autoNack,
    now: _now,
    onstate: _onstate,
    identity: _identity,
    maxWait: _maxWait,
    id: _id,
    label: _label,
    abort: _abort,
    resolveRole: _resolveRole,
    isBuyerPaymentProofValid: _isBuyerPaymentProofValid,
    isPaymentValid: _isPaymentValid,
    ...query
  } = options
  return { ...query, identity }
}

function escrowSubscribeOptions(options: MarketplaceEscrowStartOptions): OrderSubscribeOptions & ReduceOrderGroupOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
    ...(options.id ? { id: options.id } : {}),
    ...(options.label ? { label: options.label } : {}),
    ...(options.abort ? { abort: options.abort } : {}),
    ...(options.resolveRole ? { resolveRole: options.resolveRole } : {}),
    ...(options.isBuyerPaymentProofValid ? { isBuyerPaymentProofValid: options.isBuyerPaymentProofValid } : {}),
    ...(options.isPaymentValid ? { isPaymentValid: options.isPaymentValid } : {}),
  }
}

async function emitEscrowState(
  options: MarketplaceEscrowStartOptions,
  event: MarketplaceEscrowStartEvent,
): Promise<void> {
  await options.onstate?.(event)
}

function errorFromUnknown(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

function shouldAck(validation: MarketplacePaymentValidationResult): boolean {
  return validation.status === 'valid'
}

function shouldNack(validation: MarketplacePaymentValidationResult): boolean {
  return validation.status === 'invalid' || validation.status === 'expired'
}

async function processEscrowGroupPayment(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceEscrowStartOptions,
  identity: MarketplaceOrderIdentity,
  group: ParsedOrderGroup,
  payment: ParsedOrderPayment,
): Promise<void> {
  const escrowPubkey = identity.pubkey
  if (!escrowPubkey) throw new Error('Marketplace escrow identity pubkey is required')
  await emitEscrowState(options, { type: 'payment_seen', group, payment })
  const item = paymentRecoveryItemForGroup(group, payment, options.now)
  if (!item) {
    await emitEscrowState(options, { type: 'ignored', group, payment, reason: 'payment has no recoverable proof' })
    return
  }
  const validation = await validateMarketplacePayment(opts, item)
  await emitEscrowState(options, { type: 'payment_validated', group, payment, validation })

  if ((options.autoAck ?? true) && shouldAck(validation)) {
    if (hasPaymentAckFrom(group, payment, escrowPubkey)) {
      await emitEscrowState(options, { type: 'ignored', group, payment, reason: 'payment already acked by escrow' })
      return
    }
    const event = await publishMarketplaceTemplate(
      opts,
      generateOrderPaymentAckEventTemplate({
        orderGroupId: group.id,
        tradeId: group.tradeId,
        listingAnchor: group.listingAnchor,
        participants: group.participants,
        refs: { payments: [payment.event.id] },
        status: 'accepted',
      }),
    )
    await emitEscrowState(options, { type: 'payment_ack_published', group, payment, validation, event })
  } else if ((options.autoNack ?? true) && shouldNack(validation)) {
    if (hasPaymentNackFrom(group, payment, escrowPubkey)) {
      await emitEscrowState(options, { type: 'ignored', group, payment, reason: 'payment already nacked by escrow' })
      return
    }
    const event = await publishMarketplaceTemplate(
      opts,
      generateOrderPaymentNackEventTemplate({
        orderGroupId: group.id,
        tradeId: group.tradeId,
        listingAnchor: group.listingAnchor,
        participants: group.participants,
        refs: { payments: [payment.event.id] },
        status: 'rejected',
        ...(validation.error ? { message: validation.error } : {}),
      }),
    )
    await emitEscrowState(options, { type: 'payment_nack_published', group, payment, validation, event })
  }
}

export function startMarketplaceEscrow(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceEscrowStartOptions = {},
): MarketplaceEscrowRuntime {
  requireEscrowPublisher(opts)
  const identity = escrowStartIdentity(opts, options)
  const processed = new Set<string>()

  async function processGroup(group: ParsedOrderGroup): Promise<void> {
    await emitEscrowState(options, { type: 'group', group })
    for (const payment of group.payments) {
      const key = `${group.id}:${payment.event.id}:${payment.event.created_at}:${group.paymentAcks.length}:${group.paymentNacks.length}`
      if (processed.has(key)) continue
      processed.add(key)
      try {
        await processEscrowGroupPayment(opts, options, identity, group, payment)
      } catch (error) {
        await emitEscrowState(options, { type: 'error', group, payment, error: errorFromUnknown(error) })
      }
    }
  }

  const closer = subscribeMyOrderGroups(
    requireSubscribePool(opts.pool),
    opts.relays,
    escrowStartQuery(options, identity),
    {
      ongroup(group) {
        void processGroup(group)
      },
      oneose() {
        void emitEscrowState(options, { type: 'eose' })
      },
      onclose(reasons) {
        void emitEscrowState(options, { type: 'closed', reasons })
      },
      oninvalid(event, error) {
        void emitEscrowState(options, { type: 'error', error })
      },
    },
    escrowSubscribeOptions(options),
  )
  void emitEscrowState(options, { type: 'started', identity })

  return {
    close(reason?: string) {
      closer.close(reason)
    },
    processGroup,
  }
}

export async function* arbitrateMarketplaceEscrow(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceEscrowArbitrationRequest,
): AsyncIterable<MarketplaceEscrowArbitrationRuntimeState> {
  requireEscrowPublisher(opts)
  const payment = request.payment ?? request.group.payment
  if (!payment) throw new Error('Escrow arbitration requires a payment')
  const item = paymentRecoveryItemForGroup(request.group, payment, request.now)
  if (!item) throw new Error('Escrow arbitration requires a recoverable payment proof')
  const policy = policyForPayment(opts, item)
  if (!policy?.arbitrate) {
    throw new Error(policy ? 'Payment policy does not support arbitration' : 'No matching payment policy')
  }
  const stream = await policy.arbitrate({
    subject: 'order',
    group: request.group,
    payment,
    proof: item.proof,
    expected: item.expected,
    action: request.action,
    ...(request.outputs ? { outputs: request.outputs } : {}),
    ...(request.reason ? { reason: request.reason } : {}),
    ...(request.data ? { data: request.data } : {}),
  })

  for await (const state of stream) {
    yield state
    if ((state.type === 'settlement_ready' || state.type === 'completed') && state.proof) {
      const event = await publishMarketplaceTemplate(
        opts,
        generateOrderPaymentSettlementEventTemplate({
          orderGroupId: request.group.id,
          tradeId: request.group.tradeId,
          listingAnchor: request.group.listingAnchor,
          participants: request.group.participants,
          refs: { payments: [payment.event.id] },
          method: item.proof.method,
          action: request.action,
          ...(state.inputs ? { inputs: state.inputs } : {}),
          ...(state.outputs ?? request.outputs ? { outputs: state.outputs ?? request.outputs } : {}),
          data: {
            ...(request.reason ? { reason: request.reason } : {}),
            ...(request.data ?? {}),
            ...(state.data ?? {}),
            proof: state.proof,
          },
        }),
      )
      yield {
        type: 'settlement_published',
        event,
        proof: state.proof,
        data: state.data,
      }
    }
  }
}

function serviceMethod(service: ParsedEscrowService): PaymentMethod {
  return service.content.type.toLowerCase()
}

function servicePolicyHash(service: ParsedEscrowService): string | undefined {
  const params = service.content.params
  const hash = params.contractBytecodeHash ?? params.policyHash ?? params.scriptHash
  return typeof hash === 'string' ? canonicalPolicyHash(hash) : undefined
}

function canonicalPolicyHash(hash: string | undefined): string | undefined {
  if (!hash) return undefined
  const value = hash.startsWith('0x') || hash.startsWith('0X') ? hash.slice(2) : hash
  return /^[a-fA-F0-9]{64}$/.test(value) ? `0x${value.toLowerCase()}` : hash
}

function samePolicyHash(left: string | undefined, right: string | undefined): boolean {
  if (!left || !right) return false
  return canonicalPolicyHash(left) === canonicalPolicyHash(right)
}

function serviceChainId(service: ParsedEscrowService): number | undefined {
  const chainId = service.content.params.chainId
  return typeof chainId === 'number' ? chainId : undefined
}

function serviceContractAddress(service: ParsedEscrowService): string | undefined {
  const address = service.content.params.contractAddress
  return typeof address === 'string' ? address : undefined
}

function sameMethod(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase()
}

function policyMatchesService(policy: MarketplacePaymentPolicy, service: ParsedEscrowService): boolean {
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

function assetMatchesForm(
  asset: MarketplacePaymentAsset,
  form: { denomination: string; assetId: string; appId?: string },
): boolean {
  if (asset.denomination !== form.denomination) return false
  return canonicalAssetId(asset.assetId) === canonicalAssetId(form.assetId)
}

function routeScore(asset: MarketplacePaymentAsset, policy: MarketplacePaymentPolicy): number {
  let score = 0
  if (asset.appId) score += 5
  if (policy.hash) score += 10
  if (policy.contractAddress) score += 5
  return score
}

function addParticipant(
  participants: PTag[] | undefined,
  pubkey: string,
  role: OrderParticipantRole,
): PTag[] {
  const existing = participants ?? []
  if (existing.some(participant => participant.pubkey === pubkey && participant.role === role)) return existing
  return [...existing, { pubkey, role }]
}

function orderWithRouteParticipants(route: MarketplacePaymentRoute, order: OrderTemplate): OrderTemplate {
  return {
    ...order,
    participants: addParticipant(
      addParticipant(order.participants, route.escrowMethod.event.pubkey, 'seller'),
      route.escrowService.event.pubkey,
      'escrow',
    ),
  }
}

function orderContent(order: OrderTemplate): OrderContent {
  return {
    ...(order.start ? { start: order.start } : {}),
    ...(order.end ? { end: order.end } : {}),
    quantity: order.quantity ?? 1,
    ...(order.amount ? { amount: order.amount } : {}),
    ...(order.recipient ? { recipient: order.recipient } : {}),
    ...(order.commitAuthorization ? { commitAuthorization: order.commitAuthorization } : {}),
  }
}

function unlockAt(order: OrderTemplate, maxDuration: number, nowSeconds = nowSecondsFromDate()): number {
  if (order.end) {
    const parsed = Date.parse(order.end)
    if (Number.isFinite(parsed)) return Math.floor(parsed / 1000)
  }
  return nowSeconds + Math.max(maxDuration, 3600)
}

function nowSecondsFromDate(): number {
  return Math.floor(Date.now() / 1000)
}

function paymentProofForRoute(
  route: MarketplacePaymentRoute,
  proof: PaymentProofEvidence | null,
): PaymentProof {
  return {
    listing: route.listing.event,
    paymentProof: proof,
    escrow: {
      escrowService: route.escrowService.event,
      sellerEscrowMethod: route.escrowMethod.event,
    },
  }
}

function orderDraftForPaymentState(
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
): EventTemplate {
  const routedOrder = orderWithRouteParticipants(route, order)
  const amount = order.amount ? { ...order.amount, decimals: route.asset.decimals } : undefined
  return generateOrderEventTemplate({
    ...routedOrder,
    ...(amount ? { amount } : {}),
  })
}

function paymentDraftForPaymentState(
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  proof: PaymentProofEvidence | null,
): (orderEvent: Event) => EventTemplate {
  const routedOrder = orderWithRouteParticipants(route, order)
  return (orderEvent: Event) =>
    generateOrderPaymentEventTemplate({
      ...routedOrder,
      orderGroupId: orderGroupIdForOrder(orderEvent),
      proof: paymentProofForRoute(route, proof),
      refs: { orders: [orderEvent.id] },
    })
}

function buildPaymentIntent(
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  options: MarketplacePayOptions,
  seed: string | undefined,
): MarketplacePaymentIntent {
  const routedOrder = orderWithRouteParticipants(route, order)
  if (!routedOrder.amount) throw new Error('Order amount is required for marketplace payment')
  const amount = { ...routedOrder.amount, decimals: route.asset.decimals }
  const feeAsset = route.asset.assetAddress?.toLowerCase() ?? route.asset.assetId
  const fee = calculateEscrowFee(route.escrowService.content.fee, BigInt(amount.value), feeAsset)
  const buyer = routedOrder.participants?.find(participant => participant.role === 'buyer')
  const chainId = serviceChainId(route.escrowService)
  const contractAddress = serviceContractAddress(route.escrowService)
  const policyHash = servicePolicyHash(route.escrowService)
  const settlementId = orderGroupIdForParticipants(routedOrder.tradeId, routedOrder.participants ?? [])
  return {
    method: route.policy.method,
    subject: 'order',
    tradeId: routedOrder.tradeId,
    settlementId,
    accountIndex: options.accountIndex,
    ...(seed ? { seed } : {}),
    amount,
    fee: {
      value: fee.toString(),
      denomination: amount.denomination,
      decimals: amount.decimals,
    },
    asset: route.asset,
    policy: route.descriptor,
    contract: {
      type: route.escrowService.content.type,
      ...(chainId !== undefined ? { chainId } : {}),
      ...(contractAddress ? { address: contractAddress } : {}),
      ...(policyHash ? { bytecodeHash: policyHash } : {}),
      params: route.escrowService.content.params,
    },
    participants: {
      ...(buyer ? { buyer } : {}),
      seller: {
        pubkey: route.escrowMethod.event.pubkey,
        ...(route.escrowMethod.evmAddress ? { address: route.escrowMethod.evmAddress } : {}),
      },
      escrow: {
        pubkey: route.escrowService.event.pubkey,
        ...(typeof route.escrowService.content.params.arbiterAddress === 'string'
          ? { address: route.escrowService.content.params.arbiterAddress }
          : {}),
      },
    },
    unlockAt: unlockAt(order, route.escrowService.content.maxDuration, options.now),
    metadata: {
      listingAnchor: order.listingAnchor,
      listingId: route.listing.d,
      order: orderContent(routedOrder),
    },
  }
}

async function* wrapPolicyPaymentStream<State = MarketplacePaymentState>(
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  stream: AsyncIterable<MarketplacePolicyPaymentState>,
): AsyncIterable<State> {
  for await (const state of stream) {
    if (state.type === 'payment_required') {
      yield {
        type: 'payment_required',
        request: state.request,
        data: state.data,
      } as State
    } else if (state.type === 'paid') {
      yield {
        type: 'order_ready',
        orderDraft: orderDraftForPaymentState(route, order),
        paymentDraft: paymentDraftForPaymentState(route, order, state.proof),
        data: state.data,
      } as State
    } else if (state.type === 'payment_progress') {
      yield {
        type: 'payment_progress',
        status: state.status,
        data: state.data,
      } as State
    } else {
      yield {
        type: 'completed',
        data: state.data,
      } as State
    }
  }
}

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

export async function paymentRoutesForListing(
  opts: MarketplaceRuntimeOptions,
  listing: Event | MarketplaceListing,
  order: OrderTemplate | null = null,
): Promise<MarketplacePaymentRoute[]> {
  const parsedListing = 'event' in listing ? listing : parseListingEvent(listing)
  const sellerPubkey = parsedListing.event.pubkey
  const method = await findEscrowMethod(opts.pool, opts.relays, { author: sellerPubkey, limit: 5 })
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
  for (const escrowService of services) {
    for (const paymentPolicy of opts.orderPolicies ?? []) {
      const descriptors = policyDescriptors(paymentPolicy).filter(policy => policyMatchesService(policy, escrowService))
      if (descriptors.length === 0) continue
      const assets = policyAssets(paymentPolicy).filter(asset =>
        method.acceptedPaymentForms.some(form => assetMatchesForm(asset, form)) &&
        (!order?.amount || asset.denomination === order.amount.denomination),
      )
      for (const descriptor of descriptors) {
        for (const asset of assets) {
          routes.push({
            policy: paymentPolicy,
            listing: parsedListing,
            escrowMethod: method,
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

export function createMarketplace(opts: MarketplaceRuntimeOptions) {
  return {
    listings: {
      parse: parseListingEvent,
      validate: validateListingEvent,
      template: generateListingEventTemplate,
      filters: { search: listingSearchFilter },
      search: (query: ListingSearchQuery = {}) => searchListings(opts.pool, opts.relays, query),
    },
    escrowMethods: {
      parse: parseEscrowMethodEvent,
      validate: validateEscrowMethodEvent,
      template: generateEscrowMethodEventTemplate,
      filter: escrowMethodFilter,
      findOne: (query: EscrowMethodFindQuery = {}) => findEscrowMethod(opts.pool, opts.relays, query),
    },
    escrowServices: {
      parse: parseEscrowServiceEvent,
      validate: validateEscrowServiceEvent,
      template: generateEscrowServiceEventTemplate,
      filter: escrowServiceFilter,
      search: (query: EscrowServiceFindQuery = {}) => searchEscrowServices(opts.pool, opts.relays, query),
      findOne: (query: EscrowServiceFindQuery = {}) => findEscrowService(opts.pool, opts.relays, query),
    },
    escrowServiceSelections: {
      parse: parseEscrowServiceSelectionEvent,
      validate: validateEscrowServiceSelectionEvent,
      template: generateEscrowServiceSelectionEventTemplate,
    },
    orders: {
      parse: parseOrderEvent,
      validate: validateOrderEvent,
      template: generateOrderEventTemplate,
      commitHash: orderCommitHash,
      filters: orderFilters,
      search: (query: OrderQuery = {}, options: OrderSearchOptions = {}) =>
        searchOrders(opts.pool, opts.relays, query, options),
      subscribe: (query: OrderQuery, handlers: OrderSubscribeHandlers, options: OrderSubscribeOptions = {}) =>
        subscribeOrders(requireSubscribePool(opts.pool), opts.relays, query, handlers, options),
      mine: (
        query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
        options: OrderSearchOptions = {},
      ) => searchOrders(opts.pool, opts.relays, runtimeMyOrderQuery(opts, query), options),
      subscribeMine: (
        query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
        handlers: OrderSubscribeHandlers,
        options: OrderSubscribeOptions = {},
      ) => subscribeOrders(requireSubscribePool(opts.pool), opts.relays, runtimeMyOrderQuery(opts, query), handlers, options),
      groups: {
        id: orderGroupIdForParticipants,
        idForOrder: orderGroupIdForOrder,
        participants: orderGroupParticipantPubkeys,
        filter: orderGroupFilter,
        reduce: reduceOrderGroup,
        group: groupOrderEvents,
        resolveParticipants: resolveOrderGroupParticipants,
        validatePayments: (group: ParsedOrderGroup, options = {}) =>
          validateOrderGroupPayments(group, { policies: paymentValidationPolicies(paymentPolicies(opts)), ...options }),
        resolveAndValidate: (group: ParsedOrderGroup, options = {}) =>
          resolveAndValidateOrderGroup(group, { policies: paymentValidationPolicies(paymentPolicies(opts)), ...options }),
        fetch: (query: OrderGroupFilterQuery = {}, options: ReduceOrderGroupOptions = {}) =>
          fetchOrderGroups(opts.pool, opts.relays, query, options),
        search: (query: OrderQuery = {}, options: OrderGroupSearchOptions = {}) =>
          searchOrderGroups(opts.pool, opts.relays, query, options).then(groups =>
            validateGroupsWithRuntimePolicies(opts, groups, options),
          ),
        subscribe: (
          query: OrderQuery,
          handlers: OrderGroupSubscribeHandlers,
          options: OrderSubscribeOptions & ReduceOrderGroupOptions = {},
        ) => subscribeOrderGroups(requireSubscribePool(opts.pool), opts.relays, query, handlers, options),
        mine: (
          query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
          options: OrderGroupSearchOptions = {},
        ) => searchMyOrderGroups(opts.pool, opts.relays, runtimeMyOrderQuery(opts, query), options).then(async buckets => {
          const identity = {
            ...runtimeIdentity(opts, query.identity),
            roles: query.identity?.roles ?? ['buyer', 'seller'],
            tempKeyWindow: query.identity?.tempKeyWindow ?? 500,
          }
          const validated = await validateGroupsWithRuntimePolicies(opts, buckets.all, options)
          return bucketOrderGroups(validated, identity)
        }),
        subscribeMine: (
          query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
          handlers: OrderGroupSubscribeHandlers & { onbuckets?: (buckets: OrderGroupBuckets) => void },
          options: OrderSubscribeOptions & ReduceOrderGroupOptions = {},
        ) => subscribeMyOrderGroups(requireSubscribePool(opts.pool), opts.relays, runtimeMyOrderQuery(opts, query), handlers, options),
      },
    },
    reviews: {
      parse: parseReviewEvent,
      validate: validateReviewEvent,
      template: generateReviewEventTemplate,
    },
    structuredMessages: {
      parse: parseStructuredMessageEvent,
      validate: validateStructuredMessageEvent,
      template: generateStructuredMessageEventTemplate,
    },
    paymentRoutes: {
      forListing: (listing: Event | MarketplaceListing, order: OrderTemplate | null = null) =>
        paymentRoutesForListing(opts, listing, order),
    },
    payments: {
      mine: {
        fetch: (
          query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
          options: OrderGroupSearchOptions & { now?: number } = {},
        ) => paymentItemsForMyOrderGroups(opts, query, options),
      },
      recover: (payment: MarketplacePaymentRecoveryItem) => recoverMarketplacePayment(opts, payment),
      validate: (payment: MarketplacePaymentRecoveryItem) => validateMarketplacePayment(opts, payment),
      policyFor: (payment: MarketplacePaymentRecoveryItem) => policyForPayment(opts, payment),
    },
    escrow: {
      start: (options: MarketplaceEscrowStartOptions = {}) => startMarketplaceEscrow(opts, options),
      arbitrate: (request: MarketplaceEscrowArbitrationRequest) => arbitrateMarketplaceEscrow(opts, request),
    },
    discoverHighWatermark: (options: MarketplaceHighWatermarkOptions = {}) =>
      discoverMarketplaceHighWatermark(opts, options),
    start: (options: MarketplaceStartOptions = {}) => startMarketplaceRuntime(opts, options),
    async *pay<State = MarketplacePaymentState>(
      listing: Event | MarketplaceListing,
      order: OrderTemplate,
      options: MarketplacePayOptions,
    ): AsyncIterable<State> {
      const route = options.route ?? (await paymentRoutesForListing(opts, listing, order))[0]
      if (!route) throw new Error('No supported marketplace payment route')
      const seed = runtimeSeed(opts, options.seed)
      const stream = await route.policy.pay(buildPaymentIntent(route, order, options, seed))
      yield* wrapPolicyPaymentStream<State>(route, order, stream as AsyncIterable<MarketplacePolicyPaymentState>)
    },
  }
}

export async function init(opts: MarketplaceInitOptions) {
  const pubkey = opts.identity.pubkey ?? (await opts.identity.signer.getPublicKey?.())
  if (!pubkey) throw new Error('Marketplace identity pubkey is required')

  const recovered = opts.seed
    ? undefined
    : await getOrCreateMarketplaceSeed({
        pool: opts.pool,
        relays: opts.relays,
        pubkey,
        signer: opts.identity.signer,
        createdAt: opts.createdAt,
        publish: opts.publish,
      })
  const seed = opts.seed ? normalizeMarketplaceSeed(opts.seed) : recovered!.seed
  const runtime = createMarketplace({
    pool: opts.pool,
    relays: opts.relays,
    seed,
    identity: { pubkey },
    signer: opts.identity.signer,
    publish: opts.publish,
    orderPolicies: opts.orderPolicies,
    bidPolicies: opts.bidPolicies,
  })

  return {
    ...runtime,
    seed,
    identity: { pubkey },
    seedCreated: recovered?.created ?? false,
    ...(recovered ? { seedEvent: recovered.event } : {}),
  }
}
