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

export type MarketplacePolicyWatermarkRecoveryAction = {
  policy: string
  type: string
  index?: number
  data?: Record<string, unknown>
}

export type MarketplacePolicyWatermarkContext = {
  seed: string
  highWaterMark: number
  unusedWindow: number
  now?: number
}

export type MarketplacePolicyWatermarkDiscovery = {
  policy: string
  maxUsedIndex: number
  nextUnusedIndex?: number
  highWaterMark?: number
  scannedFrom?: number
  scannedThrough?: number
  unusedWindow?: number
  usedIndexes?: number[]
  recoveryActions?: MarketplacePolicyWatermarkRecoveryAction[] | unknown[]
}

export type MarketplacePolicyStartContext = {
  seed: string
  highWaterMark: number
  nextUnusedIndex: number
  unusedWindow: number
  discovery: MarketplaceHighWatermarkDiscovery
  now?: number
}

export type MarketplacePolicyStartResult = {
  policy: string
  recoveryActions?: MarketplacePolicyWatermarkRecoveryAction[] | unknown[]
  data?: Record<string, unknown>
}

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
  trustedEscrowPubkeys?: string[]
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
  | { status: 'skipped'; reason: 'no_listings' | 'no_trusted_escrows' | 'no_policy_contributions' }
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
  escrowService: ParsedEscrowService
  descriptor: MarketplacePaymentPolicy
  asset: MarketplacePaymentAsset
  score: number
}

export type MarketplacePaymentPolicy = {
  method: PaymentMethod
  id: string
  hash?: string
  type?: string
  chainId?: number
  contractAddress?: string
  data?: Record<string, unknown>
}

export type MarketplacePaymentAsset = {
  method: PaymentMethod
  assetId: string
  denomination: string
  decimals: number
  appId?: string
  chainId?: number
  assetAddress?: string
  data?: Record<string, unknown>
}

export type MarketplacePaymentIdentity = {
  pubkey?: string
  address?: string
  data?: Record<string, unknown>
}

export type MarketplacePaymentContract = {
  type: string
  chainId?: number
  address?: string
  bytecodeHash?: string
  params: Record<string, unknown>
}

export type MarketplacePaymentIntent = {
  method: PaymentMethod
  subject: 'order' | 'bid'
  tradeId: string
  settlementId: string
  accountIndex: number
  seed?: string
  amount: MarketplaceAmount
  fee: MarketplaceAmount
  asset: MarketplacePaymentAsset
  policy: MarketplacePaymentPolicy
  contract: MarketplacePaymentContract
  participants: {
    buyer?: MarketplacePaymentIdentity
    seller: MarketplacePaymentIdentity
    escrow: MarketplacePaymentIdentity
  }
  unlockAt: number
  metadata?: Record<string, unknown>
}

export type MarketplacePaymentRecoveryItem = {
  subject: 'order' | 'bid'
  group: ParsedOrderGroup
  payment: ParsedOrderPayment
  proof: PaymentProofEvidence
  expected: MarketplacePaymentValidationRequest['expected']
}

export type MarketplacePaymentRecoveryState =
  | { type: 'noop'; data?: Record<string, unknown> }
  | { type: 'progress'; status: string; data?: Record<string, unknown> }
  | { type: 'recovered'; data?: Record<string, unknown> }
  | { type: 'settlement_ready'; proof: PaymentProofEvidence; data?: Record<string, unknown> }

export type MarketplaceEscrowArbitrationIntent = {
  subject: 'order'
  group: ParsedOrderGroup
  payment: ParsedOrderPayment
  proof: PaymentProofEvidence
  expected: MarketplacePaymentValidationRequest['expected']
  action: PaymentSettlementAction
  outputs?: OrderPaymentSettlementOutput[]
  reason?: string
  data?: Record<string, unknown>
}

export type MarketplaceEscrowArbitrationState =
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

export type MarketplaceEscrowArbitrationRequest = {
  group: ParsedOrderGroup
  payment?: ParsedOrderPayment
  action: PaymentSettlementAction
  outputs?: OrderPaymentSettlementOutput[]
  reason?: string
  data?: Record<string, unknown>
  now?: number
}

export type MarketplaceEscrowArbitrationRuntimeState =
  | MarketplaceEscrowArbitrationState
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
  targetTradeId?: string
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

export type MarketplaceAuctionPaymentSettlementIntent = {
  subject: 'bid'
  action: 'auction_refund' | 'auction_promote'
  bid: ParsedMarketplaceAuctionBid
  payment: ParsedOrderPayment
  proof: PaymentProofEvidence
  expected: MarketplacePaymentValidationRequest['expected']
  validation: MarketplacePaymentValidationResult
  refundPercent?: number
  winner?: MarketplaceAuctionBidValidation
  targetTradeId?: string
  targetOrderGroupId?: string
  targetUnlockAt?: number
  recycleArgs?: unknown
  data?: Record<string, unknown>
}

export type MarketplaceAuctionPaymentSettlementResult = {
  proof: PaymentProofEvidence
  inputs?: Array<Record<string, unknown>>
  outputs?: OrderPaymentSettlementOutput[]
  data?: Record<string, unknown>
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

export type MarketplaceBolt11PaymentRequest = {
  type: 'bolt11'
  bolt11: string
  amount?: MarketplaceAmount
  description?: string
  expiresAt?: number
  data?: Record<string, unknown>
}

export type MarketplacePaymentRequest = MarketplaceBolt11PaymentRequest

export type MarketplacePolicyPaymentRequiredState = {
  type: 'payment_required'
  request: MarketplacePaymentRequest
  proof?: PaymentProofEvidence | null
  data?: Record<string, unknown>
}

export type MarketplacePolicyPaymentProgressState = {
  type: 'payment_progress'
  status: string
  proof?: PaymentProofEvidence | null
  data?: Record<string, unknown>
}

export type MarketplacePolicyPaymentPaidState = {
  type: 'paid'
  proof: PaymentProofEvidence
  data?: Record<string, unknown>
}

export type MarketplacePolicyPaymentCompletedState = {
  type: 'completed'
  proof?: PaymentProofEvidence | null
  data?: Record<string, unknown>
}

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

export type MarketplacePaymentPolicyImplementation<State = MarketplacePolicyPaymentState> = {
  method: PaymentMethod
  id?: string
  subject: 'order' | 'bid'
  family: 'escrow' | 'auction' | string
  policies(): MarketplacePaymentPolicy[]
  assets(): MarketplacePaymentAsset[]
  discoverHighWatermark?: (
    context: MarketplacePolicyWatermarkContext,
  ) => MarketplacePolicyWatermarkDiscovery | Promise<MarketplacePolicyWatermarkDiscovery>
  startup?: (
    context: MarketplacePolicyStartContext,
  ) => void | MarketplacePolicyStartResult | Promise<void | MarketplacePolicyStartResult>
  pay(intent: MarketplacePaymentIntent): AsyncIterable<State> | Promise<AsyncIterable<State>>
  recover?: (
    payment: MarketplacePaymentRecoveryItem,
  ) => AsyncIterable<MarketplacePaymentRecoveryState> | Promise<AsyncIterable<MarketplacePaymentRecoveryState>>
  arbitrate?: (
    intent: MarketplaceEscrowArbitrationIntent,
  ) => AsyncIterable<MarketplaceEscrowArbitrationState> | Promise<AsyncIterable<MarketplaceEscrowArbitrationState>>
  validatePayment?: (request: MarketplacePaymentValidationRequest) => Promise<MarketplacePaymentValidationResult>
  refundPayment?: (
    intent: MarketplaceAuctionPaymentSettlementIntent & { action: 'auction_refund'; refundPercent: number },
  ) => Promise<MarketplaceAuctionPaymentSettlementResult>
  recyclePayment?: (
    intent: MarketplaceAuctionPaymentSettlementIntent & {
      action: 'auction_promote'
      targetTradeId: string
      targetOrderGroupId: string
    },
  ) => Promise<MarketplaceAuctionPaymentSettlementResult>
}

export type MarketplaceOrderPolicy<State = MarketplacePolicyPaymentState> =
  MarketplacePaymentPolicyImplementation<State> & {
    subject: 'order'
    family: 'escrow'
  }

export type MarketplaceBidPolicy<State = MarketplacePolicyPaymentState> =
  MarketplacePaymentPolicyImplementation<State> & {
    subject: 'bid'
    family: 'auction'
  }

export type MarketplacePayOptions = {
  accountIndex?: number
  seed?: string
  now?: number
  route?: MarketplacePaymentRoute
  settlementId?: string
}

export type MarketplaceResolvedPayOptions = MarketplacePayOptions & { accountIndex: number }

export type MarketplacePaymentRouteOptions = {
  subject?: 'order' | 'bid'
}

export type MarketplaceOrderCreateParams = Omit<OrderTemplate, 'tradeId' | 'listingAnchor'> &
  Partial<Pick<OrderTemplate, 'tradeId' | 'listingAnchor'>>

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
  autoTrustEscrow?: string | string[]
  paymentMethod?: MarketplacePaymentMethodDefaults
}

export type MarketplaceEscrowStartEvent =
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

export type MarketplaceEscrowStartOptions =
  Omit<OrderQuery, 'identity'> &
  OrderSubscribeOptions &
  ReduceOrderGroupOptions & {
    identity?: MarketplaceOrderIdentity
    autoAck?: boolean
    autoNack?: boolean
    orders?: boolean
    auctions?: boolean
    autoSettleAuctions?: boolean
    auctionQuery?: Omit<MarketplaceAuctionSearchQuery, 'arbiterPubkeys'>
    auctionBidQuery?: Omit<AuctionBidGroupQuery, 'auctionAnchor' | 'participantPubkeys'>
    auctionSettlement?: Omit<MarketplaceAuctionSettlementRequest, 'auctionAnchor' | 'auctionId' | 'listingAnchor'>
    now?: number
    onstate?: (event: MarketplaceEscrowStartEvent) => void | Promise<void>
  }

export type MarketplaceEscrowRuntime = {
  close(reason?: string): void
  processGroup(group: ParsedOrderGroup): Promise<void>
  processAuction(auction: ParsedMarketplaceAuction): Promise<void>
  processAuctionBidGroup(auction: ParsedMarketplaceAuction, group: ParsedAuctionBidGroup): Promise<void>
  settleAuction(auction: ParsedMarketplaceAuction): Promise<void>
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
  parse: typeof parseListingEvent
  validate: typeof validateListingEvent
  create: typeof generateListingEventTemplate
  template: typeof generateListingEventTemplate
  filters: { search: typeof listingSearchFilter }
  search(query?: ListingSearchQuery): Promise<MarketplaceListing[]>
}

export interface MarketplacePaymentMethodApi {
  parse: typeof parsePaymentMethodEvent
  validate: typeof validatePaymentMethodEvent
  template: typeof generatePaymentMethodEventTemplate
  filter: typeof paymentMethodFilter
  findOne(query?: PaymentMethodFindQuery): Promise<ParsedPaymentMethod | null>
  canonicalAssetId: typeof canonicalAssetId
}

export interface MarketplaceEscrowServicesApi {
  parse: typeof parseEscrowServiceEvent
  validate: typeof validateEscrowServiceEvent
  template: typeof generateEscrowServiceEventTemplate
  filter: typeof escrowServiceFilter
  search(query?: EscrowServiceFindQuery): Promise<ParsedEscrowService[]>
  findOne(query?: EscrowServiceFindQuery): Promise<ParsedEscrowService | null>
  calculateFee: typeof calculateEscrowFee
}

export interface MarketplaceEscrowServiceSelectionsApi {
  parse: typeof parseEscrowServiceSelectionEvent
  validate: typeof validateEscrowServiceSelectionEvent
  template: typeof generateEscrowServiceSelectionEventTemplate
}

export interface MarketplaceOrderGroupsApi {
  id: typeof orderGroupIdForParticipants
  idForOrder: typeof orderGroupIdForOrder
  participants: typeof orderGroupParticipantPubkeys
  filter: typeof orderGroupFilter
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
  mine(
    query?: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    options?: OrderGroupSearchOptions,
  ): Promise<OrderGroupBuckets>
  subscribeMine(
    query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    handlers: OrderGroupSubscribeHandlers & { onbuckets?: (buckets: OrderGroupBuckets) => void },
    options?: OrderSubscribeOptions & ReduceOrderGroupOptions,
  ): ReturnType<typeof subscribeMyOrderGroups>
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
  mine(
    query?: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    options?: OrderSearchOptions,
  ): Promise<ParsedOrder[]>
  subscribeMine(
    query: Omit<OrderQuery, 'identity'> & { identity?: MarketplaceOrderIdentity },
    handlers: OrderSubscribeHandlers,
    options?: OrderSubscribeOptions,
  ): ReturnType<typeof subscribeOrders>
  groups: MarketplaceOrderGroupsApi
}

export interface MarketplaceReviewsApi {
  parse: typeof parseReviewEvent
  validate: typeof validateReviewEvent
  template: typeof generateReviewEventTemplate
}

export interface MarketplaceStructuredMessagesApi {
  parse(event: Event): ParsedStructuredMessage
  validate: typeof validateStructuredMessageEvent
  template: typeof generateStructuredMessageEventTemplate
}

export interface MarketplacePaymentRoutesApi {
  forListing(listing: Event | MarketplaceListing, order?: OrderTemplate | null): Promise<MarketplacePaymentRoute[]>
}

export interface MarketplaceAuctionsApi {
  parse: typeof parseAuctionEvent
  validate: typeof validateAuctionEvent
  address: typeof auctionAddress
  template: typeof generateAuctionEventTemplate
  filters: typeof auctionSearchFilters
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
  paymentRoutes: {
    forListing(listing: Event | MarketplaceListing, bid?: Partial<OrderTemplate> | null): Promise<MarketplacePaymentRoute[]>
  }
  bidGroups: MarketplaceAuctionBidGroupsApi
  bid(
    listing: Event | MarketplaceListing,
    bid: Partial<MarketplaceAuctionBidTemplate> & { amount: MarketplaceAmount },
    options?: MarketplacePayOptions & { auction?: Event | ParsedMarketplaceAuction; participantProofs?: OrderTemplate['participantProofs'] },
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
  reduce: typeof reduceAuctionBidGroup
  group: typeof groupAuctionBidEvents
  fetch(query: AuctionBidGroupQuery, options?: AuctionBidGroupSearchOptions): Promise<ParsedAuctionBidGroup[]>
  subscribe(
    query: AuctionBidGroupQuery,
    handlers: AuctionBidGroupSubscribeHandlers,
    options?: AuctionBidGroupSubscribeOptions,
  ): ReturnType<typeof subscribeAuctionBidGroups>
}

export interface MarketplacePaymentsApi {
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

export interface MarketplaceEscrowApi {
  start(options?: MarketplaceEscrowStartOptions): MarketplaceEscrowRuntime
  arbitrate(request: MarketplaceEscrowArbitrationRequest): AsyncIterable<MarketplaceEscrowArbitrationRuntimeState>
}

export interface MarketplaceClient {
  listings: MarketplaceListingsApi
  paymentMethod: MarketplacePaymentMethodApi
  escrowServices: MarketplaceEscrowServicesApi
  escrowServiceSelections: MarketplaceEscrowServiceSelectionsApi
  orders: MarketplaceOrdersApi
  reviews: MarketplaceReviewsApi
  structuredMessages: MarketplaceStructuredMessagesApi
  paymentRoutes: MarketplacePaymentRoutesApi
  auctions: MarketplaceAuctionsApi
  payments: MarketplacePaymentsApi
  escrow: MarketplaceEscrowApi
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
