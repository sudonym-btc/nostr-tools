import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import type { Filter } from '../filter.ts'
import { GiftWrap, MarketplaceAuctionBid, MarketplacePayment, MarketplacePaymentSettlement, MarketplaceShippingOption, Seal } from '../kinds.ts'
import { encrypt, getConversationKey } from '../nip44.ts'
import { finalizeEvent, generateSecretKey } from '../pure.ts'
import {
  findPaymentMethod,
  generatePaymentMethodEventTemplate,
  parsePaymentMethodEvent,
  validatePaymentMethodEvent,
  canonicalAssetId,
  paymentMethodFilter,
  type PaymentMethodFindOptions,
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
  type ArbitrationServiceSearchOptions,
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
  type ListingSearchOptions,
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
  type ShippingOptionSearchOptions,
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
  groupAuctionBidEvents,
  reduceAuctionBidGroup,
  roleAuctionBidGroups,
  subscribeAuctionBidGroups,
  type AuctionBidGroupQuery,
  type AuctionBidGroupEvent,
  type AuctionBidGroupRoles,
  type AuctionBidGroupSearchOptions,
  type AuctionBidGroupSubscribeHandlers,
  type AuctionBidGroupSubscribeOptions,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
import {
  queryAuctionScope,
  streamAuctionScope,
  type MarketplaceAuctionScopeOptions,
  type MarketplaceAuctionScopeQuery,
} from './auction-scope.ts'
import {
  decodeMarketplaceEvent,
  type MarketplaceInvalidEventHandler,
} from './event-decoder.ts'
import {
  generatePaymentAckEventTemplate,
  generatePaymentEventTemplate,
  generatePaymentNackEventTemplate,
  generatePaymentSettlementEventTemplate,
  parsePaymentEvent,
  parsePaymentSettlementEvent,
  type PaymentSettlementOutput,
  type ParsedPayment,
  type ParsedPaymentSettlement,
} from './payment-lifecycle.ts'
import { paymentValidationRequest } from './order-group-payment.ts'
import {
  fetchOrderGroups,
  roleOrderGroups,
  searchOrderGroups,
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
  type OrderGroupIdentityQuery,
  type OrderGroupRoles,
  type OrderGroupSearchOptions,
  type OrderGroupSubscribeHandlers,
  type ResolveAndValidateOrderGroupOptions,
  type ReduceOrderGroupOptions,
  type OrderGroupEvent,
  type ParsedOrderGroup,
} from './order-group.ts'
import {
  orderFilters,
  orderIdentityPubkeys,
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
import { amountCurrency, now, parseEventJson } from './helper.ts'
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
import { paymentTerms } from './payment-terms.ts'
import { resolvePaymentAmount } from './payment-amount.ts'
import { parsePaymentProof, resolvePaymentProof, resolvePaymentProofEvidence } from './payment-proof.ts'
import {
  marketplaceInboxFilter,
  streamMarketplaceInbox,
  type MarketplaceInboxFetchOptions,
  type MarketplaceInboxItem,
  type MarketplaceInboxQuery,
  type MarketplaceInboxStream,
  type MarketplaceInboxSubscribeOptions,
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
  MarketplacePaymentValidationItem,
  MarketplacePaymentSweepInput,
  MarketplacePaymentSweepRecord,
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
  MarketplaceAuctionBidAmount,
  MarketplacePaymentPolicyImplementation,
  MarketplaceOrderPolicy,
  MarketplaceBidPolicy,
  MarketplacePayOptions,
  MarketplaceResolvedPayOptions,
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
  MarketplaceOrdersApi,
  MarketplaceReviewsApi,
  MarketplaceStructuredMessagesApi,
  MarketplaceMeApi,
  MarketplaceMeBidRoleApi,
  MarketplaceMeBidsApi,
  MarketplaceMeBidsQuery,
  MarketplaceMeBidsSnapshot,
  MarketplaceMeBidsStream,
  MarketplaceMeInboxApi,
  MarketplaceMePaymentsApi,
  MarketplaceMePaymentsQuery,
  MarketplaceMePaymentsSearchOptions,
  MarketplaceMePaymentsSnapshot,
  MarketplaceMePaymentsStream,
  MarketplaceMePaymentsSubscribeOptions,
  MarketplaceMeOrderRoleApi,
  MarketplaceMeOrdersApi,
  MarketplaceMeOrdersQuery,
  MarketplaceMeOrdersSnapshot,
  MarketplaceMeOrdersStream,
  MarketplaceAuctionLookupOptions,
  MarketplaceAuctionsApi,
  MarketplacePaymentsApi,
  MarketplaceArbitrationApi,
  MarketplaceClient,
  MarketplaceSessionSeedEnsureOptions,
  MarketplaceSessionSeedEnsureResult,
  MarketplaceSessionSeedApi,
  MarketplaceSession,
} from './runtime-types.ts'
import {
  MarketplaceStream,
  ReplayStream,
  StreamClosed,
  StreamEose,
  StreamLive,
} from './stream.ts'
import {
  paymentPolicies,
  paymentValidationPolicies,
  policyForPayment,
  requireMarketplacePublisher,
  requireSubscribePool,
  runtimeIdentity,
  runtimeSeed,
  sweepMarketplacePayment,
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
  publishOrderPayStream,
} from './runtime-payment-flow.ts'
import {
  normalizeAmountForRouteEvent,
  auctionPaymentRoutesForListing,
  orderPaymentRoutesForListing,
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
import { createMarketplaceSession } from './runtime-session.ts'

function uniquePubkeys(pubkeys: string[]): string[] {
  return [...new Set(pubkeys.filter(Boolean))]
}

function mergedInvalidEventHandler(
  opts: MarketplaceRuntimeOptions,
  local?: MarketplaceInvalidEventHandler,
): MarketplaceInvalidEventHandler | undefined {
  if (!opts.onInvalidEvent) return local
  return invalid => {
    opts.onInvalidEvent?.(invalid)
    local?.(invalid)
  }
}

function withInvalidEventHandler<T extends object>(
  opts: MarketplaceRuntimeOptions,
  options: T,
): T & { oninvalid?: MarketplaceInvalidEventHandler } {
  const local = (options as { oninvalid?: MarketplaceInvalidEventHandler }).oninvalid
  const handler = mergedInvalidEventHandler(opts, local)
  return handler ? { ...options, oninvalid: handler } : options
}

function withLegacyInvalidEventHandler<T extends { oninvalid?: (event: Event, error: Error) => void }>(
  opts: MarketplaceRuntimeOptions,
  source: string,
  handlers: T,
): T {
  if (!opts.onInvalidEvent) return handlers
  return {
    ...handlers,
    oninvalid(event: Event, error: Error) {
      opts.onInvalidEvent?.({ event, error, source })
      handlers.oninvalid?.(event, error)
    },
  }
}

function requireMarketplaceSigner(opts: MarketplaceRuntimeOptions): MarketplaceSeedSigner {
  if (!opts.signer) throw new Error('Marketplace inbox requires a signer')
  return opts.signer
}

type Subscription = { unsubscribe(): void }

class LazyMarketplaceStream<TEvent, TSnapshot, TQuery extends object, TOptions extends object> {
  private readonly streams = new Map<string, MarketplaceStream<TEvent, TSnapshot>>()

  constructor(
    private readonly createStream: (query: TQuery, options: TOptions) => MarketplaceStream<TEvent, TSnapshot>,
  ) {}

  get(query: TQuery, options: TOptions): MarketplaceStream<TEvent, TSnapshot> {
    const key = LazyMarketplaceStream.key(query)
    let stream = this.streams.get(key)
    if (!stream || stream.currentStatus instanceof StreamClosed) {
      stream = this.createStream(query, options)
      this.streams.set(key, stream)
    }
    return stream
  }

  watch(query: TQuery, options: TOptions): MarketplaceStream<TEvent, TSnapshot> {
    return this.get(query, options).filter(() => true)
  }

  async list(query: TQuery, options: TOptions, fallback: TSnapshot): Promise<TSnapshot> {
    const stream = this.get(query, options)
    await LazyMarketplaceStream.waitForBackfill(stream)
    return stream.currentSnapshot ?? fallback
  }

  static snapshotView<TEvent, TSourceSnapshot, TViewSnapshot>(
    source: MarketplaceStream<TEvent, TSourceSnapshot>,
    view: (snapshot: TSourceSnapshot) => TViewSnapshot,
  ): MarketplaceStream<TEvent, TViewSnapshot> {
    let eventSubscription: Subscription | undefined
    let snapshotSubscription: Subscription | undefined
    const stream = new MarketplaceStream<TEvent, TViewSnapshot>({
      status: source.status,
      emitClosedOnClose: false,
      onClose: () => {
        eventSubscription?.unsubscribe()
        snapshotSubscription?.unsubscribe()
      },
    })
    eventSubscription = source.events.subscribe(event => stream.emitEvent(event))
    snapshotSubscription = source.snapshot.subscribe(snapshot => stream.emitSnapshot(view(snapshot)))
    return stream
  }

  static async waitForBackfill<TEvent, TSnapshot>(
    stream: MarketplaceStream<TEvent, TSnapshot>,
  ): Promise<void> {
    if (
      !(stream.currentStatus instanceof StreamEose) &&
      !(stream.currentStatus instanceof StreamLive) &&
      !(stream.currentStatus instanceof StreamClosed)
    ) {
      await Promise.race([
        stream.until(StreamEose),
        stream.until(StreamLive),
        stream.until(StreamClosed),
      ])
    }
  }

  private static key(value: unknown): string {
    return JSON.stringify(LazyMarketplaceStream.stable(value))
  }

  private static stable(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(item => LazyMarketplaceStream.stable(item))
    if (!value || typeof value !== 'object') return value
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, LazyMarketplaceStream.stable(entry)]),
    )
  }
}

class MarketplaceMeOrdersRuntime implements MarketplaceMeOrdersApi {
  readonly placed: MarketplaceMeOrderRoleApi
  readonly received: MarketplaceMeOrderRoleApi
  readonly arbitrating: MarketplaceMeOrderRoleApi
  readonly resolveParticipants = resolveOrderGroupParticipants

  private readonly cache: LazyMarketplaceStream<
    OrderGroupEvent,
    OrderGroupRoles,
    OrderGroupIdentityQuery,
    OrderSubscribeOptions & ReduceOrderGroupOptions
  >

  constructor(private readonly opts: MarketplaceRuntimeOptions) {
    this.cache = new LazyMarketplaceStream((query, options) =>
      streamMyOrderGroups(requireSubscribePool(this.opts.pool), this.opts.relays, query, options),
    )
    this.placed = this.role('placed')
    this.received = this.role('received')
    this.arbitrating = this.role('arbitrating')
  }

  async list(
    query: MarketplaceMeOrdersQuery = {},
    options: OrderGroupSearchOptions = {},
  ): Promise<MarketplaceMeOrdersSnapshot> {
    const resolvedQuery = this.query(query)
    const roles = await this.cache.list(
      resolvedQuery,
      options,
      roleOrderGroups([], resolvedQuery.identity),
    )
    const validated = await validateGroupsWithRuntimePolicies(this.opts, roles.all, options)
    return this.snapshot(roleOrderGroups(validated, resolvedQuery.identity))
  }

  watch(
    query: MarketplaceMeOrdersQuery = {},
    options: OrderSubscribeOptions & ReduceOrderGroupOptions = {},
  ): MarketplaceMeOrdersStream {
    const stream = this.cache.get(this.query(query), options)
    return LazyMarketplaceStream.snapshotView(stream, roles => this.snapshot(roles))
  }

  private role(role: keyof Omit<MarketplaceMeOrdersSnapshot, 'all'>): MarketplaceMeOrderRoleApi {
    return {
      list: async (query = {}, options = {}) => (await this.list(query, options))[role],
      watch: (query = {}, options = {}) => {
        const stream = this.cache.get(this.query(query), options)
        return LazyMarketplaceStream.snapshotView(stream, roles => this.snapshot(roles)[role])
      },
    }
  }

  private query(query: MarketplaceMeOrdersQuery = {}): OrderGroupIdentityQuery {
    const { identity, ...rest } = query
    return {
      ...rest,
      identity: runtimeIdentity(this.opts, {
        roles: ['buyer', 'seller', 'arbiter'],
        tempKeyWindow: 500,
        ...identity,
      }),
    }
  }

  private snapshot(roles: OrderGroupRoles): MarketplaceMeOrdersSnapshot {
    return {
      placed: roles.buyer,
      received: roles.seller,
      arbitrating: roles.arbiter,
      all: roles.all,
    }
  }
}

type ResolvedMarketplaceMeBidsQuery = Omit<MarketplaceMeBidsQuery, 'identity' | 'limit'> & {
  identity: MarketplaceOrderIdentity
  limit: number
}

class MarketplaceMeBidsRuntime implements MarketplaceMeBidsApi {
  readonly placed: MarketplaceMeBidRoleApi
  readonly received: MarketplaceMeBidRoleApi
  readonly arbitrating: MarketplaceMeBidRoleApi

  private readonly cache: LazyMarketplaceStream<
    AuctionBidGroupEvent,
    AuctionBidGroupRoles,
    ResolvedMarketplaceMeBidsQuery,
    AuctionBidGroupSubscribeOptions
  >

  constructor(private readonly opts: MarketplaceRuntimeOptions) {
    this.cache = new LazyMarketplaceStream((query, options) => this.stream(query, options))
    this.placed = this.role('placed')
    this.received = this.role('received')
    this.arbitrating = this.role('arbitrating')
  }

  async list(
    query: MarketplaceMeBidsQuery = {},
    options: AuctionBidGroupSearchOptions = {},
  ): Promise<MarketplaceMeBidsSnapshot> {
    const resolvedQuery = this.query(query)
    const roles = await this.cache.list(
      resolvedQuery,
      options,
      roleAuctionBidGroups([], resolvedQuery.identity),
    )
    return this.snapshot(roles)
  }

  watch(
    query: MarketplaceMeBidsQuery = {},
    options: AuctionBidGroupSubscribeOptions = {},
  ): MarketplaceMeBidsStream {
    const stream = this.cache.get(this.query(query), options)
    return LazyMarketplaceStream.snapshotView(stream, roles => this.snapshot(roles))
  }

  private role(role: keyof Omit<MarketplaceMeBidsSnapshot, 'all'>): MarketplaceMeBidRoleApi {
    return {
      list: async (query = {}, options = {}) => (await this.list(query, options))[role],
      watch: (query = {}, options = {}) => {
        const stream = this.cache.get(this.query(query), options)
        return LazyMarketplaceStream.snapshotView(stream, roles => this.snapshot(roles)[role])
      },
    }
  }

  private query(query: MarketplaceMeBidsQuery = {}): ResolvedMarketplaceMeBidsQuery {
    const { identity, ...rest } = query
    return {
      limit: 500,
      ...rest,
      identity: runtimeIdentity(this.opts, {
        roles: ['buyer', 'seller', 'arbiter'],
        tempKeyWindow: 500,
        ...identity,
      }),
    }
  }

  private stream(
    query: ReturnType<MarketplaceMeBidsRuntime['query']>,
    options: AuctionBidGroupSubscribeOptions = {},
  ): MarketplaceStream<AuctionBidGroupEvent, AuctionBidGroupRoles> {
    let eventCount = 0
    let sub: { close(reason?: string): void } | undefined
    const stream = new MarketplaceStream<AuctionBidGroupEvent, AuctionBidGroupRoles>({
      onClose: reason => sub?.close(reason),
    })
    stream.emitSnapshot(roleAuctionBidGroups([], query.identity))
    stream.markQuerying({ requestCount: this.opts.relays.length * auctionBidGroupFilters(query).length })
    sub = subscribeAuctionBidGroups(requireSubscribePool(this.opts.pool), this.opts.relays, query, {
      onevent(event) {
        eventCount += 1
        stream.emitEvent(event)
      },
      ongroups: groups => {
        stream.emitSnapshot(roleAuctionBidGroups(groups, query.identity))
      },
      oninvalid: (event, error) => {
        this.opts.onInvalidEvent?.({ event, error, source: 'me.bids.watch' })
      },
      oneose() {
        stream.markEose({ eventCount })
        stream.markLive({ eventCount })
      },
      onclose(reasons) {
        stream.emitStatus(new StreamClosed({ reasons }))
      },
    }, options)
    return stream
  }

  private snapshot(roles: AuctionBidGroupRoles): MarketplaceMeBidsSnapshot {
    return {
      placed: roles.buyer,
      received: roles.seller,
      arbitrating: roles.arbiter,
      all: roles.all,
    }
  }
}

class MarketplaceMeInboxRuntime implements MarketplaceMeInboxApi {
  readonly filter = marketplaceInboxFilter

  private readonly cache: LazyMarketplaceStream<
    MarketplaceInboxItem,
    MarketplaceInboxItem[],
    MarketplaceInboxQuery & { pubkey: string },
    MarketplaceInboxSubscribeOptions
  >

  constructor(private readonly opts: MarketplaceRuntimeOptions) {
    this.cache = new LazyMarketplaceStream((query, options) =>
      streamMarketplaceInbox(
        requireSubscribePool(this.opts.pool),
        this.opts.relays,
        requireMarketplaceSigner(this.opts),
        query,
        options,
      ),
    )
  }

  list(
    query: MarketplaceInboxQuery = {},
    options: MarketplaceInboxFetchOptions = {},
  ): Promise<MarketplaceInboxItem[]> {
    return this.cache.list(this.query(query), options, [])
  }

  watch(
    query: MarketplaceInboxQuery = {},
    options: MarketplaceInboxSubscribeOptions = {},
  ): MarketplaceInboxStream {
    return this.cache.watch(this.query(query), options)
  }

  private query(query: MarketplaceInboxQuery = {}): MarketplaceInboxQuery & { pubkey: string } {
    return {
      ...query,
      pubkey: query.pubkey ?? runtimeIdentity(this.opts).pubkey!,
      limit: query.limit ?? 100,
    }
  }
}

type ParsedMarketplacePaymentEvent = ParsedPayment | ParsedPaymentSettlement

type ResolvedMarketplaceMePaymentsQuery = Omit<MarketplaceMePaymentsQuery, 'identity' | 'limit'> & {
  identity: MarketplaceOrderIdentity
  limit: number
}

function valueChunks<T>(values: T[], size = 200): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size))
  return chunks
}

function marketplacePaymentEventFilters(query: ResolvedMarketplaceMePaymentsQuery): Filter[] {
  const { identity, paymentIds, authors, participantPubkeys, ...rest } = query
  const base = {
    ...(rest.since !== undefined ? { since: rest.since } : {}),
    ...(rest.until !== undefined ? { until: rest.until } : {}),
    ...(rest.limit !== undefined ? { limit: rest.limit } : {}),
  }
  if (paymentIds && paymentIds.length > 0) {
    const ids = [...new Set(paymentIds)]
    return [
      { ...base, kinds: [MarketplacePayment], ids },
      { ...base, kinds: [MarketplacePaymentSettlement], '#e': ids },
    ]
  }
  const identityPubkeys = orderIdentityPubkeys(identity, ['buyer', 'seller', 'arbiter'])
  const authorPubkeys = uniquePubkeys(authors ?? [])
  const taggedPubkeys = uniquePubkeys([...(participantPubkeys ?? []), ...identityPubkeys])
  const filters: Filter[] = []
  for (const chunk of valueChunks(authorPubkeys)) {
    filters.push({ ...base, kinds: [MarketplacePayment, MarketplacePaymentSettlement], authors: chunk })
  }
  for (const chunk of valueChunks(taggedPubkeys)) {
    filters.push({ ...base, kinds: [MarketplacePayment, MarketplacePaymentSettlement], '#p': chunk })
  }
  return filters.length > 0 ? filters : [{ ...base, kinds: [MarketplacePayment, MarketplacePaymentSettlement] }]
}

function parseMarketplacePaymentEvent(event: Event): ParsedMarketplacePaymentEvent {
  if (event.kind === MarketplacePayment) return parsePaymentEvent(event)
  if (event.kind === MarketplacePaymentSettlement) return parsePaymentSettlementEvent(event)
  throw new Error('Invalid marketplace payment event kind')
}

function settlementPaymentProof(settlement: ParsedPaymentSettlement): PaymentProofEvidence | undefined {
  const proof = settlement.content.data?.proof
  if (!proof || typeof proof !== 'object' || Array.isArray(proof)) return undefined
  try {
    return parsePaymentProof({ paymentProof: proof })?.paymentProof ?? undefined
  } catch {
    return undefined
  }
}

function latestSettlementPaymentProof(settlements: ParsedPaymentSettlement[] | undefined): PaymentProofEvidence | undefined {
  if (!settlements?.length) return undefined
  return [...settlements]
    .sort((left, right) => right.event.created_at - left.event.created_at || right.event.id.localeCompare(left.event.id))
    .map(settlementPaymentProof)
    .find((proof): proof is PaymentProofEvidence => proof !== undefined)
}

function emptyPaymentSweepSnapshot(): MarketplaceMePaymentsSnapshot {
  return {
    pending: [],
    sweeping: [],
    swept: [],
    noop: [],
    failed: [],
    all: [],
  }
}

function paymentSweepSnapshot(
  records: Iterable<MarketplacePaymentSweepRecord>,
): MarketplaceMePaymentsSnapshot {
  const all = [...records].sort((left, right) =>
    right.updatedAt - left.updatedAt || right.paymentId.localeCompare(left.paymentId)
  )
  return {
    pending: all.filter(record => record.status === 'pending'),
    sweeping: all.filter(record => record.status === 'sweeping'),
    swept: all.filter(record => record.status === 'swept'),
    noop: all.filter(record => record.status === 'noop'),
    failed: all.filter(record => record.status === 'failed'),
    all,
  }
}

class MarketplaceMePaymentsRuntime implements MarketplaceMePaymentsApi {
  private readonly cache: LazyMarketplaceStream<
    MarketplacePaymentSweepRecord,
    MarketplaceMePaymentsSnapshot,
    ResolvedMarketplaceMePaymentsQuery,
    MarketplaceMePaymentsSubscribeOptions
  >

  constructor(private readonly opts: MarketplaceRuntimeOptions) {
    this.cache = new LazyMarketplaceStream((query, options) => this.stream(query, options))
  }

  async list(
    query: MarketplaceMePaymentsQuery = {},
    options: MarketplaceMePaymentsSearchOptions = {},
  ): Promise<MarketplaceMePaymentsSnapshot> {
    return this.cache.list(this.query(query), options, emptyPaymentSweepSnapshot())
  }

  watch(
    query: MarketplaceMePaymentsQuery = {},
    options: MarketplaceMePaymentsSubscribeOptions = {},
  ): MarketplaceMePaymentsStream {
    return this.cache.watch(this.query(query), options)
  }

  private query(query: MarketplaceMePaymentsQuery = {}): ResolvedMarketplaceMePaymentsQuery {
    const { identity, ...rest } = query
    return {
      limit: 500,
      ...rest,
      identity: runtimeIdentity(this.opts, {
        roles: ['buyer', 'seller', 'arbiter'],
        tempKeyWindow: 500,
        ...identity,
      }),
    }
  }

  private stream(
    query: ResolvedMarketplaceMePaymentsQuery,
    options: MarketplaceMePaymentsSubscribeOptions = {},
  ): MarketplaceMePaymentsStream {
    let eventCount = 0
    let sub: { close(reason?: string): void } | undefined
    const seenEvents = new Set<string>()
    const payments = new Map<string, ParsedPayment>()
    const records = new Map<string, MarketplacePaymentSweepRecord>()
    const settlementsByPaymentId = new Map<string, ParsedPaymentSettlement[]>()
    const running = new Map<string, Promise<void>>()
    const rerun = new Map<string, MarketplacePaymentSweepInput['reason']>()
    const filters = marketplacePaymentEventFilters(query)
    const stream = new MarketplaceStream<MarketplacePaymentSweepRecord, MarketplaceMePaymentsSnapshot>({
      onClose: reason => sub?.close(reason),
    })

    const emitRecord = (record: MarketplacePaymentSweepRecord) => {
      records.set(record.paymentId, record)
      stream.emitEvent(record)
      stream.emitSnapshot(paymentSweepSnapshot(records.values()))
    }

    const updateRecord = (
      paymentId: string,
      patch: Partial<MarketplacePaymentSweepRecord>,
      fallback?: Pick<MarketplacePaymentSweepRecord, 'tradeId' | 'orderGroupId' | 'listingAnchor' | 'anchors'>,
    ): MarketplacePaymentSweepRecord => {
      const previous = records.get(paymentId)
      const base = previous ?? {
        paymentId,
        tradeId: fallback?.tradeId ?? '',
        orderGroupId: fallback?.orderGroupId ?? '',
        ...(fallback?.anchors ? { anchors: fallback.anchors } : {}),
        listingAnchor: fallback?.listingAnchor ?? '',
        status: 'pending' as const,
        reason: 'payment' as const,
        settlements: settlementsByPaymentId.get(paymentId) ?? [],
        attempts: 0,
        updatedAt: now(),
      }
      const record = {
        ...base,
        ...patch,
        settlements: patch.settlements ?? settlementsByPaymentId.get(paymentId) ?? base.settlements,
        updatedAt: patch.updatedAt ?? now(),
      }
      emitRecord(record)
      return record
    }

    const buildSweepInput = async (
      payment: ParsedPayment,
      reason: MarketplacePaymentSweepInput['reason'],
    ): Promise<MarketplacePaymentSweepInput | undefined> => {
      const settlementProof = reason === 'settlement'
        ? latestSettlementPaymentProof(settlementsByPaymentId.get(payment.event.id))
        : undefined
      let paymentProof = settlementProof
      if (!paymentProof) {
        const proofResolution = await resolvePaymentProof(payment, {
          keys: payment.paymentProofKeys,
          signer: this.opts.signer,
        })
        if (proofResolution.status !== 'resolved' || !proofResolution.proof?.paymentProof) return undefined
        paymentProof = proofResolution.proof.paymentProof
      }
      const evidenceResolution = await resolvePaymentProofEvidence(paymentProof, {
        keys: payment.paymentProofKeys,
        signer: this.opts.signer,
      })
      if (evidenceResolution.status !== 'resolved' || !evidenceResolution.proof) return undefined
      const amountResolution = await resolvePaymentAmount(payment, {
        signer: this.opts.signer,
      })
      return {
        paymentId: payment.event.id,
        tradeId: payment.tradeId,
        orderGroupId: payment.orderGroupId,
        listingAnchor: payment.anchors.listing ?? '',
        createdAt: payment.event.created_at,
        proof: evidenceResolution.proof,
        ...(this.opts.seed ? { seed: runtimeSeed(this.opts) } : {}),
        ...(amountResolution.status === 'resolved' && amountResolution.amount ? { amount: amountResolution.amount } : {}),
        ...(reason ? { reason } : {}),
      }
    }

    const runSweep = async (
      payment: ParsedPayment,
      reason: MarketplacePaymentSweepInput['reason'] = 'payment',
    ) => {
      const paymentId = payment.event.id
      const previous = records.get(paymentId)
      updateRecord(paymentId, {
        payment,
        tradeId: payment.tradeId,
        orderGroupId: payment.orderGroupId,
        anchors: payment.anchors,
        listingAnchor: payment.anchors.listing ?? '',
        status: 'sweeping',
        reason: reason ?? 'payment',
        attempts: (previous?.attempts ?? 0) + 1,
        error: undefined,
      })
      try {
        const input = await buildSweepInput(payment, reason)
        if (!input) {
          updateRecord(paymentId, {
            status: 'noop',
            reason: reason ?? 'payment',
            error: 'Payment proof is not available to this session',
          })
          return
        }
        updateRecord(paymentId, {
          driver: input.proof.driver,
          reason: input.reason ?? 'payment',
        })
        for await (const state of sweepMarketplacePayment(this.opts, input)) {
          updateRecord(paymentId, {
            driver: input.proof.driver,
            reason: input.reason ?? 'payment',
            latest: state,
            status: state.type === 'swept' ? 'swept' : state.type === 'noop' ? 'noop' : 'sweeping',
          })
        }
      } catch (err) {
        updateRecord(paymentId, {
          status: 'failed',
          reason: reason ?? 'payment',
          error: err instanceof Error ? err.message : 'Payment sweep failed',
        })
      }
    }

    const enqueuePayment = (
      payment: ParsedPayment,
      reason: MarketplacePaymentSweepInput['reason'] = 'payment',
    ) => {
      const paymentId = payment.event.id
      payments.set(paymentId, payment)
      updateRecord(paymentId, {
        payment,
        tradeId: payment.tradeId,
        orderGroupId: payment.orderGroupId,
        anchors: payment.anchors,
        listingAnchor: payment.anchors.listing ?? '',
        status: records.get(paymentId)?.status ?? 'pending',
        reason: reason ?? 'payment',
      })
      if (running.has(paymentId)) {
        rerun.set(paymentId, reason)
        return
      }
      const task = runSweep(payment, reason)
        .finally(() => {
          running.delete(paymentId)
          const nextReason = rerun.get(paymentId)
          rerun.delete(paymentId)
          const latestPayment = payments.get(paymentId)
          if (nextReason && latestPayment) enqueuePayment(latestPayment, nextReason)
        })
      running.set(paymentId, task)
    }

    const fetchPaymentsById = async (
      paymentIds: string[],
      reason: MarketplacePaymentSweepInput['reason'],
    ) => {
      const ids = [...new Set(paymentIds)].filter(Boolean)
      if (ids.length === 0) return
      const events = await this.opts.pool.querySync(this.opts.relays, {
        kinds: [MarketplacePayment],
        ids,
      }, options)
      const found = new Set<string>()
      for (const event of events) {
        const decoded = decodeMarketplaceEvent(event, parsePaymentEvent, {
          source: 'me.payments.refetch',
          oninvalid: this.opts.onInvalidEvent,
        })
        if (!decoded.ok) continue
        const payment = decoded.value
        found.add(payment.event.id)
        enqueuePayment(payment, reason)
      }
      for (const id of ids) {
        if (!found.has(id) && !payments.has(id)) {
          updateRecord(id, {
            status: 'pending',
            reason,
            error: 'Referenced payment has not been fetched yet',
          })
        }
      }
    }

    const handleSettlement = (settlement: ParsedPaymentSettlement) => {
      const ids = [...new Set(settlement.refs.payments)]
      for (const paymentId of ids) {
        const current = settlementsByPaymentId.get(paymentId) ?? []
        if (!current.some(item => item.event.id === settlement.event.id)) {
          settlementsByPaymentId.set(paymentId, [...current, settlement])
        }
        updateRecord(paymentId, {
          tradeId: settlement.tradeId,
          orderGroupId: settlement.orderGroupId,
          anchors: settlement.anchors,
          listingAnchor: settlement.anchors.listing ?? '',
          reason: 'settlement',
          settlements: settlementsByPaymentId.get(paymentId) ?? [],
        })
      }
      void fetchPaymentsById(ids, 'settlement').catch(err => {
        stream.fail(err instanceof Error ? err : new Error('Payment settlement refetch failed'))
      })
    }

    stream.emitSnapshot(emptyPaymentSweepSnapshot())
    stream.markQuerying({ requestCount: this.opts.relays.length * filters.length })
    sub = requireSubscribePool(this.opts.pool).subscribeMap(
      this.opts.relays.flatMap(url => filters.map(filter => ({ url, filter }))),
      {
        ...options,
        onevent: (event: Event) => {
          if (seenEvents.has(event.id)) return
          seenEvents.add(event.id)
          eventCount += 1
          const decoded = decodeMarketplaceEvent(event, parseMarketplacePaymentEvent, {
            source: 'me.payments.watch',
            oninvalid: this.opts.onInvalidEvent,
          })
          if (!decoded.ok) return
          const parsed = decoded.value
          if (parsed.event.kind === MarketplacePayment) enqueuePayment(parsed as ParsedPayment)
          else handleSettlement(parsed as ParsedPaymentSettlement)
        },
        oneose: () => {
          stream.markEose({ eventCount })
          stream.markLive({ eventCount })
        },
        onclose: reasons => {
          stream.emitStatus(new StreamClosed({ reasons }))
        },
      },
    )
    return stream
  }
}

class MarketplaceMeRuntime implements MarketplaceMeApi {
  readonly orders: MarketplaceMeOrdersApi
  readonly bids: MarketplaceMeBidsApi
  readonly inbox: MarketplaceMeInboxApi
  readonly payments: MarketplaceMePaymentsApi

  constructor(opts: MarketplaceRuntimeOptions) {
    this.orders = new MarketplaceMeOrdersRuntime(opts)
    this.bids = new MarketplaceMeBidsRuntime(opts)
    this.inbox = new MarketplaceMeInboxRuntime(opts)
    this.payments = new MarketplaceMePaymentsRuntime(opts)
  }
}

class MarketplaceAuctionLookup {
  static options(options: MarketplaceAuctionLookupOptions = {}): MarketplaceAuctionScopeOptions {
    const { maxWait, id, label, abort } = options
    return {
      ...(maxWait !== undefined ? { maxWait } : {}),
      ...(id !== undefined ? { id } : {}),
      ...(label !== undefined ? { label } : {}),
      ...(abort !== undefined ? { abort } : {}),
    }
  }
}

function resolveAuctionBidAmount(
  amount: MarketplaceAuctionBidAmount,
  auction: ParsedMarketplaceAuction | undefined,
): MarketplaceAmount {
  const useAuctionDefaults = Boolean(auction && amount.denomination === undefined)
  const currency = amount.currency ?? auction?.currency
  const denomination = amount.denomination ?? auction?.currency
  const decimals = amount.decimals ?? (useAuctionDefaults ? auction?.decimals : undefined)
  if (!denomination || decimals === undefined) {
    throw new Error('Marketplace auction bid amount requires denomination and decimals unless an auction is provided')
  }
  const resolved: MarketplaceAmount = {
    value: amount.value,
    ...(currency ? { currency } : {}),
    denomination,
    decimals,
  }
  if (auction && amountCurrency(resolved) !== auction.currency) {
    throw new Error(`Auction bids must use auction currency ${auction.currency}`)
  }
  return resolved
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

function runtimeOptionsFromBindOptions(
  pool: MarketplaceRuntimePool,
  relays: string[],
  options: MarketplaceBindOptions = {},
): MarketplaceRuntimeOptions {
  const { orderDrivers, auctionDrivers, ...rest } = options
  const publish = rest.publish ?? (typeof pool.publish === 'function'
    ? (event: Event) => Promise.allSettled(pool.publish!(relays, event))
    : undefined)
  return {
    ...rest,
    ...(publish ? { publish } : {}),
    pool,
    relays,
    orderPolicies: orderDrivers,
    bidPolicies: auctionDrivers,
  }
}

function sessionOptionsFromBoundOptions(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceSessionOptions = {},
): MarketplaceSessionOptions {
  return {
    ...(opts.autoTrustArbiter !== undefined ? { autoTrustArbiter: opts.autoTrustArbiter } : {}),
    ...(opts.paymentMethod !== undefined ? { paymentMethod: opts.paymentMethod } : {}),
    ...(opts.locationProvider !== undefined ? { locationProvider: opts.locationProvider } : {}),
    ...(opts.logger !== undefined ? { logger: opts.logger } : {}),
    ...(opts.publish !== undefined ? { publish: opts.publish } : {}),
    ...(opts.orderPolicies !== undefined ? { orderDrivers: opts.orderPolicies } : {}),
    ...(opts.bidPolicies !== undefined ? { auctionDrivers: opts.bidPolicies } : {}),
    ...options,
  }
}

function bindRuntimeClient(opts: MarketplaceRuntimeOptions): MarketplaceClient {
  let nextAccountIndex: number | undefined
  const nextTradeIndexState = new ReplayStream<number | undefined>({ replayLimit: 1 })
  const nextTradeIndex = {
    get value() {
      return nextTradeIndexState.value
    },
    get latest() {
      return nextTradeIndexState.latest
    },
    subscribe: (
      handler,
      options,
    ) => nextTradeIndexState.subscribe(handler, options),
  } satisfies MarketplaceClient['nextTradeIndex']
  const logger = marketplaceLogger(opts, 'marketplace.runtime.bind')
  logger.info('Marketplace runtime bound', {
    relayCount: opts.relays.length,
    orderPolicyCount: opts.orderPolicies?.length ?? 0,
    bidPolicyCount: opts.bidPolicies?.length ?? 0,
  })
  const me = new MarketplaceMeRuntime(opts)

  function setNextAccountIndex(index: number | undefined): void {
    nextAccountIndex = index
    nextTradeIndexState.next(index)
  }

  async function getNextAccountIndex(options: MarketplaceHighWatermarkOptions = {}): Promise<number> {
    if (nextAccountIndex === undefined) {
      const discovery = await discoverMarketplaceHighWatermark(opts, options)
      setNextAccountIndex(discovery.nextUnusedIndex)
    }
    const index = nextAccountIndex
    if (index === undefined) throw new Error('Marketplace next trade index discovery failed')
    setNextAccountIndex(index + 1)
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

  async function resolveParticipantProofsForIdentity(params: {
    label: string
    mode?: MarketplacePayOptions['identityProofPrivacy']
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
    const route = resolvedOptions.route ?? (await orderPaymentRoutesForListing(opts, listing, {
      amount: baseOrder.amount,
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
      mode: resolvedOptions.identityProofPrivacy,
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
    yield* publishOrderPayStream(
      opts,
      route,
      proofedOrder,
      trade.tradeSecretKey,
      trade.tradePubkey,
      stream as AsyncIterable<MarketplacePolicyPaymentState>,
      resolvedOptions.paymentProofPrivacy ?? 'public',
      resolvedOptions.paymentAmountPrivacy ?? 'public',
      resolvedOptions.paymentTermsPrivacy ?? resolvedOptions.paymentAmountPrivacy ?? 'public',
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
    nextTradeIndex,
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
        options: ListingSearchOptions = {},
      ) => findListing(opts.pool, opts.relays, pubkey, query, withInvalidEventHandler(opts, options)),
      findById: (id: string, options: ListingSearchOptions = {}) =>
        findListingById(opts.pool, opts.relays, id, withInvalidEventHandler(opts, options)),
      findByAnchor: (anchor: string, options: ListingSearchOptions = {}) =>
        findListingByAnchor(opts.pool, opts.relays, anchor, withInvalidEventHandler(opts, options)),
      search: (query: ListingSearchQuery = {}, options: ListingSearchOptions = {}) =>
        searchListings(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
    },
    shippingOption: {
      kind: MarketplaceShippingOption,
      parse: parseShippingOptionEvent,
      validate: validateShippingOptionEvent,
      address: shippingOptionAddress,
      template: generateShippingOptionEventTemplate,
      filter: shippingOptionSearchFilter,
      filters: { search: shippingOptionSearchFilter },
      search: (query: ShippingOptionSearchQuery = {}, options: ShippingOptionSearchOptions = {}) =>
        searchShippingOptions(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
    },
    locations: createMarketplaceLocationsApi(opts.locationProvider),
    paymentMethod: {
      parse: parsePaymentMethodEvent,
      validate: validatePaymentMethodEvent,
      template: generatePaymentMethodEventTemplate,
      filter: paymentMethodFilter,
      findOne: (query: PaymentMethodFindQuery = {}, options: PaymentMethodFindOptions = {}) =>
        findPaymentMethod(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
      canonicalAssetId,
    },
    arbitrationServices: {
      parse: parseArbitrationServiceEvent,
      validate: validateArbitrationServiceEvent,
      template: generateArbitrationServiceEventTemplate,
      filter: arbitrationServiceFilter,
      search: (query: ArbitrationServiceFindQuery = {}, options: ArbitrationServiceSearchOptions = {}) =>
        searchArbitrationServices(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
      findOne: (query: ArbitrationServiceFindQuery = {}, options: ArbitrationServiceSearchOptions = {}) =>
        findArbitrationService(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
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
        searchOrders(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
      subscribe: (query: OrderQuery, handlers: OrderSubscribeHandlers, options: OrderSubscribeOptions = {}) =>
        subscribeOrders(requireSubscribePool(opts.pool), opts.relays, query, withLegacyInvalidEventHandler(opts, 'orders.subscribe', handlers), options),
      stream: (query: OrderQuery = {}, options: OrderSubscribeOptions = {}) =>
        streamOrders(requireSubscribePool(opts.pool), opts.relays, query, options),
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
          fetchOrderGroups(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
        search: (query: OrderQuery = {}, options: OrderGroupSearchOptions = {}) =>
          searchOrderGroups(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)).then(groups =>
            validateGroupsWithRuntimePolicies(opts, groups, options),
          ),
        subscribe: (
          query: OrderQuery,
          handlers: OrderGroupSubscribeHandlers,
          options: OrderSubscribeOptions & ReduceOrderGroupOptions = {},
        ) => subscribeOrderGroups(requireSubscribePool(opts.pool), opts.relays, query, withLegacyInvalidEventHandler(opts, 'orderGroups.subscribe', handlers), options),
        stream: (query: OrderQuery = {}, options: OrderSubscribeOptions & ReduceOrderGroupOptions = {}) =>
          streamOrderGroups(requireSubscribePool(opts.pool), opts.relays, query, options),
      },
    },
    reviews: {
      parse: parseReviewEvent,
      validate: validateReviewEvent,
      template: generateReviewEventTemplate,
      resolveProof: resolveReviewProof,
      revealedBuyerPubkey: revealedReviewBuyerPubkey,
      search: (query = {}, options = {}) => searchReviews(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
    },
    structuredMessages: {
      parse: parseStructuredMessageEvent,
      validate: validateStructuredMessageEvent,
      template: generateStructuredMessageEventTemplate,
    },
    me,
    auctions: {
      template: generateAuctionEventTemplate,
      parse: parseAuctionEvent,
      validate: validateAuctionEvent,
      address: auctionAddress,
      bidChainId: auctionBidChainId,
      filters: auctionSearchFilters,
      get: (query: MarketplaceAuctionScopeQuery, options: MarketplaceAuctionLookupOptions = {}) =>
        queryAuctionScope(
          requireSubscribePool(opts.pool),
          opts.relays,
          query,
          withInvalidEventHandler(opts, MarketplaceAuctionLookup.options(options)),
        ),
      watch: (query: MarketplaceAuctionScopeQuery, options: MarketplaceAuctionLookupOptions = {}) =>
        streamAuctionScope(
          requireSubscribePool(opts.pool),
          opts.relays,
          query,
          withInvalidEventHandler(opts, MarketplaceAuctionLookup.options(options)),
        ),
      search: (query: MarketplaceAuctionSearchQuery = {}, options: MarketplaceAuctionSearchOptions = {}) =>
        searchAuctions(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
      subscribe: (
        query: MarketplaceAuctionSearchQuery,
        handlers: MarketplaceAuctionSubscribeHandlers,
        options: MarketplaceAuctionSubscribeOptions = {},
      ) => subscribeAuctions(requireSubscribePool(opts.pool), opts.relays, query, withLegacyInvalidEventHandler(opts, 'auctions.subscribe', handlers), options),
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
        ) => searchAuctionCompletes(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
        subscribe: (
          query: MarketplaceAuctionCompleteSearchQuery,
          handlers: MarketplaceAuctionCompleteSubscribeHandlers,
          options: MarketplaceAuctionCompleteSubscribeOptions = {},
        ) => subscribeAuctionCompletes(requireSubscribePool(opts.pool), opts.relays, query, withLegacyInvalidEventHandler(opts, 'auctionCompletes.subscribe', handlers), options),
      },
      bidGroups: {
        filter: auctionBidGroupFilter,
        filters: auctionBidGroupFilters,
        reduce: reduceAuctionBidGroup,
        group: groupAuctionBidEvents,
        chains: buildAuctionBidChains,
        fetch: (query: AuctionBidGroupQuery, options: AuctionBidGroupSearchOptions = {}) =>
          fetchAuctionBidGroups(opts.pool, opts.relays, query, withInvalidEventHandler(opts, options)),
        subscribe: (
          query: AuctionBidGroupQuery,
          handlers: AuctionBidGroupSubscribeHandlers,
          options: AuctionBidGroupSubscribeOptions = {},
        ) => subscribeAuctionBidGroups(requireSubscribePool(opts.pool), opts.relays, query, withLegacyInvalidEventHandler(opts, 'auctionBidGroups.subscribe', handlers), options),
      },
      async *bid(
        listing: Event | MarketplaceListing,
        bid: Omit<Partial<MarketplaceAuctionBidTemplate>, 'amount'> & { amount: MarketplaceAuctionBidAmount },
        options: MarketplacePayOptions & {
          auction?: Event | ParsedMarketplaceAuction
          identityProofPrivacy?: 'none' | 'public' | 'sealed'
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
        const bidAmount = resolveAuctionBidAmount(bid.amount, auction)
        const trade = deriveMarketplaceTradeMaterial(seed, {
          index: resolvedOptions.accountIndex,
          role: 'buyer',
        })
        const baseBid = {
          tradeId: bid.tradeId ?? trade.tradeId,
          listingAnchor,
          amount: bidAmount,
          participants: addParticipant(bid.participants, trade.tradePubkey, 'buyer'),
        }
        const routes = await auctionPaymentRoutesForListing(opts, listing, auction, {
          amount: baseBid.amount,
        })
        const route = resolvedOptions.route ?? routes[0]
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
        const paymentAmount = normalizeAmountForRouteEvent(bidAmount, route.asset)
        const participantProofs = await resolveParticipantProofsForIdentity({
          label: 'bid',
          mode: resolvedOptions.identityProofPrivacy,
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
          amount: bidAmount,
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
          ...(resolvedOptions.unlockAt === undefined && auction?.endAt !== undefined ? { unlockAt: auction.endAt } : {}),
          settlementId: resolvedOptions.settlementId ?? auctionBid.tradeId,
        }
        const targetTradeId = auctionBid.targetOrder?.tradeId ?? auctionBid.bidChainId ?? auctionBid.tradeId
        const targetOrderGroupId = orderGroupIdForParticipants(
          targetTradeId,
          auctionBid.targetOrder?.participants ?? auctionBid.participants ?? [],
        )
        const paymentIntent = buildPaymentIntent(route, paymentOrder, finalOptions, seed, 'bid')
        if (opts.logger) paymentIntent.logger = opts.logger
        paymentIntent.metadata = {
          ...(paymentIntent.metadata ?? {}),
          auctionAnchor,
          targetListingAnchor: listingAnchor,
          targetTradeId,
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
          resolvedOptions.paymentTermsPrivacy ?? resolvedOptions.paymentAmountPrivacy ?? 'public',
        )
      },
      settle: (request: MarketplaceAuctionSettlementRequest) => settleMarketplaceAuction(opts, request),
    },
    payments: {
      group: groupPaymentStreams,
      terms: paymentTerms,
      validateGroup: validatePaymentGroup,
      validateGroups: validatePaymentGroupStream,
      validate: (payment: MarketplacePaymentValidationItem) => validateMarketplacePayment(opts, payment),
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
      setNextAccountIndex(result.discovery.nextUnusedIndex)
      return result
    },
    session: (signer, options = {}) => createMarketplaceSession(
      opts.pool,
      opts.relays,
      signer,
      sessionOptionsFromBoundOptions(opts, options),
      bindRuntimeClient,
    ),
    pay,
  } satisfies MarketplaceClient

  return client
}

export function bind(
  pool: MarketplaceRuntimePool,
  relays: string[],
  options: MarketplaceBindOptions = {},
): MarketplaceClient {
  return bindRuntimeClient(runtimeOptionsFromBindOptions(pool, relays, options))
}
