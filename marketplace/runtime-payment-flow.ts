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
  publishMarketplaceEvent,
} from './runtime-common.ts'
import {
  serviceChainId,
  serviceContractAddress,
  servicePolicyHash,
  normalizeAmountForPaymentAsset,
  normalizeAmountForRouteEvent,
} from './runtime-routes.ts'

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
      route.escrowService.event.pubkey,
      'escrow',
    ),
  }
}

export function orderContent(order: OrderTemplate): OrderContent {
  return {
    ...(order.start ? { start: order.start } : {}),
    ...(order.end ? { end: order.end } : {}),
    quantity: order.quantity ?? 1,
    ...(order.amount ? { amount: order.amount } : {}),
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
    listing: route.listing.event,
    paymentProof: proof,
    escrow: {
      escrowService: route.escrowService.event,
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
  proof: PaymentProofEvidence | null,
  orderEvent: Event,
  buyerPubkey?: string,
): EventTemplate {
  const routedOrder = orderWithRouteParticipants(route, order, buyerPubkey)
  return generateOrderPaymentEventTemplate({
    ...routedOrder,
    orderGroupId: orderGroupIdForOrder(orderEvent),
    proof: paymentProofForRoute(route, proof),
    purpose: 'order_payment',
    refs: { orders: [orderEvent.id] },
  })
}

export function auctionBidPaymentTemplateForState(
  route: MarketplacePaymentRoute,
  bid: MarketplaceAuctionBidTemplate,
  proof: PaymentProofEvidence | null,
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
  return generateOrderPaymentEventTemplate({
    tradeId: routedBid.tradeId,
    listingAnchor: routedBid.auctionAnchor,
    anchorMarker: 'auction',
    participants: routedBid.participants,
    orderGroupId: routedBid.bidId ?? routedBid.tradeId,
    proof: paymentProofForRoute(route, proof),
    purpose: 'auction_bid',
    refs: { auctionBids: [bidEvent.id] },
    extraTags: [['a', routedBid.listingAnchor, '', 'listing']],
  })
}

export function buildPaymentIntent(
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  options: MarketplaceResolvedPayOptions,
  seed: string | undefined,
  subject: 'order' | 'bid' = 'order',
): MarketplacePaymentIntent {
  const routedOrder = orderWithRouteParticipants(route, order)
  if (!routedOrder.amount) throw new Error('Order amount is required for marketplace payment')
  const amount = normalizeAmountForPaymentAsset(routedOrder.amount, route.asset)
  const feeAsset = route.asset.assetAddress?.toLowerCase() ?? route.asset.assetId
  const fee = calculateEscrowFee(route.escrowService.content.fee, BigInt(amount.value), feeAsset)
  const buyer = routedOrder.participants?.find(participant => participant.role === 'buyer')
  const chainId = serviceChainId(route.escrowService)
  const contractAddress = serviceContractAddress(route.escrowService)
  const policyHash = servicePolicyHash(route.escrowService)
  const settlementId = options.settlementId ?? orderGroupIdForParticipants(routedOrder.tradeId, routedOrder.participants ?? [])
  return {
    method: route.policy.method,
    subject,
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
        pubkey: route.paymentMethod.event.pubkey,
        ...(route.paymentMethod.evmAddress ? { address: route.paymentMethod.evmAddress } : {}),
        ...(route.paymentMethod.cashuPubkey ? { data: { cashuPubkey: route.paymentMethod.cashuPubkey } } : {}),
      },
      escrow: {
        pubkey: route.escrowService.event.pubkey,
        ...(typeof route.escrowService.content.params.arbiterAddress === 'string'
          ? { address: route.escrowService.content.params.arbiterAddress }
          : {}),
        ...(typeof route.escrowService.content.params.cashuPubkey === 'string'
          ? { data: { cashuPubkey: route.escrowService.content.params.cashuPubkey } }
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

export async function* publishOrderPaymentStream(
  opts: MarketplaceRuntimeOptions,
  route: MarketplacePaymentRoute,
  order: OrderTemplate,
  tradeSecretKey: Uint8Array,
  tradePubkey: string,
  stream: AsyncIterable<MarketplacePolicyPaymentState>,
): AsyncIterable<MarketplacePaymentState> {
  for await (const state of stream) {
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
      const paymentEvent = finalizeEvent(
        orderPaymentTemplateForState(route, order, state.proof, orderEvent, tradePubkey),
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
  stream: AsyncIterable<MarketplacePolicyPaymentState>,
): AsyncIterable<MarketplaceAuctionBidState> {
  for await (const state of stream) {
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
      const paymentEvent = finalizeEvent(auctionBidPaymentTemplateForState(route, bid, state.proof, bidEvent), tradeSecretKey)
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
