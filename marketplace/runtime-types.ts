import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event, EventTemplate } from '../core.ts'
import { MarketplaceAuctionBid, MarketplacePayment, MarketplaceShippingOption } from '../kinds.ts'
import { finalizeEvent } from '../pure.ts'
import type { MarketplaceValue } from './stream.ts'
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
  type ParsedMarketplaceShippingOption,
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
  subscribeAuctionBidGroups,
  type AuctionBidGroupQuery,
  type AuctionBidGroupSearchOptions,
  type AuctionBidGroupEvent,
  type AuctionBidGroupSubscribeHandlers,
  type AuctionBidGroupSubscribeOptions,
  type ParsedAuctionBidChain,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
import type {
  MarketplaceAuctionScopeOptions,
  MarketplaceAuctionScopeQuery,
  MarketplaceAuctionScopesSnapshot,
  MarketplaceAuctionScopeStream,
} from './auction-scope.ts'
import {
  generatePaymentAckEventTemplate,
  generatePaymentEventTemplate,
  generatePaymentNackEventTemplate,
  generatePaymentSettlementEventTemplate,
  parsePaymentEvent,
  parsePaymentSettlementEvent,
  type PaymentLifecycleAnchors,
  type PaymentSettlementOutput,
  type ParsedPayment,
  type ParsedPaymentSettlement,
} from './payment-lifecycle.ts'
import type { PaymentProofPrivacy, PaymentTermsPrivacy } from './payment-proof.ts'
import type { PaymentAmountPrivacy } from './payment-amount.ts'
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
  type OrderGroupEvent,
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
  MarketplaceOrderStream,
  MarketplaceOrderGroupStream,
} from './order-stream.ts'
import type { MarketplaceStream } from './stream.ts'
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
import type { MarketplaceInvalidEventHandler } from './event-decoder.ts'
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
  paymentTerms,
} from './payment-terms.ts'
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
  MarketplaceDriverPaymentSettlementIntent,
  MarketplaceDriverPaymentSettlementState,
  MarketplaceDriverPaymentProof,
  MarketplaceDriverPaymentState,
  MarketplaceDriverPaymentSweepInput,
  MarketplaceDriverPaymentSweepState,
  MarketplaceDriverPolicyDescriptor,
  MarketplaceDriverStartContext,
  MarketplaceDriverStartResult,
  MarketplaceDriverSwapResumeContext,
  MarketplaceDriverSwapResumeState,
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

export type MarketplacePolicySwapResumeContext = MarketplaceDriverSwapResumeContext<MarketplaceHighWatermarkDiscovery>

export type MarketplacePolicySwapResumeState = MarketplaceDriverSwapResumeState

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
  paymentForm?: AcceptedPaymentForm
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

export type MarketplacePaymentValidationItem = {
  purpose: 'order' | 'bid'
  group: ParsedOrderGroup
  payment: ParsedPayment
  proof: PaymentProofEvidence
  expected?: MarketplacePaymentValidationExpected
}

export type MarketplacePaymentSweepInput = MarketplaceDriverPaymentSweepInput<
  PaymentProofEvidence,
  MarketplacePaymentValidationExpected
>

export type MarketplacePaymentSweepState = MarketplaceDriverPaymentSweepState<PaymentProofEvidence>

export type MarketplacePaymentArbitrationIntent = {
  purpose: 'order'
  group: ParsedOrderGroup
  payment: ParsedPayment
  proof: PaymentProofEvidence
  expected?: MarketplacePaymentValidationExpected
  action: PaymentSettlementAction
  outputs?: PaymentSettlementOutput[]
  reason?: string
  data?: Record<string, unknown>
}

export type MarketplacePaymentSettlementIntent = MarketplaceDriverPaymentSettlementIntent<
  PaymentProofEvidence,
  MarketplacePaymentValidationExpected
>

export type MarketplacePaymentArbitrationState =
  | { type: 'progress'; status: string; data?: Record<string, unknown> }
  | {
      type: 'settlement_ready'
      proof: PaymentProofEvidence
      inputs?: Array<Record<string, unknown>>
      outputs?: PaymentSettlementOutput[]
      data?: Record<string, unknown>
    }
  | {
      type: 'completed'
      proof?: PaymentProofEvidence | null
      inputs?: Array<Record<string, unknown>>
      outputs?: PaymentSettlementOutput[]
      data?: Record<string, unknown>
    }

export type MarketplacePaymentSettlementState = MarketplaceDriverPaymentSettlementState<PaymentProofEvidence>

export type MarketplacePaymentArbitrationRequest = {
  group: ParsedOrderGroup
  payment?: ParsedPayment
  payments?: ParsedPayment[]
  action: PaymentSettlementAction
  outputs?: PaymentSettlementOutput[]
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
  payment?: Event | ParsedPayment
}

export type MarketplaceAuctionBidValidation = {
  bid: ParsedMarketplaceAuctionBid
  payment?: ParsedPayment
  validation: MarketplacePaymentValidationResult
}

export type MarketplaceAuctionPaymentSettlementIntent = MarketplaceDriverAuctionSettlementIntent<
  PaymentProofEvidence,
  MarketplacePaymentValidationExpected
> & {
  bid: ParsedMarketplaceAuctionBid
  payment: ParsedPayment
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
  outputs?: PaymentSettlementOutput[]
}

export type MarketplaceAuctionSettlementState =
  | { type: 'bid_validated'; bid: MarketplaceAuctionBidValidation }
  | { type: 'winner_selected'; winner?: MarketplaceAuctionBidValidation; bids: MarketplaceAuctionBidValidation[] }
  | {
      type: 'settlement_published'
      action: PaymentSettlementAction
      bid: ParsedMarketplaceAuctionBid
      payment: ParsedPayment
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
  MarketplacePaymentSweepInput,
  MarketplacePaymentSweepState,
  MarketplacePaymentSettlementIntent,
  MarketplacePaymentSettlementState,
  MarketplacePolicySwapResumeContext,
  MarketplacePolicySwapResumeState,
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
  MarketplacePaymentSweepInput,
  MarketplacePaymentSweepState,
  MarketplacePaymentSettlementIntent,
  MarketplacePaymentSettlementState,
  MarketplacePolicySwapResumeContext,
  MarketplacePolicySwapResumeState,
  MarketplaceAuctionPaymentSettlementIntent,
  MarketplaceAuctionPaymentSettlementResult
>

export type MarketplaceOrderDriver<State = MarketplacePolicyPaymentState> = MarketplaceOrderPolicy<State>

export type MarketplaceAuctionDriver<State = MarketplacePolicyPaymentState> = MarketplaceBidPolicy<State>

export type MarketplacePaymentPolicyImplementation<State = MarketplacePolicyPaymentState> =
  | MarketplaceOrderPolicy<State>
  | MarketplaceBidPolicy<State>

export type MarketplaceSessionDriverKind = 'order' | 'auction'

export type MarketplaceSessionDriverStatus = 'idle' | 'starting' | 'ready' | 'recovering' | 'error'

export type MarketplaceSessionDriverState = {
  id: string
  label: string
  kind: MarketplaceSessionDriverKind
  status: MarketplaceSessionDriverStatus
  updatedAt: number
  error?: string
}

export type MarketplaceSessionDriverRecoveryFailure = {
  operationId?: string
  error: string
}

export type MarketplaceSessionDriverRecoveryState = {
  active: number
  resumed: number
  settled: number
  failed: number
  failures: MarketplaceSessionDriverRecoveryFailure[]
  updatedAt: number
}

export type MarketplaceSessionDriverRecoveryEvent =
  | { type: 'started'; at: number; data?: Record<string, unknown> }
  | { type: 'progress'; at: number; status: string; data?: Record<string, unknown> }
  | { type: 'resumed'; at: number; data?: Record<string, unknown> }
  | { type: 'failed'; at: number; error: string; data?: Record<string, unknown> }
  | { type: 'complete'; at: number; data?: Record<string, unknown> }

export type MarketplaceSessionDriver = {
  readonly id: string
  readonly label: string
  readonly kind: MarketplaceSessionDriverKind
  readonly state: MarketplaceValue<MarketplaceSessionDriverState>
  readonly recovery: MarketplaceValue<MarketplaceSessionDriverRecoveryState>
  readonly recoveryStream: MarketplaceStream<MarketplaceSessionDriverRecoveryEvent, MarketplaceSessionDriverRecoveryEvent[]>
}

export type MarketplaceSessionDriversApi = {
  readonly all: MarketplaceSessionDriver[]
  readonly orders: MarketplaceSessionDriver[]
  readonly auctions: MarketplaceSessionDriver[]
  byId(id: string): MarketplaceSessionDriver | undefined
  each(callback: (driver: MarketplaceSessionDriver) => void): void
}

export type MarketplaceDriverRuntimeReporter = {
  starting(policy: MarketplacePaymentPolicyImplementation): void
  started(policy: MarketplacePaymentPolicyImplementation, result?: MarketplacePolicyStartResult): void
  ready(policy: MarketplacePaymentPolicyImplementation): void
  recovering(policy: MarketplacePaymentPolicyImplementation): void
  failed(policy: MarketplacePaymentPolicyImplementation, error: unknown): void
  swapResumeState(policy: MarketplacePaymentPolicyImplementation, state: MarketplacePolicySwapResumeState): void
  swapResumeComplete(policy: MarketplacePaymentPolicyImplementation): void
}

export type MarketplacePayOptions = {
  seed?: string
  now?: number
  accountIndex?: number
  route?: MarketplacePaymentRoute
  settlementId?: string
  identityProofPrivacy?: MarketplaceIdentityProofMode
  paymentProofPrivacy?: PaymentProofPrivacy
  paymentTermsPrivacy?: PaymentTermsPrivacy
  paymentAmountPrivacy?: PaymentAmountPrivacy
}

export type MarketplaceIdentityProofMode = 'none' | 'public' | 'sealed'

export type MarketplaceResolvedPayOptions = MarketplacePayOptions & { accountIndex: number }

export type MarketplacePaymentRouteOptions = {
  amount?: MarketplaceAmount
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
  driverRuntime?: MarketplaceDriverRuntimeReporter
  autoTrustArbiter?: string | string[]
  paymentMethod?: MarketplacePaymentMethodDefaults
  locationProvider?: MarketplaceLocationProvider
  logger?: MarketplaceLogger
  onInvalidEvent?: MarketplaceInvalidEventHandler
}

export type MarketplaceArbitrationStartEvent =
  | { type: 'started'; identity: MarketplaceOrderIdentity }
  | { type: 'group'; group: ParsedOrderGroup }
  | { type: 'payment_seen'; group: ParsedOrderGroup; payment: ParsedPayment }
  | {
      type: 'payment_validated'
      group: ParsedOrderGroup
      payment: ParsedPayment
      validation: MarketplacePaymentValidationResult
    }
  | {
      type: 'payment_ack_published'
      group: ParsedOrderGroup
      payment: ParsedPayment
      validation: MarketplacePaymentValidationResult
      event: Event
    }
  | {
      type: 'payment_nack_published'
      group: ParsedOrderGroup
      payment: ParsedPayment
      validation: MarketplacePaymentValidationResult
      event: Event
    }
  | { type: 'auction_seen'; auction: ParsedMarketplaceAuction }
  | { type: 'auction_scheduled'; auction: ParsedMarketplaceAuction; settleAt: number; delayMs: number }
  | { type: 'auction_bid_group'; auction: ParsedMarketplaceAuction; group: ParsedAuctionBidGroup }
  | { type: 'auction_bid_payment_seen'; auction: ParsedMarketplaceAuction; group: ParsedAuctionBidGroup; payment: ParsedPayment }
  | {
      type: 'auction_bid_payment_validated'
      auction: ParsedMarketplaceAuction
      group: ParsedAuctionBidGroup
      payment: ParsedPayment
      validation: MarketplacePaymentValidationResult
    }
  | {
      type: 'auction_bid_payment_ack_published'
      auction: ParsedMarketplaceAuction
      group: ParsedAuctionBidGroup
      payment: ParsedPayment
      validation: MarketplacePaymentValidationResult
      event: Event
    }
  | {
      type: 'auction_bid_payment_nack_published'
      auction: ParsedMarketplaceAuction
      group: ParsedAuctionBidGroup
      payment?: ParsedPayment
      validation?: MarketplacePaymentValidationResult
      event: Event
    }
  | { type: 'auction_settlement_started'; auction: ParsedMarketplaceAuction }
  | { type: 'auction_settlement_state'; auction: ParsedMarketplaceAuction; state: MarketplaceAuctionSettlementState }
  | { type: 'auction_settlement_completed'; auction: ParsedMarketplaceAuction; winner?: MarketplaceAuctionBidValidation }
  | { type: 'auction_ignored'; auction?: ParsedMarketplaceAuction; group?: ParsedAuctionBidGroup; payment?: ParsedPayment; reason: string }
  | { type: 'auction_error'; auction?: ParsedMarketplaceAuction; group?: ParsedAuctionBidGroup; payment?: ParsedPayment; error: Error }
  | { type: 'ignored'; group?: ParsedOrderGroup; payment?: ParsedPayment; reason: string }
  | { type: 'error'; group?: ParsedOrderGroup; payment?: ParsedPayment; error: Error }
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

export type MarketplaceDriverOptions = {
  orderDrivers?: MarketplaceOrderDriver[]
  auctionDrivers?: MarketplaceAuctionDriver[]
}

export type MarketplaceBindOptions = Omit<MarketplaceRuntimeOptions, 'pool' | 'relays' | 'orderPolicies' | 'bidPolicies'> &
  MarketplaceDriverOptions

export type MarketplaceSessionOptions = Omit<MarketplaceRuntimeOptions, 'pool' | 'relays' | 'identity' | 'seed' | 'signer' | 'publish' | 'orderPolicies' | 'bidPolicies'> &
  MarketplaceDriverOptions & {
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
    options?: ListingSearchOptions,
  ): ReturnType<typeof findListing>
  findById(id: string, options?: ListingSearchOptions): ReturnType<typeof findListingById>
  findByAnchor(anchor: string, options?: ListingSearchOptions): ReturnType<typeof findListingByAnchor>
  search(query?: ListingSearchQuery, options?: ListingSearchOptions): Promise<MarketplaceListing[]>
}

export interface MarketplaceShippingOptionApi {
  kind: typeof MarketplaceShippingOption
  parse: typeof parseShippingOptionEvent
  validate: typeof validateShippingOptionEvent
  address: typeof shippingOptionAddress
  template: typeof generateShippingOptionEventTemplate
  filter: typeof shippingOptionSearchFilter
  filters: { search: typeof shippingOptionSearchFilter }
  search(query?: ShippingOptionSearchQuery, options?: ShippingOptionSearchOptions): Promise<ParsedMarketplaceShippingOption[]>
}

export interface MarketplacePaymentMethodApi {
  parse: typeof parsePaymentMethodEvent
  validate: typeof validatePaymentMethodEvent
  template: typeof generatePaymentMethodEventTemplate
  filter: typeof paymentMethodFilter
  findOne(query?: PaymentMethodFindQuery, options?: PaymentMethodFindOptions): Promise<ParsedPaymentMethod | null>
  canonicalAssetId: typeof canonicalAssetId
}

export interface MarketplaceArbitrationServicesApi {
  parse: typeof parseArbitrationServiceEvent
  validate: typeof validateArbitrationServiceEvent
  template: typeof generateArbitrationServiceEventTemplate
  filter: typeof arbitrationServiceFilter
  search(query?: ArbitrationServiceFindQuery, options?: ArbitrationServiceSearchOptions): Promise<ParsedArbitrationService[]>
  findOne(query?: ArbitrationServiceFindQuery, options?: ArbitrationServiceSearchOptions): Promise<ParsedArbitrationService | null>
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
  groups: MarketplaceOrderGroupsApi
  negotiate(
    listing: Event | MarketplaceListing,
    order: MarketplaceOrderNegotiationOptions,
  ): Promise<MarketplaceOrderNegotiationResult>
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

export type MarketplaceMeOrdersQuery = Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity }

export type MarketplaceMeOrdersSnapshot = {
  placed: ParsedOrderGroup[]
  received: ParsedOrderGroup[]
  arbitrating: ParsedOrderGroup[]
  all: ParsedOrderGroup[]
}

export type MarketplaceMeOrdersStream = MarketplaceStream<OrderGroupEvent, MarketplaceMeOrdersSnapshot>

export type MarketplaceMeOrderRoleStream = MarketplaceStream<OrderGroupEvent, ParsedOrderGroup[]>

export interface MarketplaceMeOrderRoleApi {
  list(
    query?: MarketplaceMeOrdersQuery,
    options?: OrderGroupSearchOptions,
  ): Promise<ParsedOrderGroup[]>
  watch(
    query?: MarketplaceMeOrdersQuery,
    options?: OrderSubscribeOptions & ReduceOrderGroupOptions,
  ): MarketplaceMeOrderRoleStream
}

export interface MarketplaceMeOrdersApi {
  list(
    query?: MarketplaceMeOrdersQuery,
    options?: OrderGroupSearchOptions,
  ): Promise<MarketplaceMeOrdersSnapshot>
  watch(
    query?: MarketplaceMeOrdersQuery,
    options?: OrderSubscribeOptions & ReduceOrderGroupOptions,
  ): MarketplaceMeOrdersStream
  placed: MarketplaceMeOrderRoleApi
  received: MarketplaceMeOrderRoleApi
  arbitrating: MarketplaceMeOrderRoleApi
  resolveParticipants: typeof resolveOrderGroupParticipants
}

export type MarketplaceMeBidsQuery = Omit<AuctionBidGroupQuery, 'identity'> & { identity?: MarketplaceOrderIdentity }

export type MarketplaceMeBidsSnapshot = {
  placed: ParsedAuctionBidGroup[]
  received: ParsedAuctionBidGroup[]
  arbitrating: ParsedAuctionBidGroup[]
  all: ParsedAuctionBidGroup[]
}

export type MarketplaceMeBidsStream = MarketplaceStream<AuctionBidGroupEvent, MarketplaceMeBidsSnapshot>

export type MarketplaceMeBidRoleStream = MarketplaceStream<AuctionBidGroupEvent, ParsedAuctionBidGroup[]>

export interface MarketplaceMeBidRoleApi {
  list(
    query?: MarketplaceMeBidsQuery,
    options?: AuctionBidGroupSearchOptions,
  ): Promise<ParsedAuctionBidGroup[]>
  watch(
    query?: MarketplaceMeBidsQuery,
    options?: AuctionBidGroupSubscribeOptions,
  ): MarketplaceMeBidRoleStream
}

export interface MarketplaceMeBidsApi {
  list(
    query?: MarketplaceMeBidsQuery,
    options?: AuctionBidGroupSearchOptions,
  ): Promise<MarketplaceMeBidsSnapshot>
  watch(
    query?: MarketplaceMeBidsQuery,
    options?: AuctionBidGroupSubscribeOptions,
  ): MarketplaceMeBidsStream
  placed: MarketplaceMeBidRoleApi
  received: MarketplaceMeBidRoleApi
  arbitrating: MarketplaceMeBidRoleApi
}

export interface MarketplaceMeInboxApi {
  filter: typeof marketplaceInboxFilter
  list(
    query?: MarketplaceInboxQuery,
    options?: MarketplaceInboxFetchOptions,
  ): Promise<MarketplaceInboxItem[]>
  watch(
    query?: MarketplaceInboxQuery,
    options?: MarketplaceInboxSubscribeOptions,
  ): MarketplaceInboxStream
}

export type MarketplaceMePaymentsQuery = {
  identity?: MarketplaceOrderIdentity
  paymentIds?: string[]
  authors?: string[]
  participantPubkeys?: string[]
  since?: number
  until?: number
  limit?: number
}

export type MarketplaceMePaymentsSearchOptions = OrderSearchOptions & { now?: number }

export type MarketplaceMePaymentsSubscribeOptions = OrderSubscribeOptions & { now?: number }

export type MarketplacePaymentSweepStatus = 'pending' | 'sweeping' | 'swept' | 'noop' | 'failed'

export type MarketplacePaymentSweepRecord = {
  paymentId: string
  tradeId: string
  orderGroupId: string
  anchors?: PaymentLifecycleAnchors
  listingAnchor: string
  driver?: string
  status: MarketplacePaymentSweepStatus
  reason: 'payment' | 'settlement' | 'retry'
  payment?: ParsedPayment
  settlements: ParsedPaymentSettlement[]
  latest?: MarketplacePaymentSweepState
  error?: string
  attempts: number
  updatedAt: number
}

export type MarketplaceMePaymentsSnapshot = {
  pending: MarketplacePaymentSweepRecord[]
  sweeping: MarketplacePaymentSweepRecord[]
  swept: MarketplacePaymentSweepRecord[]
  noop: MarketplacePaymentSweepRecord[]
  failed: MarketplacePaymentSweepRecord[]
  all: MarketplacePaymentSweepRecord[]
}

export type MarketplaceMePaymentsStream = MarketplaceStream<
  MarketplacePaymentSweepRecord,
  MarketplaceMePaymentsSnapshot
>

export interface MarketplaceMePaymentsApi {
  list(
    query?: MarketplaceMePaymentsQuery,
    options?: MarketplaceMePaymentsSearchOptions,
  ): Promise<MarketplaceMePaymentsSnapshot>
  watch(
    query?: MarketplaceMePaymentsQuery,
    options?: MarketplaceMePaymentsSubscribeOptions,
  ): MarketplaceMePaymentsStream
}

export interface MarketplaceMeApi {
  orders: MarketplaceMeOrdersApi
  bids: MarketplaceMeBidsApi
  inbox: MarketplaceMeInboxApi
  payments: MarketplaceMePaymentsApi
}

export type MarketplaceAuctionLookupOptions = MarketplaceAuctionScopeOptions

export interface MarketplaceAuctionsApi {
  parse: typeof parseAuctionEvent
  validate: typeof validateAuctionEvent
  address: typeof auctionAddress
  bidChainId: typeof auctionBidChainId
  template: typeof generateAuctionEventTemplate
  filters: typeof auctionSearchFilters
  get(query: MarketplaceAuctionScopeQuery, options?: MarketplaceAuctionLookupOptions): Promise<MarketplaceAuctionScopesSnapshot>
  watch(query: MarketplaceAuctionScopeQuery, options?: MarketplaceAuctionLookupOptions): MarketplaceAuctionScopeStream
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
      identityProofPrivacy?: MarketplaceIdentityProofMode
      participantProofs?: OrderTemplate['participantProofs']
      participantProofKeys?: OrderTemplate['participantProofKeys']
    },
  ): AsyncIterable<MarketplaceAuctionBidState>
  settle(request: MarketplaceAuctionSettlementRequest): AsyncIterable<MarketplaceAuctionSettlementState>
}

export interface MarketplaceSessionOrdersApi extends MarketplaceOrdersApi {
  paymentRoutes(
    listing: Event | MarketplaceListing,
    options?: MarketplacePaymentRouteOptions | null,
  ): Promise<MarketplacePaymentRoute[]>
  paymentRoute(
    listing: Event | MarketplaceListing,
    options?: MarketplacePaymentRouteOptions | null,
  ): Promise<MarketplacePaymentRoute | undefined>
}

export interface MarketplaceSessionAuctionsApi extends MarketplaceAuctionsApi {
  paymentRoutes(
    listing: Event | MarketplaceListing,
    auction: Event | ParsedMarketplaceAuction,
    options?: MarketplacePaymentRouteOptions | null,
  ): Promise<MarketplacePaymentRoute[]>
  paymentRoutes(
    listing: Event | MarketplaceListing,
    options?: MarketplacePaymentRouteOptions | null,
  ): Promise<MarketplacePaymentRoute[]>
  paymentRoute(
    listing: Event | MarketplaceListing,
    auction: Event | ParsedMarketplaceAuction,
    options?: MarketplacePaymentRouteOptions | null,
  ): Promise<MarketplacePaymentRoute | undefined>
  paymentRoute(
    listing: Event | MarketplaceListing,
    options?: MarketplacePaymentRouteOptions | null,
  ): Promise<MarketplacePaymentRoute | undefined>
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
  subscribe(
    query: AuctionBidGroupQuery,
    handlers: AuctionBidGroupSubscribeHandlers,
    options?: AuctionBidGroupSubscribeOptions,
  ): ReturnType<typeof subscribeAuctionBidGroups>
}

export interface MarketplacePaymentsApi {
  group: typeof groupPaymentStreams
  terms: typeof paymentTerms
  validateGroup: typeof validatePaymentGroup
  validateGroups: typeof validatePaymentGroupStream
  validate(payment: MarketplacePaymentValidationItem): Promise<MarketplacePaymentValidationResult>
}

export interface MarketplaceArbitrationApi {
  start(options?: MarketplaceArbitrationStartOptions): MarketplaceArbitrationRuntime
  arbitrate(request: MarketplacePaymentArbitrationRequest): AsyncIterable<MarketplacePaymentArbitrationRuntimeState>
}

export interface MarketplaceClient {
  readonly nextTradeIndex: MarketplaceValue<number | undefined>
  listings: MarketplaceListingsApi
  shippingOption: MarketplaceShippingOptionApi
  locations: MarketplaceLocationsApi
  paymentMethod: MarketplacePaymentMethodApi
  arbitrationServices: MarketplaceArbitrationServicesApi
  arbitrationServiceSelections: MarketplaceArbitrationServiceSelectionsApi
  orders: MarketplaceOrdersApi
  reviews: MarketplaceReviewsApi
  structuredMessages: MarketplaceStructuredMessagesApi
  me: MarketplaceMeApi
  auctions: MarketplaceAuctionsApi
  payments: MarketplacePaymentsApi
  arbitration: MarketplaceArbitrationApi
  discoverHighWatermark(options?: MarketplaceHighWatermarkOptions): Promise<MarketplaceHighWatermarkDiscovery>
  getNextAccountIndex(options?: MarketplaceHighWatermarkOptions): Promise<number>
  start(options?: MarketplaceStartOptions): Promise<MarketplaceStartResult>
  session(signer: MarketplaceSeedSigner, options?: MarketplaceSessionOptions): Promise<MarketplaceSession>
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

export type MarketplaceSessionSeedOwnershipPath = {
  from?: number
  through?: number
  lookahead?: number
}

export interface MarketplaceSessionSeedApi {
  created: boolean
  event?: Event
  ensureCreated(options?: MarketplaceSessionSeedEnsureOptions): Promise<MarketplaceSessionSeedEnsureResult>
  owns(pubkey: string, path?: MarketplaceSessionSeedOwnershipPath): boolean
}

export interface MarketplaceSession extends Omit<MarketplaceClient, 'orders' | 'auctions'> {
  identity: {
    pubkey: string
  }
  orders: MarketplaceSessionOrdersApi
  auctions: MarketplaceSessionAuctionsApi
  seed: MarketplaceSessionSeedApi
  paymentMethod: MarketplaceSessionPaymentMethodApi
  drivers: MarketplaceSessionDriversApi
}
