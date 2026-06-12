import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import { GiftWrap, MarketplaceAuctionBid, MarketplacePayment, MarketplaceShippingOption, Seal } from '../kinds.ts'
import { encrypt, getConversationKey } from '../nip44.ts'
import { finalizeEvent, generateSecretKey } from '../pure.ts'
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
  findListing,
  findListingByAnchor,
  findListingById,
  generateListingEventTemplate,
  listingAnchor,
  listingSearchFilter,
  listingPriceAmount,
  parseListingEvent,
  searchListings,
  validateListingEvent,
  type ListingSearchQuery,
  type MarketplaceListing,
} from './listing.ts'
import {
  generateShippingOptionEventTemplate,
  parseShippingOptionEvent,
  searchShippingOptions,
  shippingOptionAddress,
  shippingOptionSearchFilter,
  validateShippingOptionEvent,
  type ShippingOptionSearchQuery,
} from './shipping-option.ts'
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
  auctionBidChainId,
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
  auctionBidGroupFilters,
  buildAuctionBidChains,
  fetchAuctionBidGroups,
  fetchMyAuctionBidGroups,
  groupAuctionBidEvents,
  reduceAuctionBidGroup,
  subscribeAuctionBidGroups,
  type AuctionBidGroupQuery,
  type AuctionBidGroupSearchOptions,
  type AuctionBidGroupSubscribeHandlers,
  type AuctionBidGroupSubscribeOptions,
  type MyAuctionBidGroupQuery,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
import {
  createAuctionScope,
  type MarketplaceAuctionScopeQuery,
} from './auction-scope.ts'
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
  participantGroupIdForEvent,
  participantGroupParticipantPubkeys,
  participantGroupRoleParticipants,
  parseParticipantGroupEvent,
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
import {
  streamMyOrderGroups,
  streamMyOrders,
  streamOrders,
  streamOrderGroups,
} from './order-stream.ts'
import {
  generateReviewEventTemplate,
  parseReviewEvent,
  resolveReviewProof,
  revealedReviewBuyerPubkey,
  searchReviews,
  validateReviewEvent,
} from './review.ts'
import {
  generateTradeKeyAuthorizationEventTemplate,
  participantProofKeyWrap,
  publicParticipantProof,
  sealedParticipantProof,
} from './participant-proof.ts'
import { now, parseEventJson } from './helper.ts'
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
  deriveMarketplaceTradeId,
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
import {
  groupPaymentStreams,
  validatePaymentGroup,
  validatePaymentGroupStream,
} from './payment-group.ts'
import {
  fetchMarketplaceInbox,
  marketplaceInboxFilter,
  streamMarketplaceInbox,
  unwrapMarketplaceInboxItem,
} from './inbox.ts'
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
  MarketplaceOrderNegotiationResult,
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
  MarketplaceInboxApi,
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
  marketplaceLogger,
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
import { arbitrateMarketplacePayment } from './runtime-payment-arbitration.ts'
import { startMarketplaceArbitration } from './runtime-arbitration.ts'
import { settleMarketplaceAuction } from './runtime-auction-settlement.ts'
import { createMarketplaceLocationsApi } from './location.ts'

function uniquePubkeys(pubkeys: string[]): string[] {
  return [...new Set(pubkeys.filter(Boolean))]
}

function requireMarketplaceSigner(opts: MarketplaceRuntimeOptions): MarketplaceSeedSigner {
  if (!opts.signer) throw new Error('Marketplace inbox requires a signer')
  return opts.signer
}

async function publishGiftWrappedRumor(
  opts: MarketplaceRuntimeOptions,
  rumor: Event,
  recipientPubkeys: string[],
  createdAt?: number,
): Promise<Event[]> {
  if (!opts.signer) throw new Error('Marketplace private negotiation requires a signer')
  const publish = requireMarketplacePublisher(opts)
  const identity = runtimeIdentity(opts)
  const identityPubkey = identity.pubkey
  if (!identityPubkey) throw new Error('Marketplace identity pubkey is required')
  const recipients = uniquePubkeys([...recipientPubkeys, identityPubkey])
  const timestamp = createdAt ?? now()
  const wraps = await Promise.all(recipients.map(async recipientPubkey => {
    const seal = await opts.signer!.signEvent({
      kind: Seal,
      created_at: timestamp,
      content: await opts.signer!.nip44Encrypt(recipientPubkey, JSON.stringify(rumor)),
      tags: [],
    })
    const randomKey = generateSecretKey()
    const conversationKey = getConversationKey(randomKey, recipientPubkey)
    return finalizeEvent({
      kind: GiftWrap,
      created_at: timestamp,
      content: encrypt(JSON.stringify(seal), conversationKey),
      tags: [['p', recipientPubkey]],
    }, randomKey)
  }))
  await Promise.all(wraps.map(wrap => publish(wrap)))
  return wraps
}

export function bind(
  pool: MarketplaceRuntimePool,
  relays: string[],
  options: MarketplaceBindOptions = {},
): MarketplaceClient {
  const opts: MarketplaceRuntimeOptions = { ...options, pool, relays }
  let nextAccountIndex: number | undefined
  const logger = marketplaceLogger(opts, 'marketplace.runtime.bind')
  logger.info('Marketplace runtime bound', {
    relayCount: relays.length,
    orderPolicyCount: opts.orderPolicies?.length ?? 0,
    bidPolicyCount: opts.bidPolicies?.length ?? 0,
  })

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
      accountIndex: await getNextAccountIndex({
        ...(options.seed ? { seed: options.seed } : {}),
        ...(options.now !== undefined ? { now: options.now } : {}),
      }),
    }
  }

  async function resolveParticipantProofsForIdentity(params: {
    label: string
    mode?: MarketplacePayOptions['identityProof']
    role: OrderParticipantRole
    participantPubkey: string
    listingAnchor: string
    tradeId: string
    participants?: PTag[]
    createdAt?: number
    senderSecretKey: Uint8Array
    participantProofs?: OrderTemplate['participantProofs']
    participantProofKeys?: OrderTemplate['participantProofKeys']
  }): Promise<Pick<OrderTemplate, 'participantProofs' | 'participantProofKeys'>> {
    const participantProofs = [...(params.participantProofs ?? [])]
    const participantProofKeys = [...(params.participantProofKeys ?? [])]
    const mode = params.mode ?? 'none'
    if (mode === 'none') return { participantProofs, participantProofKeys }
    if (!opts.signer) throw new Error(`Marketplace ${params.label} identity proof requires a signer`)
    const authorization = await opts.signer.signEvent(generateTradeKeyAuthorizationEventTemplate({
      version: 1,
      role: params.role,
      participantPubkey: params.participantPubkey,
      listingAnchor: params.listingAnchor,
      tradeId: params.tradeId,
      createdAt: params.createdAt,
    }))
    if (mode === 'public') {
      participantProofs.push(publicParticipantProof(authorization))
      return { participantProofs, participantProofKeys }
    }
    const sealed = sealedParticipantProof(authorization)
    participantProofs.push(sealed.proof)
    const recipientPubkeys = new Set<string>()
    for (const participant of params.participants ?? []) {
      if (participant.role === 'seller' || participant.role === 'arbiter') recipientPubkeys.add(participant.pubkey)
    }
    recipientPubkeys.add(authorization.pubkey)
    for (const recipientPubkey of recipientPubkeys) {
      participantProofKeys.push(participantProofKeyWrap({
        proofId: sealed.proof.proofId,
        recipientPubkey,
        senderSecretKey: params.senderSecretKey,
        disclosureKey: sealed.disclosureKey,
      }))
    }
    return { participantProofs, participantProofKeys }
  }

  const pay: MarketplaceClient['pay'] = async function* (
    listing: Event | MarketplaceListing,
    order: MarketplaceOrderCreateParams,
    options: MarketplacePayOptions = {},
  ): AsyncIterable<MarketplacePaymentState> {
    requireMarketplacePublisher(opts)
    const resolvedOptions = await resolvePayOptions(options)
    const seed = runtimeSeed(opts, resolvedOptions.seed)
    const parsedListing = 'event' in listing ? listing : parseListingEvent(listing)
    const listingAnchor = order.listingAnchor ?? eventAnchor(parsedListing)
    const trade = deriveMarketplaceTradeMaterial(seed, {
      index: resolvedOptions.accountIndex,
      role: 'buyer',
    })
    const baseOrder = {
      ...order,
      listing: parsedListing.event,
      tradeId: order.tradeId ?? trade.tradeId,
      listingAnchor,
      participants: addParticipant(order.participants, trade.tradePubkey, 'buyer'),
    }
    const route = resolvedOptions.route ?? (await paymentRoutesForListing(opts, listing, {
      amount: baseOrder.amount,
      purpose: 'order',
    }))[0]
    if (!route) throw new Error('No supported marketplace payment route')
    const paymentLogger = marketplaceLogger(opts, 'marketplace.runtime.pay')
    paymentLogger.info('Marketplace order payment route selected', {
      method: route.policy.method,
      policyId: route.descriptor.id,
      assetId: route.asset.assetId,
      denomination: route.asset.denomination,
      accountIndex: resolvedOptions.accountIndex,
    })
    const routedAmount = baseOrder.amount ? normalizeAmountForRouteEvent(baseOrder.amount, route.asset) : undefined
    const finalOrder = orderWithRouteParticipants(
      route,
      { ...baseOrder, ...(routedAmount ? { amount: routedAmount } : {}) },
      trade.tradePubkey,
    )
    const finalParticipantProofs = await resolveParticipantProofsForIdentity({
      label: 'order',
      mode: resolvedOptions.identityProof,
      role: 'buyer',
      participantPubkey: trade.tradePubkey,
      listingAnchor,
      tradeId: finalOrder.tradeId,
      participants: finalOrder.participants,
      createdAt: order.createdAt ?? resolvedOptions.now,
      senderSecretKey: trade.tradeSecretKey,
      participantProofs: finalOrder.participantProofs,
      participantProofKeys: finalOrder.participantProofKeys,
    })
    const proofedOrder = {
      ...finalOrder,
      participantProofs: finalParticipantProofs.participantProofs,
      participantProofKeys: finalParticipantProofs.participantProofKeys,
    }
    const finalOptions = {
      ...resolvedOptions,
      settlementId: resolvedOptions.settlementId ?? orderGroupIdForParticipants(proofedOrder.tradeId, proofedOrder.participants ?? []),
    }
    const paymentIntent = buildPaymentIntent(route, proofedOrder, finalOptions, seed)
    if (opts.logger) paymentIntent.logger = opts.logger
    const stream = await route.policy.pay(paymentIntent)
    yield* publishOrderPaymentStream(
      opts,
      route,
      proofedOrder,
      trade.tradeSecretKey,
      trade.tradePubkey,
      stream as AsyncIterable<MarketplacePolicyPaymentState>,
      resolvedOptions.paymentProofPrivacy ?? 'public',
      resolvedOptions.paymentAmountPrivacy ?? 'public',
    )
  }

  const negotiate: MarketplaceOrdersApi['negotiate'] = async (
    listing: Event | MarketplaceListing,
    order,
  ): Promise<MarketplaceOrderNegotiationResult> => {
    if (!opts.signer) throw new Error('Marketplace private negotiation requires a signer')
    requireMarketplacePublisher(opts)
    const identity = runtimeIdentity(opts)
    const identityPubkey = identity.pubkey
    if (!identityPubkey) throw new Error('Marketplace identity pubkey is required')
    const parsedListing = 'event' in listing ? listing : parseListingEvent(listing)
    const {
      alt,
      now: negotiationNow,
      recipientPubkeys = [],
      seed,
      ...orderFields
    } = order
    const listingAnchor = orderFields.listingAnchor ?? eventAnchor(parsedListing)
    const accountIndex = orderFields.tradeId === undefined
      ? await getNextAccountIndex({
          ...(seed ? { seed } : {}),
          ...(negotiationNow !== undefined ? { now: negotiationNow } : {}),
        })
      : undefined
    const tradeId = orderFields.tradeId ?? deriveMarketplaceTradeId(runtimeSeed(opts, seed), { index: accountIndex })
    const createdAt = orderFields.createdAt ?? negotiationNow
    const participants = addParticipant(
      addParticipant(orderFields.participants, identityPubkey, 'buyer'),
      parsedListing.event.pubkey,
      'seller',
    )
    const orderEvent = await opts.signer.signEvent(generateOrderEventTemplate({
      ...orderFields,
      listing: parsedListing.event,
      tradeId,
      listingAnchor,
      createdAt,
      participants,
    }))
    const message = await opts.signer.signEvent(generateStructuredMessageEventTemplate({
      childEvent: orderEvent,
      conversation: tradeId,
      recipients: participants,
      alt: alt ?? 'Marketplace negotiation offer',
      createdAt,
    }))
    const giftWraps = await publishGiftWrappedRumor(
      opts,
      message,
      [parsedListing.event.pubkey, ...recipientPubkeys],
      createdAt,
    )
    return {
      ...(accountIndex !== undefined ? { accountIndex } : {}),
      tradeId,
      order: orderEvent,
      message,
      giftWraps,
    }
  }

  const client = {
    listings: {
      anchor: listingAnchor,
      parse: parseListingEvent,
      validate: validateListingEvent,
      create: generateListingEventTemplate,
      template: generateListingEventTemplate,
      filters: { search: listingSearchFilter },
      price: listingPriceAmount,
      findOne: (
        pubkey: string,
        query: Omit<ListingSearchQuery, 'authors' | 'limit'> = {},
      ) => findListing(opts.pool, opts.relays, pubkey, query),
      findById: (id: string) => findListingById(opts.pool, opts.relays, id),
      findByAnchor: (anchor: string) => findListingByAnchor(opts.pool, opts.relays, anchor),
      search: (query: ListingSearchQuery = {}) => searchListings(opts.pool, opts.relays, query),
    },
    shippingOption: {
      kind: MarketplaceShippingOption,
      parse: parseShippingOptionEvent,
      validate: validateShippingOptionEvent,
      address: shippingOptionAddress,
      template: generateShippingOptionEventTemplate,
      filter: shippingOptionSearchFilter,
      filters: { search: shippingOptionSearchFilter },
      search: (query: ShippingOptionSearchQuery = {}) => searchShippingOptions(opts.pool, opts.relays, query),
    },
    locations: createMarketplaceLocationsApi(opts.locationProvider),
    paymentMethod: {
      parse: parsePaymentMethodEvent,
      validate: validatePaymentMethodEvent,
      template: generatePaymentMethodEventTemplate,
      filter: paymentMethodFilter,
      findOne: (query: PaymentMethodFindQuery = {}) => findPaymentMethod(opts.pool, opts.relays, query),
      canonicalAssetId,
    },
    arbitrationServices: {
      parse: parseArbitrationServiceEvent,
      validate: validateArbitrationServiceEvent,
      template: generateArbitrationServiceEventTemplate,
      filter: arbitrationServiceFilter,
      search: (query: ArbitrationServiceFindQuery = {}) => searchArbitrationServices(opts.pool, opts.relays, query),
      findOne: (query: ArbitrationServiceFindQuery = {}) => findArbitrationService(opts.pool, opts.relays, query),
      calculateFee: calculateArbitrationFee,
    },
    arbitrationServiceSelections: {
      parse: parseArbitrationServiceSelectionEvent,
      validate: validateArbitrationServiceSelectionEvent,
      template: generateArbitrationServiceSelectionEventTemplate,
    },
    orders: {
      parse: parseOrderEvent,
      validate: validateOrderEvent,
      create: pay,
      template: generateOrderEventTemplate,
      commitHash: orderCommitHash,
      filters: orderFilters,
      negotiate,
      search: (query: OrderQuery = {}, options: OrderSearchOptions = {}) =>
        searchOrders(opts.pool, opts.relays, query, options),
      subscribe: (query: OrderQuery, handlers: OrderSubscribeHandlers, options: OrderSubscribeOptions = {}) =>
        subscribeOrders(requireSubscribePool(opts.pool), opts.relays, query, handlers, options),
      stream: (query: OrderQuery = {}, options: OrderSubscribeOptions = {}) =>
        streamOrders(requireSubscribePool(opts.pool), opts.relays, query, options),
      mine: Object.assign(
        (
          query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
          options: OrderSearchOptions = {},
        ) => searchOrders(opts.pool, opts.relays, runtimeMyOrderQuery(opts, query), options),
        {
          stream: (
            query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
            options: OrderSubscribeOptions = {},
          ) => streamMyOrders(
            requireSubscribePool(opts.pool),
            opts.relays,
            runtimeMyOrderQuery(opts, query),
            options,
          ),
        },
      ),
      subscribeMine: (
        query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
        handlers: OrderSubscribeHandlers,
        options: OrderSubscribeOptions = {},
      ) => subscribeOrders(requireSubscribePool(opts.pool), opts.relays, runtimeMyOrderQuery(opts, query), handlers, options),
      groups: {
        id: orderGroupIdForParticipants,
        idForOrder: orderGroupIdForOrder,
        idForEvent: participantGroupIdForEvent,
        participants: orderGroupParticipantPubkeys,
        participantPubkeys: participantGroupParticipantPubkeys,
        participantEntries: participantGroupRoleParticipants,
        filter: orderGroupFilter,
        parseParticipantEvent: parseParticipantGroupEvent,
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
        stream: (query: OrderQuery = {}, options: OrderSubscribeOptions & ReduceOrderGroupOptions = {}) =>
          streamOrderGroups(requireSubscribePool(opts.pool), opts.relays, query, options),
        mine: Object.assign(
          (
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
          {
            stream: (
              query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity } = {},
              options: OrderSubscribeOptions & ReduceOrderGroupOptions = {},
            ) => streamMyOrderGroups(
              requireSubscribePool(opts.pool),
              opts.relays,
              runtimeMyOrderQuery(opts, query),
              options,
            ),
          },
        ),
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
      resolveProof: resolveReviewProof,
      revealedBuyerPubkey: revealedReviewBuyerPubkey,
      search: (query = {}, options = {}) => searchReviews(opts.pool, opts.relays, query, options),
    },
    structuredMessages: {
      parse: parseStructuredMessageEvent,
      validate: validateStructuredMessageEvent,
      template: generateStructuredMessageEventTemplate,
    },
    inbox: {
      filter: marketplaceInboxFilter,
      unwrap: (wrap: Event) => unwrapMarketplaceInboxItem(wrap, requireMarketplaceSigner(opts)),
      fetch: (
        query: Parameters<MarketplaceInboxApi['fetch']>[0] = {},
        options: Parameters<MarketplaceInboxApi['fetch']>[1] = {},
      ) => fetchMarketplaceInbox(
        opts.pool,
        opts.relays,
        requireMarketplaceSigner(opts),
        {
          ...query,
          pubkey: query.pubkey ?? runtimeIdentity(opts).pubkey!,
          limit: query.limit ?? 100,
        },
        options,
      ),
      stream: (
        query: Parameters<MarketplaceInboxApi['stream']>[0] = {},
        options: Parameters<MarketplaceInboxApi['stream']>[1] = {},
      ) => streamMarketplaceInbox(
        requireSubscribePool(opts.pool),
        opts.relays,
        requireMarketplaceSigner(opts),
        {
          ...query,
          pubkey: query.pubkey ?? runtimeIdentity(opts).pubkey!,
          limit: query.limit ?? 100,
        },
        options,
      ),
    },
    paymentRoutes: {
      forListing: (listing: Event | MarketplaceListing, options: MarketplacePaymentRouteOptions | null = null) =>
        paymentRoutesForListing(opts, listing, options),
    },
    auctions: {
      template: generateAuctionEventTemplate,
      parse: parseAuctionEvent,
      validate: validateAuctionEvent,
      address: auctionAddress,
      bidChainId: auctionBidChainId,
      filters: auctionSearchFilters,
      scope: (query: MarketplaceAuctionScopeQuery) =>
        createAuctionScope(requireSubscribePool(opts.pool), opts.relays, query),
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
      bidGroups: {
        filter: auctionBidGroupFilter,
        filters: auctionBidGroupFilters,
        reduce: reduceAuctionBidGroup,
        group: groupAuctionBidEvents,
        chains: buildAuctionBidChains,
        fetch: (query: AuctionBidGroupQuery, options: AuctionBidGroupSearchOptions = {}) =>
          fetchAuctionBidGroups(opts.pool, opts.relays, query, options),
        mine: {
          fetch: (
            query: MyAuctionBidGroupQuery = {},
            options: AuctionBidGroupSearchOptions = {},
          ) => fetchMyAuctionBidGroups(
            opts.pool,
            opts.relays,
            { ...query, identity: runtimeIdentity(opts, query.identity) },
            options,
          ),
          chains: async (
            query: MyAuctionBidGroupQuery = {},
            options: AuctionBidGroupSearchOptions = {},
          ) => buildAuctionBidChains(
            await fetchMyAuctionBidGroups(
              opts.pool,
              opts.relays,
              { ...query, identity: runtimeIdentity(opts, query.identity) },
              options,
            ),
          ),
        },
        subscribe: (
          query: AuctionBidGroupQuery,
          handlers: AuctionBidGroupSubscribeHandlers,
          options: AuctionBidGroupSubscribeOptions = {},
        ) => subscribeAuctionBidGroups(requireSubscribePool(opts.pool), opts.relays, query, handlers, options),
      },
      async *bid(
        listing: Event | MarketplaceListing,
        bid: Partial<MarketplaceAuctionBidTemplate> & { amount: MarketplaceAmount },
        options: MarketplacePayOptions & {
          auction?: Event | ParsedMarketplaceAuction
          identityProof?: 'none' | 'public' | 'sealed'
          participantProofs?: OrderTemplate['participantProofs']
          participantProofKeys?: OrderTemplate['participantProofKeys']
        } = {},
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
        const routes = await paymentRoutesForListing(opts, listing, {
          amount: baseBid.amount,
          purpose: 'bid',
        })
        const route = resolvedOptions.route ?? (auction ? routes.find(candidate => routeMatchesAuction(candidate, auction)) : routes[0])
        if (!route) throw new Error('No supported marketplace bid payment route')
        if (auction && !routeMatchesAuction(route, auction)) {
          throw new Error('Selected bid payment route does not match the auction arbiter and currency')
        }
        const bidLogger = marketplaceLogger(opts, 'marketplace.runtime.bid')
        bidLogger.info('Marketplace auction bid payment route selected', {
          method: route.policy.method,
          policyId: route.descriptor.id,
          assetId: route.asset.assetId,
          denomination: route.asset.denomination,
          accountIndex: resolvedOptions.accountIndex,
          auctionAnchor,
        })
        const routedBidOrder = orderWithRouteParticipants(route, baseBid, trade.tradePubkey)
        const paymentAmount = normalizeAmountForRouteEvent(bid.amount, route.asset)
        const participantProofs = await resolveParticipantProofsForIdentity({
          label: 'bid',
          mode: resolvedOptions.identityProof,
          role: 'buyer',
          participantPubkey: trade.tradePubkey,
          listingAnchor,
          tradeId: routedBidOrder.tradeId,
          participants: routedBidOrder.participants,
          createdAt: bid.createdAt ?? resolvedOptions.now,
          senderSecretKey: trade.tradeSecretKey,
          participantProofs: options.participantProofs ?? bid.participantProofs,
          participantProofKeys: options.participantProofKeys ?? bid.participantProofKeys,
        })
        const auctionBid: MarketplaceAuctionBidTemplate = {
          tradeId: routedBidOrder.tradeId,
          auctionAnchor,
          listingAnchor,
          bidChainId: bid.bidChainId ?? auctionBidChainId(seed, auctionAnchor),
          amount: bid.amount,
          participants: routedBidOrder.participants,
          participantProofs: participantProofs.participantProofs,
          participantProofKeys: participantProofs.participantProofKeys,
          ...(bid.targetOrder ? { targetOrder: bid.targetOrder } : {}),
          ...(bid.data ? { data: bid.data } : {}),
          ...(bid.extraTags ? { extraTags: bid.extraTags } : {}),
          ...(bid.createdAt ?? resolvedOptions.now ? { createdAt: bid.createdAt ?? resolvedOptions.now } : {}),
        }
        const paymentOrder: OrderTemplate = {
          tradeId: auctionBid.tradeId,
          listingAnchor: auctionBid.auctionAnchor,
          amount: paymentAmount,
          participants: auctionBid.participants,
          ...(resolvedOptions.now ? { createdAt: resolvedOptions.now } : {}),
        }
        const finalOptions = {
          ...resolvedOptions,
          settlementId: resolvedOptions.settlementId ?? auctionBid.tradeId,
        }
        const targetOrderGroupId = orderGroupIdForParticipants(
          auctionBid.tradeId,
          auctionBid.targetOrder?.participants ?? auctionBid.participants ?? [],
        )
        const paymentIntent = buildPaymentIntent(route, paymentOrder, finalOptions, seed, 'bid')
        if (opts.logger) paymentIntent.logger = opts.logger
        paymentIntent.metadata = {
          ...(paymentIntent.metadata ?? {}),
          auctionAnchor,
          targetListingAnchor: listingAnchor,
          targetTradeId: auctionBid.tradeId,
          targetOrderGroupId,
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
          trade.tradePubkey,
          stream as AsyncIterable<MarketplacePolicyPaymentState>,
          resolvedOptions.paymentProofPrivacy ?? 'public',
          resolvedOptions.paymentAmountPrivacy ?? 'public',
        )
      },
      settle: (request: MarketplaceAuctionSettlementRequest) => settleMarketplaceAuction(opts, request),
    },
    payments: {
      group: groupPaymentStreams,
      validateGroup: validatePaymentGroup,
      validateGroups: validatePaymentGroupStream,
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
    arbitration: {
      start: (options: MarketplaceArbitrationStartOptions = {}) => startMarketplaceArbitration(opts, options),
      arbitrate: (request: MarketplacePaymentArbitrationRequest) => arbitrateMarketplacePayment(opts, request),
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
  } satisfies MarketplaceClient

  return client
}
