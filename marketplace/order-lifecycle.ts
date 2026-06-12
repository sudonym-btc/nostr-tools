import type { Event, EventTemplate } from '../core.ts'
import {
  MarketplaceOrderCancel,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
} from '../kinds.ts'
import {
  normalizeMarketplaceAmount,
  now,
  parseAmount,
  parseJsonObject,
  requireString,
  tagValue,
  type MarketplaceAmount,
  type PaymentAckStatus,
  type PaymentNackStatus,
  type PaymentProof,
  type PaymentSettlementAction,
  type PaymentMethod,
} from './helper.ts'
import {
  parseParticipantTag,
  participantTag,
  type MarketplaceParticipantTag,
} from './participant.ts'
import { orderGroupIdForRoleParticipants } from './order-id.ts'
import {
  parsePaymentAmountKeyTag,
  parseSealedPaymentAmount,
  paymentAmountKeyTag,
  type PaymentAmountKeyTag,
  type SealedPaymentAmount,
} from './payment-amount.ts'
import {
  parsePaymentProof,
  parsePaymentProofKeyTag,
  parseSealedPaymentProof,
  paymentProofKeyTag,
  type PaymentProofKeyTag,
  type SealedPaymentProof,
} from './payment-proof.ts'

export type OrderLinkedEventRefs = {
  orders: string[]
  auctionBids: string[]
  auctionCompletes: string[]
  payments: string[]
  paymentAcks: string[]
  paymentNacks: string[]
  settlements: string[]
  cancels: string[]
}

export type ParsedOrderLinkedFields = {
  orderGroupId: string
  tradeId: string
  listingAnchor: string
  participants: MarketplaceParticipantTag[]
  refs: OrderLinkedEventRefs
}

export type OrderLinkedEventTemplate = {
  orderGroupId?: string
  tradeId: string
  listingAnchor: string
  anchorMarker?: string
  participants?: MarketplaceParticipantTag[]
  refs?: Partial<OrderLinkedEventRefs>
  extraTags?: string[][]
  createdAt?: number
}

export type OrderPaymentContent = {
  amount?: MarketplaceAmount
  sealedAmount?: SealedPaymentAmount
  proof?: PaymentProof
  sealedProof?: SealedPaymentProof
}

export type ParsedOrderPayment = ParsedOrderLinkedFields & {
  event: Event
  content: OrderPaymentContent
  paymentAmountKeys: PaymentAmountKeyTag[]
  paymentProofKeys: PaymentProofKeyTag[]
}

export type OrderPaymentTemplate = OrderLinkedEventTemplate & {
  amount?: MarketplaceAmount
  sealedAmount?: SealedPaymentAmount
  proof: PaymentProof | SealedPaymentProof
  paymentAmountKeys?: PaymentAmountKeyTag[]
  paymentProofKeys?: PaymentProofKeyTag[]
}

export type OrderPaymentAckContent = {
  status: PaymentAckStatus
  message?: string
}

export type ParsedOrderPaymentAck = ParsedOrderLinkedFields & {
  event: Event
  content: OrderPaymentAckContent
}

export type OrderPaymentAckTemplate = OrderLinkedEventTemplate & OrderPaymentAckContent

export type OrderPaymentNackContent = {
  status: PaymentNackStatus
  message?: string
}

export type ParsedOrderPaymentNack = ParsedOrderLinkedFields & {
  event: Event
  content: OrderPaymentNackContent
}

export type OrderPaymentNackTemplate = OrderLinkedEventTemplate & OrderPaymentNackContent

export type OrderPaymentSettlementOutput = {
  role?: string
  pubkey?: string
  amount?: string
  proofYs?: string[]
  data?: Record<string, unknown>
}

export type OrderPaymentSettlementContent = {
  method: PaymentMethod
  action: PaymentSettlementAction
  inputs?: Array<Record<string, unknown>>
  outputs?: OrderPaymentSettlementOutput[]
  data?: Record<string, unknown>
}

export type ParsedOrderPaymentSettlement = ParsedOrderLinkedFields & {
  event: Event
  content: OrderPaymentSettlementContent
}

export type OrderPaymentSettlementTemplate = OrderLinkedEventTemplate & OrderPaymentSettlementContent

export type OrderCancelContent = {
  reason?: string
}

export type ParsedOrderCancel = ParsedOrderLinkedFields & {
  event: Event
  content: OrderCancelContent
}

export type OrderCancelTemplate = OrderLinkedEventTemplate & OrderCancelContent

function referenceTags(refs: Partial<OrderLinkedEventRefs> | undefined): string[][] {
  return [
    ...(refs?.orders ?? []).map(id => ['e', id, '', 'order']),
    ...(refs?.auctionBids ?? []).map(id => ['e', id, '', 'auction-bid']),
    ...(refs?.auctionCompletes ?? []).map(id => ['e', id, '', 'auction-complete']),
    ...(refs?.payments ?? []).map(id => ['e', id, '', 'payment']),
    ...(refs?.paymentAcks ?? []).map(id => ['e', id, '', 'payment-ack']),
    ...(refs?.paymentNacks ?? []).map(id => ['e', id, '', 'payment-nack']),
    ...(refs?.settlements ?? []).map(id => ['e', id, '', 'settlement']),
    ...(refs?.cancels ?? []).map(id => ['e', id, '', 'cancel']),
  ]
}

function linkedTags(template: OrderLinkedEventTemplate): string[][] {
  const orderGroupId =
    template.orderGroupId ?? orderGroupIdForRoleParticipants(template.tradeId, template.participants ?? [])
  if (!orderGroupId) throw new Error('Order linked event requires an order group id')
  return [
    ['a', template.listingAnchor, ...(template.anchorMarker ? ['', template.anchorMarker] : [])],
    ['d', orderGroupId],
    ['trade', template.tradeId],
    ...(template.participants ?? []).map(participantTag),
    ...referenceTags(template.refs),
    ...(template.extraTags ?? []),
  ]
}

function linkedFields(event: Event, label: string): ParsedOrderLinkedFields {
  const refs: OrderLinkedEventRefs = {
    orders: [],
    auctionBids: [],
    auctionCompletes: [],
    payments: [],
    paymentAcks: [],
    paymentNacks: [],
    settlements: [],
    cancels: [],
  }
  for (const tag of event.tags) {
    if (tag[0] !== 'e' || !tag[1]) continue
    if (tag[3] === 'order') refs.orders.push(tag[1])
    else if (tag[3] === 'auction-bid' || tag[3] === 'bid') refs.auctionBids.push(tag[1])
    else if (tag[3] === 'auction-complete' || tag[3] === 'auction-close') refs.auctionCompletes.push(tag[1])
    else if (tag[3] === 'payment') refs.payments.push(tag[1])
    else if (tag[3] === 'payment-ack') refs.paymentAcks.push(tag[1])
    else if (tag[3] === 'payment-nack') refs.paymentNacks.push(tag[1])
    else if (tag[3] === 'settlement') refs.settlements.push(tag[1])
    else if (tag[3] === 'cancel') refs.cancels.push(tag[1])
  }
  return {
    orderGroupId: requireString(tagValue(event, 'd'), `${label} order group id`),
    tradeId: requireString(tagValue(event, 'trade'), `${label} trade id`),
    listingAnchor: requireString(tagValue(event, 'a'), `${label} listing anchor`),
    participants: event.tags
      .map(parseParticipantTag)
      .filter((tag): tag is MarketplaceParticipantTag => tag !== null),
    refs,
  }
}

function parsePaymentContent(content: string): OrderPaymentContent {
  const json = parseJsonObject(content, 'payment content')
  const amount = parseAmount(json.amount)
  const sealedAmount = amount ? undefined : parseSealedPaymentAmount(json.amount)
  if (!amount && !sealedAmount) throw new Error('Payment event requires an amount')
  const sealedProof = parseSealedPaymentProof(json.proof)
  if (sealedProof) {
    return {
      ...(amount ? { amount } : {}),
      ...(sealedAmount ? { sealedAmount } : {}),
      sealedProof,
    }
  }
  const proof = parsePaymentProof(json.proof)
  if (!proof) throw new Error('Payment event requires a payment proof')
  return {
    ...(amount ? { amount } : {}),
    ...(sealedAmount ? { sealedAmount } : {}),
    proof,
  }
}

function parsePaymentAckContent(content: string): OrderPaymentAckContent {
  const json = parseJsonObject(content, 'payment ack content')
  const status = requireString(json.status, 'payment ack status') as PaymentAckStatus
  if (status !== 'accepted') throw new Error('Invalid payment ack status')
  return {
    status,
    ...(typeof json.message === 'string' ? { message: json.message } : {}),
  }
}

function parsePaymentNackContent(content: string): OrderPaymentNackContent {
  const json = parseJsonObject(content, 'payment nack content')
  const status = requireString(json.status, 'payment nack status') as PaymentNackStatus
  if (status !== 'rejected') throw new Error('Invalid payment nack status')
  return {
    status,
    ...(typeof json.message === 'string' ? { message: json.message } : {}),
  }
}

function parseSettlementContent(content: string): OrderPaymentSettlementContent {
  const json = parseJsonObject(content, 'payment settlement content')
  return {
    method: requireString(json.method, 'payment settlement method'),
    action: requireString(json.action, 'payment settlement action'),
    ...(Array.isArray(json.inputs) ? { inputs: json.inputs as Array<Record<string, unknown>> } : {}),
    ...(Array.isArray(json.outputs) ? { outputs: json.outputs as OrderPaymentSettlementOutput[] } : {}),
    ...(json.data && typeof json.data === 'object' && !Array.isArray(json.data)
      ? { data: json.data as Record<string, unknown> }
      : {}),
  }
}

function parseCancelContent(content: string): OrderCancelContent {
  const json = parseJsonObject(content || '{}', 'order cancel content')
  return {
    ...(typeof json.reason === 'string' ? { reason: json.reason } : {}),
  }
}

export function parseOrderPaymentEvent(event: Event): ParsedOrderPayment {
  if (event.kind !== MarketplacePayment) throw new Error('Invalid payment kind')
  const content = parsePaymentContent(event.content)
  return {
    event,
    ...linkedFields(event, 'payment'),
    paymentAmountKeys: event.tags
      .map(parsePaymentAmountKeyTag)
      .filter((tag): tag is PaymentAmountKeyTag => tag !== null),
    paymentProofKeys: event.tags
      .map(parsePaymentProofKeyTag)
      .filter((tag): tag is PaymentProofKeyTag => tag !== null),
    content,
  }
}

export function parseOrderPaymentAckEvent(event: Event): ParsedOrderPaymentAck {
  if (event.kind !== MarketplacePaymentAck) throw new Error('Invalid payment ack kind')
  return {
    event,
    ...linkedFields(event, 'payment ack'),
    content: parsePaymentAckContent(event.content),
  }
}

export function parseOrderPaymentNackEvent(event: Event): ParsedOrderPaymentNack {
  if (event.kind !== MarketplacePaymentNack) throw new Error('Invalid payment nack kind')
  return {
    event,
    ...linkedFields(event, 'payment nack'),
    content: parsePaymentNackContent(event.content),
  }
}

export function parseOrderPaymentSettlementEvent(event: Event): ParsedOrderPaymentSettlement {
  if (event.kind !== MarketplacePaymentSettlement) throw new Error('Invalid payment settlement kind')
  return {
    event,
    ...linkedFields(event, 'payment settlement'),
    content: parseSettlementContent(event.content),
  }
}

export function parseOrderCancelEvent(event: Event): ParsedOrderCancel {
  if (event.kind !== MarketplaceOrderCancel) throw new Error('Invalid order cancel kind')
  return {
    event,
    ...linkedFields(event, 'order cancel'),
    content: parseCancelContent(event.content),
  }
}

export function generateOrderPaymentEventTemplate(payment: OrderPaymentTemplate): EventTemplate {
  if (!payment.amount && !payment.sealedAmount) throw new Error('Payment event requires an amount')
  return {
    kind: MarketplacePayment,
    created_at: payment.createdAt ?? now(),
    content: JSON.stringify({
      amount: payment.amount ? normalizeMarketplaceAmount(payment.amount) : payment.sealedAmount,
      proof: payment.proof,
    }),
    tags: [
      ...linkedTags(payment),
      ...(payment.paymentAmountKeys ?? []).map(paymentAmountKeyTag),
      ...(payment.paymentProofKeys ?? []).map(paymentProofKeyTag),
    ],
  }
}

export function generateOrderPaymentAckEventTemplate(ack: OrderPaymentAckTemplate): EventTemplate {
  return {
    kind: MarketplacePaymentAck,
    created_at: ack.createdAt ?? now(),
    content: JSON.stringify({
      status: ack.status,
      ...(ack.message ? { message: ack.message } : {}),
    }),
    tags: linkedTags(ack),
  }
}

export function generateOrderPaymentNackEventTemplate(nack: OrderPaymentNackTemplate): EventTemplate {
  return {
    kind: MarketplacePaymentNack,
    created_at: nack.createdAt ?? now(),
    content: JSON.stringify({
      status: nack.status,
      ...(nack.message ? { message: nack.message } : {}),
    }),
    tags: linkedTags(nack),
  }
}

export function generateOrderPaymentSettlementEventTemplate(
  settlement: OrderPaymentSettlementTemplate,
): EventTemplate {
  return {
    kind: MarketplacePaymentSettlement,
    created_at: settlement.createdAt ?? now(),
    content: JSON.stringify({
      method: settlement.method,
      action: settlement.action,
      ...(settlement.inputs ? { inputs: settlement.inputs } : {}),
      ...(settlement.outputs ? { outputs: settlement.outputs } : {}),
      ...(settlement.data ? { data: settlement.data } : {}),
    }),
    tags: linkedTags(settlement),
  }
}

export function generateOrderCancelEventTemplate(cancel: OrderCancelTemplate): EventTemplate {
  return {
    kind: MarketplaceOrderCancel,
    created_at: cancel.createdAt ?? now(),
    content: JSON.stringify({
      ...(cancel.reason ? { reason: cancel.reason } : {}),
    }),
    tags: linkedTags(cancel),
  }
}

export const orderLifecycle = {
  paymentTemplate: generateOrderPaymentEventTemplate,
  paymentAckTemplate: generateOrderPaymentAckEventTemplate,
  paymentNackTemplate: generateOrderPaymentNackEventTemplate,
  paymentSettlementTemplate: generateOrderPaymentSettlementEventTemplate,
  cancelTemplate: generateOrderCancelEventTemplate,
  parsePayment: parseOrderPaymentEvent,
  parsePaymentAck: parseOrderPaymentAckEvent,
  parsePaymentNack: parseOrderPaymentNackEvent,
  parsePaymentSettlement: parseOrderPaymentSettlementEvent,
  parseCancel: parseOrderCancelEvent,
}
