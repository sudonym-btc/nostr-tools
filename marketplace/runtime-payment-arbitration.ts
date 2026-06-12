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
  paymentRecoveryItemForGroup,
  policyForPayment,
  publishMarketplaceTemplate,
  requireArbitrationPublisher,
  requireSubscribePool,
  runtimeIdentity,
  runtimeMyOrderQuery,
  validateMarketplacePayment,
} from './runtime-common.ts'

export function hasPaymentAckFrom(group: ParsedOrderGroup, payment: ParsedOrderPayment, pubkey: string): boolean {
  return group.paymentAcks.some(ack =>
    ack.event.pubkey === pubkey && ack.refs.payments.includes(payment.event.id),
  )
}

export function hasPaymentNackFrom(group: ParsedOrderGroup, payment: ParsedOrderPayment, pubkey: string): boolean {
  return group.paymentNacks.some(nack =>
    nack.event.pubkey === pubkey && nack.refs.payments.includes(payment.event.id),
  )
}

type ArbitrationPaymentDecisionTracker = {
  hasAck: (group: ParsedOrderGroup, payment: ParsedOrderPayment, pubkey: string) => boolean
  hasNack: (group: ParsedOrderGroup, payment: ParsedOrderPayment, pubkey: string) => boolean
  markAck: (group: ParsedOrderGroup, payment: ParsedOrderPayment, pubkey: string) => void
  markNack: (group: ParsedOrderGroup, payment: ParsedOrderPayment, pubkey: string) => void
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
  payment: ParsedOrderPayment,
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
  const item = paymentRecoveryItemForGroup(group, payment, options.now, amount.amount)
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
      generateOrderPaymentAckEventTemplate({
        orderGroupId: group.id,
        tradeId: group.tradeId,
        listingAnchor: group.listingAnchor,
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

  const closer = subscribeMyOrderGroups(
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
  const payment = request.payment ?? request.group.payment
  if (!payment) throw new Error('Payment arbitration requires a payment')
  const amount = await resolvePaymentAmount(payment, { signer: opts.signer })
  if (amount.status !== 'resolved' || !amount.amount) {
    throw new Error(amount.error ?? 'Payment arbitration requires a resolvable payment amount')
  }
  const item = paymentRecoveryItemForGroup(request.group, payment, request.now, amount.amount)
  if (!item) throw new Error('Payment arbitration requires a recoverable payment proof')
  const policy = policyForPayment(opts, item)
  if (!policy?.arbitrate) {
    throw new Error(policy ? 'Payment policy does not support arbitration' : 'No matching payment policy')
  }
  const stream = await policy.arbitrate({
    purpose: 'order',
    group: request.group,
    payment,
    proof: item.proof,
    action: request.action,
    ...(item.expected ? { expected: item.expected } : {}),
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
          method: item.proof.driver,
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
