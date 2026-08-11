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
  buildAuctionBidChains,
  fetchAuctionBidGroups,
  groupAuctionBidEvents,
  reduceAuctionBidGroup,
  subscribeAuctionBidGroups,
  type AuctionBidGroupQuery,
  type AuctionBidGroupSearchOptions,
  type AuctionBidGroupSubscribeHandlers,
  type AuctionBidGroupSubscribeOptions,
  type ParsedAuctionBidChain,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
import {
  generatePaymentAckEventTemplate,
  generatePaymentEventTemplate,
  generatePaymentNackEventTemplate,
  generatePaymentSettlementEventTemplate,
  paymentLifecycleHasAnchor,
  parsePaymentEvent,
  type ParsedPaymentAck,
  type ParsedPaymentNack,
  type PaymentSettlementOutput,
  type ParsedPayment,
} from './payment-lifecycle.ts'
import { paymentValidationRequest } from './order-group-payment.ts'
import {
  fetchOrderGroups,
  roleOrderGroups,
  searchOrderGroupsForIdentity,
  searchOrderGroups,
  subscribeOrderGroupsForIdentity,
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
  type OrderGroupIdentityQuery,
  type OrderGroupRoles,
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
import { amountCurrency, parseEventJson, sha256Hex, sortedJson } from './helper.ts'
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
  normalizePaymentValidationResult,
} from './payment-validation.ts'
import { resolvePaymentAmount } from './payment-amount.ts'
import {
  buildPaymentProofPayloadWithSigner,
  paymentProofParamsDecryptor,
  resolvePaymentProof,
  resolvePaymentProofEvidence,
} from './payment-proof.ts'
import {
  isMarketplaceDriverEncryptedPaymentProofParams,
  type MarketplaceDriverFinancialActionReceipt,
} from '@sudonym-btc/marketplace-driver-interface'
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
  MarketplaceSettlementJournal,
  MarketplaceSettlementJournalRecord,
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
  payment: ParsedPayment
  proof: PaymentProofEvidence
  expected?: MarketplacePaymentValidationRequest['expected']
  now?: number
}

type MarketplaceAuctionSettlementPlan = {
  group: ParsedAuctionBidGroup
  bid: MarketplaceAuctionBidValidation
  action: 'auction_refund' | 'auction_promote'
  operationId: string
  result: MarketplaceAuctionPaymentSettlementResult
  targetTradeId?: string
  targetOrderGroupId?: string
  targetOrderTemplate?: OrderTemplate
}

type MarketplaceAuctionPromotedPayment = MarketplaceAuctionSettlementPlan & {
  settlementEvent: Event
  proof: PaymentProofEvidence
}

type AuctionBidPaymentDecision = ParsedPaymentAck | ParsedPaymentNack

export function stringParam(params: Record<string, unknown>, name: string): string | undefined {
  const value = params[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function numberParam(params: Record<string, unknown>, name: string): number | undefined {
  const value = params[name]
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : undefined
}

export function arbitrationServiceEventFrom(payment: ParsedPayment, proof = payment.content.proof): Event | undefined {
  const service = proof?.arbitration?.arbitrationService
  if (!service) return undefined
  try {
    return typeof service === 'string' ? parseEventJson(service, 'arbitrationService') : service
  } catch (_) {
    return undefined
  }
}

export function paymentMethodEventFrom(payment: ParsedPayment, proof = payment.content.proof): Event | undefined {
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

export function auctionSettlementJournalId(request: MarketplaceAuctionSettlementRequest): string {
  return `auction:${sha256Hex(sortedJson(['auction-settlement-journal-v1', auctionAnchorForRequest(request)]))}`
}

export function auctionSettlementOperationId(
  request: MarketplaceAuctionSettlementRequest,
  bid: MarketplaceAuctionBidValidation,
  action: 'auction_refund' | 'auction_promote',
): string {
  if (!bid.payment) throw new Error('Auction settlement operation requires a payment')
  return `auction-action:${sha256Hex(sortedJson([
    'auction-settlement-action-v1',
    auctionAnchorForRequest(request),
    bid.bid.event.id,
    bid.payment.event.id,
    action,
  ]))}`
}

type SettlementJournalContext = {
  journal: MarketplaceSettlementJournal
  record: MarketplaceSettlementJournalRecord
  save(record: MarketplaceSettlementJournalRecord): Promise<void>
  options: MarketplaceRuntimeOptions
}

async function settlementJournalContext(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceAuctionSettlementRequest,
): Promise<SettlementJournalContext> {
  const journal = opts.settlementJournal
  if (!journal) throw new Error('Auction settlement requires a durable settlementJournal')
  if (request.now === undefined || !Number.isSafeInteger(request.now) || request.now < 0) {
    throw new Error('Auction settlement requires a deterministic non-negative now value')
  }
  const publish = opts.publish
  if (!publish) throw new Error('Marketplace arbitration mode requires a publish function')
  const signer = opts.signer
  if (!signer) throw new Error('Marketplace arbitration mode requires a signer')
  const id = auctionSettlementJournalId(request)
  const auctionAnchor = auctionAnchorForRequest(request)
  const existingRecord = await journal.get(id)
  let record = existingRecord ?? {
    version: 1,
    id,
    auctionAnchor,
    status: 'pending',
    actions: {},
    outbox: {},
    updatedAt: request.now,
  }
  if (record.version !== 1 || record.id !== id || record.auctionAnchor !== auctionAnchor) {
    throw new Error('Auction settlement journal record does not match this auction')
  }
  const context = {} as SettlementJournalContext
  context.journal = journal
  context.record = record
  context.save = async next => {
    record = next
    context.record = next
    await journal.put(next)
  }
  let outboxSequence = 0
  const outboxSigner: MarketplaceSeedSigner = {
    ...(signer.getPublicKey ? { getPublicKey: () => signer.getPublicKey!() } : {}),
    nip44Encrypt: (pubkey, plaintext) => signer.nip44Encrypt(pubkey, plaintext),
    nip44Decrypt: (pubkey, ciphertext) => signer.nip44Decrypt(pubkey, ciphertext),
    signEvent: async (template: EventTemplate) => {
      const key = `${outboxSequence.toString().padStart(6, '0')}:${template.kind}`
      outboxSequence += 1
      const existing = context.record.outbox[key]
      if (existing) {
        if (existing.event.kind !== template.kind) throw new Error(`Settlement outbox sequence mismatch: ${key}`)
        return existing.event
      }
      const event = await signer.signEvent(template)
      await context.save({
        ...context.record,
        status: 'publishing',
        outbox: { ...context.record.outbox, [key]: { event, published: false } },
        updatedAt: request.now!,
      })
      return event
    },
  }
  context.options = {
    ...opts,
    signer: outboxSigner,
    publish: async event => {
      const outboxEntry = Object.entries(context.record.outbox).find(([, candidate]) => candidate.event.id === event.id)
      if (!outboxEntry) throw new Error(`Settlement event was not journaled before publication: ${event.id}`)
      const [key, existing] = outboxEntry
      if (existing.published) return
      await publish(event)
      await context.save({
        ...context.record,
        status: 'publishing',
        outbox: { ...context.record.outbox, [key]: { event, published: true } },
        updatedAt: request.now!,
      })
    },
  }
  if (!existingRecord) await journal.put(record)
  return context
}

function requireCompletedFinancialResult(
  result: MarketplaceAuctionPaymentSettlementResult,
  operationId: string,
): MarketplaceAuctionPaymentSettlementResult {
  if (!result.receipt || result.receipt.status !== 'completed' || result.receipt.operationId !== operationId) {
    throw new Error(`Auction financial action did not return a matching completed receipt: ${operationId}`)
  }
  return result
}

/**
 * Keep the runtime journal and public settlement event independent of
 * driver-defined evidence. The complete driver result is committed and its
 * proof is sealed separately; only the fields needed to identify a completed
 * idempotent operation cross this boundary.
 */
function publicFinancialReceipt(
  receipt: MarketplaceDriverFinancialActionReceipt,
): MarketplaceDriverFinancialActionReceipt {
  return {
    status: 'completed',
    operationId: receipt.operationId,
    ...(receipt.externalId ? { externalId: receipt.externalId } : {}),
  }
}

/** Driver validation `data`, `terms.data`, and errors may contain provider or
 * proof details. Public auction events need only the normalized verdict. */
function publicValidationResult(
  validation: MarketplacePaymentValidationResult,
): MarketplacePaymentValidationResult {
  return {
    driver: validation.driver,
    status: validation.status,
    ...(validation.confirmations !== undefined ? { confirmations: validation.confirmations } : {}),
    ...(validation.amountMatched !== undefined ? { amountMatched: validation.amountMatched } : {}),
    ...(validation.assetMatched !== undefined ? { assetMatched: validation.assetMatched } : {}),
    ...(validation.recipientMatched !== undefined ? { recipientMatched: validation.recipientMatched } : {}),
    ...(validation.arbiterMatched !== undefined ? { arbiterMatched: validation.arbiterMatched } : {}),
  }
}

export function invalidPaymentResult(
  bid: ParsedMarketplaceAuctionBid,
  payment?: ParsedPayment,
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

export function bidChainValue(chain: ParsedAuctionBidChain): bigint {
  const value = chain.amount.value
  if (value === undefined || !/^\d+$/.test(value)) return -1n
  return BigInt(value)
}

export function higherBidChain(
  left: ParsedAuctionBidChain | undefined,
  right: ParsedAuctionBidChain,
): ParsedAuctionBidChain {
  if (!left) return right
  const leftValue = bidChainValue(left)
  const rightValue = bidChainValue(right)
  if (rightValue !== leftValue) return rightValue > leftValue ? right : left
  if (right.head.bid.event.created_at !== left.head.bid.event.created_at) {
    return right.head.bid.event.created_at < left.head.bid.event.created_at ? right : left
  }
  return right.head.bid.event.id.localeCompare(left.head.bid.event.id) < 0 ? right : left
}

function latestPaymentDecision<T extends AuctionBidPaymentDecision>(left: T | undefined, right: T): T {
  if (!left) return right
  if (right.event.created_at !== left.event.created_at) {
    return right.event.created_at > left.event.created_at ? right : left
  }
  return right.event.id.localeCompare(left.event.id) > 0 ? right : left
}

function paymentDriver(payment?: ParsedPayment): string {
  return payment?.content.proof?.paymentProof?.driver ?? 'none'
}

function decisionReferencesGroup(decision: AuctionBidPaymentDecision, group: ParsedAuctionBidGroup): boolean {
  const paymentIds = new Set(group.payments.map(payment => payment.event.id))
  return (
    decision.refs.auctionBids.includes(group.bid.event.id) ||
    decision.refs.payments.some(id => paymentIds.has(id)) ||
    (
      paymentLifecycleHasAnchor(decision, group.auctionAnchor, 'auction') &&
      decision.orderGroupId === group.tradeId &&
      decision.tradeId === group.tradeId
    )
  )
}

function latestArbiterDecision(
  group: ParsedAuctionBidGroup,
  arbiterPubkey?: string,
): AuctionBidPaymentDecision | undefined {
  const decisions = [
    ...group.paymentAcks.filter(ack => ack.content.status === 'accepted'),
    ...group.paymentNacks.filter(nack => nack.content.status === 'rejected'),
  ].filter(decision =>
    (!arbiterPubkey || decision.event.pubkey === arbiterPubkey) &&
    decisionReferencesGroup(decision, group)
  )
  return decisions.reduce<AuctionBidPaymentDecision | undefined>(latestPaymentDecision, undefined)
}

function acceptedDecision(decision: AuctionBidPaymentDecision | undefined): decision is ParsedPaymentAck {
  return decision?.content.status === 'accepted'
}

function bidValidationFromDecision(
  group: ParsedAuctionBidGroup,
  request: MarketplaceAuctionSettlementRequest,
): MarketplaceAuctionBidValidation {
  const payment = group.payment
  const decision = latestArbiterDecision(group, request.arbiterPubkey)
  if (!payment) {
    return {
      bid: group.bid,
      validation: invalidPaymentResult(group.bid, undefined, 'Auction bid has no payment event'),
    }
  }
  if (acceptedDecision(decision)) {
    return {
      bid: group.bid,
      payment,
      validation: {
        driver: paymentDriver(payment),
        status: 'valid',
        proofEventId: payment.event.id,
        ...(payment.content.amount ? { amount: payment.content.amount } : {}),
        amountMatched: true,
        data: {
          bidEventId: group.bid.event.id,
          paymentAckId: decision.event.id,
        },
      },
    }
  }
  return {
    bid: group.bid,
    payment,
    validation: {
      driver: paymentDriver(payment),
      status: decision ? 'invalid' : 'unverifiable',
      proofEventId: payment.event.id,
      ...(payment.content.amount ? { amount: payment.content.amount } : {}),
      amountMatched: false,
      data: {
        bidEventId: group.bid.event.id,
        ...(decision ? { paymentNackId: decision.event.id } : {}),
      },
      error: decision?.content.message ?? 'Auction bid payment has no arbiter payment ack',
    },
  }
}

function acceptedBidValidation(entry: MarketplaceAuctionBidValidation): boolean {
  return Boolean(entry.payment && entry.validation.status === 'valid' && entry.validation.amountMatched === true)
}

export async function auctionBidGroupsForSettlement(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceAuctionSettlementRequest,
): Promise<ParsedAuctionBidGroup[]> {
  if (request.bids) {
    const events = request.bids.flatMap(input => [
      parseAuctionBidInput(input.bid).event,
      ...(input.payment ? [parseAuctionPaymentInput(input.payment)!.event] : []),
    ])
    return groupAuctionBidEvents(events)
  }
  if (request.bidEvents || request.paymentEvents) {
    return groupAuctionBidEvents([
      ...(request.bidEvents ?? []),
      ...(request.paymentEvents ?? []),
    ])
  }
  return fetchAuctionBidGroups(opts.pool, opts.relays, { auctionAnchor: auctionAnchorForRequest(request) })
}

export function auctionSettlementData(input: {
  action: PaymentSettlementAction
  auctionId: string
  auctionAnchor: string
  bid: MarketplaceAuctionBidValidation
  bidChain?: ParsedAuctionBidChain
  winner?: MarketplaceAuctionBidValidation
  winningChain?: ParsedAuctionBidChain
  proof?: PaymentProofEvidence
  sourceProof?: PaymentProofEvidence
  receipt?: MarketplaceAuctionPaymentSettlementResult['receipt']
  targetTradeId?: string
  targetOrderGroupId?: string
  targetUnlockAt?: number
}): Record<string, unknown> {
  return {
    auctionId: input.auctionId,
    auctionAnchor: input.auctionAnchor,
    bidTradeId: input.bid.bid.tradeId,
    bidEventId: input.bid.bid.event.id,
    bidAmount: input.bid.bid.amount,
    ...(input.bid.bid.bidChainId ? { bidChainId: input.bid.bid.bidChainId } : {}),
    ...(input.bidChain ? { bidChainTotal: input.bidChain.amount, bidChainHeadId: input.bidChain.head.bid.event.id } : {}),
    validation: publicValidationResult(input.bid.validation),
    ...(input.winner ? { winnerTradeId: input.winner.bid.tradeId, winnerEventId: input.winner.bid.event.id } : {}),
    ...(input.winningChain ? {
      winningBidChainId: input.winningChain.id,
      winningBidChainTotal: input.winningChain.amount,
      winningBidChainPaymentIds: input.winningChain.paymentEventIds,
    } : {}),
    ...(input.targetTradeId ? { targetTradeId: input.targetTradeId } : {}),
    ...(input.targetOrderGroupId ? { targetOrderGroupId: input.targetOrderGroupId } : {}),
    ...(input.targetUnlockAt !== undefined ? { targetUnlockAt: input.targetUnlockAt } : {}),
    ...(input.sourceProof ? { sourceProofCommitment: sha256Hex(sortedJson(input.sourceProof)) } : {}),
    ...(input.proof ? { proofCommitment: sha256Hex(sortedJson(input.proof)) } : {}),
    ...(input.receipt ? { receipt: publicFinancialReceipt(input.receipt) } : {}),
  }
}

export function parseAuctionPaymentInput(payment: Event | ParsedPayment | undefined): ParsedPayment | undefined {
  if (!payment) return undefined
  return 'event' in payment ? payment : parsePaymentEvent(payment)
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
  payment: ParsedPayment | undefined,
  request: MarketplaceAuctionSettlementRequest,
): string | undefined {
  const auctionAnchor = auctionAnchorForRequest(request)
  if (bid.auctionAnchor !== auctionAnchor) return 'Bid does not belong to auction'
  if (request.listingAnchor && bid.listingAnchor !== request.listingAnchor) return 'Bid listing does not match auction listing'
  if (payment && !paymentLifecycleHasAnchor(payment, auctionAnchor, 'auction')) {
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
  const payments = paymentEvents.map(parsePaymentEvent)
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
  payment: ParsedPayment,
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
  payment: ParsedPayment,
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
  const proofResolution = await resolvePaymentProofEvidence(item.proof, {
    keys: item.payment.paymentProofKeys,
    signer: opts.signer,
    signerPubkey: opts.identity?.pubkey,
  })
  if (proofResolution.status !== 'resolved' || !proofResolution.proof) {
    return {
      driver: item.proof.driver,
      status: 'unverifiable',
      proofEventId: item.payment.event.id,
      error: proofResolution.error ?? 'Payment proof could not be resolved',
    }
  }
  const result = await policy.validatePayment({
    driver: proofResolution.proof.driver,
    proof: proofResolution.proof,
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
  operationId: string,
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
    operationId,
    ...(opts.seed ? { seed: opts.seed } : {}),
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
  winningChain?: ParsedAuctionBidChain,
): OrderTemplate {
  const targetOrder = {
    ...(winner.bid.content.targetOrder ?? {}),
    ...(request.targetOrder ?? {}),
  }
  const chainGroups = winningChain?.groups ?? []
  const extraTags = [
    ['a', winner.bid.auctionAnchor, '', 'auction'],
    ['e', winner.bid.event.id, '', 'winning-bid'],
    ...(winner.payment ? [['e', winner.payment.event.id, '', 'winning-payment']] : []),
    ...chainGroups
      .filter(group => group.bid.event.id !== winner.bid.event.id)
      .map(group => ['e', group.bid.event.id, '', 'winning-chain-bid']),
    ...chainGroups
      .flatMap(group => group.payments.map(payment => ['e', payment.event.id, '', 'winning-chain-payment'])),
    ...(targetOrder.extraTags ?? []),
  ]
  return {
    tradeId: winningChain?.head.bid.bidChainId ?? winner.bid.bidChainId ?? winner.bid.tradeId,
    listingAnchor: targetOrder.listingAnchor ?? winner.bid.listingAnchor,
    quantity: targetOrder.quantity ?? 1,
    ...(targetOrder.start ? { start: targetOrder.start } : {}),
    ...(targetOrder.end ? { end: targetOrder.end } : {}),
    amount: targetOrder.amount ?? winningChain?.amount ?? winner.bid.amount,
    recipient: targetOrder.recipient ?? buyerTradePubkey(winner.bid),
    ...(targetOrder.commitAuthorization ? { commitAuthorization: targetOrder.commitAuthorization } : {}),
    participants: targetOrder.participants ?? winner.bid.participants,
    participantProofs: targetOrder.participantProofs ?? winner.bid.participantProofs,
    extraTags,
    ...(targetOrder.createdAt ?? request.now ? { createdAt: targetOrder.createdAt ?? request.now } : {}),
    ...(targetOrder.publishedAt ?? request.now ? { publishedAt: targetOrder.publishedAt ?? request.now } : {}),
  }
}

export async function recycleAuctionBidPayment(
  opts: MarketplaceRuntimeOptions,
  bid: MarketplaceAuctionBidValidation,
  request: MarketplaceAuctionSettlementRequest,
  winner: MarketplaceAuctionBidValidation,
  targetTradeId: string,
  targetOrderGroupId: string,
  operationId: string,
): Promise<MarketplaceAuctionPaymentSettlementResult> {
  if (!bid.payment) throw new Error('Auction winner requires a payment')
  const item = await resolvedAuctionPaymentItem(opts, bid.bid, bid.payment, request.now)
  if (!item) throw new Error('Auction settlement requires a recoverable bid payment proof')
  const policy = auctionSettlementPolicy(opts, item)
  if (!policy.recyclePayment) throw new Error(`Auction policy ${policy.id ?? policy.method} cannot recycle payments`)
  return policy.recyclePayment({
    purpose: 'bid',
    action: 'auction_promote',
    operationId,
    ...(opts.seed ? { seed: opts.seed } : {}),
    bid: bid.bid,
    payment: bid.payment!,
    proof: item.proof,
    validation: bid.validation,
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
  bidChain?: ParsedAuctionBidChain,
  winningChain?: ParsedAuctionBidChain,
  targetTradeId?: string,
  targetOrderGroupId?: string,
  auctionCompleteEvent?: Event,
): Promise<Event> {
  const payment = bid.payment
  if (!payment) throw new Error('Auction settlement requires a payment')
  const { signer } = requireArbitrationPublisher(opts)
  const senderPubkey = opts.identity?.pubkey ?? await signer.getPublicKey?.()
  if (!senderPubkey) throw new Error('Auction settlement proof sealing requires the arbiter signer pubkey')
  const proofRecipients = action === 'auction_refund'
    ? [senderPubkey, buyerTradePubkey(bid.bid)]
    : [senderPubkey, ...bid.bid.participants.map(participant => participant.pubkey)]
  const protectedProof = await buildPaymentProofPayloadWithSigner(
    { paymentProof: result.proof },
    {
      signer,
      senderPubkey,
      recipientPubkeys: proofRecipients,
    },
  )
  const auctionAnchor = auctionAnchorForRequest(request)
  return publishMarketplaceTemplate(
    opts,
    generatePaymentSettlementEventTemplate({
      orderGroupId: bid.bid.tradeId,
      tradeId: bid.bid.tradeId,
      anchors: [
        { value: auctionAnchor, marker: 'auction' },
        { value: bid.bid.listingAnchor, marker: 'listing' },
      ],
      participants: bid.bid.participants,
      refs: {
        auctionBids: [bid.bid.event.id],
        payments: [payment.event.id],
        ...(auctionCompleteEvent ? { auctionCompletes: [auctionCompleteEvent.id] } : {}),
      },
      method: result.proof.driver,
      action,
      sealedProof: protectedProof.proof,
      paymentProofKeys: protectedProof.paymentProofKeys,
      data: auctionSettlementData({
        action,
        auctionId: auctionIdForRequest(request),
        auctionAnchor,
        bid,
        ...(bidChain ? { bidChain } : {}),
        ...(winner ? { winner } : {}),
        ...(winningChain ? { winningChain } : {}),
        proof: result.proof,
        receipt: result.receipt,
        ...(payment.content.proof?.paymentProof ? { sourceProof: payment.content.proof.paymentProof } : {}),
        ...(targetTradeId ? { targetTradeId } : {}),
        ...(targetOrderGroupId ? { targetOrderGroupId } : {}),
        ...(request.targetUnlockAt !== undefined ? { targetUnlockAt: request.targetUnlockAt } : {}),
      }),
      ...(request.now !== undefined ? { createdAt: request.now } : {}),
    }),
  )
}

export function auctionCompleteTemplate(
  request: MarketplaceAuctionSettlementRequest,
  winner?: MarketplaceAuctionBidValidation,
  winningChain?: ParsedAuctionBidChain,
): EventTemplate {
  const auctionAnchor = auctionAnchorForRequest(request)
  return generateAuctionCompleteEventTemplate({
    auctionAnchor,
    listingAnchor: request.listingAnchor ?? winner?.bid.listingAnchor,
    status: winner ? 'closed' : 'reserve_not_met',
    ...(winner ? { winningBidId: winner.bid.event.id } : {}),
    ...(winner?.payment ? { winningPaymentId: winner.payment.event.id } : {}),
    ...(winner ? { winnerPubkey: buyerTradePubkey(winner.bid), finalAmount: winningChain?.amount ?? winner.bid.amount } : {}),
    data: {
      auctionId: auctionIdForRequest(request),
      ...(winner ? { winningTradeId: winner.bid.tradeId } : {}),
      ...(winningChain ? {
        winningBidChainId: winningChain.id,
        winningBidChainTotal: winningChain.amount,
        winningBidChainPaymentIds: winningChain.paymentEventIds,
      } : {}),
    },
    ...(request.now !== undefined ? { createdAt: request.now } : {}),
  })
}

export async function publishAuctionComplete(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceAuctionSettlementRequest,
  winner?: MarketplaceAuctionBidValidation,
  winningChain?: ParsedAuctionBidChain,
): Promise<Event> {
  return publishMarketplaceTemplate(opts, auctionCompleteTemplate(request, winner, winningChain))
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
  payment: ParsedPayment,
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
  promotions: MarketplaceAuctionPromotedPayment[],
  auctionCompleteEvent: Event,
  winningChain?: ParsedAuctionBidChain,
): Promise<{ order: Event; payments: Array<{ bid: MarketplaceAuctionBidValidation; payment: Event; ack: Event; proof: PaymentProofEvidence }> }> {
  if (promotions.length === 0) throw new Error('Auction promotion requires at least one promoted payment')
  const { signer } = requireArbitrationPublisher(opts)
  const senderPubkey = opts.identity?.pubkey ?? await signer.getPublicKey?.()
  if (!senderPubkey) throw new Error('Auction promotion requires the arbiter signer pubkey')
  const auctionAnchor = auctionAnchorForRequest(request)
  const orderTemplate = promotedAuctionOrderTemplate(winner, request, winningChain)
  orderTemplate.extraTags = [
    ...(orderTemplate.extraTags ?? []),
    ['e', auctionCompleteEvent.id, '', 'auction-complete'],
    ...promotions.map(promotion => ['e', promotion.settlementEvent.id, '', 'auction-promote']),
  ]
  const order = await publishMarketplaceTemplate(opts, generateOrderEventTemplate(orderTemplate))
  const payments: Array<{ bid: MarketplaceAuctionBidValidation; payment: Event; ack: Event; proof: PaymentProofEvidence }> = []
  for (const promotion of promotions) {
    if (!promotion.bid.payment) throw new Error('Auction promoted bid requires a payment')
    const sourceProof = await sourcePaymentProofForPromotion(opts, promotion.bid.payment)
    const protectedProof = await buildPaymentProofPayloadWithSigner(
      promotedPaymentProof(sourceProof, promotion.proof),
      {
        signer,
        senderPubkey,
        recipientPubkeys: [
          senderPubkey,
          ...(orderTemplate.participants ?? []).map(participant => participant.pubkey),
        ],
      },
    )
    const payment = await publishMarketplaceTemplate(
      opts,
      generatePaymentEventTemplate({
        tradeId: orderTemplate.tradeId,
        anchors: [
          { value: orderTemplate.listingAnchor, marker: 'listing' },
          { value: auctionAnchor, marker: 'auction' },
        ],
        participants: orderTemplate.participants,
        orderGroupId: orderGroupIdForOrder(order),
        refs: {
          orders: [order.id],
          settlements: [promotion.settlementEvent.id],
          auctionCompletes: [auctionCompleteEvent.id],
        },
        amount: promotion.bid.payment.content.amount ?? promotion.bid.validation.amount,
        proof: protectedProof.proof,
        paymentProofKeys: protectedProof.paymentProofKeys,
        ...(request.now !== undefined ? { createdAt: request.now } : {}),
      }),
    )
    const ack = await publishMarketplaceTemplate(
      opts,
      generatePaymentAckEventTemplate({
        tradeId: orderTemplate.tradeId,
        anchors: [
          { value: orderTemplate.listingAnchor, marker: 'listing' },
          { value: auctionAnchor, marker: 'auction' },
        ],
        participants: orderTemplate.participants,
        orderGroupId: orderGroupIdForOrder(order),
        refs: { orders: [order.id], payments: [payment.id], auctionCompletes: [auctionCompleteEvent.id] },
        status: 'accepted',
        message: 'Auction winning payment promoted into order payment',
        ...(request.now !== undefined ? { createdAt: request.now } : {}),
      }),
    )
    payments.push({ bid: promotion.bid, payment, ack, proof: promotion.proof })
  }
  return { order, payments }
}

export async function* settleMarketplaceAuction(
  opts: MarketplaceRuntimeOptions,
  request: MarketplaceAuctionSettlementRequest,
): AsyncIterable<MarketplaceAuctionSettlementState> {
  requireArbitrationPublisher(opts)
  const journal = await settlementJournalContext(opts, request)
  const publishOpts = journal.options
  const groups = (await auctionBidGroupsForSettlement(opts, request))
    .sort((left, right) => left.bid.event.id.localeCompare(right.bid.event.id))
  const bids = groups.map(group => bidValidationFromDecision(group, request))
  for (const bid of bids) yield { type: 'bid_validated', bid }

  const bidByEventId = new Map(bids.map(bid => [bid.bid.event.id, bid]))
  const acceptedGroups = groups.filter(group => {
    const bid = bidByEventId.get(group.bid.event.id)
    return bid ? acceptedBidValidation(bid) : false
  })
  const acceptedChains = buildAuctionBidChains(acceptedGroups).filter(chain => chain.complete)
  const winningChain = acceptedChains.reduce<ParsedAuctionBidChain | undefined>(higherBidChain, undefined)
  const winner = winningChain ? bidByEventId.get(winningChain.head.bid.event.id) : undefined
  yield { type: 'winner_selected', winner, bids }

  const allActiveChains = buildAuctionBidChains(groups)
  const chainByGroupId = new Map<string, ParsedAuctionBidChain>()
  for (const chain of allActiveChains) {
    for (const group of chain.groups) chainByGroupId.set(group.id, chain)
  }
  const winningGroupIds = new Set(winningChain?.groups.map(group => group.id) ?? [])
  const targetOrderTemplate = winner && winningChain
    ? promotedAuctionOrderTemplate(winner, request, winningChain)
    : undefined
  const targetOrderGroupId = targetOrderTemplate
    ? orderGroupIdForParticipants(targetOrderTemplate.tradeId, targetOrderTemplate.participants ?? [])
    : undefined

  const plans: MarketplaceAuctionSettlementPlan[] = []
  for (const [index, bid] of bids.entries()) {
    if (!bid.payment) continue
    const group = groups[index]
    if (!group) continue
    const action: 'auction_refund' | 'auction_promote' = winner && bid.bid.event.id === winner.bid.event.id
      ? 'auction_promote'
      : 'auction_refund'
    const chainAction = winningGroupIds.has(group.id) ? 'auction_promote' : action
    const operationId = auctionSettlementOperationId(request, bid, chainAction)
    const previousForBid = Object.values(journal.record.actions).find(candidate =>
      candidate.bidEventId === bid.bid.event.id && candidate.paymentEventId === bid.payment!.event.id,
    )
    if (previousForBid && previousForBid.operationId !== operationId) {
      throw new Error(`Auction settlement decision changed after journaling for bid ${bid.bid.event.id}`)
    }
    if (group.settlement && !previousForBid) continue
    if (!previousForBid) {
      await journal.save({
        ...journal.record,
        actions: {
          ...journal.record.actions,
          [operationId]: {
            operationId,
            action: chainAction,
            bidEventId: bid.bid.event.id,
            paymentEventId: bid.payment.event.id,
            status: 'pending',
          },
        },
        updatedAt: request.now!,
      })
    }
    // Even after completion, ask the driver to reconstruct the exact result
    // from its deterministic operation id. The journal intentionally stores no
    // proof because some drivers return bearer value (for example Cashu).
    const executed = chainAction === 'auction_promote' && winner && targetOrderTemplate && targetOrderGroupId
      ? await recycleAuctionBidPayment(
          opts,
          bid,
          request,
          winner,
          targetOrderTemplate.tradeId,
          targetOrderGroupId,
          operationId,
        )
      : await refundAuctionBid(opts, bid, request, operationId, winner)
    const result = requireCompletedFinancialResult(executed, operationId)
    const resultCommitment = sha256Hex(sortedJson(result))
    if (previousForBid?.status === 'completed') {
      if (!previousForBid.resultCommitment || previousForBid.resultCommitment !== resultCommitment) {
        throw new Error(`Recovered auction result does not match journal commitment: ${operationId}`)
      }
    } else {
      await journal.save({
        ...journal.record,
        actions: {
          ...journal.record.actions,
          [operationId]: {
            operationId,
            action: chainAction,
            bidEventId: bid.bid.event.id,
            paymentEventId: bid.payment.event.id,
            status: 'completed',
            receipt: publicFinancialReceipt(result.receipt),
            resultCommitment,
          },
        },
        updatedAt: request.now!,
      })
    }
    plans.push({
      group,
      bid,
      action: chainAction,
      operationId,
      result,
      ...(targetOrderTemplate ? { targetOrderTemplate } : {}),
      ...(targetOrderTemplate?.tradeId ? { targetTradeId: targetOrderTemplate.tradeId } : {}),
      ...(targetOrderGroupId ? { targetOrderGroupId } : {}),
    })
  }

  await journal.save({
    ...journal.record,
    status: 'financial_complete',
    updatedAt: request.now!,
  })

  // Sign and durably enqueue the terminal event first so dependent events can
  // reference it, but publish it last. Observers must never see an auction as
  // complete while financial/action events are still missing.
  const auctionCompleteEvent = await publishOpts.signer!.signEvent(
    auctionCompleteTemplate(request, winner, winningChain),
  )

  const promotedPayments: MarketplaceAuctionPromotedPayment[] = []

  for (const plan of plans) {
    const event = await publishAuctionPaymentSettlement(
      publishOpts,
      request,
      plan.bid,
      plan.action,
      plan.result,
      winner,
      chainByGroupId.get(plan.group.id),
      winningChain,
      plan.targetTradeId,
      plan.targetOrderGroupId,
      auctionCompleteEvent,
    )
    if (plan.action === 'auction_promote') {
      promotedPayments.push({
        ...plan,
        settlementEvent: event,
        proof: plan.result.proof,
      })
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

  if (winner && promotedPayments.length > 0) {
    const promoted = await publishPromotedAuctionOrder(
      publishOpts,
      winner,
      request,
      promotedPayments,
      auctionCompleteEvent,
      winningChain,
    )
    yield { type: 'order_published', winner, event: promoted.order }
    for (const item of promoted.payments) {
      yield { type: 'payment_published', winner, event: item.payment, proof: item.proof }
      yield { type: 'payment_ack_published', winner, event: item.ack }
    }
  }

  await publishOpts.publish!(auctionCompleteEvent)
  yield { type: 'auction_complete_published', winner, event: auctionCompleteEvent }

  await journal.save({
    ...journal.record,
    status: 'completed',
    updatedAt: request.now!,
  })
  yield { type: 'completed', winner, bids }
}
