import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event } from '../core.ts'
import type { MarketplaceAmount, OrderStage, PTag, PaymentProofEvidence } from './helper.ts'
import type { ParsedOrder } from './order.ts'
import type {
  ParsedOrderCancel,
  ParsedPayment,
  ParsedPaymentAck,
  ParsedPaymentNack,
  ParsedPaymentSettlement,
} from './payment-lifecycle.ts'
import type { OrderGroupParticipantEntry, OrderGroupRole } from './order-id.ts'
import type { MarketplaceOrderIdentity, OrderQuery, OrderSearchOptions, OrderSubscribeOptions } from './order-query.ts'
import type { MarketplaceOrderValidationResult } from './order-validation.ts'
import type { MarketplacePaymentValidationPolicy, MarketplacePaymentValidationResult } from './payment-validation.ts'
import type { MarketplaceInvalidEventHandler } from './event-decoder.ts'

export type OrderGroupRoleContext = {
  tradeId: string
  orderGroupId: string
  listingAnchor: string
  sellerPubkey: string
  listingOwnerPubkey: string
  participants: PTag[]
  participantEntries: OrderGroupParticipantEntry[]
  participantPubkeys: string[]
  arbiterPubkeys: string[]
}

export type OrderGroupRoleResolver = (
  order: ParsedOrder,
  context: OrderGroupRoleContext,
) => OrderGroupRole | null | undefined

export type ReduceOrderGroupOptions = {
  resolveRole?: OrderGroupRoleResolver
  isBuyerPaymentProofValid?: (order: ParsedOrder, context: OrderGroupRoleContext) => boolean
  isPaymentValid?: (payment: ParsedPayment, context: OrderGroupRoleContext) => boolean
}

export type Nip44DecryptSigner = {
  getPublicKey?: () => Promise<string> | string
  nip44Decrypt: (pubkey: string, ciphertext: string) => Promise<string> | string
}

export type ParticipantResolutionStatus =
  | 'public'
  | 'resolved'
  | 'not_for_us'
  | 'invalid'
  | 'missing'
  | 'unsupported'

export type OrderGroupResolutionStatus = 'complete' | 'partial' | 'public_only' | 'invalid'

export type ResolvedTradeParticipant = {
  role: OrderGroupRole
  tradePubkey: string
  realPubkey?: string
  proofStatus: ParticipantResolutionStatus
  proofId?: string
  authorizationEventId?: string
  error?: string
}

export type ResolvedOrderGroup = {
  group: ParsedOrderGroup
  participants: ResolvedTradeParticipant[]
  status: OrderGroupResolutionStatus
}

export type ResolveOrderGroupParticipantsOptions = {
  signer?: Nip44DecryptSigner
  signerPubkey?: string
}

export type PaymentValidationContext = {
  group: ParsedOrderGroup
  resolved?: ResolvedOrderGroup
  buyerOrder?: ParsedOrder
  paymentProof?: PaymentProofEvidence
  paymentAmount?: MarketplaceAmount
  listing?: Event
  paymentMethod?: Event
  arbitrationService?: Event
  signer?: Nip44DecryptSigner
  signerPubkey?: string
  now?: number
}

export type ValidateOrderGroupPaymentsOptions = {
  policies?: MarketplacePaymentValidationPolicy[]
  resolved?: ResolvedOrderGroup
  listing?: Event
  paymentMethod?: Event
  arbitrationService?: Event
  signer?: Nip44DecryptSigner
  signerPubkey?: string
  now?: number
  reduceOptions?: ReduceOrderGroupOptions
}

export type ValidatedOrderGroup = {
  group: ParsedOrderGroup
  payment: MarketplacePaymentValidationResult
  order?: MarketplaceOrderValidationResult
  resolved?: ResolvedOrderGroup
}

export type ResolveAndValidateOrderGroupOptions = ResolveOrderGroupParticipantsOptions &
  ValidateOrderGroupPaymentsOptions

export type OrderGroupFilterQuery = {
  orderGroupId?: string
  tradeId?: string
  listingAnchor?: string
  participantPubkey?: string
  authors?: string[]
  since?: number
  until?: number
  limit?: number
}

export type OrderGroupSearchOptions = OrderSearchOptions & ReduceOrderGroupOptions & {
  oninvalid?: MarketplaceInvalidEventHandler
}

export type OrderGroupSubscribeHandlers = {
  onevent?: (event: OrderGroupEvent) => void
  ongroup?: (group: ParsedOrderGroup) => void
  ongroups?: (groups: ParsedOrderGroup[]) => void
  oninvalid?: (event: Event, error: Error) => void
  oneose?: () => void
  onclose?: (reasons: string[]) => void
}

export type OrderGroupRoles = {
  buyer: ParsedOrderGroup[]
  seller: ParsedOrderGroup[]
  arbiter: ParsedOrderGroup[]
  all: ParsedOrderGroup[]
}

export type OrderGroupIdentityQuery = Omit<OrderQuery, 'identity'> & {
  identity: MarketplaceOrderIdentity
}

export type OrderGroupParticipantOrder = {
  role: OrderGroupRole
  order: ParsedOrder
}

export type ParsedOrderGroup = {
  id: string
  tradeId: string
  listingAnchor: string
  sellerPubkey: string
  listingOwnerPubkey: string
  arbiterPubkeys: string[]
  participants: PTag[]
  participantPubkeys: string[]
  orders: ParsedOrder[]
  payments: ParsedPayment[]
  paymentAcks: ParsedPaymentAck[]
  paymentNacks: ParsedPaymentNack[]
  settlements: ParsedPaymentSettlement[]
  cancellations: ParsedOrderCancel[]
  events: OrderGroupEvent[]
  validOrders: OrderGroupParticipantOrder[]
  ignoredEvents: OrderGroupEvent[]
  ignoredOrders: ParsedOrder[]
  latestByPubkey: Record<string, OrderGroupParticipantOrder>
  buyerOrder?: ParsedOrder
  arbiterOrder?: ParsedOrder
  sellerOrder?: ParsedOrder
  payment?: ParsedPayment
  paymentAck?: ParsedPaymentAck
  buyerPaymentAck?: ParsedPaymentAck
  sellerPaymentAck?: ParsedPaymentAck
  paymentNack?: ParsedPaymentNack
  settlement?: ParsedPaymentSettlement
  cancellation?: ParsedOrderCancel
  stage: OrderStage
  confirmedCommitted: boolean
}

export type OrderGroupEvent =
  | ParsedOrder
  | ParsedPayment
  | ParsedPaymentAck
  | ParsedPaymentNack
  | ParsedPaymentSettlement
  | ParsedOrderCancel

export type OrderGroupQueryPool = Pick<AbstractSimplePool, 'querySync'>
export type OrderGroupSubscribePool = Pick<AbstractSimplePool, 'subscribeMap'>
export type OrderGroupSubscribeOptions = OrderSubscribeOptions & ReduceOrderGroupOptions
