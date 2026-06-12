import type { Event } from '../core.ts'
import type { Filter } from '../filter.ts'
import {
  MarketplaceAuctionBid,
  MarketplaceOrder,
  MarketplaceOrderCancel,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
} from '../kinds.ts'
import { type OrderStage, type PTag } from './helper.ts'
import { parseAuctionBidEvent, type ParsedMarketplaceAuctionBid } from './auction.ts'
import { parseOrderEvent, type ParsedOrder } from './order.ts'
import {
  parseOrderCancelEvent,
  parseOrderPaymentAckEvent,
  parseOrderPaymentEvent,
  parseOrderPaymentNackEvent,
  parseOrderPaymentSettlementEvent,
  type ParsedOrderCancel,
  type ParsedOrderPayment,
  type ParsedOrderPaymentAck,
  type ParsedOrderPaymentNack,
  type ParsedOrderPaymentSettlement,
} from './order-lifecycle.ts'
import {
  isOrderGroupRole,
  orderGroupIdForRoleParticipants,
  orderGroupParticipantEntries,
  type OrderGroupParticipantEntry,
  type OrderGroupRole,
} from './order-id.ts'
import {
  marketplaceParticipantPubkeys,
  participantGroupIdForRecord,
} from './participant.ts'
import type {
  OrderGroupFilterQuery,
  OrderGroupEvent,
  OrderGroupParticipantOrder,
  OrderGroupRoleContext,
  ParsedOrderGroup,
  ReduceOrderGroupOptions,
} from './order-group-types.ts'

export const orderGroupEventKinds = [
  MarketplaceOrder,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
  MarketplaceOrderCancel,
]

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set([...values].filter(value => value.length > 0))].sort((a, b) => a.localeCompare(b))
}

function latestOrder<T extends { order: ParsedOrder }>(left: T | undefined, right: T): T {
  if (!left) return right
  if (right.order.event.created_at !== left.order.event.created_at) {
    return right.order.event.created_at > left.order.event.created_at ? right : left
  }
  return right.order.event.id.localeCompare(left.order.event.id) > 0 ? right : left
}

function latestEvent<T extends OrderGroupEvent>(left: T | undefined, right: T): T {
  if (!left) return right
  if (right.event.created_at !== left.event.created_at) {
    return right.event.created_at > left.event.created_at ? right : left
  }
  return right.event.id.localeCompare(left.event.id) > 0 ? right : left
}

type ParsedPaymentDecision = ParsedOrderPaymentAck | ParsedOrderPaymentNack

function roleForPubkey(context: OrderGroupRoleContext, pubkey: string): OrderGroupRole | undefined {
  return context.participantEntries.find(participant => participant.pubkey === pubkey)?.role
}

function isParsedOrder(event: OrderGroupEvent): event is ParsedOrder {
  return event.event.kind === MarketplaceOrder
}

function isParsedPayment(event: OrderGroupEvent): event is ParsedOrderPayment {
  return event.event.kind === MarketplacePayment
}

function isParsedPaymentAck(event: OrderGroupEvent): event is ParsedOrderPaymentAck {
  return event.event.kind === MarketplacePaymentAck
}

function isParsedPaymentNack(event: OrderGroupEvent): event is ParsedOrderPaymentNack {
  return event.event.kind === MarketplacePaymentNack
}

function isParsedSettlement(event: OrderGroupEvent): event is ParsedOrderPaymentSettlement {
  return event.event.kind === MarketplacePaymentSettlement
}

function isParsedCancel(event: OrderGroupEvent): event is ParsedOrderCancel {
  return event.event.kind === MarketplaceOrderCancel
}

export type ParticipantGroupEvent = ParsedOrder | ParsedMarketplaceAuctionBid

export function parseOrderGroupEvent(event: Event | OrderGroupEvent): OrderGroupEvent {
  if ('event' in event) return event
  if (event.kind === MarketplaceOrder) return parseOrderEvent(event)
  if (event.kind === MarketplacePayment) return parseOrderPaymentEvent(event)
  if (event.kind === MarketplacePaymentAck) return parseOrderPaymentAckEvent(event)
  if (event.kind === MarketplacePaymentNack) return parseOrderPaymentNackEvent(event)
  if (event.kind === MarketplacePaymentSettlement) return parseOrderPaymentSettlementEvent(event)
  if (event.kind === MarketplaceOrderCancel) return parseOrderCancelEvent(event)
  throw new Error('Invalid order group event kind')
}

export function pubkeyFromListingAnchor(listingAnchor: string): string {
  const [, pubkey] = listingAnchor.split(':')
  if (!pubkey || !/^[a-f0-9]{64}$/.test(pubkey)) throw new Error('Invalid listing anchor')
  return pubkey
}

export function parseParticipantGroupEvent(event: Event | ParticipantGroupEvent): ParticipantGroupEvent {
  if ('event' in event) return event
  if (event.kind === MarketplaceOrder) return parseOrderEvent(event)
  if (event.kind === MarketplaceAuctionBid) return parseAuctionBidEvent(event)
  throw new Error('Invalid participant group event kind')
}

export function participantGroupParticipantPubkeys(event: ParticipantGroupEvent | Event): string[] {
  const parsed = parseParticipantGroupEvent(event)
  return marketplaceParticipantPubkeys(parsed.participants)
}

export function participantGroupRoleParticipants(event: ParticipantGroupEvent | Event): OrderGroupParticipantEntry[] {
  const parsed = parseParticipantGroupEvent(event)
  return orderGroupParticipantEntries(parsed.participants)
}

export function orderGroupIdForParticipants(
  tradeId: string,
  participants: Iterable<PTag | OrderGroupParticipantEntry>,
): string {
  return orderGroupIdForRoleParticipants(tradeId, participants)
}

export function participantGroupIdForEvent(event: ParticipantGroupEvent | Event): string {
  const parsed = parseParticipantGroupEvent(event)
  return 'orderGroupId' in parsed ? parsed.orderGroupId : participantGroupIdForRecord(parsed)
}

export function orderGroupParticipantPubkeys(order: ParsedOrder | ParsedMarketplaceAuctionBid | Event): string[] {
  return participantGroupParticipantPubkeys(order)
}

export function orderGroupRoleParticipants(order: ParsedOrder | ParsedMarketplaceAuctionBid | Event): OrderGroupParticipantEntry[] {
  return participantGroupRoleParticipants(order)
}

export function orderGroupIdForOrder(order: ParsedOrder | ParsedMarketplaceAuctionBid | Event): string {
  return participantGroupIdForEvent(order)
}

export function orderGroupFilter(query: OrderGroupFilterQuery = {}): Filter {
  return {
    kinds: orderGroupEventKinds,
    ...(query.orderGroupId ? { '#d': [query.orderGroupId] } : {}),
    ...(query.tradeId ? { '#trade': [query.tradeId] } : {}),
    ...(query.listingAnchor ? { '#a': [query.listingAnchor] } : {}),
    ...(query.participantPubkey ? { '#p': [query.participantPubkey] } : {}),
    ...(query.authors ? { authors: query.authors } : {}),
    ...(query.since !== undefined ? { since: query.since } : {}),
    ...(query.until !== undefined ? { until: query.until } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
  }
}

function orderGroupContext(order: ParsedOrder): OrderGroupRoleContext {
  const participantPubkeys = orderGroupParticipantPubkeys(order)
  const participantEntries = orderGroupParticipantEntries(order.participants)
  const sellerPubkey = participantEntries.find(participant => participant.role === 'seller')?.pubkey
  if (!sellerPubkey) throw new Error('Order group requires a seller participant')
  const arbiterPubkeys = uniqueSorted([
    ...order.participants
      .filter(participant => participant.role === 'arbiter')
      .map(participant => participant.pubkey),
  ])
  return {
    tradeId: order.tradeId,
    orderGroupId: order.orderGroupId,
    listingAnchor: order.listingAnchor,
    sellerPubkey,
    listingOwnerPubkey: pubkeyFromListingAnchor(order.listingAnchor),
    participants: order.participants,
    participantEntries,
    participantPubkeys,
    arbiterPubkeys,
  }
}

function defaultOrderRole(order: ParsedOrder): OrderGroupRole | null {
  const authoredParticipant = order.participants.find(participant => participant.pubkey === order.event.pubkey)
  if (isOrderGroupRole(authoredParticipant?.role)) return authoredParticipant.role
  return null
}

function resolvedOrderRole(
  order: ParsedOrder,
  context: OrderGroupRoleContext,
  options: ReduceOrderGroupOptions,
): OrderGroupRole | null {
  const resolved = options.resolveRole?.(order, context)
  if (resolved !== undefined) return resolved
  return defaultOrderRole(order)
}

function sameGroup(order: ParsedOrder, groupId: string, listingAnchor: string): boolean {
  return order.listingAnchor === listingAnchor && order.orderGroupId === groupId
}

function sameOrderGroupEvent(event: OrderGroupEvent, context: OrderGroupRoleContext): boolean {
  return (
    event.orderGroupId === context.orderGroupId &&
    event.tradeId === context.tradeId &&
    event.listingAnchor === context.listingAnchor
  )
}

export function allowedInOrderGroup(event: Event | OrderGroupEvent, anchor: ParsedOrder | ParsedOrderGroup): boolean {
  const parsed = parseOrderGroupEvent(event)
  const context =
    'id' in anchor
      ? {
          orderGroupId: anchor.id,
          tradeId: anchor.tradeId,
          listingAnchor: anchor.listingAnchor,
          participantPubkeys: anchor.participantPubkeys,
        }
      : orderGroupContext(anchor)
  return (
    parsed.orderGroupId === context.orderGroupId &&
    parsed.tradeId === context.tradeId &&
    parsed.listingAnchor === context.listingAnchor &&
    context.participantPubkeys.includes(parsed.event.pubkey)
  )
}

export function reduceOrderGroup(
  events: Iterable<Event | OrderGroupEvent>,
  options: ReduceOrderGroupOptions = {},
): ParsedOrderGroup {
  const parsed = [...events].map(parseOrderGroupEvent)
  if (parsed.length === 0) throw new Error('Order group requires at least one event')

  const orderEvents = parsed.filter(isParsedOrder)
  if (orderEvents.length === 0) throw new Error('Order group requires an order anchor')

  const base = orderEvents.reduce((oldest, order) => {
    if (order.event.created_at !== oldest.event.created_at) {
      return order.event.created_at < oldest.event.created_at ? order : oldest
    }
    return order.event.id.localeCompare(oldest.event.id) < 0 ? order : oldest
  })
  const groupId = orderGroupIdForOrder(base)
  const context = orderGroupContext(base)
  const groupEvents = parsed.filter(event => sameOrderGroupEvent(event, context))
  const orders = groupEvents.filter(isParsedOrder).filter(order => sameGroup(order, groupId, context.listingAnchor))
  const ignoredEvents: OrderGroupEvent[] = []
  const validOrders: OrderGroupParticipantOrder[] = []
  const ignoredOrders: ParsedOrder[] = []
  const latestByPubkey: Record<string, OrderGroupParticipantOrder> = {}

  for (const order of orders) {
    if (!allowedInOrderGroup(order, base)) {
      ignoredOrders.push(order)
      ignoredEvents.push(order)
      continue
    }
    const role = resolvedOrderRole(order, context, options)
    if (!role) {
      ignoredOrders.push(order)
      ignoredEvents.push(order)
      continue
    }
    const participantOrder = { role, order }
    validOrders.push(participantOrder)
    latestByPubkey[order.event.pubkey] = latestOrder(latestByPubkey[order.event.pubkey], participantOrder)
  }

  const latestByRole: Partial<Record<OrderGroupRole, OrderGroupParticipantOrder>> = {}
  for (const participantOrder of Object.values(latestByPubkey)) {
    latestByRole[participantOrder.role] = latestOrder(latestByRole[participantOrder.role], participantOrder)
  }

  const buyerOrder = latestByRole.buyer?.order
  const arbiterOrder = latestByRole.arbiter?.order
  const sellerOrder = latestByRole.seller?.order
  const orderIds = new Set(orders.map(order => order.event.id))
  const payments = groupEvents.filter(isParsedPayment).filter(payment => {
    const valid = allowedInOrderGroup(payment, base) && payment.refs.orders.some(id => orderIds.has(id))
    if (!valid) ignoredEvents.push(payment)
    return valid
  })
  const payment = payments.reduce<ParsedOrderPayment | undefined>(latestEvent, undefined)
  const paymentIds = new Set(payments.map(item => item.event.id))
  const paymentAcks = groupEvents.filter(isParsedPaymentAck).filter(ack => {
    const valid = allowedInOrderGroup(ack, base) && ack.refs.payments.some(id => paymentIds.has(id))
    if (!valid) ignoredEvents.push(ack)
    return valid
  })
  const paymentNacks = groupEvents.filter(isParsedPaymentNack).filter(nack => {
    const valid = allowedInOrderGroup(nack, base) && nack.refs.payments.some(id => paymentIds.has(id))
    if (!valid) ignoredEvents.push(nack)
    return valid
  })
  const currentPaymentDecisions: ParsedPaymentDecision[] = payment
    ? [...paymentAcks, ...paymentNacks]
      .filter(decision => decision.refs.payments.includes(payment.event.id))
      .filter(decision => roleForPubkey(context, decision.event.pubkey) === 'arbiter')
    : []
  const latestPaymentDecision = currentPaymentDecisions.reduce<ParsedPaymentDecision | undefined>(latestEvent, undefined)
  const paymentAck =
    latestPaymentDecision && isParsedPaymentAck(latestPaymentDecision) && latestPaymentDecision.content.status === 'accepted'
      ? latestPaymentDecision
      : undefined
  const paymentNack =
    latestPaymentDecision && isParsedPaymentNack(latestPaymentDecision) && latestPaymentDecision.content.status === 'rejected'
      ? latestPaymentDecision
      : undefined
  const latestAcceptedAckByRole: Partial<Record<OrderGroupRole, ParsedOrderPaymentAck>> = {}
  for (const ack of paymentAcks) {
    if (payment && !ack.refs.payments.includes(payment.event.id)) continue
    if (ack.content.status !== 'accepted') continue
    const role = roleForPubkey(context, ack.event.pubkey)
    if (!role) continue
    latestAcceptedAckByRole[role] = latestEvent(latestAcceptedAckByRole[role], ack)
  }
  const settlements = groupEvents.filter(isParsedSettlement).filter(settlement => {
    const valid = allowedInOrderGroup(settlement, base) && settlement.refs.payments.some(id => paymentIds.has(id))
    if (!valid) ignoredEvents.push(settlement)
    return valid
  })
  const settlement = settlements.reduce<ParsedOrderPaymentSettlement | undefined>(latestEvent, undefined)
  const cancellations = groupEvents.filter(isParsedCancel).filter(cancel => {
    const valid =
      allowedInOrderGroup(cancel, base) &&
      (cancel.refs.orders.some(id => orderIds.has(id)) || cancel.refs.payments.some(id => paymentIds.has(id)))
    if (!valid) ignoredEvents.push(cancel)
    return valid
  })
  const cancellation = cancellations.reduce<ParsedOrderCancel | undefined>(latestEvent, undefined)

  const buyerPaymentValid =
    (payment !== undefined && options.isPaymentValid?.(payment, context) === true) ||
    (buyerOrder !== undefined && options.isBuyerPaymentProofValid?.(buyerOrder, context) === true)
  const buyerSellerAcked =
    latestAcceptedAckByRole.buyer !== undefined && latestAcceptedAckByRole.seller !== undefined
  const paymentRejected = paymentNack !== undefined
  const arbiterPaymentAcked = paymentAck !== undefined
  const confirmedCommitted = settlement !== undefined ||
    (!paymentRejected && (buyerPaymentValid === true || buyerSellerAcked || arbiterPaymentAcked))

  let stage: OrderStage = 'negotiate'
  if (cancellation) {
    stage = 'cancel'
  } else if (settlement) {
    stage = 'settled'
  } else if (!paymentRejected && (buyerPaymentValid || buyerSellerAcked || arbiterPaymentAcked)) {
    stage = 'commit'
  }

  return {
    id: groupId,
    tradeId: context.tradeId,
    listingAnchor: context.listingAnchor,
    sellerPubkey: context.sellerPubkey,
    listingOwnerPubkey: context.listingOwnerPubkey,
    arbiterPubkeys: context.arbiterPubkeys,
    participants: context.participants,
    participantPubkeys: context.participantPubkeys,
    orders,
    payments,
    paymentAcks,
    paymentNacks,
    settlements,
    cancellations,
    events: groupEvents,
    validOrders,
    ignoredEvents,
    ignoredOrders,
    latestByPubkey,
    ...(buyerOrder ? { buyerOrder } : {}),
    ...(arbiterOrder ? { arbiterOrder } : {}),
    ...(sellerOrder ? { sellerOrder } : {}),
    ...(payment ? { payment } : {}),
    ...(paymentAck ? { paymentAck } : {}),
    ...(latestAcceptedAckByRole.buyer ? { buyerPaymentAck: latestAcceptedAckByRole.buyer } : {}),
    ...(latestAcceptedAckByRole.seller ? { sellerPaymentAck: latestAcceptedAckByRole.seller } : {}),
    ...(paymentNack ? { paymentNack } : {}),
    ...(settlement ? { settlement } : {}),
    ...(cancellation ? { cancellation } : {}),
    stage,
    confirmedCommitted,
  }
}

export function groupOrderEvents(
  events: Iterable<Event | OrderGroupEvent>,
  options: ReduceOrderGroupOptions = {},
): ParsedOrderGroup[] {
  const buckets = new Map<string, OrderGroupEvent[]>()
  for (const event of events) {
    const orderEvent = parseOrderGroupEvent(event)
    const key = `${orderEvent.orderGroupId}:${orderEvent.listingAnchor}`
    const bucket = buckets.get(key)
    if (bucket) bucket.push(orderEvent)
    else buckets.set(key, [orderEvent])
  }
  return [...buckets.values()]
    .filter(bucket => bucket.some(isParsedOrder))
    .map(bucket => reduceOrderGroup(bucket, options))
}
