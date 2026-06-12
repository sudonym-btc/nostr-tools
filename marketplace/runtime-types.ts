import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import { MarketplaceAuctionBid, MarketplacePayment, MarketplaceShippingOption } from '../kinds.ts'
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
  findListing,
  findListingByAnchor,
  findListingById,
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
  type ParsedMarketplaceShippingOption,
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
  fetchMyAuctionBidGroups,
  fetchAuctionBidGroups,
  groupAuctionBidEvents,
  reduceAuctionBidGroup,
  subscribeAuctionBidGroups,
  type AuctionBidGroupQuery,
  type AuctionBidGroupSearchOptions,
  type AuctionBidGroupSubscribeHandlers,
  type AuctionBidGroupSubscribeOptions,
  type MyAuctionBidGroupQuery,
  type ParsedAuctionBidChain,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
import type {
  MarketplaceAuctionScope,
  MarketplaceAuctionScopeQuery,
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
import type { PaymentProofPrivacy } from './payment-proof.ts'
import type { PaymentAmountPrivacy } from './payment-amount.ts'
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
import type {
  MarketplaceMyOrderGroupStream,
  MarketplaceOrderStream,
  MarketplaceOrderGroupStream,
} from './order-stream.ts'
import {
  generateReviewEventTemplate,
  parseReviewEvent,
  resolveReviewProof,
  revealedReviewBuyerPubkey,
  searchReviews,
  validateReviewEvent,
  type ReviewSearchOptions,
  type ReviewSearchQuery,
} from './review.ts'
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
  MarketplaceLocationProvider,
  MarketplaceLocationsApi,
} from './location.ts'
import type {
  MarketplacePaymentValidationExpected,
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
  marketplaceInboxFilter,
  type MarketplaceInboxFetchOptions,
  type MarketplaceInboxItem,
  type MarketplaceInboxQuery,
  type MarketplaceInboxStream,
  type MarketplaceInboxSubscribeOptions,
} from './inbox.ts'
import type {
  MarketplaceDriverAmount,
  MarketplaceDriverAsset,
  MarketplaceDriverAuctionPolicy,
  MarketplaceDriverAuctionSettlementIntent,
  MarketplaceDriverAuctionSettlementResult,
  MarketplaceDriverBolt11PaymentRequest,
  MarketplaceDriverContract,
  MarketplaceDriverIdentity,
  MarketplaceDriverOrderPolicy,
  MarketplaceDriverPaymentIntent,
  MarketplaceDriverPaymentProof,
  MarketplaceDriverPaymentState,
  MarketplaceDriverPolicyDescriptor,
  MarketplaceDriverRecoveryItem,
  MarketplaceDriverRecoveryState,
  MarketplaceDriverStartContext,
  MarketplaceDriverStartResult,
  MarketplaceDriverValidationRequest,
  MarketplaceDriverValidationResult,
  MarketplaceDriverWatermarkContext,
  MarketplaceDriverWatermarkDiscovery,
  MarketplaceDriverWatermarkRecoveryAction,
  MarketplaceDriverLogEntry,
  MarketplaceDriverLogger,
} from '@sudonym-btc/marketplace-driver-interface'

export type MarketplaceLogEntry = MarketplaceDriverLogEntry
export type MarketplaceLogger = MarketplaceDriverLogger

export type MarketplacePolicyWatermarkRecoveryAction = MarketplaceDriverWatermarkRecoveryAction

export type MarketplacePolicyWatermarkContext = MarketplaceDriverWatermarkContext

export type MarketplacePolicyWatermarkDiscovery = MarketplaceDriverWatermarkDiscovery

export type MarketplacePolicyStartContext = MarketplaceDriverStartContext<MarketplaceHighWatermarkDiscovery>

export type MarketplacePolicyStartResult = MarketplaceDriverStartResult

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

export type MarketplacePaymentMethodDefaults = {
  trustedArbiterPubkeys?: string[]
  evmAddress?: string
  evmAddressProof?: string
  cashuPubkey?: string
}

export type MarketplacePaymentMethodEnsureOptions = MarketplacePaymentMethodDefaults & {
  force?: boolean
  requireListings?: boolean
  listingsQuery?: Omit<ListingSearchQuery, 'authors' | 'limit'> & { limit?: number }
  createdAt?: number
}

export type MarketplacePaymentMethodEnsureResult =
  | { status: 'skipped'; reason: 'no_listings' | 'no_trusted_arbiters' | 'no_policy_contributions' }
  | { status: 'unchanged'; event: Event }
  | { status: 'created'; event: Event }
  | { status: 'updated'; previousEvent: Event; event: Event }

export interface MarketplaceSessionPaymentMethodApi {
  parse: typeof parsePaymentMethodEvent
  validate: typeof validatePaymentMethodEvent
  template: typeof generatePaymentMethodEventTemplate
  filter: typeof paymentMethodFilter
  findOne(query?: PaymentMethodFindQuery): Promise<ParsedPaymentMethod | null>
  canonicalAssetId: typeof canonicalAssetId
  find(): Promise<ParsedPaymentMethod | null>
  ensureUpToDate(options?: MarketplacePaymentMethodEnsureOptions): Promise<MarketplacePaymentMethodEnsureResult>
}

export type MarketplacePaymentRoute = {
  policy: MarketplacePaymentPolicyImplementation
  listing: MarketplaceListing
  paymentMethod: ParsedPaymentMethod
  arbitrationService: ParsedArbitrationService
  descriptor: MarketplacePaymentPolicy
  asset: MarketplacePaymentAsset
  score: number
}

export type MarketplacePaymentPolicy = MarketplaceDriverPolicyDescriptor & {
  method: PaymentMethod
}

export type MarketplacePaymentAsset = MarketplaceDriverAsset & {
  method: PaymentMethod
}

export type MarketplacePaymentIdentity = MarketplaceDriverIdentity

export type MarketplacePaymentContract = MarketplaceDriverContract

export type MarketplacePaymentIntent = MarketplaceDriverPaymentIntent & {
  method: PaymentMethod
  amount: MarketplaceAmount
  fee: MarketplaceAmount
  asset: MarketplacePaymentAsset
  policy: MarketplacePaymentPolicy
  contract: MarketplacePaymentContract
  participants: {
    buyer?: MarketplacePaymentIdentity
    seller: MarketplacePaymentIdentity
    arbiter: MarketplacePaymentIdentity
  }
}

export type MarketplacePaymentRecoveryItem = MarketplaceDriverRecoveryItem<
  PaymentProofEvidence,
  MarketplacePaymentValidationExpected
> & {
  group: ParsedOrderGroup
  payment: ParsedOrderPayment
  proof: PaymentProofEvidence
  expected?: MarketplacePaymentValidationExpected
}

export type MarketplacePaymentRecoveryState = MarketplaceDriverRecoveryState<PaymentProofEvidence>

export type MarketplacePaymentArbitrationIntent = {
  purpose: 'order'
  group: ParsedOrderGroup
  payment: ParsedOrderPayment
  proof: PaymentProofEvidence
  expected?: MarketplacePaymentValidationExpected
  action: PaymentSettlementAction
  outputs?: OrderPaymentSettlementOutput[]
  reason?: string
  data?: Record<string, unknown>
}

export type MarketplacePaymentArbitrationState =
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

export type MarketplacePaymentArbitrationRequest = {
  group: ParsedOrderGroup
  payment?: ParsedOrderPayment
  action: PaymentSettlementAction
  outputs?: OrderPaymentSettlementOutput[]
  reason?: string
  data?: Record<string, unknown>
  now?: number
}

export type MarketplacePaymentArbitrationRuntimeState =
  | MarketplacePaymentArbitrationState
  | { type: 'settlement_published'; event: Event; proof?: PaymentProofEvidence; data?: Record<string, unknown> }

export type MarketplaceAuctionSettlementRequest = {
  auctionId?: string
  auctionAnchor?: string
  listingAnchor?: string
  arbiterPubkey?: string
  currency?: string
  decimals?: number
  startAt?: number
  endAt?: number
  startingBid?: string
  bids?: MarketplaceAuctionBidSettlementInput[]
  bidEvents?: Event[]
  paymentEvents?: Event[]
  now?: number
  targetUnlockAt?: number
  targetOrder?: Partial<OrderTemplate>
}

export type MarketplaceAuctionBidSettlementInput = {
  bid: Event | ParsedMarketplaceAuctionBid
  payment?: Event | ParsedOrderPayment
}

export type MarketplaceAuctionBidValidation = {
  bid: ParsedMarketplaceAuctionBid
  payment?: ParsedOrderPayment
  validation: MarketplacePaymentValidationResult
}

export type MarketplaceAuctionPaymentSettlementIntent = MarketplaceDriverAuctionSettlementIntent<
  PaymentProofEvidence,
  MarketplacePaymentValidationExpected
> & {
  bid: ParsedMarketplaceAuctionBid
  payment: ParsedOrderPayment
  proof: PaymentProofEvidence
  expected?: MarketplacePaymentValidationExpected
  validation: MarketplacePaymentValidationResult
  refundPercent?: number
  winner?: MarketplaceAuctionBidValidation
  targetTradeId?: string
  targetOrderGroupId?: string
  targetUnlockAt?: number
  recycleArgs?: unknown
  data?: Record<string, unknown>
}

export type MarketplaceAuctionPaymentSettlementResult = Omit<
  MarketplaceDriverAuctionSettlementResult<PaymentProofEvidence>,
  'outputs'
> & {
  proof: PaymentProofEvidence
  outputs?: OrderPaymentSettlementOutput[]
}

export type MarketplaceAuctionSettlementState =
  | { type: 'bid_validated'; bid: MarketplaceAuctionBidValidation }
  | { type: 'winner_selected'; winner?: MarketplaceAuctionBidValidation; bids: MarketplaceAuctionBidValidation[] }
  | {
      type: 'settlement_published'
      action: PaymentSettlementAction
      bid: ParsedMarketplaceAuctionBid
      payment: ParsedOrderPayment
      event: Event
      validation: MarketplacePaymentValidationResult
      proof?: PaymentProofEvidence
    }
  | { type: 'auction_complete_published'; winner?: MarketplaceAuctionBidValidation; event: Event }
  | { type: 'order_published'; winner: MarketplaceAuctionBidValidation; event: Event }
  | { type: 'payment_published'; winner: MarketplaceAuctionBidValidation; event: Event; proof: PaymentProofEvidence }
  | { type: 'payment_ack_published'; winner: MarketplaceAuctionBidValidation; event: Event }
  | { type: 'completed'; winner?: MarketplaceAuctionBidValidation; bids: MarketplaceAuctionBidValidation[] }

export type MarketplaceBolt11PaymentRequest = MarketplaceDriverBolt11PaymentRequest & {
  amount?: MarketplaceAmount
}

export type MarketplacePaymentRequest = MarketplaceBolt11PaymentRequest

export type MarketplacePolicyPaymentRequiredState = Extract<
  MarketplaceDriverPaymentState<PaymentProofEvidence>,
  { type: 'payment_required' }
> & {
  request: MarketplacePaymentRequest
}

export type MarketplacePolicyPaymentProgressState = Extract<
  MarketplaceDriverPaymentState<PaymentProofEvidence>,
  { type: 'payment_progress' }
>

export type MarketplacePolicyPaymentPaidState = Extract<MarketplaceDriverPaymentState<PaymentProofEvidence>, { type: 'paid' }>

export type MarketplacePolicyPaymentCompletedState = Extract<
  MarketplaceDriverPaymentState<PaymentProofEvidence>,
  { type: 'completed' }
>

export type MarketplacePolicyPaymentState =
  | MarketplacePolicyPaymentRequiredState
  | MarketplacePolicyPaymentProgressState
  | MarketplacePolicyPaymentPaidState
  | MarketplacePolicyPaymentCompletedState

export type MarketplacePaymentRequiredState = {
  type: 'payment_required'
  request: MarketplacePaymentRequest
  data?: Record<string, unknown>
}

export type MarketplacePaymentProgressState = {
  type: 'payment_progress'
  status: string
  data?: Record<string, unknown>
}

export type MarketplaceOrderPublishedState = {
  type: 'order_published'
  event: Event
  data?: Record<string, unknown>
}

export type MarketplacePaymentPublishedState = {
  type: 'payment_published'
  event: Event
  proof: PaymentProofEvidence
  data?: Record<string, unknown>
}

export type MarketplacePaymentCompletedState = {
  type: 'completed'
  order?: Event
  payment?: Event
  proof?: PaymentProofEvidence
  data?: Record<string, unknown>
}

export type MarketplacePaymentState =
  | MarketplacePaymentRequiredState
  | MarketplacePaymentProgressState
  | MarketplaceOrderPublishedState
  | MarketplacePaymentPublishedState
  | MarketplacePaymentCompletedState

export type MarketplaceAuctionBidPublishedState = {
  type: 'bid_published'
  event: Event
  data?: Record<string, unknown>
}

export type MarketplaceAuctionBidPaymentPublishedState = {
  type: 'payment_published'
  event: Event
  bid: Event
  proof: PaymentProofEvidence
  data?: Record<string, unknown>
}

export type MarketplaceAuctionBidCompletedState = {
  type: 'completed'
  bid?: Event
  payment?: Event
  proof?: PaymentProofEvidence
  data?: Record<string, unknown>
}

export type MarketplaceAuctionBidState =
  | MarketplacePaymentRequiredState
  | MarketplacePaymentProgressState
  | MarketplaceAuctionBidPublishedState
  | MarketplaceAuctionBidPaymentPublishedState
  | MarketplaceAuctionBidCompletedState

export type MarketplaceOrderPolicy<State = MarketplacePolicyPaymentState> = MarketplaceDriverOrderPolicy<
  State,
  MarketplacePaymentPolicy,
  MarketplacePaymentAsset,
  MarketplacePaymentIntent,
  MarketplacePaymentValidationRequest,
  MarketplacePaymentValidationResult,
  MarketplacePaymentRecoveryItem,
  MarketplacePaymentRecoveryState,
  MarketplacePaymentArbitrationIntent,
  MarketplacePaymentArbitrationState
>

export type MarketplaceBidPolicy<State = MarketplacePolicyPaymentState> = MarketplaceDriverAuctionPolicy<
  State,
  MarketplacePaymentPolicy,
  MarketplacePaymentAsset,
  MarketplacePaymentIntent,
  MarketplacePaymentValidationRequest,
  MarketplacePaymentValidationResult,
  MarketplacePaymentRecoveryItem,
  MarketplacePaymentRecoveryState,
  MarketplaceAuctionPaymentSettlementIntent,
  MarketplaceAuctionPaymentSettlementResult
>

export type MarketplacePaymentPolicyImplementation<State = MarketplacePolicyPaymentState> =
  | MarketplaceOrderPolicy<State>
  | MarketplaceBidPolicy<State>

export type MarketplacePayOptions = {
  seed?: string
  now?: number
  route?: MarketplacePaymentRoute
  settlementId?: string
  identityProof?: MarketplaceIdentityProofMode
  paymentProofPrivacy?: PaymentProofPrivacy
  paymentAmountPrivacy?: PaymentAmountPrivacy
}

export type MarketplaceIdentityProofMode = 'none' | 'public' | 'sealed'

export type MarketplaceResolvedPayOptions = MarketplacePayOptions & { accountIndex: number }

export type MarketplacePaymentRouteOptions = {
  amount?: MarketplaceAmount
  purpose?: 'order' | 'bid'
}

export type MarketplaceOrderCreateParams = Omit<OrderTemplate, 'tradeId' | 'listingAnchor'> &
  Partial<Pick<OrderTemplate, 'tradeId' | 'listingAnchor'>>

export type MarketplaceOrderNegotiationOptions = MarketplaceOrderCreateParams & {
  alt?: string
  now?: number
  recipientPubkeys?: string[]
  seed?: string
}

export type MarketplaceOrderNegotiationResult = {
  accountIndex?: number
  tradeId: string
  order: Event
  message: Event
  giftWraps: Event[]
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
  autoTrustArbiter?: string | string[]
  paymentMethod?: MarketplacePaymentMethodDefaults
  locationProvider?: MarketplaceLocationProvider
  logger?: MarketplaceLogger
}

export type MarketplaceArbitrationStartEvent =
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
  | { type: 'auction_seen'; auction: ParsedMarketplaceAuction }
  | { type: 'auction_scheduled'; auction: ParsedMarketplaceAuction; settleAt: number; delayMs: number }
  | { type: 'auction_bid_group'; auction: ParsedMarketplaceAuction; group: ParsedAuctionBidGroup }
  | { type: 'auction_bid_payment_seen'; auction: ParsedMarketplaceAuction; group: ParsedAuctionBidGroup; payment: ParsedOrderPayment }
  | {
      type: 'auction_bid_payment_validated'
      auction: ParsedMarketplaceAuction
      group: ParsedAuctionBidGroup
      payment: ParsedOrderPayment
      validation: MarketplacePaymentValidationResult
    }
  | {
      type: 'auction_bid_payment_ack_published'
      auction: ParsedMarketplaceAuction
      group: ParsedAuctionBidGroup
      payment: ParsedOrderPayment
      validation: MarketplacePaymentValidationResult
      event: Event
    }
  | {
      type: 'auction_bid_payment_nack_published'
      auction: ParsedMarketplaceAuction
      group: ParsedAuctionBidGroup
      payment?: ParsedOrderPayment
      validation?: MarketplacePaymentValidationResult
      event: Event
    }
  | { type: 'auction_settlement_started'; auction: ParsedMarketplaceAuction }
  | { type: 'auction_settlement_state'; auction: ParsedMarketplaceAuction; state: MarketplaceAuctionSettlementState }
  | { type: 'auction_settlement_completed'; auction: ParsedMarketplaceAuction; winner?: MarketplaceAuctionBidValidation }
  | { type: 'auction_ignored'; auction?: ParsedMarketplaceAuction; group?: ParsedAuctionBidGroup; payment?: ParsedOrderPayment; reason: string }
  | { type: 'auction_error'; auction?: ParsedMarketplaceAuction; group?: ParsedAuctionBidGroup; payment?: ParsedOrderPayment; error: Error }
  | { type: 'ignored'; group?: ParsedOrderGroup; payment?: ParsedOrderPayment; reason: string }
  | { type: 'error'; group?: ParsedOrderGroup; payment?: ParsedOrderPayment; error: Error }
  | { type: 'eose' }
  | { type: 'closed'; reasons: string[] }

export type MarketplaceArbitrationStartOptions =
  Omit<OrderQuery, 'identity'> &
  OrderSubscribeOptions &
  ReduceOrderGroupOptions & {
    identity?: MarketplaceOrderIdentity
    autoAck?: boolean
    autoNack?: boolean
    orders?: boolean
    auctions?: boolean
    autoSettleAuctions?: boolean
    auctionSettlementSweepIntervalMs?: number
    auctionQuery?: Omit<MarketplaceAuctionSearchQuery, 'arbiterPubkeys'>
    auctionBidQuery?: Omit<AuctionBidGroupQuery, 'auctionAnchor' | 'participantPubkeys'>
    auctionSettlement?: Omit<MarketplaceAuctionSettlementRequest, 'auctionAnchor' | 'auctionId' | 'listingAnchor'>
    now?: number
    onstate?: (event: MarketplaceArbitrationStartEvent) => void | Promise<void>
  }

export type MarketplaceArbitrationRuntime = {
  close(reason?: string): void
  processGroup(group: ParsedOrderGroup): Promise<void>
  processAuction(auction: ParsedMarketplaceAuction): Promise<void>
  processAuctionBidGroup(auction: ParsedMarketplaceAuction, group: ParsedAuctionBidGroup): Promise<void>
  settleAuction(auction: ParsedMarketplaceAuction): Promise<void>
  settleDueAuctions(): Promise<void>
}

export type MarketplaceSessionIdentity = {
  pubkey?: string
  signer: MarketplaceSeedSigner
}

export type MarketplaceBindOptions = Omit<MarketplaceRuntimeOptions, 'pool' | 'relays'>

export type MarketplaceSessionOptions = Omit<MarketplaceRuntimeOptions, 'pool' | 'relays' | 'identity' | 'seed' | 'signer' | 'publish'> & {
  pubkey?: string
  seed?: string
  createdAt?: number
  publish?(event: Event): unknown | Promise<unknown>
  ensurePaymentMethod?: boolean
  paymentMethod?: MarketplacePaymentMethodDefaults
}

export interface MarketplaceListingsApi {
  anchor: typeof listingAnchor
  parse: typeof parseListingEvent
  validate: typeof validateListingEvent
  create: typeof generateListingEventTemplate
  template: typeof generateListingEventTemplate
  filters: { search: typeof listingSearchFilter }
  price: typeof listingPriceAmount
  findOne(
    pubkey: string,
    query?: Omit<ListingSearchQuery, 'authors' | 'limit'>,
  ): ReturnType<typeof findListing>
  findById(id: string): ReturnType<typeof findListingById>
  findByAnchor(anchor: string): ReturnType<typeof findListingByAnchor>
  search(query?: ListingSearchQuery): Promise<MarketplaceListing[]>
}

export interface MarketplaceShippingOptionApi {
  kind: typeof MarketplaceShippingOption
  parse: typeof parseShippingOptionEvent
  validate: typeof validateShippingOptionEvent
  address: typeof shippingOptionAddress
  template: typeof generateShippingOptionEventTemplate
  filter: typeof shippingOptionSearchFilter
  filters: { search: typeof shippingOptionSearchFilter }
  search(query?: ShippingOptionSearchQuery): Promise<ParsedMarketplaceShippingOption[]>
}

export interface MarketplacePaymentMethodApi {
  parse: typeof parsePaymentMethodEvent
  validate: typeof validatePaymentMethodEvent
  template: typeof generatePaymentMethodEventTemplate
  filter: typeof paymentMethodFilter
  findOne(query?: PaymentMethodFindQuery): Promise<ParsedPaymentMethod | null>
  canonicalAssetId: typeof canonicalAssetId
}

export interface MarketplaceArbitrationServicesApi {
  parse: typeof parseArbitrationServiceEvent
  validate: typeof validateArbitrationServiceEvent
  template: typeof generateArbitrationServiceEventTemplate
  filter: typeof arbitrationServiceFilter
  search(query?: ArbitrationServiceFindQuery): Promise<ParsedArbitrationService[]>
  findOne(query?: ArbitrationServiceFindQuery): Promise<ParsedArbitrationService | null>
  calculateFee: typeof calculateArbitrationFee
}

export interface MarketplaceArbitrationServiceSelectionsApi {
  parse: typeof parseArbitrationServiceSelectionEvent
  validate: typeof validateArbitrationServiceSelectionEvent
  template: typeof generateArbitrationServiceSelectionEventTemplate
}

export interface MarketplaceOrderGroupsApi {
  id: typeof orderGroupIdForParticipants
  idForOrder: typeof orderGroupIdForOrder
  idForEvent: typeof participantGroupIdForEvent
  participants: typeof orderGroupParticipantPubkeys
  participantPubkeys: typeof participantGroupParticipantPubkeys
  participantEntries: typeof participantGroupRoleParticipants
  filter: typeof orderGroupFilter
  parseParticipantEvent: typeof parseParticipantGroupEvent
  reduce: typeof reduceOrderGroup
  group: typeof groupOrderEvents
  resolveParticipants: typeof resolveOrderGroupParticipants
  validatePayments(group: ParsedOrderGroup, options?: ResolveAndValidateOrderGroupOptions): ReturnType<typeof validateOrderGroupPayments>
  resolveAndValidate(
    group: ParsedOrderGroup,
    options?: ResolveAndValidateOrderGroupOptions,
  ): ReturnType<typeof resolveAndValidateOrderGroup>
  fetch(query?: OrderGroupFilterQuery, options?: ReduceOrderGroupOptions): Promise<ParsedOrderGroup[]>
  search(query?: OrderQuery, options?: OrderGroupSearchOptions): Promise<ParsedOrderGroup[]>
  subscribe(
    query: OrderQuery,
    handlers: OrderGroupSubscribeHandlers,
    options?: OrderSubscribeOptions & ReduceOrderGroupOptions,
  ): ReturnType<typeof subscribeOrderGroups>
  stream(query?: OrderQuery, options?: OrderSubscribeOptions & ReduceOrderGroupOptions): MarketplaceOrderGroupStream
  mine: MarketplaceOrderGroupsMineApi
  subscribeMine(
    query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    handlers: OrderGroupSubscribeHandlers & { onbuckets?: (buckets: OrderGroupBuckets) => void },
    options?: OrderSubscribeOptions & ReduceOrderGroupOptions,
  ): ReturnType<typeof subscribeMyOrderGroups>
}

export interface MarketplaceOrderGroupsMineApi {
  (
    query?: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    options?: OrderGroupSearchOptions,
  ): Promise<OrderGroupBuckets>
  stream(
    query?: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    options?: OrderSubscribeOptions & ReduceOrderGroupOptions,
  ): MarketplaceMyOrderGroupStream
}

export interface MarketplaceOrdersApi {
  create(
    listing: Event | MarketplaceListing,
    order: MarketplaceOrderCreateParams,
    options?: MarketplacePayOptions,
  ): AsyncIterable<MarketplacePaymentState>
  parse: typeof parseOrderEvent
  validate: typeof validateOrderEvent
  template: typeof generateOrderEventTemplate
  commitHash: typeof orderCommitHash
  filters: typeof orderFilters
  search(query?: OrderQuery, options?: OrderSearchOptions): Promise<ParsedOrder[]>
  subscribe(
    query: OrderQuery,
    handlers: OrderSubscribeHandlers,
    options?: OrderSubscribeOptions,
  ): ReturnType<typeof subscribeOrders>
  stream(query?: OrderQuery, options?: OrderSubscribeOptions): MarketplaceOrderStream
  mine: MarketplaceOrdersMineApi
  subscribeMine(
    query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    handlers: OrderSubscribeHandlers,
    options?: OrderSubscribeOptions,
  ): ReturnType<typeof subscribeOrders>
  groups: MarketplaceOrderGroupsApi
  negotiate(
    listing: Event | MarketplaceListing,
    order: MarketplaceOrderNegotiationOptions,
  ): Promise<MarketplaceOrderNegotiationResult>
}

export interface MarketplaceOrdersMineApi {
  (
    query?: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    options?: OrderSearchOptions,
  ): Promise<ParsedOrder[]>
  stream(
    query?: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    options?: OrderSubscribeOptions,
  ): MarketplaceOrderStream
}

export interface MarketplaceReviewsApi {
  parse: typeof parseReviewEvent
  validate: typeof validateReviewEvent
  template: typeof generateReviewEventTemplate
  resolveProof: typeof resolveReviewProof
  revealedBuyerPubkey: typeof revealedReviewBuyerPubkey
  search(query?: ReviewSearchQuery, options?: ReviewSearchOptions): ReturnType<typeof searchReviews>
}

export interface MarketplaceStructuredMessagesApi {
  parse(event: Event): ParsedStructuredMessage
  validate: typeof validateStructuredMessageEvent
  template: typeof generateStructuredMessageEventTemplate
}

export interface MarketplaceInboxApi {
  filter: typeof marketplaceInboxFilter
  unwrap(wrap: Event): Promise<MarketplaceInboxItem>
  fetch(
    query?: MarketplaceInboxQuery,
    options?: MarketplaceInboxFetchOptions,
  ): Promise<MarketplaceInboxItem[]>
  stream(
    query?: MarketplaceInboxQuery,
    options?: MarketplaceInboxSubscribeOptions,
  ): MarketplaceInboxStream
}

export interface MarketplacePaymentRoutesApi {
  forListing(
    listing: Event | MarketplaceListing,
    options?: MarketplacePaymentRouteOptions | null,
  ): Promise<MarketplacePaymentRoute[]>
}

export interface MarketplaceAuctionsApi {
  parse: typeof parseAuctionEvent
  validate: typeof validateAuctionEvent
  address: typeof auctionAddress
  bidChainId: typeof auctionBidChainId
  template: typeof generateAuctionEventTemplate
  filters: typeof auctionSearchFilters
  scope(query: MarketplaceAuctionScopeQuery): MarketplaceAuctionScope
  search(query?: MarketplaceAuctionSearchQuery, options?: MarketplaceAuctionSearchOptions): Promise<ParsedMarketplaceAuction[]>
  subscribe(
    query: MarketplaceAuctionSearchQuery,
    handlers: MarketplaceAuctionSubscribeHandlers,
    options?: MarketplaceAuctionSubscribeOptions,
  ): ReturnType<typeof subscribeAuctions>
  bidTemplate: typeof generateAuctionBidEventTemplate
  parseBid: typeof parseAuctionBidEvent
  validateBid: typeof validateAuctionBidEvent
  completeTemplate: typeof generateAuctionCompleteEventTemplate
  parseComplete: typeof parseAuctionCompleteEvent
  validateComplete: typeof validateAuctionCompleteEvent
  completes: MarketplaceAuctionCompletesApi
  bidGroups: MarketplaceAuctionBidGroupsApi
  bid(
    listing: Event | MarketplaceListing,
    bid: Partial<MarketplaceAuctionBidTemplate> & { amount: MarketplaceAmount },
    options?: MarketplacePayOptions & {
      auction?: Event | ParsedMarketplaceAuction
      identityProof?: MarketplaceIdentityProofMode
      participantProofs?: OrderTemplate['participantProofs']
      participantProofKeys?: OrderTemplate['participantProofKeys']
    },
  ): AsyncIterable<MarketplaceAuctionBidState>
  settle(request: MarketplaceAuctionSettlementRequest): AsyncIterable<MarketplaceAuctionSettlementState>
}

export interface MarketplaceAuctionCompletesApi {
  filter: typeof auctionCompleteSearchFilter
  search(
    query?: MarketplaceAuctionCompleteSearchQuery,
    options?: MarketplaceAuctionCompleteSearchOptions,
  ): ReturnType<typeof searchAuctionCompletes>
  subscribe(
    query: MarketplaceAuctionCompleteSearchQuery,
    handlers: MarketplaceAuctionCompleteSubscribeHandlers,
    options?: MarketplaceAuctionCompleteSubscribeOptions,
  ): ReturnType<typeof subscribeAuctionCompletes>
}

export interface MarketplaceAuctionBidGroupsApi {
  filter: typeof auctionBidGroupFilter
  filters: typeof auctionBidGroupFilters
  reduce: typeof reduceAuctionBidGroup
  group: typeof groupAuctionBidEvents
  chains: typeof buildAuctionBidChains
  fetch(query: AuctionBidGroupQuery, options?: AuctionBidGroupSearchOptions): Promise<ParsedAuctionBidGroup[]>
  mine: {
    fetch(
      query?: MyAuctionBidGroupQuery,
      options?: AuctionBidGroupSearchOptions,
    ): ReturnType<typeof fetchMyAuctionBidGroups>
    chains(
      query?: MyAuctionBidGroupQuery,
      options?: AuctionBidGroupSearchOptions,
    ): Promise<ParsedAuctionBidChain[]>
  }
  subscribe(
    query: AuctionBidGroupQuery,
    handlers: AuctionBidGroupSubscribeHandlers,
    options?: AuctionBidGroupSubscribeOptions,
  ): ReturnType<typeof subscribeAuctionBidGroups>
}

export interface MarketplacePaymentsApi {
  group: typeof groupPaymentStreams
  validateGroup: typeof validatePaymentGroup
  validateGroups: typeof validatePaymentGroupStream
  mine: {
    fetch(
      query?: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
      options?: OrderGroupSearchOptions & { now?: number },
    ): Promise<MarketplacePaymentRecoveryItem[]>
  }
  recover(payment: MarketplacePaymentRecoveryItem): AsyncIterable<MarketplacePaymentRecoveryState>
  validate(payment: MarketplacePaymentRecoveryItem): Promise<MarketplacePaymentValidationResult>
  policyFor(payment: MarketplacePaymentRecoveryItem): MarketplacePaymentPolicyImplementation | undefined
}

export interface MarketplaceArbitrationApi {
  start(options?: MarketplaceArbitrationStartOptions): MarketplaceArbitrationRuntime
  arbitrate(request: MarketplacePaymentArbitrationRequest): AsyncIterable<MarketplacePaymentArbitrationRuntimeState>
}

export interface MarketplaceClient {
  listings: MarketplaceListingsApi
  shippingOption: MarketplaceShippingOptionApi
  locations: MarketplaceLocationsApi
  paymentMethod: MarketplacePaymentMethodApi
  arbitrationServices: MarketplaceArbitrationServicesApi
  arbitrationServiceSelections: MarketplaceArbitrationServiceSelectionsApi
  orders: MarketplaceOrdersApi
  reviews: MarketplaceReviewsApi
  structuredMessages: MarketplaceStructuredMessagesApi
  inbox: MarketplaceInboxApi
  paymentRoutes: MarketplacePaymentRoutesApi
  auctions: MarketplaceAuctionsApi
  payments: MarketplacePaymentsApi
  arbitration: MarketplaceArbitrationApi
  discoverHighWatermark(options?: MarketplaceHighWatermarkOptions): Promise<MarketplaceHighWatermarkDiscovery>
  getNextAccountIndex(options?: MarketplaceHighWatermarkOptions): Promise<number>
  start(options?: MarketplaceStartOptions): Promise<MarketplaceStartResult>
  pay(
    listing: Event | MarketplaceListing,
    order: MarketplaceOrderCreateParams,
    options?: MarketplacePayOptions,
  ): AsyncIterable<MarketplacePaymentState>
}

export type MarketplaceSessionSeedEnsureOptions = {
  createdAt?: number
}

export type MarketplaceSessionSeedEnsureResult = {
  created: boolean
  event: Event
}

export interface MarketplaceSessionSeedApi {
  created: boolean
  event?: Event
  ensureCreated(options?: MarketplaceSessionSeedEnsureOptions): Promise<MarketplaceSessionSeedEnsureResult>
}

export interface MarketplaceSession extends MarketplaceClient {
  identity: {
    pubkey: string
  }
  seed: MarketplaceSessionSeedApi
  paymentMethod: MarketplaceSessionPaymentMethodApi
  getNextAccountIndex(options?: MarketplaceHighWatermarkOptions): Promise<number>
  start(options?: MarketplaceStartOptions): Promise<MarketplaceStartResult>
}
