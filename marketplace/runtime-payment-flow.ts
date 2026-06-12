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
  marketplaceLogger,
  policyName,
  publishMarketplaceEvent,
} from './runtime-common.ts'
import {
  serviceChainId,
  serviceContractAddress,
  servicePolicyHash,
  normalizeAmountForPaymentAsset,
  normalizeAmountForRouteEvent,
} from './runtime-routes.ts'
import {
  buildPaymentProofPayload,
  type PaymentProofKeyTag,
  type PaymentProofPrivacy,
  type SealedPaymentProof,
} from './payment-proof.ts'
import {
  buildPaymentAmountPayload,
  type PaymentAmountKeyTag,
  type PaymentAmountPrivacy,
  type SealedPaymentAmount,
} from './payment-amount.ts'

type PaymentAmountPayloadForState = {
  amount?: MarketplaceAmount
  sealedAmount?: SealedPaymentAmount
  paymentAmountKeys: PaymentAmountKeyTag[]
}

export function addParticipant(
  participants: PTag[] | undefined,
  pubkey: string,
  role: OrderParticipantRole,
): PTag[] {
  const existing = participants ?? []
  if (existing.some(participant => participant.pubkey === pubkey && participant.role === role)) return existing
  return [...existing, { pubkey, role }]
}

export function orderWithRouteParticipants(
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  buyerPubkey?: string,
): OrderTemplate {
  const withBuyer = buyerPubkey ? addParticipant(order.participants, buyerPubkey, 'buyer') : order.participants
  return {
    ...order,
    participants: addParticipant(
      addParticipant(withBuyer, route.paymentMethod.event.pubkey, 'seller'),
      route.arbitrationService.event.pubkey,
      'arbiter',
    ),
  }
}

export function orderContent(order: OrderTemplate): OrderContent {
  return {
    ...(order.start ? { start: order.start } : {}),
    ...(order.end ? { end: order.end } : {}),
    quantity: order.quantity ?? 1,
    ...(order.amount ? { amount: order.amount } : {}),
    ...(order.listing ? { listing: order.listing } : {}),
    ...(order.recipient ? { recipient: order.recipient } : {}),
    ...(order.commitAuthorization ? { commitAuthorization: order.commitAuthorization } : {}),
  }
}

export function unlockAt(order: OrderTemplate, maxDuration: number, nowSeconds = nowSecondsFromDate()): number {
  if (order.end) {
    const parsed = Date.parse(order.end)
    if (Number.isFinite(parsed)) return Math.floor(parsed / 1000)
  }
  return nowSeconds + Math.max(maxDuration, 3600)
}

export function nowSecondsFromDate(): number {
  return Math.floor(Date.now() / 1000)
}

export function paymentProofForRoute(
  route: MarketplacePaymentRoute,
  proof: PaymentProofEvidence | null,
): PaymentProof {
  return {
    paymentProof: proof ? { driver: policyName(route.policy), params: proof.params } : null,
    arbitration: {
      arbitrationService: route.arbitrationService.event,
      paymentMethod: route.paymentMethod.event,
    },
  }
}

export function eventAnchor(event: Event | MarketplaceListing): string {
  const parsed = 'event' in event ? event : parseListingEvent(event)
  return `${parsed.event.kind}:${parsed.event.pubkey}:${parsed.d}`
}

export function routedOrderForPaymentState(
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  buyerPubkey?: string,
): EventTemplate {
  const routedOrder = orderWithRouteParticipants(route, order, buyerPubkey)
  const amount = order.amount ? normalizeAmountForRouteEvent(order.amount, route.asset) : undefined
  return generateOrderEventTemplate({
    ...routedOrder,
    ...(amount ? { amount } : {}),
  })
}

export function orderPaymentTemplateForState(
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  amountPayload: PaymentAmountPayloadForState,
  proof: PaymentProof | SealedPaymentProof,
  paymentProofKeys: PaymentProofKeyTag[],
  orderEvent: Event,
  buyerPubkey?: string,
): EventTemplate {
  const routedOrder = orderWithRouteParticipants(route, order, buyerPubkey)
  if (!routedOrder.amount) throw new Error('Order amount is required for marketplace payment')
  const { amount: _orderAmount, ...paymentOrder } = routedOrder
  return generateOrderPaymentEventTemplate({
    ...paymentOrder,
    orderGroupId: orderGroupIdForOrder(orderEvent),
    ...amountPayload,
    proof,
    paymentProofKeys,
    refs: { orders: [orderEvent.id] },
  })
}

export function auctionBidPaymentTemplateForState(
  route: MarketplacePaymentRoute,
  bid: MarketplaceAuctionBidTemplate,
  amountPayload: PaymentAmountPayloadForState,
  proof: PaymentProof | SealedPaymentProof,
  paymentProofKeys: PaymentProofKeyTag[],
  bidEvent: Event,
): EventTemplate {
  const routedBid = {
    ...bid,
    participants: orderWithRouteParticipants(route, {
      tradeId: bid.tradeId,
      listingAnchor: bid.listingAnchor,
      amount: bid.amount,
      participants: bid.participants,
    }).participants,
  }
  const { amount: _bidAmount, ...paymentBid } = routedBid
  return generateOrderPaymentEventTemplate({
    ...paymentBid,
    tradeId: routedBid.tradeId,
    listingAnchor: routedBid.auctionAnchor,
    anchorMarker: 'auction',
    participants: routedBid.participants,
    orderGroupId: routedBid.tradeId,
    ...amountPayload,
    proof,
    paymentProofKeys,
    refs: { auctionBids: [bidEvent.id] },
    extraTags: [['a', routedBid.listingAnchor, '', 'listing']],
  })
}

function paymentProofRecipientPubkeys(participants: PTag[] | undefined, senderPubkey: string): string[] {
  return [...new Set([
    senderPubkey,
    ...(participants ?? [])
      .filter(participant => participant.role === 'seller' || participant.role === 'arbiter')
      .map(participant => participant.pubkey),
  ])]
}

function paymentProofPayloadForState(
  route: MarketplacePaymentRoute,
  proof: PaymentProofEvidence | null,
  participants: PTag[] | undefined,
  senderSecretKey: Uint8Array,
  senderPubkey: string,
  privacy: PaymentProofPrivacy,
): { proof: PaymentProof | SealedPaymentProof; paymentProofKeys: PaymentProofKeyTag[] } {
  return buildPaymentProofPayload(paymentProofForRoute(route, proof), {
    mode: privacy,
    senderSecretKey,
    recipientPubkeys: paymentProofRecipientPubkeys(participants, senderPubkey),
  })
}

function paymentAmountPayloadForState(
  amount: MarketplaceAmount,
  participants: PTag[] | undefined,
  senderSecretKey: Uint8Array,
  senderPubkey: string,
  privacy: PaymentAmountPrivacy,
): PaymentAmountPayloadForState {
  return buildPaymentAmountPayload(amount, {
    mode: privacy,
    senderSecretKey,
    recipientPubkeys: paymentProofRecipientPubkeys(participants, senderPubkey),
  })
}

export function buildPaymentIntent(
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  options: MarketplaceResolvedPayOptions,
  seed: string | undefined,
  purpose: 'order' | 'bid' = 'order',
): MarketplacePaymentIntent {
  const routedOrder = orderWithRouteParticipants(route, order)
  if (!routedOrder.amount) throw new Error('Order amount is required for marketplace payment')
  const amount = normalizeAmountForPaymentAsset(routedOrder.amount, route.asset)
  const feeAsset = route.asset.assetAddress?.toLowerCase() ?? route.asset.assetId
  const fee = calculateArbitrationFee(route.arbitrationService.content.fee, BigInt(amount.value), feeAsset)
  const buyer = routedOrder.participants?.find(participant => participant.role === 'buyer')
  const chainId = serviceChainId(route.arbitrationService)
  const contractAddress = serviceContractAddress(route.arbitrationService)
  const policyHash = servicePolicyHash(route.arbitrationService)
  const settlementId = options.settlementId ?? orderGroupIdForParticipants(routedOrder.tradeId, routedOrder.participants ?? [])
  return {
    method: route.policy.method,
    purpose,
    tradeId: routedOrder.tradeId,
    settlementId,
    accountIndex: options.accountIndex,
    ...(seed ? { seed } : {}),
    amount,
    fee: {
      value: fee.toString(),
      ...(amount.currency ? { currency: amount.currency } : {}),
      denomination: amount.denomination,
      decimals: amount.decimals,
    },
    asset: route.asset,
    policy: route.descriptor,
    contract: {
      type: route.arbitrationService.content.type,
      ...(chainId !== undefined ? { chainId } : {}),
      ...(contractAddress ? { address: contractAddress } : {}),
      ...(policyHash ? { bytecodeHash: policyHash } : {}),
      params: route.arbitrationService.content.params,
    },
    participants: {
      ...(buyer ? { buyer } : {}),
      seller: {
        pubkey: route.paymentMethod.event.pubkey,
        ...(route.paymentMethod.evmAddress ? { address: route.paymentMethod.evmAddress } : {}),
        ...(route.paymentMethod.cashuPubkey ? { data: { cashuPubkey: route.paymentMethod.cashuPubkey } } : {}),
      },
      arbiter: {
        pubkey: route.arbitrationService.event.pubkey,
        ...(typeof route.arbitrationService.content.params.arbiterAddress === 'string'
          ? { address: route.arbitrationService.content.params.arbiterAddress }
          : {}),
        ...(typeof route.arbitrationService.content.params.cashuPubkey === 'string'
          ? { data: { cashuPubkey: route.arbitrationService.content.params.cashuPubkey } }
          : {}),
      },
    },
    unlockAt: unlockAt(order, route.arbitrationService.content.maxDuration, options.now),
    metadata: {
      listingAnchor: order.listingAnchor,
      listingId: route.listing.d,
      order: orderContent(routedOrder),
    },
  }
}

export async function* publishOrderPaymentStream(
  opts: MarketplaceRuntimeOptions,
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  tradeSecretKey: Uint8Array,
  tradePubkey: string,
  stream: AsyncIterable<MarketplacePolicyPaymentState>,
  paymentProofPrivacy: PaymentProofPrivacy = 'public',
  paymentAmountPrivacy: PaymentAmountPrivacy = 'public',
): AsyncIterable<MarketplacePaymentState> {
  const logger = marketplaceLogger(opts, 'marketplace.runtime.pay', {
    policy: route.descriptor.id,
    method: route.policy.method,
  })
  for await (const state of stream) {
    logger.debug('Order payment policy state received', {
      type: state.type,
      status: 'status' in state ? state.status : undefined,
      data: state.data,
    })
    if (state.type === 'payment_required') {
      yield {
        type: 'payment_required',
        request: state.request,
        data: state.data,
      }
    } else if (state.type === 'paid') {
      const orderEvent = finalizeEvent(routedOrderForPaymentState(route, order, tradePubkey), tradeSecretKey)
      await publishMarketplaceEvent(opts, orderEvent)
      yield {
        type: 'order_published',
        event: orderEvent,
        data: state.data,
      }
      const routedOrder = orderWithRouteParticipants(route, order, tradePubkey)
      if (!routedOrder.amount) throw new Error('Order amount is required for marketplace payment')
      const paymentAmountPayload = paymentAmountPayloadForState(
        normalizeAmountForRouteEvent(routedOrder.amount, route.asset),
        routedOrder.participants,
        tradeSecretKey,
        tradePubkey,
        paymentAmountPrivacy,
      )
      const paymentProofPayload = paymentProofPayloadForState(
        route,
        state.proof,
        routedOrder.participants,
        tradeSecretKey,
        tradePubkey,
        paymentProofPrivacy,
      )
      const paymentEvent = finalizeEvent(
        orderPaymentTemplateForState(
          route,
          order,
          paymentAmountPayload,
          paymentProofPayload.proof,
          paymentProofPayload.paymentProofKeys,
          orderEvent,
          tradePubkey,
        ),
        tradeSecretKey,
      )
      await publishMarketplaceEvent(opts, paymentEvent)
      yield {
        type: 'payment_published',
        event: paymentEvent,
        proof: state.proof,
        data: state.data,
      }
      yield {
        type: 'completed',
        order: orderEvent,
        payment: paymentEvent,
        proof: state.proof,
        data: state.data,
      }
    } else if (state.type === 'payment_progress') {
      yield {
        type: 'payment_progress',
        status: state.status,
        data: state.data,
      }
    } else {
      yield {
        type: 'completed',
        data: state.data,
      }
    }
  }
}

export async function* publishAuctionBidPaymentStream(
  opts: MarketplaceRuntimeOptions,
  route: MarketplacePaymentRoute,
  bid: MarketplaceAuctionBidTemplate,
  tradeSecretKey: Uint8Array,
  tradePubkey: string,
  stream: AsyncIterable<MarketplacePolicyPaymentState>,
  paymentProofPrivacy: PaymentProofPrivacy = 'public',
  paymentAmountPrivacy: PaymentAmountPrivacy = 'public',
): AsyncIterable<MarketplaceAuctionBidState> {
  const logger = marketplaceLogger(opts, 'marketplace.runtime.bid', {
    policy: route.descriptor.id,
    method: route.policy.method,
  })
  for await (const state of stream) {
    logger.debug('Auction bid payment policy state received', {
      type: state.type,
      status: 'status' in state ? state.status : undefined,
      data: state.data,
    })
    if (state.type === 'payment_required') {
      yield {
        type: 'payment_required',
        request: state.request,
        data: state.data,
      }
    } else if (state.type === 'paid') {
      const bidEvent = finalizeEvent(generateAuctionBidEventTemplate(bid), tradeSecretKey)
      await publishMarketplaceEvent(opts, bidEvent)
      yield {
        type: 'bid_published',
        event: bidEvent,
        data: state.data,
      }
      const routedBid = {
        ...bid,
        participants: orderWithRouteParticipants(route, {
          tradeId: bid.tradeId,
          listingAnchor: bid.listingAnchor,
          amount: bid.amount,
          participants: bid.participants,
        }).participants,
      }
      const paymentAmountPayload = paymentAmountPayloadForState(
        normalizeAmountForRouteEvent(routedBid.amount, route.asset),
        routedBid.participants,
        tradeSecretKey,
        tradePubkey,
        paymentAmountPrivacy,
      )
      const paymentProofPayload = paymentProofPayloadForState(
        route,
        state.proof,
        routedBid.participants,
        tradeSecretKey,
        tradePubkey,
        paymentProofPrivacy,
      )
      const paymentEvent = finalizeEvent(
        auctionBidPaymentTemplateForState(
          route,
          bid,
          paymentAmountPayload,
          paymentProofPayload.proof,
          paymentProofPayload.paymentProofKeys,
          bidEvent,
        ),
        tradeSecretKey,
      )
      await publishMarketplaceEvent(opts, paymentEvent)
      yield {
        type: 'payment_published',
        bid: bidEvent,
        event: paymentEvent,
        proof: state.proof,
        data: state.data,
      }
      yield {
        type: 'completed',
        bid: bidEvent,
        payment: paymentEvent,
        proof: state.proof,
        data: state.data,
      }
    } else if (state.type === 'payment_progress') {
      yield {
        type: 'payment_progress',
        status: state.status,
        data: state.data,
      }
    } else {
      yield {
        type: 'completed',
        data: state.data,
      }
    }
  }
}
