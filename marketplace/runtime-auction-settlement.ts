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
import { amountCurrency, parseEventJson } from './helper.ts'
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
import {
  isPaymentValidationAccepted,
  normalizePaymentValidationResult,
} from './payment-validation.ts'
import { resolvePaymentAmount } from './payment-amount.ts'
import { paymentProofParamsDecryptor, resolvePaymentProof } from './payment-proof.ts'
import { isMarketplaceDriverEncryptedPaymentProofParams } from '@sudonym-btc/marketplace-driver-interface'
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
  policyName,
  publishMarketplaceTemplate,
  requireArbitrationPublisher,
} from './runtime-common.ts'

type MarketplaceAuctionPaymentItem = {
  purpose: 'bid'
  bid: ParsedMarketplaceAuctionBid
  payment: ParsedOrderPayment
  proof: PaymentProofEvidence
  expected?: MarketplacePaymentValidationRequest['expected']
  now?: number
}

type MarketplaceAuctionSettlementPlan = {
  bid: MarketplaceAuctionBidValidation
  action: 'auction_refund' | 'auction_promote'
  result: MarketplaceAuctionPaymentSettlementResult
  targetTradeId?: string
  targetOrderGroupId?: string
  targetOrderTemplate?: OrderTemplate
}

export function stringParam(params: Record<string, unknown>, name: string): string | undefined {
  const value = params[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function numberParam(params: Record<string, unknown>, name: string): number | undefined {
  const value = params[name]
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : undefined
}

export function arbitrationServiceEventFrom(payment: ParsedOrderPayment, proof = payment.content.proof): Event | undefined {
  const service = proof?.arbitration?.arbitrationService
  if (!service) return undefined
  try {
    return typeof service === 'string' ? parseEventJson(service, 'arbitrationService') : service
  } catch (_) {
    return undefined
  }
}

export function paymentMethodEventFrom(payment: ParsedOrderPayment, proof = payment.content.proof): Event | undefined {
  const method = proof?.arbitration?.paymentMethod
  if (!method) return undefined
  try {
    return typeof method === 'string' ? parseEventJson(method, 'paymentMethod') : method
  } catch (_) {
    return undefined
  }
}

export function auctionAnchorForRequest(request: MarketplaceAuctionSettlementRequest): string {
  if (request.auctionAnchor) return request.auctionAnchor
  if (request.auctionId) return request.auctionId
  throw new Error('Auction settlement requires an auctionAnchor')
}

export function auctionIdForRequest(request: MarketplaceAuctionSettlementRequest): string {
  return request.auctionId ?? request.auctionAnchor ?? 'auction'
}

export function invalidPaymentResult(
  bid: ParsedMarketplaceAuctionBid,
  payment?: ParsedOrderPayment,
  error = 'No bid payment found',
): MarketplacePaymentValidationResult {
  return {
    driver: payment?.content.proof?.paymentProof?.driver ?? 'none',
    status: 'unverifiable',
    ...(payment ? { proofEventId: payment.event.id } : {}),
    data: { bidEventId: bid.event.id },
    error,
  }
}

export function bidValue(bid: ParsedMarketplaceAuctionBid): bigint {
  const value = bid.amount.value
  if (value === undefined || !/^\d+$/.test(value)) return -1n
  return BigInt(value)
}

export function higherBid(
  left: MarketplaceAuctionBidValidation | undefined,
  right: MarketplaceAuctionBidValidation,
): MarketplaceAuctionBidValidation {
  if (!left) return right
  const leftValue = bidValue(left.bid)
  const rightValue = bidValue(right.bid)
  if (rightValue !== leftValue) return rightValue > leftValue ? right : left
  if (right.bid.event.created_at !== left.bid.event.created_at) {
    return right.bid.event.created_at < left.bid.event.created_at ? right : left
  }
  return right.bid.event.id.localeCompare(left.bid.event.id) < 0 ? right : left
}

export function auctionSettlementData(input: {
  action: PaymentSettlementAction
  auctionId: string
  auctionAnchor: string
  bid: MarketplaceAuctionBidValidation
  winner?: MarketplaceAuctionBidValidation
  proof?: PaymentProofEvidence
  sourceProof?: PaymentProofEvidence
  targetTradeId?: string
  targetOrderGroupId?: string
  targetUnlockAt?: number
  data?: Record<string, unknown>
}): Record<string, unknown> {
  return {
    auctionId: input.auctionId,
    auctionAnchor: input.auctionAnchor,
    bidTradeId: input.bid.bid.tradeId,
    bidEventId: input.bid.bid.event.id,
    bidAmount: input.bid.bid.amount,
    validation: input.bid.validation,
    ...(input.winner ? { winnerTradeId: input.winner.bid.tradeId, winnerEventId: input.winner.bid.event.id } : {}),
    ...(input.targetTradeId ? { targetTradeId: input.targetTradeId } : {}),
    ...(input.targetOrderGroupId ? { targetOrderGroupId: input.targetOrderGroupId } : {}),
    ...(input.targetUnlockAt !== undefined ? { targetUnlockAt: input.targetUnlockAt } : {}),
    ...(input.sourceProof ? { sourceProof: input.sourceProof } : {}),
    ...(input.proof ? { proof: input.proof } : {}),
    ...(input.data ?? {}),
  }
}

export function parseAuctionPaymentInput(payment: Event | ParsedOrderPayment | undefined): ParsedOrderPayment | undefined {
  if (!payment) return undefined
  return 'event' in payment ? payment : parseOrderPaymentEvent(payment)
}

export function parseAuctionBidInput(bid: Event | ParsedMarketplaceAuctionBid): ParsedMarketplaceAuctionBid {
  return 'event' in bid ? bid : parseAuctionBidEvent(bid)
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function valuesMatch(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function validateAuctionBidAgainstRequest(
  bid: ParsedMarketplaceAuctionBid,
  payment: ParsedOrderPayment | undefined,
  request: MarketplaceAuctionSettlementRequest,
): string | undefined {
  const auctionAnchor = auctionAnchorForRequest(request)
  if (bid.auctionAnchor !== auctionAnchor) return 'Bid does not belong to auction'
  if (request.listingAnchor && bid.listingAnchor !== request.listingAnchor) return 'Bid listing does not match auction listing'
  if (payment && payment.listingAnchor !== auctionAnchor) {
    return 'Payment is not an auction bid lock'
  }
  if (request.currency && bid.amount.denomination !== request.currency) {
    return `Bid must use auction currency ${request.currency}`
  }
  if (request.decimals !== undefined && bid.amount.decimals !== request.decimals) {
    return `Bid must use auction decimals ${request.decimals}`
  }
  if (request.arbiterPubkey && !bid.participants.some(participant =>
    participant.role === 'arbiter' && participant.pubkey === request.arbiterPubkey
  )) {
    return 'Bid does not tag the auction arbiter'
  }
  if (request.startAt !== undefined && bid.event.created_at < request.startAt) {
    return 'Bid was created before the auction started'
  }
  if (request.endAt !== undefined && bid.event.created_at > request.endAt) {
    return 'Bid was created after the auction ended'
  }
  if (
    request.startingBid &&
    /^\d+$/.test(request.startingBid) &&
    bid.amount.value !== undefined &&
    /^\d+$/.test(bid.amount.value) &&
    BigInt(bid.amount.value) < BigInt(request.startingBid)
  ) {
    return 'Bid is below the auction starting bid'
  }
  return undefined
}

export function validateAuctionBidRecycleArgs(
  bid: ParsedMarketplaceAuctionBid,
  proof: PaymentProofEvidence,
  request: MarketplaceAuctionSettlementRequest,
): string | undefined {
  const params = proof && !isMarketplaceDriverEncryptedPaymentProofParams(proof.params)
    ? proof.params as Record<string, unknown>
    : undefined
  const recycleArgs = params ? recordValue(params.recycleArgs) : undefined
  if (!recycleArgs) return 'Auction bid payment is missing recycle covenant parameters'
  const target = recordValue(recycleArgs.target)
  const order = target ? recordValue(target.order) : undefined
  if (!order) return 'Auction bid recycleArgs are missing target order parameters'
  const expected = {
    ...(bid.content.targetOrder ?? {}),
    listingAnchor: bid.content.targetOrder?.listingAnchor ?? bid.listingAnchor,
  }
  if (order.listingAnchor !== bid.listingAnchor || (request.listingAnchor && order.listingAnchor !== request.listingAnchor)) {
    return 'Auction bid recycleArgs target listing does not match auction listing'
  }
  for (const key of ['start', 'end', 'quantity', 'recipient'] as const) {
    if (expected[key] !== undefined && !valuesMatch(order[key], expected[key])) {
      return `Auction bid recycleArgs target ${key} does not match bid order`
    }
  }
  return undefined
}

export async function auctionBidInputs(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceAuctionSettlementRequest,
): Promise<MarketplaceAuctionBidSettlementInput[]> {
  if (request.bids) return request.bids
  const auctionAnchor = auctionAnchorForRequest(request)
  const bidEvents = request.bidEvents ?? await opts.pool.querySync(opts.relays, {
    kinds: [MarketplaceAuctionBid],
    '#a': [auctionAnchor],
  })
  const paymentEvents = request.paymentEvents ?? await opts.pool.querySync(opts.relays, {
    kinds: [MarketplacePayment],
    '#a': [auctionAnchor],
  })
  const payments = paymentEvents.map(parseOrderPaymentEvent)
  return bidEvents.map(event => {
    const bid = parseAuctionBidEvent(event)
    const payment = payments.find(candidate =>
      candidate.refs.auctionBids.includes(event.id) ||
      (candidate.tradeId === bid.tradeId && candidate.event.pubkey === bid.event.pubkey),
    )
    return { bid, ...(payment ? { payment } : {}) }
  })
}

export function auctionPaymentItem(
  bid: ParsedMarketplaceAuctionBid,
  payment: ParsedOrderPayment,
  now?: number,
  amount = payment.content.amount,
  resolvedProof = payment.content.proof,
): MarketplaceAuctionPaymentItem | undefined {
  const proof = resolvedProof?.paymentProof ?? undefined
  if (!proof || !amount) return undefined
  const service = arbitrationServiceEventFrom(payment, resolvedProof)
  const method = paymentMethodEventFrom(payment, resolvedProof)
  const serviceContent = service ? parseArbitrationServiceEvent(service).content : undefined
  const paymentMethod = method ? parsePaymentMethodEvent(method) : undefined
  const params = isMarketplaceDriverEncryptedPaymentProofParams(proof.params)
    ? {}
    : proof.params as Record<string, unknown>
  const buyer = bid.participants.find(participant => participant.role === 'buyer')
  const seller = bid.participants.find(participant => participant.role === 'seller')
  const arbiter = bid.participants.find(participant => participant.role === 'arbiter')
  return {
    purpose: 'bid',
    bid,
    payment,
    proof,
    expected: {
      settlementId: bid.tradeId,
      tradeId: bid.tradeId,
      listingAnchor: bid.auctionAnchor,
      amount,
      asset: {
        currency: amountCurrency(amount),
        denomination: amount.denomination,
        decimals: amount.decimals,
        assetId: stringParam(params, 'assetId'),
      },
      contract: {
        type: serviceContent?.type,
        chainId: numberParam(params, 'chainId') ?? numberParam(serviceContent?.params ?? {}, 'chainId'),
        address: stringParam(params, 'contractAddress') ?? stringParam(serviceContent?.params ?? {}, 'contractAddress'),
        bytecodeHash: stringParam(params, 'contractBytecodeHash') ?? stringParam(serviceContent?.params ?? {}, 'contractBytecodeHash'),
        params: serviceContent?.params ?? {},
      },
      participants: {
        buyer: {
          pubkey: buyer?.pubkey ?? bid.event.pubkey,
          address: stringParam(params, 'buyerAddress'),
        },
        seller: {
          pubkey: seller?.pubkey,
          address: stringParam(params, 'sellerAddress') ?? paymentMethod?.evmAddress,
        },
        arbiter: {
          pubkey: arbiter?.pubkey,
          address: stringParam(params, 'arbiterAddress'),
        },
      },
      ...(stringParam(params, 'escrowFee')
        ? {
            fee: {
              value: stringParam(params, 'escrowFee')!,
              currency: amountCurrency(amount),
              denomination: amount.denomination,
              decimals: amount.decimals,
            },
          }
        : {}),
    },
    ...(now !== undefined ? { now } : {}),
  }
}

async function resolvedAuctionPaymentItem(
  opts: MarketplaceRuntimeOptions,
  bid: ParsedMarketplaceAuctionBid,
  payment: ParsedOrderPayment,
  now?: number,
): Promise<MarketplaceAuctionPaymentItem | undefined> {
  const amount = await resolvePaymentAmount(payment, { signer: opts.signer })
  if (amount.status !== 'resolved' || !amount.amount) return undefined
  let proof = payment.content.proof
  if (!proof && payment.content.sealedProof) {
    const proofResolution = await resolvePaymentProof(payment, {
      keys: payment.paymentProofKeys,
      signer: opts.signer,
      signerPubkey: opts.identity?.pubkey,
    })
    if (proofResolution.status !== 'resolved' || !proofResolution.proof) return undefined
    proof = proofResolution.proof
  }
  return auctionPaymentItem(bid, payment, now, amount.amount, proof)
}

export async function validateAuctionPayment(
  opts: MarketplaceRuntimeOptions,
  item: MarketplaceAuctionPaymentItem,
): Promise<MarketplacePaymentValidationResult> {
  const policy = auctionSettlementPolicy(opts, item)
  if (!policy.validatePayment) {
    return {
      driver: item.proof.driver,
      status: 'unverifiable',
      proofEventId: item.payment.event.id,
      error: 'Policy has no payment validator',
    }
  }
  const result = await policy.validatePayment({
    driver: item.proof.driver,
    proof: item.proof,
    ...(item.expected ? { expected: item.expected } : {}),
    decryptParams: paymentProofParamsDecryptor({
      keys: item.payment.paymentProofKeys,
      signer: opts.signer,
      signerPubkey: opts.identity?.pubkey,
    }),
    ...(item.now !== undefined ? { now: item.now } : {}),
  })
  const amount = await resolvePaymentAmount(item.payment, { signer: opts.signer })
  if (amount.status !== 'resolved' || !amount.amount) {
    return {
      driver: item.proof.driver,
      status: 'unverifiable',
      proofEventId: item.payment.event.id,
      error: amount.error ?? 'Payment amount could not be resolved',
    }
  }
  return normalizePaymentValidationResult(result, amount.amount)
}

export async function auctionBidValidations(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceAuctionSettlementRequest,
): Promise<MarketplaceAuctionBidValidation[]> {
  const inputs = await auctionBidInputs(opts, request)
  const bids: MarketplaceAuctionBidValidation[] = []
  for (const input of inputs) {
    const bid = parseAuctionBidInput(input.bid)
    const payment = parseAuctionPaymentInput(input.payment)
    const item = payment ? await resolvedAuctionPaymentItem(opts, bid, payment, request.now) : undefined
    if (!payment || !item) {
      bids.push({ bid, ...(payment ? { payment } : {}), validation: invalidPaymentResult(bid, payment, 'Event is not a funded auction bid') })
      continue
    }
    const auctionError = validateAuctionBidAgainstRequest(bid, payment, request)
    if (auctionError) {
      bids.push({ bid, payment, validation: invalidPaymentResult(bid, payment, auctionError) })
      continue
    }
    const recycleArgsError = validateAuctionBidRecycleArgs(bid, item.proof, request)
    if (recycleArgsError) {
      bids.push({ bid, payment, validation: invalidPaymentResult(bid, payment, recycleArgsError) })
      continue
    }
    const validation = await validateAuctionPayment(opts, item)
    bids.push({ bid, payment, validation })
  }
  return bids
}

export function auctionSettlementPolicy(
  opts: MarketplaceRuntimeOptions,
  item: MarketplaceAuctionPaymentItem,
): MarketplaceBidPolicy {
  const policy = (opts.bidPolicies ?? []).find(candidate =>
    candidate.purpose === 'bid' &&
    candidate.family === 'auction' &&
    policyName(candidate) === item.proof.driver,
  )
  if (!policy || policy.purpose !== 'bid' || policy.family !== 'auction') {
    throw new Error(`No matching auction payment policy for driver: ${item.proof.driver}`)
  }
  return policy as MarketplaceBidPolicy
}

export async function refundAuctionBid(
  opts: MarketplaceRuntimeOptions,
  bid: MarketplaceAuctionBidValidation,
  request: MarketplaceAuctionSettlementRequest,
  winner?: MarketplaceAuctionBidValidation,
): Promise<MarketplaceAuctionPaymentSettlementResult> {
  if (!bid.payment) throw new Error('Auction settlement requires a bid payment')
  const item = await resolvedAuctionPaymentItem(opts, bid.bid, bid.payment, request.now)
  if (!item) throw new Error('Auction settlement requires a recoverable bid payment proof')
  const policy = auctionSettlementPolicy(opts, item)
  if (!policy.refundPayment) throw new Error(`Auction policy ${policy.id ?? policy.method} cannot refund payments`)
  return policy.refundPayment({
    purpose: 'bid',
    action: 'auction_refund',
    bid: bid.bid,
    payment: bid.payment!,
    proof: item.proof,
    validation: bid.validation,
    refundPercent: 100,
    ...(item.expected ? { expected: item.expected } : {}),
    ...(winner ? { winner } : {}),
    data: {
      auctionId: auctionIdForRequest(request),
      auctionAnchor: auctionAnchorForRequest(request),
      reason: winner ? 'outbid' : 'no_valid_winner',
    },
  })
}

export function buyerTradePubkey(bid: ParsedMarketplaceAuctionBid): string {
  const buyer = bid.participants.find(participant => participant.role === 'buyer')?.pubkey
  if (!buyer) throw new Error('Auction winner requires a buyer participant')
  return buyer
}

export function promotedAuctionOrderTemplate(
  winner: MarketplaceAuctionBidValidation,
  request: MarketplaceAuctionSettlementRequest,
): OrderTemplate {
  const targetOrder = {
    ...(winner.bid.content.targetOrder ?? {}),
    ...(request.targetOrder ?? {}),
  }
  const extraTags = [
    ['a', winner.bid.auctionAnchor, '', 'auction'],
    ['e', winner.bid.event.id, '', 'winning-bid'],
    ...(winner.payment ? [['e', winner.payment.event.id, '', 'winning-payment']] : []),
    ...(targetOrder.extraTags ?? []),
  ]
  return {
    tradeId: winner.bid.tradeId,
    listingAnchor: targetOrder.listingAnchor ?? winner.bid.listingAnchor,
    quantity: targetOrder.quantity ?? 1,
    ...(targetOrder.start ? { start: targetOrder.start } : {}),
    ...(targetOrder.end ? { end: targetOrder.end } : {}),
    amount: targetOrder.amount ?? winner.bid.amount,
    recipient: targetOrder.recipient ?? buyerTradePubkey(winner.bid),
    ...(targetOrder.commitAuthorization ? { commitAuthorization: targetOrder.commitAuthorization } : {}),
    participants: targetOrder.participants ?? winner.bid.participants,
    participantProofs: targetOrder.participantProofs ?? winner.bid.participantProofs,
    extraTags,
    ...(targetOrder.createdAt ?? request.now ? { createdAt: targetOrder.createdAt ?? request.now } : {}),
    ...(targetOrder.publishedAt ?? request.now ? { publishedAt: targetOrder.publishedAt ?? request.now } : {}),
  }
}

export async function recycleWinningAuctionBid(
  opts: MarketplaceRuntimeOptions,
  winner: MarketplaceAuctionBidValidation,
  request: MarketplaceAuctionSettlementRequest,
  targetTradeId: string,
  targetOrderGroupId: string,
): Promise<MarketplaceAuctionPaymentSettlementResult> {
  if (!winner.payment) throw new Error('Auction winner requires a payment')
  const item = await resolvedAuctionPaymentItem(opts, winner.bid, winner.payment, request.now)
  if (!item) throw new Error('Auction settlement requires a recoverable bid payment proof')
  const policy = auctionSettlementPolicy(opts, item)
  if (!policy.recyclePayment) throw new Error(`Auction policy ${policy.id ?? policy.method} cannot recycle payments`)
  return policy.recyclePayment({
    purpose: 'bid',
    action: 'auction_promote',
    ...(opts.seed ? { seed: opts.seed } : {}),
    bid: winner.bid,
    payment: winner.payment!,
    proof: item.proof,
    validation: winner.validation,
    winner,
    targetTradeId,
    targetOrderGroupId,
    ...(item.expected ? { expected: item.expected } : {}),
    ...(request.targetUnlockAt !== undefined ? { targetUnlockAt: request.targetUnlockAt } : {}),
    ...(!isMarketplaceDriverEncryptedPaymentProofParams(item.proof.params)
      ? { recycleArgs: (item.proof.params as Record<string, unknown>).recycleArgs }
      : {}),
    data: { auctionId: auctionIdForRequest(request), auctionAnchor: auctionAnchorForRequest(request) },
  })
}

export async function publishAuctionPaymentSettlement(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceAuctionSettlementRequest,
  bid: MarketplaceAuctionBidValidation,
  action: 'auction_refund' | 'auction_promote',
  result: MarketplaceAuctionPaymentSettlementResult,
  winner?: MarketplaceAuctionBidValidation,
  targetTradeId?: string,
  targetOrderGroupId?: string,
  auctionCompleteEvent?: Event,
): Promise<Event> {
  const payment = bid.payment
  if (!payment) throw new Error('Auction settlement requires a payment')
  const auctionAnchor = auctionAnchorForRequest(request)
  return publishMarketplaceTemplate(
    opts,
    generateOrderPaymentSettlementEventTemplate({
      orderGroupId: bid.bid.tradeId,
      tradeId: bid.bid.tradeId,
      listingAnchor: auctionAnchor,
      anchorMarker: 'auction',
      participants: bid.bid.participants,
      refs: {
        auctionBids: [bid.bid.event.id],
        payments: [payment.event.id],
        ...(auctionCompleteEvent ? { auctionCompletes: [auctionCompleteEvent.id] } : {}),
      },
      method: result.proof.driver,
      action,
      ...(result.inputs ? { inputs: result.inputs } : {}),
      ...(result.outputs ? { outputs: result.outputs } : {}),
      data: auctionSettlementData({
        action,
        auctionId: auctionIdForRequest(request),
        auctionAnchor,
        bid,
        ...(winner ? { winner } : {}),
        proof: result.proof,
        ...(payment.content.proof?.paymentProof ? { sourceProof: payment.content.proof.paymentProof } : {}),
        ...(targetTradeId ? { targetTradeId } : {}),
        ...(targetOrderGroupId ? { targetOrderGroupId } : {}),
        ...(request.targetUnlockAt !== undefined ? { targetUnlockAt: request.targetUnlockAt } : {}),
        ...(result.data ? { data: result.data } : {}),
      }),
    }),
  )
}

export async function publishAuctionComplete(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceAuctionSettlementRequest,
  winner?: MarketplaceAuctionBidValidation,
): Promise<Event> {
  const auctionAnchor = auctionAnchorForRequest(request)
  return publishMarketplaceTemplate(
    opts,
    generateAuctionCompleteEventTemplate({
      auctionAnchor,
      listingAnchor: request.listingAnchor ?? winner?.bid.listingAnchor,
      status: winner ? 'closed' : 'reserve_not_met',
      ...(winner ? { winningBidId: winner.bid.event.id } : {}),
      ...(winner?.payment ? { winningPaymentId: winner.payment.event.id } : {}),
      ...(winner ? { winnerPubkey: buyerTradePubkey(winner.bid), finalAmount: winner.bid.amount } : {}),
      data: {
        auctionId: auctionIdForRequest(request),
        ...(winner ? { winningTradeId: winner.bid.tradeId } : {}),
      },
      ...(request.now ? { createdAt: request.now } : {}),
    }),
  )
}

export function promotedPaymentProof(
  source: PaymentProof,
  proof: PaymentProofEvidence,
): PaymentProof {
  return {
    paymentProof: proof,
    ...(source.arbitration ? { arbitration: source.arbitration } : {}),
  }
}

async function sourcePaymentProofForPromotion(
  opts: MarketplaceRuntimeOptions,
  payment: ParsedOrderPayment,
): Promise<PaymentProof> {
  if (payment.content.proof) return payment.content.proof
  const proofResolution = await resolvePaymentProof(payment, {
    keys: payment.paymentProofKeys,
    signer: opts.signer,
    signerPubkey: opts.identity?.pubkey,
  })
  if (proofResolution.status === 'resolved' && proofResolution.proof) return proofResolution.proof
  throw new Error(proofResolution.error ?? 'Auction promotion requires a public or resolved payment proof')
}

export async function publishPromotedAuctionOrder(
  opts: MarketplaceRuntimeOptions,
  winner: MarketplaceAuctionBidValidation,
  request: MarketplaceAuctionSettlementRequest,
  settlementEvent: Event,
  auctionCompleteEvent: Event,
  recycledProof: PaymentProofEvidence,
): Promise<{ order: Event; payment: Event; ack: Event }> {
  if (!winner.payment) throw new Error('Auction winner requires a payment')
  const auctionAnchor = auctionAnchorForRequest(request)
  const orderTemplate = promotedAuctionOrderTemplate(winner, request)
  orderTemplate.extraTags = [
    ...(orderTemplate.extraTags ?? []),
    ['e', auctionCompleteEvent.id, '', 'auction-complete'],
    ['e', settlementEvent.id, '', 'auction-promote'],
  ]
  const order = await publishMarketplaceTemplate(opts, generateOrderEventTemplate(orderTemplate))
  const sourceProof = await sourcePaymentProofForPromotion(opts, winner.payment)
  const payment = await publishMarketplaceTemplate(
    opts,
    generateOrderPaymentEventTemplate({
      tradeId: orderTemplate.tradeId,
      listingAnchor: orderTemplate.listingAnchor,
      participants: orderTemplate.participants,
      orderGroupId: orderGroupIdForOrder(order),
      refs: { orders: [order.id], settlements: [settlementEvent.id], auctionCompletes: [auctionCompleteEvent.id] },
      extraTags: [['a', auctionAnchor, '', 'auction']],
      amount: winner.payment.content.amount ?? winner.validation.amount,
      proof: promotedPaymentProof(sourceProof, recycledProof),
      ...(request.now ? { createdAt: request.now } : {}),
    }),
  )
  const ack = await publishMarketplaceTemplate(
    opts,
    generateOrderPaymentAckEventTemplate({
      tradeId: orderTemplate.tradeId,
      listingAnchor: orderTemplate.listingAnchor,
      participants: orderTemplate.participants,
      orderGroupId: orderGroupIdForOrder(order),
      refs: { orders: [order.id], payments: [payment.id], auctionCompletes: [auctionCompleteEvent.id] },
      extraTags: [['a', auctionAnchor, '', 'auction']],
      status: 'accepted',
      message: 'Auction winning payment promoted into order payment',
      ...(request.now ? { createdAt: request.now } : {}),
    }),
  )
  return { order, payment, ack }
}

export async function* settleMarketplaceAuction(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceAuctionSettlementRequest,
): AsyncIterable<MarketplaceAuctionSettlementState> {
  requireArbitrationPublisher(opts)
  const bids = await auctionBidValidations(opts, request)
  for (const bid of bids) yield { type: 'bid_validated', bid }

  const validBids = bids.filter(bid => isPaymentValidationAccepted(bid.validation) && bid.payment)
  const winner = validBids.reduce<MarketplaceAuctionBidValidation | undefined>(higherBid, undefined)
  yield { type: 'winner_selected', winner, bids }

  const plans: MarketplaceAuctionSettlementPlan[] = []
  for (const bid of bids) {
    if (!bid.payment) continue
    const action: 'auction_refund' | 'auction_promote' = winner && bid.bid.event.id === winner.bid.event.id
      ? 'auction_promote'
      : 'auction_refund'
    const targetOrderTemplate = action === 'auction_promote' && winner
      ? promotedAuctionOrderTemplate(winner, request)
      : undefined
    const targetOrderGroupId = targetOrderTemplate
      ? orderGroupIdForParticipants(targetOrderTemplate.tradeId, targetOrderTemplate.participants ?? [])
      : undefined
    const result = action === 'auction_promote' && winner && targetOrderTemplate && targetOrderGroupId
      ? await recycleWinningAuctionBid(opts, winner, request, targetOrderTemplate.tradeId, targetOrderGroupId)
      : await refundAuctionBid(opts, bid, request, winner)
    plans.push({
      bid,
      action,
      result,
      ...(targetOrderTemplate ? { targetOrderTemplate } : {}),
      ...(targetOrderTemplate?.tradeId ? { targetTradeId: targetOrderTemplate.tradeId } : {}),
      ...(targetOrderGroupId ? { targetOrderGroupId } : {}),
    })
  }

  const auctionCompleteEvent = await publishAuctionComplete(opts, request, winner)
  yield { type: 'auction_complete_published', winner, event: auctionCompleteEvent }

  let promotedSettlementEvent: Event | undefined
  let promotedProof: PaymentProofEvidence | undefined
  let targetTradeId: string | undefined

  for (const plan of plans) {
    const event = await publishAuctionPaymentSettlement(
      opts,
      request,
      plan.bid,
      plan.action,
      plan.result,
      winner,
      plan.targetTradeId,
      plan.targetOrderGroupId,
      auctionCompleteEvent,
    )
    if (plan.action === 'auction_promote') {
      promotedSettlementEvent = event
      promotedProof = plan.result.proof
      targetTradeId = plan.targetTradeId
    }
    yield {
      type: 'settlement_published',
      action: plan.action,
      bid: plan.bid.bid,
      payment: plan.bid.payment!,
      event,
      validation: plan.bid.validation,
      proof: plan.result.proof,
    }
  }

  if (winner && promotedSettlementEvent && promotedProof && targetTradeId) {
    const promoted = await publishPromotedAuctionOrder(
      opts,
      winner,
      request,
      promotedSettlementEvent,
      auctionCompleteEvent,
      promotedProof,
    )
    yield { type: 'order_published', winner, event: promoted.order }
    yield { type: 'payment_published', winner, event: promoted.payment, proof: promotedProof }
    yield { type: 'payment_ack_published', winner, event: promoted.ack }
  }

  yield { type: 'completed', winner, bids }
}
