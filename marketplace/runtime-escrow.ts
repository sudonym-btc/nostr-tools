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
  paymentRecoveryItemForGroup,
  policyForPayment,
  publishMarketplaceTemplate,
  requireEscrowPublisher,
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

export function escrowStartIdentity(
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

export function escrowStartQuery(
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

export function escrowSubscribeOptions(options: MarketplaceEscrowStartOptions): OrderSubscribeOptions & ReduceOrderGroupOptions {
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

export async function emitEscrowState(
  options: MarketplaceEscrowStartOptions,
  event: MarketplaceEscrowStartEvent,
): Promise<void> {
  await options.onstate?.(event)
}

export function errorFromUnknown(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function shouldAck(validation: MarketplacePaymentValidationResult): boolean {
  return validation.status === 'valid'
}

export function shouldNack(validation: MarketplacePaymentValidationResult): boolean {
  return validation.status === 'invalid' || validation.status === 'expired'
}

export async function processEscrowGroupPayment(
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
    async processAuction() {},
    async processAuctionBidGroup() {},
    async settleAuction() {},
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
