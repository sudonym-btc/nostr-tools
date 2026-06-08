import type { SubCloser } from '../abstract-pool.ts'
import type { Event } from '../core.ts'
import {
  type ParsedMarketplaceAuction,
} from './auction.ts'
import {
  fetchAuctionBidGroups,
  subscribeAuctionBidGroups,
  type AuctionBidGroupSearchOptions,
  type AuctionBidGroupSubscribeOptions,
  type ParsedAuctionBidGroup,
} from './auction-bid-group.ts'
import {
  searchAuctions,
  subscribeAuctions,
  type MarketplaceAuctionSearchOptions,
  type MarketplaceAuctionSubscribeOptions,
} from './auction-query.ts'
import type { PaymentMethod } from './helper.ts'
import {
  generateOrderPaymentAckEventTemplate,
  generateOrderPaymentNackEventTemplate,
  type ParsedOrderPayment,
} from './order-lifecycle.ts'
import type { MarketplacePaymentValidationResult } from './payment-validation.ts'
import {
  auctionPaymentItem,
  settleMarketplaceAuction,
  validateAuctionPayment,
} from './runtime-auction-settlement.ts'
import {
  emitEscrowState,
  errorFromUnknown,
  escrowStartIdentity,
  processEscrowGroupPayment,
  shouldAck,
  shouldNack,
  startMarketplaceEscrow,
} from './runtime-escrow.ts'
import {
  publishMarketplaceTemplate,
  requireEscrowPublisher,
  requireSubscribePool,
} from './runtime-common.ts'
import type {
  MarketplaceEscrowRuntime,
  MarketplaceEscrowStartOptions,
  MarketplaceRuntimeOptions,
} from './runtime-types.ts'

function paymentMethod(payment?: ParsedOrderPayment): PaymentMethod {
  return payment?.content.proof.paymentProof?.method ?? 'none'
}

function invalidAuctionBidPayment(
  group: ParsedAuctionBidGroup,
  payment: ParsedOrderPayment | undefined,
  error: string,
): MarketplacePaymentValidationResult {
  return {
    method: paymentMethod(payment),
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
  payment: ParsedOrderPayment,
): string | undefined {
  const proof = payment.content.proof.paymentProof
  const order = proof ? recycleTargetOrder(proof.params) : undefined
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

function auctionHasPaymentAckFrom(group: ParsedAuctionBidGroup, payment: ParsedOrderPayment, pubkey: string): boolean {
  return group.paymentAcks.some(ack =>
    ack.event.pubkey === pubkey && (
      ack.refs.payments.includes(payment.event.id) ||
      ack.refs.auctionBids.includes(group.bid.event.id) ||
      (ack.orderGroupId === group.bidId && ack.tradeId === group.tradeId)
    ),
  )
}

function auctionHasPaymentNackFrom(group: ParsedAuctionBidGroup, payment: ParsedOrderPayment | undefined, pubkey: string): boolean {
  return group.paymentNacks.some(nack =>
    nack.event.pubkey === pubkey && (
      (payment && nack.refs.payments.includes(payment.event.id)) ||
      nack.refs.auctionBids.includes(group.bid.event.id) ||
      (nack.orderGroupId === group.bidId && nack.tradeId === group.tradeId)
    ),
  )
}

function auctionBidPaymentPrecheck(
  auction: ParsedMarketplaceAuction,
  group: ParsedAuctionBidGroup,
  payment: ParsedOrderPayment | undefined,
  escrowPubkey: string,
  now?: number,
): MarketplacePaymentValidationResult | null {
  if (!payment) return invalidAuctionBidPayment(group, payment, 'Auction bid has no payment event')
  if (group.auctionAnchor !== auction.auctionAnchor) {
    return invalidAuctionBidPayment(group, payment, 'Bid does not belong to auction')
  }
  if (group.listingAnchor !== auction.listingAnchor) {
    return invalidAuctionBidPayment(group, payment, 'Bid listing does not match auction listing')
  }
  if (payment.listingAnchor !== auction.auctionAnchor || payment.content.purpose !== 'auction_bid') {
    return invalidAuctionBidPayment(group, payment, 'Payment is not an auction bid lock')
  }
  if (group.amount.denomination !== auction.currency || group.amount.decimals !== auction.decimals) {
    return invalidAuctionBidPayment(group, payment, `Bid must use auction currency ${auction.currency}`)
  }
  if (!group.participants.some(participant => participant.role === 'escrow' && participant.pubkey === auction.arbiterPubkey)) {
    return invalidAuctionBidPayment(group, payment, 'Bid does not tag the auction arbiter as escrow')
  }
  if (auction.arbiterPubkey !== escrowPubkey) {
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
  const proof = payment.content.proof.paymentProof
  if (!proof) return invalidAuctionBidPayment(group, payment, 'Auction bid payment has no payment proof')
  if (proof.params.subject !== undefined && proof.params.subject !== 'bid') {
    return invalidAuctionBidPayment(group, payment, 'Auction bid payment proof subject must be bid')
  }
  if (proof.params.recycleArgs === undefined || proof.params.recycleArgs === null) {
    return invalidAuctionBidPayment(group, payment, 'Auction bid payment is missing recycle covenant parameters')
  }
  const recycleArgsError = recycleArgsMatchBidOrder(auction, group, payment)
  if (recycleArgsError) return invalidAuctionBidPayment(group, payment, recycleArgsError)
  if (now !== undefined && auction.startAt !== undefined && now < auction.startAt) {
    return invalidAuctionBidPayment(group, payment, 'Auction is not open yet')
  }
  return null
}

async function validateAuctionBidPaymentForRuntime(
  opts: MarketplaceRuntimeOptions,
  options: MarketplaceEscrowStartOptions,
  auction: ParsedMarketplaceAuction,
  group: ParsedAuctionBidGroup,
  payment: ParsedOrderPayment,
  escrowPubkey: string,
): Promise<MarketplacePaymentValidationResult> {
  const precheck = auctionBidPaymentPrecheck(auction, group, payment, escrowPubkey, options.now)
  if (precheck) return precheck
  const item = auctionPaymentItem(group.bid, payment, options.now)
  if (!item) return invalidAuctionBidPayment(group, payment, 'Auction bid payment has no recoverable proof')
  return validateAuctionPayment(opts, item)
}

function auctionSearchOptions(options: MarketplaceEscrowStartOptions): MarketplaceAuctionSearchOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
  }
}

function auctionSubscribeOptions(options: MarketplaceEscrowStartOptions): MarketplaceAuctionSubscribeOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
    ...(options.id ? { id: `${options.id}:auctions` } : {}),
    ...(options.label ? { label: `${options.label}:auctions` } : {}),
    ...(options.abort ? { abort: options.abort } : {}),
  }
}

function auctionBidSearchOptions(options: MarketplaceEscrowStartOptions): AuctionBidGroupSearchOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
  }
}

function auctionBidSubscribeOptions(
  options: MarketplaceEscrowStartOptions,
  auction: ParsedMarketplaceAuction,
): AuctionBidGroupSubscribeOptions {
  return {
    ...(options.maxWait !== undefined ? { maxWait: options.maxWait } : {}),
    ...(options.id ? { id: `${options.id}:auction-bids:${auction.d}` } : {}),
    ...(options.label ? { label: `${options.label}:auction-bids:${auction.d}` } : {}),
    ...(options.abort ? { abort: options.abort } : {}),
  }
}

function secondsNow(options: MarketplaceEscrowStartOptions): number {
  return options.now ?? Math.floor(Date.now() / 1000)
}

function auctionSettleDelayMs(auction: ParsedMarketplaceAuction, options: MarketplaceEscrowStartOptions): number | undefined {
  if (auction.endAt === undefined) return undefined
  if (options.now !== undefined) return Math.max(0, (auction.endAt - options.now) * 1000)
  return Math.max(0, auction.endAt * 1000 - Date.now())
}

function settlementRequest(
  auction: ParsedMarketplaceAuction,
  options: MarketplaceEscrowStartOptions,
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
  options: MarketplaceEscrowStartOptions = {},
): MarketplaceEscrowRuntime {
  requireEscrowPublisher(opts)
  const identity = escrowStartIdentity(opts, options)
  if (!identity.pubkey) throw new Error('Marketplace arbitration identity pubkey is required')
  const escrowPubkey: string = identity.pubkey

  const orderRuntime = options.orders === false ? undefined : startMarketplaceEscrow(opts, options)
  const bidClosers = new Map<string, SubCloser>()
  const settlementTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const processedAuctionPayments = new Set<string>()
  const settlementStarted = new Set<string>()

  async function publishAuctionBidAck(
    auction: ParsedMarketplaceAuction,
    group: ParsedAuctionBidGroup,
    payment: ParsedOrderPayment,
    validation: MarketplacePaymentValidationResult,
  ): Promise<void> {
    if (auctionHasPaymentAckFrom(group, payment, escrowPubkey)) {
      await emitEscrowState(options, { type: 'auction_ignored', auction, group, payment, reason: 'bid payment already acked by arbiter' })
      return
    }
    const event = await publishMarketplaceTemplate(
      opts,
      generateOrderPaymentAckEventTemplate({
        orderGroupId: group.bidId,
        tradeId: group.tradeId,
        listingAnchor: auction.auctionAnchor,
        anchorMarker: 'auction',
        participants: group.participants,
        refs: { auctionBids: [group.bid.event.id], payments: [payment.event.id] },
        status: 'accepted',
      }),
    )
    await emitEscrowState(options, { type: 'auction_bid_payment_ack_published', auction, group, payment, validation, event })
  }

  async function publishAuctionBidNack(
    auction: ParsedMarketplaceAuction,
    group: ParsedAuctionBidGroup,
    payment: ParsedOrderPayment | undefined,
    validation: MarketplacePaymentValidationResult,
  ): Promise<void> {
    if (auctionHasPaymentNackFrom(group, payment, escrowPubkey)) {
      await emitEscrowState(options, { type: 'auction_ignored', auction, group, payment, reason: 'bid payment already nacked by arbiter' })
      return
    }
    const event = await publishMarketplaceTemplate(
      opts,
      generateOrderPaymentNackEventTemplate({
        orderGroupId: group.bidId,
        tradeId: group.tradeId,
        listingAnchor: auction.auctionAnchor,
        anchorMarker: 'auction',
        participants: group.participants,
        refs: {
          auctionBids: [group.bid.event.id],
          ...(payment ? { payments: [payment.event.id] } : {}),
        },
        status: 'rejected',
        ...(validation.error ? { message: validation.error } : {}),
      }),
    )
    await emitEscrowState(options, { type: 'auction_bid_payment_nack_published', auction, group, payment, validation, event })
  }

  async function processAuctionBidGroup(
    auction: ParsedMarketplaceAuction,
    group: ParsedAuctionBidGroup,
  ): Promise<void> {
    await emitEscrowState(options, { type: 'auction_bid_group', auction, group })
    const payment = group.payment
    if (!payment) {
      const validation = invalidAuctionBidPayment(group, payment, 'Auction bid has no payment event')
      if ((options.autoNack ?? true) && shouldNack(validation)) {
        await publishAuctionBidNack(auction, group, payment, validation)
      } else {
        await emitEscrowState(options, { type: 'auction_ignored', auction, group, reason: validation.error ?? 'bid has no payment event' })
      }
      return
    }

    const key = `${auction.auctionAnchor}:${group.bidId}:${payment.event.id}:${payment.event.created_at}:${group.paymentAcks.length}:${group.paymentNacks.length}:${group.settlements.length}`
    if (processedAuctionPayments.has(key)) return
    processedAuctionPayments.add(key)

    await emitEscrowState(options, { type: 'auction_bid_payment_seen', auction, group, payment })
    const validation = await validateAuctionBidPaymentForRuntime(opts, options, auction, group, payment, escrowPubkey)
    await emitEscrowState(options, { type: 'auction_bid_payment_validated', auction, group, payment, validation })

    if ((options.autoAck ?? true) && shouldAck(validation)) {
      await publishAuctionBidAck(auction, group, payment, validation)
    } else if ((options.autoNack ?? true) && shouldNack(validation)) {
      await publishAuctionBidNack(auction, group, payment, validation)
    }
  }

  async function settleAuction(auction: ParsedMarketplaceAuction): Promise<void> {
    if (settlementStarted.has(auction.auctionAnchor)) return
    settlementStarted.add(auction.auctionAnchor)
    try {
      await emitEscrowState(options, { type: 'auction_settlement_started', auction })
      for await (const state of settleMarketplaceAuction(opts, settlementRequest(auction, options))) {
        await emitEscrowState(options, { type: 'auction_settlement_state', auction, state })
        if (state.type === 'completed') {
          await emitEscrowState(options, { type: 'auction_settlement_completed', auction, winner: state.winner })
        }
      }
    } catch (error) {
      await emitEscrowState(options, { type: 'auction_error', auction, error: errorFromUnknown(error) })
    }
  }

  function scheduleAuctionSettlement(auction: ParsedMarketplaceAuction): void {
    if (options.autoSettleAuctions === false) return
    const delayMs = auctionSettleDelayMs(auction, options)
    if (delayMs === undefined) {
      void emitEscrowState(options, { type: 'auction_ignored', auction, reason: 'auction has no end time' })
      return
    }
    const existing = settlementTimers.get(auction.auctionAnchor)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      settlementTimers.delete(auction.auctionAnchor)
      void settleAuction(auction)
    }, delayMs)
    settlementTimers.set(auction.auctionAnchor, timer)
    void emitEscrowState(options, { type: 'auction_scheduled', auction, settleAt: auction.endAt!, delayMs })
  }

  async function processAuction(auction: ParsedMarketplaceAuction): Promise<void> {
    if (auction.arbiterPubkey !== escrowPubkey) {
      await emitEscrowState(options, { type: 'auction_ignored', auction, reason: 'auction is not assigned to this arbiter' })
      return
    }
    await emitEscrowState(options, { type: 'auction_seen', auction })

    const bidQuery = {
      ...(options.auctionBidQuery ?? {}),
      auctionAnchor: auction.auctionAnchor,
      participantPubkeys: [escrowPubkey],
    }
    try {
      const groups = await fetchAuctionBidGroups(opts.pool, opts.relays, bidQuery, auctionBidSearchOptions(options))
      await Promise.all(groups.map(group => processAuctionBidGroup(auction, group)))
    } catch (error) {
      await emitEscrowState(options, { type: 'auction_error', auction, error: errorFromUnknown(error) })
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
            void emitEscrowState(options, { type: 'eose' })
          },
          onclose(reasons) {
            void emitEscrowState(options, { type: 'closed', reasons })
          },
          oninvalid(_event: Event, error: Error) {
            void emitEscrowState(options, { type: 'auction_error', auction, error })
          },
        },
        auctionBidSubscribeOptions(options, auction),
      )
      bidClosers.set(auction.auctionAnchor, closer)
    }

    scheduleAuctionSettlement(auction)
  }

  let auctionCloser: SubCloser | undefined
  if (options.auctions !== false) {
    const pool = requireSubscribePool(opts.pool)
    const query = {
      ...(options.auctionQuery ?? {}),
      arbiterPubkeys: [escrowPubkey],
    }
    void searchAuctions(opts.pool, opts.relays, query, auctionSearchOptions(options))
      .then(auctions => Promise.all(auctions.map(processAuction)))
      .catch(error => emitEscrowState(options, { type: 'auction_error', error: errorFromUnknown(error) }))
    auctionCloser = subscribeAuctions(
      pool,
      opts.relays,
      query,
      {
        onauction(auction) {
          void processAuction(auction)
        },
        oneose() {
          void emitEscrowState(options, { type: 'eose' })
        },
        onclose(reasons) {
          void emitEscrowState(options, { type: 'closed', reasons })
        },
        oninvalid(_event: Event, error: Error) {
          void emitEscrowState(options, { type: 'auction_error', error })
        },
      },
      auctionSubscribeOptions(options),
    )
  }

  if (options.orders === false) {
    void emitEscrowState(options, { type: 'started', identity })
  }

  return {
    close(reason?: string) {
      orderRuntime?.close(reason)
      auctionCloser?.close(reason)
      for (const closer of bidClosers.values()) closer.close(reason)
      bidClosers.clear()
      for (const timer of settlementTimers.values()) clearTimeout(timer)
      settlementTimers.clear()
      void emitEscrowState(options, { type: 'closed', reasons: reason ? [reason] : [] })
    },
    async processGroup(group) {
      if (orderRuntime) {
        await orderRuntime.processGroup(group)
        return
      }
      for (const payment of group.payments) {
        try {
          await processEscrowGroupPayment(opts, options, identity, group, payment)
        } catch (error) {
          await emitEscrowState(options, { type: 'error', group, payment, error: errorFromUnknown(error) })
        }
      }
    },
    processAuction,
    processAuctionBidGroup,
    settleAuction,
  }
}
