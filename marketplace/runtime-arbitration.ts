import type { SubCloser } from '../abstract-pool.ts'
import type { Event } from '../core.ts'
import {
  auctionCompleteAppliesToAuction,
  type ParsedMarketplaceAuction,
  type ParsedMarketplaceAuctionComplete,
} from './auction.ts'
import {
  fetchAuctionBidGroups,
  subscribeAuctionBidGroups,
  type AuctionBidGroupSearchOptions,
  type AuctionBidGroupSubscribeOptions,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
import {
  searchAuctionCompletes,
  searchAuctions,
  subscribeAuctions,
  type MarketplaceAuctionCompleteSearchOptions,
  type MarketplaceAuctionSearchOptions,
  type MarketplaceAuctionSubscribeOptions,
} from './auction-query.ts'
import {
  generatePaymentAckEventTemplate,
  generatePaymentNackEventTemplate,
  paymentLifecycleHasAnchor,
  type ParsedPayment,
} from './payment-lifecycle.ts'
import { resolvePaymentAmount } from './payment-amount.ts'
import { resolvePaymentProof } from './payment-proof.ts'
import type { MarketplacePaymentValidationResult } from './payment-validation.ts'
import {
  auctionPaymentItem,
  settleMarketplaceAuction,
  validateAuctionPayment,
} from './runtime-auction-settlement.ts'
import {
  emitArbitrationState,
  errorFromUnknown,
  arbitrationStartIdentity,
  processArbitrationGroupPayment,
  shouldAck,
  shouldNack,
  startMarketplaceOrderArbitration,
} from './runtime-payment-arbitration.ts'
import {
  publishMarketplaceTemplate,
  requireArbitrationPublisher,
  requireSubscribePool,
} from './runtime-common.ts'
import type {
  MarketplaceArbitrationRuntime,
  MarketplaceArbitrationStartOptions,
  MarketplaceRuntimeOptions,
} from './runtime-types.ts'
import type { PaymentProof } from './helper.ts'
import { isMarketplaceDriverEncryptedPaymentProofParams } from '@sudonym-btc/marketplace-driver-interface'

const AUCTION_SETTLEMENT_SWEEP_INTERVAL_MS = 60 * 60 * 1000

function paymentDriver(payment?: ParsedPayment): string {
  return payment?.content.proof?.paymentProof?.driver ?? 'none'
}

function invalidAuctionBidPayment(
  group: ParsedAuctionBidGroup,
  payment: ParsedPayment | undefined,
  error: string,
): MarketplacePaymentValidationResult {
  return {
    driver: paymentDriver(payment),
    status: 'invalid',
    ...(payment ? { proofEventId: payment.event.id } : {}),
    data: { bidEventId: group.bid.event.id },
    error,
  }
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function recycleTargetOrder(proofParams: Record<string, unknown>): Record<string, unknown> | undefined {
  const recycleArgs = recordValue(proofParams.recycleArgs)
  if (!recycleArgs) return undefined
  const target = recordValue(recycleArgs.target)
  if (!target) return undefined
  return recordValue(target.order)
}

function valuesMatch(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function recycleArgsMatchBidOrder(
  auction: ParsedMarketplaceAuction,
  group: ParsedAuctionBidGroup,
  payment: ParsedPayment,
  resolvedProof = payment.content.proof,
): string | undefined {
  const proof = resolvedProof?.paymentProof
  const params = proof && !isMarketplaceDriverEncryptedPaymentProofParams(proof.params)
    ? proof.params as Record<string, unknown>
    : undefined
  const order = params ? recycleTargetOrder(params) : undefined
  if (!order) return 'Auction bid recycleArgs are missing target order parameters'
  const expected = {
    ...(group.bid.content.targetOrder ?? {}),
    listingAnchor: group.bid.content.targetOrder?.listingAnchor ?? group.bid.listingAnchor,
  }
  if (order.listingAnchor !== group.bid.listingAnchor || order.listingAnchor !== auction.listingAnchor) {
    return 'Auction bid recycleArgs target listing does not match auction listing'
  }
  for (const key of ['start', 'end', 'quantity', 'recipient'] as const) {
    if (expected[key] !== undefined && !valuesMatch(order[key], expected[key])) {
      return `Auction bid recycleArgs target ${key} does not match bid order`
    }
  }
  return undefined
}

function auctionHasPaymentAckFrom(group: ParsedAuctionBidGroup, payment: ParsedPayment, pubkey: string): boolean {
  return group.paymentAcks.some(ack =>
    ack.event.pubkey === pubkey && (
      ack.refs.payments.includes(payment.event.id) ||
      ack.refs.auctionBids.includes(group.bid.event.id)
    ),
  )
}

function auctionHasPaymentNackFrom(group: ParsedAuctionBidGroup, payment: ParsedPayment | undefined, pubkey: string): boolean {
  return group.paymentNacks.some(nack =>
    nack.event.pubkey === pubkey && (
      (payment && nack.refs.payments.includes(payment.event.id)) ||
      nack.refs.auctionBids.includes(group.bid.event.id)
    ),
  )
}

function auctionBidPaymentPrecheck(
  auction: ParsedMarketplaceAuction,
  group: ParsedAuctionBidGroup,
  payment: ParsedPayment | undefined,
  arbiterPubkey: string,
  now?: number,
  resolvedProof?: PaymentProof,
): MarketplacePaymentValidationResult | null {
  if (!payment) return invalidAuctionBidPayment(group, payment, 'Auction bid has no payment event')
  if (group.auctionAnchor !== auction.auctionAnchor) {
    return invalidAuctionBidPayment(group, payment, 'Bid does not belong to auction')
  }
  if (group.listingAnchor !== auction.listingAnchor) {
    return invalidAuctionBidPayment(group, payment, 'Bid listing does not match auction listing')
  }
  if (!paymentLifecycleHasAnchor(payment, auction.auctionAnchor, 'auction')) {
    return invalidAuctionBidPayment(group, payment, 'Payment is not an auction bid lock')
  }
  if (group.amount.denomination !== auction.currency || group.amount.decimals !== auction.decimals) {
    return invalidAuctionBidPayment(group, payment, `Bid must use auction currency ${auction.currency}`)
  }
  if (!group.participants.some(participant => participant.role === 'arbiter' && participant.pubkey === auction.arbiterPubkey)) {
    return invalidAuctionBidPayment(group, payment, 'Bid does not tag the auction arbiter')
  }
  if (auction.arbiterPubkey !== arbiterPubkey) {
    return invalidAuctionBidPayment(group, payment, 'Runtime identity is not the auction arbiter')
  }
  if (auction.startAt !== undefined && group.bid.event.created_at < auction.startAt) {
    return invalidAuctionBidPayment(group, payment, 'Bid was created before the auction started')
  }
  if (auction.endAt !== undefined && group.bid.event.created_at > auction.endAt) {
    return invalidAuctionBidPayment(group, payment, 'Bid was created after the auction ended')
  }
  if (auction.startingBid && /^\d+$/.test(auction.startingBid) && /^\d+$/.test(group.amount.value ?? '')) {
    if (BigInt(group.amount.value!) < BigInt(auction.startingBid)) {
      return invalidAuctionBidPayment(group, payment, 'Bid is below the auction starting bid')
    }
  }
  const proof = (resolvedProof ?? payment.content.proof)?.paymentProof
  if (!proof) return invalidAuctionBidPayment(group, payment, 'Auction bid payment has no payment proof')
  const params = isMarketplaceDriverEncryptedPaymentProofParams(proof.params)
    ? undefined
    : proof.params as Record<string, unknown>
  if (!params || params.recycleArgs === undefined || params.recycleArgs === null) {
    return invalidAuctionBidPayment(group, payment, 'Auction bid payment is missing recycle covenant parameters')
  }
  const recycleArgsError = recycleArgsMatchBidOrder(auction, group, payment, resolvedProof ?? payment.content.proof)
  if (recycleArgsError) return invalidAuctionBidPayment(group, payment, recycleArgsError)
  if (now !== undefined && auction.startAt !== undefined && now < auction.startAt) {
    return invalidAuctionBidPayment(group, payment, 'Auction is not open yet')
  }
  return null
}

async function validateAuctionBidPaymentForRuntime(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceArbitrationStartOptions,
  auction: ParsedMarketplaceAuction,
  group: ParsedAuctionBidGroup,
  payment: ParsedPayment,
  arbiterPubkey: string,
): Promise<MarketplacePaymentValidationResult> {
  let resolvedProof = payment.content.proof
  if (!resolvedProof && payment.content.sealedProof) {
    const proofResolution = await resolvePaymentProof(payment, {
      keys: payment.paymentProofKeys,
      signer: opts.signer,
      signerPubkey: arbiterPubkey,
    })
    if (proofResolution.status !== 'resolved' || !proofResolution.proof) {
      return invalidAuctionBidPayment(group, payment, proofResolution.error ?? 'Auction bid payment proof could not be resolved')
    }
    resolvedProof = proofResolution.proof
  }
  const precheck = auctionBidPaymentPrecheck(auction, group, payment, arbiterPubkey, options.now, resolvedProof)
  if (precheck) return precheck
  const amount = await resolvePaymentAmount(payment, { signer: opts.signer, signerPubkey: arbiterPubkey })
  if (amount.status !== 'resolved' || !amount.amount) {
    return invalidAuctionBidPayment(group, payment, amount.error ?? 'Auction bid payment amount could not be resolved')
  }
  const item = auctionPaymentItem(group.bid, payment, options.now, amount.amount, resolvedProof)
  if (!item) return invalidAuctionBidPayment(group, payment, 'Auction bid payment has no recoverable proof')
  try {
    return await validateAuctionPayment(opts, item)
  } catch (error) {
    return invalidAuctionBidPayment(group, payment, errorFromUnknown(error).message)
  }
}

function auctionSearchOptions(options: MarketplaceArbitrationStartOptions): MarketplaceAuctionSearchOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
  }
}

function auctionCompleteSearchOptions(options: MarketplaceArbitrationStartOptions): MarketplaceAuctionCompleteSearchOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
  }
}

function auctionSubscribeOptions(options: MarketplaceArbitrationStartOptions): MarketplaceAuctionSubscribeOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
    ...(options.id ? { id: `${options.id}:auctions` } : {}),
    ...(options.label ? { label: `${options.label}:auctions` } : {}),
    ...(options.abort ? { abort: options.abort } : {}),
  }
}

function auctionBidSearchOptions(options: MarketplaceArbitrationStartOptions): AuctionBidGroupSearchOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
  }
}

function auctionBidSubscribeOptions(
  options: MarketplaceArbitrationStartOptions,
  auction: ParsedMarketplaceAuction,
): AuctionBidGroupSubscribeOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
    ...(options.id ? { id: `${options.id}:auction-bids:${auction.d}` } : {}),
    ...(options.label ? { label: `${options.label}:auction-bids:${auction.d}` } : {}),
    ...(options.abort ? { abort: options.abort } : {}),
  }
}

function secondsNow(options: MarketplaceArbitrationStartOptions): number {
  return options.now ?? Math.floor(Date.now() / 1000)
}

function auctionSettlementSweepIntervalMs(options: MarketplaceArbitrationStartOptions): number {
  return options.auctionSettlementSweepIntervalMs ?? AUCTION_SETTLEMENT_SWEEP_INTERVAL_MS
}

function auctionIsDueForSettlement(auction: ParsedMarketplaceAuction, options: MarketplaceArbitrationStartOptions): boolean {
  return auction.endAt !== undefined && secondsNow(options) >= auction.endAt
}

function settlementRequest(
  auction: ParsedMarketplaceAuction,
  options: MarketplaceArbitrationStartOptions,
) {
  return {
    ...(options.auctionSettlement ?? {}),
    auctionId: auction.d,
    auctionAnchor: auction.auctionAnchor,
    listingAnchor: auction.listingAnchor,
    arbiterPubkey: auction.arbiterPubkey,
    currency: auction.currency,
    decimals: auction.decimals,
    ...(auction.startAt !== undefined ? { startAt: auction.startAt } : {}),
    ...(auction.endAt !== undefined ? { endAt: auction.endAt } : {}),
    ...(auction.startingBid !== undefined ? { startingBid: auction.startingBid } : {}),
    now: options.auctionSettlement?.now ?? secondsNow(options),
  }
}

export function startMarketplaceArbitration(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceArbitrationStartOptions = {},
): MarketplaceArbitrationRuntime {
  requireArbitrationPublisher(opts)
  const identity = arbitrationStartIdentity(opts, options)
  if (!identity.pubkey) throw new Error('Marketplace arbitration identity pubkey is required')
  const arbiterPubkey: string = identity.pubkey

  const orderRuntime = options.orders === false ? undefined : startMarketplaceOrderArbitration(opts, options)
  const bidClosers = new Map<string, SubCloser>()
  let settlementSweepTimer: ReturnType<typeof setInterval> | undefined
  const processedAuctionPayments = new Set<string>()
  const settlementInFlight = new Set<string>()

  async function publishAuctionBidAck(
    auction: ParsedMarketplaceAuction,
    group: ParsedAuctionBidGroup,
    payment: ParsedPayment,
    validation: MarketplacePaymentValidationResult,
  ): Promise<void> {
    if (auctionHasPaymentAckFrom(group, payment, arbiterPubkey)) {
      await emitArbitrationState(options, { type: 'auction_ignored', auction, group, payment, reason: 'bid payment already acked by arbiter' })
      return
    }
    const event = await publishMarketplaceTemplate(
      opts,
      generatePaymentAckEventTemplate({
        orderGroupId: group.tradeId,
        tradeId: group.tradeId,
        anchors: [
          { value: auction.auctionAnchor, marker: 'auction' },
          { value: auction.listingAnchor, marker: 'listing' },
        ],
        participants: group.participants,
        refs: { auctionBids: [group.bid.event.id], payments: [payment.event.id] },
        status: 'accepted',
      }),
    )
    await emitArbitrationState(options, { type: 'auction_bid_payment_ack_published', auction, group, payment, validation, event })
  }

  async function publishAuctionBidNack(
    auction: ParsedMarketplaceAuction,
    group: ParsedAuctionBidGroup,
    payment: ParsedPayment | undefined,
    validation: MarketplacePaymentValidationResult,
  ): Promise<void> {
    if (auctionHasPaymentNackFrom(group, payment, arbiterPubkey)) {
      await emitArbitrationState(options, { type: 'auction_ignored', auction, group, payment, reason: 'bid payment already nacked by arbiter' })
      return
    }
    const event = await publishMarketplaceTemplate(
      opts,
      generatePaymentNackEventTemplate({
        orderGroupId: group.tradeId,
        tradeId: group.tradeId,
        anchors: [
          { value: auction.auctionAnchor, marker: 'auction' },
          { value: auction.listingAnchor, marker: 'listing' },
        ],
        participants: group.participants,
        refs: {
          auctionBids: [group.bid.event.id],
          ...(payment ? { payments: [payment.event.id] } : {}),
        },
        status: 'rejected',
        ...(validation.error ? { message: validation.error } : {}),
      }),
    )
    await emitArbitrationState(options, { type: 'auction_bid_payment_nack_published', auction, group, payment, validation, event })
  }

  async function processAuctionBidGroup(
    auction: ParsedMarketplaceAuction,
    group: ParsedAuctionBidGroup,
  ): Promise<void> {
    await emitArbitrationState(options, { type: 'auction_bid_group', auction, group })
    const payment = group.payment
    if (!payment) {
      await emitArbitrationState(options, { type: 'auction_ignored', auction, group, reason: 'bid has no payment event yet' })
      return
    }

    const key = `${auction.auctionAnchor}:${group.tradeId}:${payment.event.id}:${payment.event.created_at}:${group.paymentAcks.length}:${group.paymentNacks.length}:${group.settlements.length}`
    if (processedAuctionPayments.has(key)) return
    processedAuctionPayments.add(key)

    await emitArbitrationState(options, { type: 'auction_bid_payment_seen', auction, group, payment })
    const validation = await validateAuctionBidPaymentForRuntime(opts, options, auction, group, payment, arbiterPubkey)
    await emitArbitrationState(options, { type: 'auction_bid_payment_validated', auction, group, payment, validation })

    if ((options.autoAck ?? true) && shouldAck(validation)) {
      await publishAuctionBidAck(auction, group, payment, validation)
    } else if ((options.autoNack ?? true) && shouldNack(validation)) {
      await publishAuctionBidNack(auction, group, payment, validation)
    }
  }

  async function latestAuctionComplete(auction: ParsedMarketplaceAuction) {
    const [complete] = await searchAuctionCompletes(
      opts.pool,
      opts.relays,
      { auctionAnchor: auction.auctionAnchor, authors: [auction.arbiterPubkey], limit: 10 },
      auctionCompleteSearchOptions(options),
    )
    return complete
  }

  async function settleAuction(
    auction: ParsedMarketplaceAuction,
    knownComplete?: ParsedMarketplaceAuctionComplete,
  ): Promise<void> {
    if (auction.arbiterPubkey !== arbiterPubkey) {
      await emitArbitrationState(options, { type: 'auction_ignored', auction, reason: 'auction is not assigned to this arbiter' })
      return
    }
    if (auction.endAt === undefined) {
      await emitArbitrationState(options, { type: 'auction_ignored', auction, reason: 'auction has no end time' })
      return
    }
    if (!auctionIsDueForSettlement(auction, options)) {
      await emitArbitrationState(options, { type: 'auction_ignored', auction, reason: 'auction has not ended yet' })
      return
    }
    const complete = knownComplete ?? await latestAuctionComplete(auction)
    if (complete && auctionCompleteAppliesToAuction(auction, complete)) {
      await emitArbitrationState(options, { type: 'auction_ignored', auction, reason: 'auction already completed' })
      return
    }
    if (settlementInFlight.has(auction.auctionAnchor)) return
    settlementInFlight.add(auction.auctionAnchor)
    try {
      await emitArbitrationState(options, { type: 'auction_settlement_started', auction })
      for await (const state of settleMarketplaceAuction(opts, settlementRequest(auction, options))) {
        await emitArbitrationState(options, { type: 'auction_settlement_state', auction, state })
        if (state.type === 'completed') {
          await emitArbitrationState(options, { type: 'auction_settlement_completed', auction, winner: state.winner })
        }
      }
    } catch (error) {
      await emitArbitrationState(options, { type: 'auction_error', auction, error: errorFromUnknown(error) })
    } finally {
      settlementInFlight.delete(auction.auctionAnchor)
    }
  }

  async function settleDueAuctions(): Promise<void> {
    if (options.autoSettleAuctions === false) return
    const auctions = await searchAuctions(
      opts.pool,
      opts.relays,
      { ...(options.auctionQuery ?? {}), arbiterPubkeys: [arbiterPubkey] },
      auctionSearchOptions(options),
    )
    const dueAuctions = auctions.filter(auction => auctionIsDueForSettlement(auction, options))
    if (dueAuctions.length === 0) return

    const completes = await searchAuctionCompletes(
      opts.pool,
      opts.relays,
      { auctionAnchors: dueAuctions.map(auction => auction.auctionAnchor), authors: [arbiterPubkey] },
      auctionCompleteSearchOptions(options),
    )
    const completeByAuction = new Map(completes.map(complete => [complete.auctionAnchor, complete]))
    await Promise.all(dueAuctions.map(auction => settleAuction(auction, completeByAuction.get(auction.auctionAnchor))))
  }

  function startAuctionSettlementLoop(): void {
    if (options.auctions === false || options.autoSettleAuctions === false) return
    void settleDueAuctions().catch(error => emitArbitrationState(options, { type: 'auction_error', error: errorFromUnknown(error) }))
    const intervalMs = auctionSettlementSweepIntervalMs(options)
    if (intervalMs <= 0) return
    settlementSweepTimer = setInterval(() => {
      void settleDueAuctions().catch(error => emitArbitrationState(options, { type: 'auction_error', error: errorFromUnknown(error) }))
    }, intervalMs)
    ;(settlementSweepTimer as unknown as { unref?: () => void }).unref?.()
  }

  async function settleAuctionIfDue(auction: ParsedMarketplaceAuction): Promise<void> {
    if (options.autoSettleAuctions === false) return
    if (!auctionIsDueForSettlement(auction, options)) return
    await settleAuction(auction)
  }

  function stopAuctionSettlementLoop(): void {
    if (settlementSweepTimer) {
      clearInterval(settlementSweepTimer)
      settlementSweepTimer = undefined
    }
  }

  async function processAuction(auction: ParsedMarketplaceAuction): Promise<void> {
    if (auction.arbiterPubkey !== arbiterPubkey) {
      await emitArbitrationState(options, { type: 'auction_ignored', auction, reason: 'auction is not assigned to this arbiter' })
      return
    }
    await emitArbitrationState(options, { type: 'auction_seen', auction })

    const bidQuery = {
      ...(options.auctionBidQuery ?? {}),
      auctionAnchor: auction.auctionAnchor,
      participantPubkeys: [arbiterPubkey],
    }
    try {
      const groups = await fetchAuctionBidGroups(opts.pool, opts.relays, bidQuery, auctionBidSearchOptions(options))
      await Promise.all(groups.map(group => processAuctionBidGroup(auction, group)))
    } catch (error) {
      await emitArbitrationState(options, { type: 'auction_error', auction, error: errorFromUnknown(error) })
    }

    if (!bidClosers.has(auction.auctionAnchor) && options.auctions !== false) {
      const closer = subscribeAuctionBidGroups(
        requireSubscribePool(opts.pool),
        opts.relays,
        bidQuery,
        {
          ongroup(group) {
            void processAuctionBidGroup(auction, group)
          },
          oneose() {
            void emitArbitrationState(options, { type: 'eose' })
          },
          onclose(reasons) {
            void emitArbitrationState(options, { type: 'closed', reasons })
          },
          oninvalid(_event: Event, error: Error) {
            void emitArbitrationState(options, { type: 'auction_error', auction, error })
          },
        },
        auctionBidSubscribeOptions(options, auction),
      )
      bidClosers.set(auction.auctionAnchor, closer)
    }

    await settleAuctionIfDue(auction)
  }

  let auctionCloser: SubCloser | undefined
  if (options.auctions !== false) {
    const pool = requireSubscribePool(opts.pool)
    const query = {
      ...(options.auctionQuery ?? {}),
      arbiterPubkeys: [arbiterPubkey],
    }
    void searchAuctions(opts.pool, opts.relays, query, auctionSearchOptions(options))
      .then(auctions => Promise.all(auctions.map(processAuction)))
      .catch(error => emitArbitrationState(options, { type: 'auction_error', error: errorFromUnknown(error) }))
    auctionCloser = subscribeAuctions(
      pool,
      opts.relays,
      query,
      {
        onauction(auction) {
          void processAuction(auction)
        },
        oneose() {
          void emitArbitrationState(options, { type: 'eose' })
        },
        onclose(reasons) {
          void emitArbitrationState(options, { type: 'closed', reasons })
        },
        oninvalid(_event: Event, error: Error) {
          void emitArbitrationState(options, { type: 'auction_error', error })
        },
      },
      auctionSubscribeOptions(options),
    )
  }
  startAuctionSettlementLoop()

  if (options.orders === false) {
    void emitArbitrationState(options, { type: 'started', identity })
  }

  return {
    close(reason?: string) {
      orderRuntime?.close(reason)
      auctionCloser?.close(reason)
      for (const closer of bidClosers.values()) closer.close(reason)
      bidClosers.clear()
      stopAuctionSettlementLoop()
      void emitArbitrationState(options, { type: 'closed', reasons: reason ? [reason] : [] })
    },
    async processGroup(group) {
      if (orderRuntime) {
        await orderRuntime.processGroup(group)
        return
      }
      for (const payment of group.payments) {
        try {
          await processArbitrationGroupPayment(opts, options, identity, group, payment)
        } catch (error) {
          await emitArbitrationState(options, { type: 'error', group, payment, error: errorFromUnknown(error) })
        }
      }
    },
    processAuction,
    processAuctionBidGroup,
    settleAuction,
    settleDueAuctions,
  }
}
