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
import { isPaymentValidationAccepted } from './payment-validation.ts'
import { resolvePaymentAmount } from './payment-amount.ts'
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
  MarketplacePaymentSettlementIntent,
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
  paymentValidationItemForGroup,
  policyForPayment,
  publishMarketplaceTemplate,
  requireArbitrationPublisher,
  requireSubscribePool,
  runtimeIdentity,
  runtimeMyOrderQuery,
  validateMarketplacePayment,
} from './runtime-common.ts'

type ArbitrationPaymentItem = {
  payment: ParsedPayment
  item: MarketplacePaymentValidationItem
  amount: MarketplaceAmount
}

function uniquePayments(payments: ParsedPayment[]): ParsedPayment[] {
  const seen = new Set<string>()
  const unique: ParsedPayment[] = []
  for (const payment of payments) {
    if (seen.has(payment.event.id)) continue
    seen.add(payment.event.id)
    unique.push(payment)
  }
  return unique
}

function arbitrationPayments(request: MarketplacePaymentArbitrationRequest): ParsedPayment[] {
  const payments = request.payments?.length
    ? request.payments
    : request.payment
      ? [request.payment]
      : request.group.payments.length
        ? request.group.payments
        : request.group.payment
          ? [request.group.payment]
          : []
  return uniquePayments(payments)
}

function parseSettlementAmount(value: string | undefined, label: string): bigint {
  if (value === undefined) throw new Error(`${label} settlement output amount is required`)
  if (!/^\d+$/.test(value)) throw new Error(`${label} settlement output amount must be an integer string`)
  return BigInt(value)
}

function sumPaymentAmounts(items: ArbitrationPaymentItem[]): bigint {
  return items.reduce((total, item) => total + parseSettlementAmount(item.amount.value, 'Payment'), 0n)
}

function allocateOutputAmount(
  outputAmount: bigint,
  paymentAmount: bigint,
  totalAmount: bigint,
): { amount: bigint; remainder: bigint } {
  const scaled = outputAmount * paymentAmount
  return {
    amount: scaled / totalAmount,
    remainder: scaled % totalAmount,
  }
}

function allocateSettlementOutputs(
  items: ArbitrationPaymentItem[],
  outputs: PaymentSettlementOutput[] | undefined,
): Map<string, PaymentSettlementOutput[] | undefined> {
  const allocations = new Map<string, PaymentSettlementOutput[] | undefined>()
  if (!outputs || items.length <= 1) {
    for (const item of items) allocations.set(item.payment.event.id, outputs)
    return allocations
  }
  const totalAmount = sumPaymentAmounts(items)
  if (totalAmount <= 0n) throw new Error('Payment arbitration requires a positive payment total')
  for (const item of items) allocations.set(item.payment.event.id, [])
  for (const output of outputs) {
    const outputAmount = parseSettlementAmount(output.amount, 'Arbitration')
    let allocatedTotal = 0n
    const shares = items.map((item, index) => {
      const allocation = allocateOutputAmount(
        outputAmount,
        parseSettlementAmount(item.amount.value, 'Payment'),
        totalAmount,
      )
      allocatedTotal += allocation.amount
      return { item, index, ...allocation }
    })
    let remainder = outputAmount - allocatedTotal
    shares
      .slice()
      .sort((left, right) =>
        left.remainder === right.remainder
          ? left.index - right.index
          : left.remainder > right.remainder
            ? -1
            : 1,
      )
      .forEach(share => {
        if (remainder <= 0n) return
        share.amount += 1n
        remainder -= 1n
      })
    for (const share of shares) {
      allocations.get(share.item.payment.event.id)?.push({
        ...output,
        amount: share.amount.toString(),
      })
    }
  }
  return allocations
}

async function arbitrationPaymentItems(
  opts: MarketplaceRuntimeOptions,
  request: MarketplacePaymentArbitrationRequest,
): Promise<ArbitrationPaymentItem[]> {
  const payments = arbitrationPayments(request)
  if (payments.length === 0) throw new Error('Payment arbitration requires at least one payment')
  const items: ArbitrationPaymentItem[] = []
  for (const payment of payments) {
    const amount = await resolvePaymentAmount(payment, { signer: opts.signer })
    if (amount.status !== 'resolved' || !amount.amount) {
      throw new Error(amount.error ?? 'Payment arbitration requires a resolvable payment amount')
    }
    const item = paymentValidationItemForGroup(request.group, payment, request.now, amount.amount)
    if (!item) throw new Error('Payment arbitration requires a recoverable payment proof')
    items.push({ payment, item, amount: amount.amount })
  }
  return items
}

function settlementIntentForPayment(
  request: MarketplacePaymentArbitrationRequest,
  entry: ArbitrationPaymentItem,
  outputs: PaymentSettlementOutput[] | undefined,
): MarketplacePaymentSettlementIntent {
  return {
    paymentId: entry.payment.event.id,
    tradeId: request.group.tradeId,
    orderGroupId: request.group.id,
    listingAnchor: request.group.listingAnchor,
    createdAt: entry.payment.event.created_at,
    action: request.action,
    proof: entry.item.proof,
    amount: entry.amount,
    ...(entry.item.expected ? { expected: entry.item.expected } : {}),
    ...(outputs ? { outputs } : {}),
    ...(request.reason ? { reason: request.reason } : {}),
    ...(request.data ? { data: request.data } : {}),
  }
}

export function hasPaymentAckFrom(group: ParsedOrderGroup, payment: ParsedPayment, pubkey: string): boolean {
  return group.paymentAcks.some(ack =>
    ack.event.pubkey === pubkey && ack.refs.payments.includes(payment.event.id),
  )
}

export function hasPaymentNackFrom(group: ParsedOrderGroup, payment: ParsedPayment, pubkey: string): boolean {
  return group.paymentNacks.some(nack =>
    nack.event.pubkey === pubkey && nack.refs.payments.includes(payment.event.id),
  )
}

type ArbitrationPaymentDecisionTracker = {
  hasAck: (group: ParsedOrderGroup, payment: ParsedPayment, pubkey: string) => boolean
  hasNack: (group: ParsedOrderGroup, payment: ParsedPayment, pubkey: string) => boolean
  markAck: (group: ParsedOrderGroup, payment: ParsedPayment, pubkey: string) => void
  markNack: (group: ParsedOrderGroup, payment: ParsedPayment, pubkey: string) => void
}

export function arbitrationStartIdentity(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceArbitrationStartOptions,
): MarketplaceOrderIdentity {
  const identity = runtimeIdentity(opts, options.identity)
  return {
    ...identity,
    roles: options.identity?.roles ?? ['arbiter'],
    tempKeyWindow: options.identity?.tempKeyWindow ?? 0,
  }
}

export function arbitrationStartQuery(
  options: MarketplaceArbitrationStartOptions,
  identity: MarketplaceOrderIdentity,
): OrderGroupIdentityQuery {
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

export function arbitrationSubscribeOptions(options: MarketplaceArbitrationStartOptions): OrderSubscribeOptions & ReduceOrderGroupOptions {
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

export async function emitArbitrationState(
  options: MarketplaceArbitrationStartOptions,
  event: MarketplaceArbitrationStartEvent,
): Promise<void> {
  await options.onstate?.(event)
}

export function errorFromUnknown(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function shouldAck(validation: MarketplacePaymentValidationResult): boolean {
  return isPaymentValidationAccepted(validation)
}

export function shouldNack(validation: MarketplacePaymentValidationResult): boolean {
  return validation.status === 'invalid' || validation.status === 'expired'
}

export async function processArbitrationGroupPayment(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceArbitrationStartOptions,
  identity: MarketplaceOrderIdentity,
  group: ParsedOrderGroup,
  payment: ParsedPayment,
  tracker?: ArbitrationPaymentDecisionTracker,
): Promise<void> {
  const arbiterPubkey = identity.pubkey
  if (!arbiterPubkey) throw new Error('Marketplace arbiter identity pubkey is required')
  await emitArbitrationState(options, { type: 'payment_seen', group, payment })
  const amount = await resolvePaymentAmount(payment, { signer: opts.signer, signerPubkey: arbiterPubkey })
  if (amount.status !== 'resolved' || !amount.amount) {
    await emitArbitrationState(options, {
      type: 'ignored',
      group,
      payment,
      reason: amount.error ?? 'payment amount could not be resolved',
    })
    return
  }
  const item = paymentValidationItemForGroup(group, payment, options.now, amount.amount)
  if (!item) {
    await emitArbitrationState(options, { type: 'ignored', group, payment, reason: 'payment has no recoverable proof' })
    return
  }
  const validation = await validateMarketplacePayment(opts, item)
  await emitArbitrationState(options, { type: 'payment_validated', group, payment, validation })

  if ((options.autoAck ?? true) && shouldAck(validation)) {
    if (tracker?.hasAck(group, payment, arbiterPubkey) || hasPaymentAckFrom(group, payment, arbiterPubkey)) {
      await emitArbitrationState(options, { type: 'ignored', group, payment, reason: 'payment already acked by arbiter' })
      return
    }
    const event = await publishMarketplaceTemplate(
      opts,
      generatePaymentAckEventTemplate({
        orderGroupId: group.id,
        tradeId: group.tradeId,
        anchors: [{ value: group.listingAnchor, marker: 'listing' }],
        participants: group.participants,
        refs: { payments: [payment.event.id] },
        status: 'accepted',
      }),
    )
    tracker?.markAck(group, payment, arbiterPubkey)
    await emitArbitrationState(options, { type: 'payment_ack_published', group, payment, validation, event })
  } else if ((options.autoNack ?? true) && shouldNack(validation)) {
    if (tracker?.hasNack(group, payment, arbiterPubkey) || hasPaymentNackFrom(group, payment, arbiterPubkey)) {
      await emitArbitrationState(options, { type: 'ignored', group, payment, reason: 'payment already nacked by arbiter' })
      return
    }
    const event = await publishMarketplaceTemplate(
      opts,
      generatePaymentNackEventTemplate({
        orderGroupId: group.id,
        tradeId: group.tradeId,
        anchors: [{ value: group.listingAnchor, marker: 'listing' }],
        participants: group.participants,
        refs: { payments: [payment.event.id] },
        status: 'rejected',
        ...(validation.error ? { message: validation.error } : {}),
      }),
    )
    tracker?.markNack(group, payment, arbiterPubkey)
    await emitArbitrationState(options, { type: 'payment_nack_published', group, payment, validation, event })
  }
}

export function startMarketplaceOrderArbitration(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceArbitrationStartOptions = {},
): MarketplaceArbitrationRuntime {
  requireArbitrationPublisher(opts)
  const identity = arbitrationStartIdentity(opts, options)
  const processed = new Set<string>()
  const observedAcks = new Set<string>()
  const observedNacks = new Set<string>()

  const decisionKey = (group: ParsedOrderGroup, paymentId: string, pubkey: string) =>
    `${group.id}:${paymentId}:${pubkey}`
  const tracker: ArbitrationPaymentDecisionTracker = {
    hasAck(group, payment, pubkey) {
      return observedAcks.has(decisionKey(group, payment.event.id, pubkey))
    },
    hasNack(group, payment, pubkey) {
      return observedNacks.has(decisionKey(group, payment.event.id, pubkey))
    },
    markAck(group, payment, pubkey) {
      observedAcks.add(decisionKey(group, payment.event.id, pubkey))
    },
    markNack(group, payment, pubkey) {
      observedNacks.add(decisionKey(group, payment.event.id, pubkey))
    },
  }

  function noteGroupDecisions(group: ParsedOrderGroup): void {
    for (const ack of group.paymentAcks) {
      if (ack.event.pubkey !== identity.pubkey) continue
      for (const paymentId of ack.refs.payments) observedAcks.add(decisionKey(group, paymentId, ack.event.pubkey))
    }
    for (const nack of group.paymentNacks) {
      if (nack.event.pubkey !== identity.pubkey) continue
      for (const paymentId of nack.refs.payments) observedNacks.add(decisionKey(group, paymentId, nack.event.pubkey))
    }
  }

  async function processGroup(group: ParsedOrderGroup): Promise<void> {
    await emitArbitrationState(options, { type: 'group', group })
    noteGroupDecisions(group)
    for (const payment of group.payments) {
      const key = `${group.id}:${payment.event.id}:${payment.event.created_at}:${group.paymentAcks.length}:${group.paymentNacks.length}`
      if (processed.has(key)) continue
      processed.add(key)
      try {
        await processArbitrationGroupPayment(opts, options, identity, group, payment, tracker)
      } catch (error) {
        await emitArbitrationState(options, { type: 'error', group, payment, error: errorFromUnknown(error) })
      }
    }
  }

  const closer = subscribeOrderGroupsForIdentity(
    requireSubscribePool(opts.pool),
    opts.relays,
    arbitrationStartQuery(options, identity),
    {
      ongroup(group) {
        void processGroup(group)
      },
      oneose() {
        void emitArbitrationState(options, { type: 'eose' })
      },
      onclose(reasons) {
        void emitArbitrationState(options, { type: 'closed', reasons })
      },
      oninvalid(event, error) {
        void emitArbitrationState(options, { type: 'error', error })
      },
    },
    arbitrationSubscribeOptions(options),
  )
  void emitArbitrationState(options, { type: 'started', identity })

  return {
    close(reason?: string) {
      closer.close(reason)
    },
    processGroup,
    async processAuction() {},
    async processAuctionBidGroup() {},
    async settleAuction() {},
    async settleDueAuctions() {},
  }
}

export async function* arbitrateMarketplacePayment(
  opts: MarketplaceRuntimeOptions,
  request: MarketplacePaymentArbitrationRequest,
): AsyncIterable<MarketplacePaymentArbitrationRuntimeState> {
  requireArbitrationPublisher(opts)
  const items = await arbitrationPaymentItems(opts, request)
  const outputAllocations = allocateSettlementOutputs(items, request.outputs)

  for (const entry of items) {
    const policy = policyForPayment(opts, entry.item)
    if (!policy) throw new Error('No matching payment policy')
    const outputs = outputAllocations.get(entry.payment.event.id)
    const stream = policy.settlePayment
      ? await policy.settlePayment(settlementIntentForPayment(request, entry, outputs))
      : policy.arbitrate
        ? await policy.arbitrate({
            purpose: 'order',
            group: request.group,
            payment: entry.payment,
            proof: entry.item.proof,
            action: request.action,
            ...(entry.item.expected ? { expected: entry.item.expected } : {}),
            ...(outputs ? { outputs } : {}),
            ...(request.reason ? { reason: request.reason } : {}),
            ...(request.data ? { data: request.data } : {}),
          })
        : undefined
    if (!stream) throw new Error('Payment policy does not support settlement')

    for await (const state of stream) {
      yield state
      if ((state.type === 'settlement_ready' || state.type === 'completed') && state.proof) {
        const settledOutputs = state.outputs ?? outputs
        const event = await publishMarketplaceTemplate(
          opts,
          generatePaymentSettlementEventTemplate({
            orderGroupId: request.group.id,
            tradeId: request.group.tradeId,
            anchors: [{ value: request.group.listingAnchor, marker: 'listing' }],
            participants: request.group.participants,
            refs: { payments: [entry.payment.event.id] },
            method: entry.item.proof.driver,
            action: request.action,
            ...(state.inputs ? { inputs: state.inputs } : {}),
            ...(settledOutputs ? { outputs: settledOutputs } : {}),
            data: {
              ...(request.reason ? { reason: request.reason } : {}),
              ...(request.data ?? {}),
              ...(items.length > 1
                ? {
                    paymentSet: {
                      count: items.length,
                      total: sumPaymentAmounts(items).toString(),
                      payments: items.map(item => item.payment.event.id),
                    },
                  }
                : {}),
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
}
