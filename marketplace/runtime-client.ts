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
  auctionCompleteSearchFilter,
  searchAuctions,
  searchAuctionCompletes,
  subscribeAuctionCompletes,
  subscribeAuctions,
  type MarketplaceAuctionCompleteSearchOptions,
  type MarketplaceAuctionCompleteSearchQuery,
  type MarketplaceAuctionCompleteSubscribeHandlers,
  type MarketplaceAuctionCompleteSubscribeOptions,
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
  paymentItemsForMyOrderGroups,
  paymentPolicies,
  paymentValidationPolicies,
  policyForPayment,
  recoverMarketplacePayment,
  requireMarketplacePublisher,
  requireSubscribePool,
  runtimeIdentity,
  runtimeMyOrderQuery,
  runtimeSeed,
  validateGroupsWithRuntimePolicies,
  validateMarketplacePayment,
} from './runtime-common.ts'
import {
  addParticipant,
  buildPaymentIntent,
  eventAnchor,
  orderWithRouteParticipants,
  publishAuctionBidPaymentStream,
  publishOrderPaymentStream,
} from './runtime-payment-flow.ts'
import {
  normalizeAmountForRouteEvent,
  paymentRoutesForListing,
  routeMatchesAuction,
} from './runtime-routes.ts'
import {
  discoverMarketplaceHighWatermark,
  startMarketplaceRuntime,
} from './runtime-watermark.ts'
import { arbitrateMarketplaceEscrow } from './runtime-escrow.ts'
import { startMarketplaceArbitration } from './runtime-arbitration.ts'
import { settleMarketplaceAuction } from './runtime-auction-settlement.ts'

export function bind(
  pool: MarketplaceRuntimePool,
  relays: string[],
  options: MarketplaceBindOptions = {},
): MarketplaceClient {
  const opts: MarketplaceRuntimeOptions = { ...options, pool, relays }
  let nextAccountIndex: number | undefined

  async function getNextAccountIndex(options: MarketplaceHighWatermarkOptions = {}): Promise<number> {
    if (nextAccountIndex === undefined) {
      const discovery = await discoverMarketplaceHighWatermark(opts, options)
      nextAccountIndex = discovery.nextUnusedIndex
    }
    const index = nextAccountIndex
    nextAccountIndex += 1
    return index
  }

  async function resolvePayOptions(options: MarketplacePayOptions = {}): Promise<MarketplaceResolvedPayOptions> {
    return {
      ...options,
      accountIndex: options.accountIndex ?? await getNextAccountIndex({
        ...(options.seed ? { seed: options.seed } : {}),
        ...(options.now !== undefined ? { now: options.now } : {}),
      }),
    }
  }

  const pay: MarketplaceClient['pay'] = async function* (
    listing: Event | MarketplaceListing,
    order: MarketplaceOrderCreateParams,
    options: MarketplacePayOptions = {},
  ): AsyncIterable<MarketplacePaymentState> {
    requireMarketplacePublisher(opts)
    const resolvedOptions = await resolvePayOptions(options)
    const seed = runtimeSeed(opts, resolvedOptions.seed)
    const listingAnchor = order.listingAnchor ?? eventAnchor(listing)
    const trade = deriveMarketplaceTradeMaterial(seed, {
      index: resolvedOptions.accountIndex,
      role: 'buyer',
    })
    const baseOrder = {
      ...order,
      tradeId: order.tradeId ?? trade.tradeId,
      listingAnchor,
      participants: addParticipant(order.participants, trade.tradePubkey, 'buyer'),
    }
    const route = resolvedOptions.route ?? (await paymentRoutesForListing(opts, listing, baseOrder))[0]
    if (!route) throw new Error('No supported marketplace payment route')
    const routedAmount = baseOrder.amount ? normalizeAmountForRouteEvent(baseOrder.amount, route.asset) : undefined
    const finalOrder = orderWithRouteParticipants(
      route,
      { ...baseOrder, ...(routedAmount ? { amount: routedAmount } : {}) },
      trade.tradePubkey,
    )
    const finalOptions = {
      ...resolvedOptions,
      settlementId: resolvedOptions.settlementId ?? orderGroupIdForParticipants(finalOrder.tradeId, finalOrder.participants ?? []),
    }
    const stream = await route.policy.pay(buildPaymentIntent(route, finalOrder, finalOptions, seed))
    yield* publishOrderPaymentStream(
      opts,
      route,
      finalOrder,
      trade.tradeSecretKey,
      trade.tradePubkey,
      stream as AsyncIterable<MarketplacePolicyPaymentState>,
    )
  }

  return {
    listings: {
      parse: parseListingEvent,
      validate: validateListingEvent,
      create: generateListingEventTemplate,
      template: generateListingEventTemplate,
      filters: { search: listingSearchFilter },
      search: (query: ListingSearchQuery = {}) => searchListings(opts.pool, opts.relays, query),
    },
    paymentMethod: {
      parse: parsePaymentMethodEvent,
      validate: validatePaymentMethodEvent,
      template: generatePaymentMethodEventTemplate,
      filter: paymentMethodFilter,
      findOne: (query: PaymentMethodFindQuery = {}) => findPaymentMethod(opts.pool, opts.relays, query),
      canonicalAssetId,
    },
    escrowServices: {
      parse: parseEscrowServiceEvent,
      validate: validateEscrowServiceEvent,
      template: generateEscrowServiceEventTemplate,
      filter: escrowServiceFilter,
      search: (query: EscrowServiceFindQuery = {}) => searchEscrowServices(opts.pool, opts.relays, query),
      findOne: (query: EscrowServiceFindQuery = {}) => findEscrowService(opts.pool, opts.relays, query),
      calculateFee: calculateEscrowFee,
    },
    escrowServiceSelections: {
      parse: parseEscrowServiceSelectionEvent,
      validate: validateEscrowServiceSelectionEvent,
      template: generateEscrowServiceSelectionEventTemplate,
    },
    orders: {
      parse: parseOrderEvent,
      validate: validateOrderEvent,
      create: pay,
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
      forListing: (listing: Event | MarketplaceListing, order: Partial<OrderTemplate> | null = null) =>
        paymentRoutesForListing(opts, listing, order),
    },
    auctions: {
      template: generateAuctionEventTemplate,
      parse: parseAuctionEvent,
      validate: validateAuctionEvent,
      address: auctionAddress,
      filters: auctionSearchFilters,
      search: (query: MarketplaceAuctionSearchQuery = {}, options: MarketplaceAuctionSearchOptions = {}) =>
        searchAuctions(opts.pool, opts.relays, query, options),
      subscribe: (
        query: MarketplaceAuctionSearchQuery,
        handlers: MarketplaceAuctionSubscribeHandlers,
        options: MarketplaceAuctionSubscribeOptions = {},
      ) => subscribeAuctions(requireSubscribePool(opts.pool), opts.relays, query, handlers, options),
      bidTemplate: generateAuctionBidEventTemplate,
      parseBid: parseAuctionBidEvent,
      validateBid: validateAuctionBidEvent,
      completeTemplate: generateAuctionCompleteEventTemplate,
      parseComplete: parseAuctionCompleteEvent,
      validateComplete: validateAuctionCompleteEvent,
      completes: {
        filter: auctionCompleteSearchFilter,
        search: (
          query: MarketplaceAuctionCompleteSearchQuery = {},
          options: MarketplaceAuctionCompleteSearchOptions = {},
        ) => searchAuctionCompletes(opts.pool, opts.relays, query, options),
        subscribe: (
          query: MarketplaceAuctionCompleteSearchQuery,
          handlers: MarketplaceAuctionCompleteSubscribeHandlers,
          options: MarketplaceAuctionCompleteSubscribeOptions = {},
        ) => subscribeAuctionCompletes(requireSubscribePool(opts.pool), opts.relays, query, handlers, options),
      },
      paymentRoutes: {
        forListing: (listing: Event | MarketplaceListing, bid: Partial<OrderTemplate> | null = null) =>
          paymentRoutesForListing(opts, listing, bid, { subject: 'bid' }),
      },
      bidGroups: {
        filter: auctionBidGroupFilter,
        reduce: reduceAuctionBidGroup,
        group: groupAuctionBidEvents,
        fetch: (query: AuctionBidGroupQuery, options: AuctionBidGroupSearchOptions = {}) =>
          fetchAuctionBidGroups(opts.pool, opts.relays, query, options),
        subscribe: (
          query: AuctionBidGroupQuery,
          handlers: AuctionBidGroupSubscribeHandlers,
          options: AuctionBidGroupSubscribeOptions = {},
        ) => subscribeAuctionBidGroups(requireSubscribePool(opts.pool), opts.relays, query, handlers, options),
      },
      async *bid(
        listing: Event | MarketplaceListing,
        bid: Partial<MarketplaceAuctionBidTemplate> & { amount: MarketplaceAmount },
        options: MarketplacePayOptions & { auction?: Event | ParsedMarketplaceAuction; participantProofs?: OrderTemplate['participantProofs'] } = {},
      ): AsyncIterable<MarketplaceAuctionBidState> {
        requireMarketplacePublisher(opts)
        const resolvedOptions = await resolvePayOptions(options)
        const seed = runtimeSeed(opts, resolvedOptions.seed)
        const auction = options.auction ? ('event' in options.auction ? options.auction : parseAuctionEvent(options.auction)) : undefined
        const listingAnchor = bid.listingAnchor ?? auction?.listingAnchor ?? eventAnchor(listing)
        const auctionAnchor = bid.auctionAnchor ?? auction?.auctionAnchor
        if (!auctionAnchor) throw new Error('Marketplace auction bid requires an auction anchor or auction event')
        const trade = deriveMarketplaceTradeMaterial(seed, {
          index: resolvedOptions.accountIndex,
          role: 'buyer',
          extra: 'auction-bid',
        })
        const baseBid = {
          tradeId: bid.tradeId ?? trade.tradeId,
          listingAnchor,
          amount: bid.amount,
          participants: addParticipant(bid.participants, trade.tradePubkey, 'buyer'),
        }
        if (auction && bid.amount.denomination !== auction.currency) {
          throw new Error(`Auction bids must use ${auction.currency}`)
        }
        const routes = await paymentRoutesForListing(opts, listing, baseBid, { subject: 'bid' })
        const route = resolvedOptions.route ?? (auction ? routes.find(candidate => routeMatchesAuction(candidate, auction)) : routes[0])
        if (!route) throw new Error('No supported marketplace bid payment route')
        if (auction && !routeMatchesAuction(route, auction)) {
          throw new Error('Selected bid payment route does not match the auction arbiter and currency')
        }
        const routedBidOrder = orderWithRouteParticipants(route, baseBid, trade.tradePubkey)
        const amount = normalizeAmountForRouteEvent(bid.amount, route.asset)
        const auctionBid: MarketplaceAuctionBidTemplate = {
          tradeId: routedBidOrder.tradeId,
          bidId: bid.bidId ?? routedBidOrder.tradeId,
          auctionAnchor,
          listingAnchor,
          amount,
          participants: routedBidOrder.participants,
          participantProofs: options.participantProofs ?? bid.participantProofs,
          ...(bid.targetOrder ? { targetOrder: bid.targetOrder } : {}),
          ...(bid.data ? { data: bid.data } : {}),
          ...(bid.extraTags ? { extraTags: bid.extraTags } : {}),
          ...(bid.createdAt ?? resolvedOptions.now ? { createdAt: bid.createdAt ?? resolvedOptions.now } : {}),
        }
        const paymentOrder: OrderTemplate = {
          tradeId: auctionBid.tradeId,
          listingAnchor: auctionBid.auctionAnchor,
          amount,
          participants: auctionBid.participants,
          ...(resolvedOptions.now ? { createdAt: resolvedOptions.now } : {}),
        }
        const finalOptions = {
          ...resolvedOptions,
          settlementId: resolvedOptions.settlementId ?? auctionBid.bidId,
        }
        const paymentIntent = buildPaymentIntent(route, paymentOrder, finalOptions, seed, 'bid')
        paymentIntent.metadata = {
          ...(paymentIntent.metadata ?? {}),
          auctionAnchor,
          targetListingAnchor: listingAnchor,
          targetOrder: {
            ...(auctionBid.targetOrder ?? {}),
            listingAnchor: auctionBid.targetOrder?.listingAnchor ?? listingAnchor,
          },
        }
        const stream = await route.policy.pay(paymentIntent)
        yield* publishAuctionBidPaymentStream(
          opts,
          route,
          auctionBid,
          trade.tradeSecretKey,
          stream as AsyncIterable<MarketplacePolicyPaymentState>,
        )
      },
      settle: (request: MarketplaceAuctionSettlementRequest) => settleMarketplaceAuction(opts, request),
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
      start: (options: MarketplaceEscrowStartOptions = {}) => startMarketplaceArbitration(opts, options),
      arbitrate: (request: MarketplaceEscrowArbitrationRequest) => arbitrateMarketplaceEscrow(opts, request),
    },
    discoverHighWatermark: (options: MarketplaceHighWatermarkOptions = {}) =>
      discoverMarketplaceHighWatermark(opts, options),
    getNextAccountIndex,
    start: async (options: MarketplaceStartOptions = {}) => {
      const result = await startMarketplaceRuntime(opts, options)
      nextAccountIndex = result.discovery.nextUnusedIndex
      return result
    },
    pay,
  }
}
