import type { AbstractSimplePool } from '../abstract-pool.ts'
import type { Event } from '../core.ts'
import type { OrderStage, PTag, PaymentProofEvidence } from './helper.ts'
import type { ParsedOrder } from './order.ts'
import type {
  ParsedOrderCancel,
  ParsedOrderPayment,
  ParsedOrderPaymentAck,
  ParsedOrderPaymentNack,
  ParsedOrderPaymentSettlement,
} from './order-lifecycle.ts'
import type { OrderGroupParticipantEntry, OrderGroupRole } from './order-id.ts'
import type { MarketplaceOrderIdentity, OrderQuery, OrderSearchOptions, OrderSubscribeOptions } from './order-query.ts'
import type { MarketplacePaymentValidationPolicy, MarketplacePaymentValidationResult } from './payment-validation.ts'

export type OrderGroupRoleContext = {
  tradeId: string
  orderGroupId: string
  listingAnchor: string
  sellerPubkey: string
  listingOwnerPubkey: string
  participants: PTag[]
  participantEntries: OrderGroupParticipantEntry[]
  participantPubkeys: string[]
  escrowPubkeys: string[]
}

export type OrderGroupRoleResolver = (
  order: ParsedOrder,
  context: OrderGroupRoleContext,
) => OrderGroupRole | null | undefined

export type ReduceOrderGroupOptions = {
  resolveRole?: OrderGroupRoleResolver
  isBuyerPaymentProofValid?: (order: ParsedOrder, context: OrderGroupRoleContext) => boolean
  isPaymentValid?: (payment: ParsedOrderPayment, context: OrderGroupRoleContext) => boolean
}

export type Nip44DecryptSigner = {
  getPublicKey?: () => Promise<string>
  nip44Decrypt: (pubkey: string, ciphertext: string) => Promise<string>
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
  proofRecipientPubkey?: string
  proofPayloadHash?: string
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
  listing?: Event
  escrowMethod?: Event
  escrowService?: Event
  now?: number
}

export type ValidateOrderGroupPaymentsOptions = {
  policies?: MarketplacePaymentValidationPolicy[]
  resolved?: ResolvedOrderGroup
  listing?: Event
  escrowMethod?: Event
  escrowService?: Event
  now?: number
  reduceOptions?: ReduceOrderGroupOptions
}

export type ValidatedOrderGroup = {
  group: ParsedOrderGroup
  payment: MarketplacePaymentValidationResult
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

export type OrderGroupSearchOptions = OrderSearchOptions & ReduceOrderGroupOptions

export type OrderGroupSubscribeHandlers = {
  onevent?: (event: OrderGroupEvent) => void
  ongroup?: (group: ParsedOrderGroup) => void
  ongroups?: (groups: ParsedOrderGroup[]) => void
  oninvalid?: (event: Event, error: Error) => void
  oneose?: () => void
  onclose?: (reasons: string[]) => void
}

export type OrderGroupBuckets = {
  buyer: ParsedOrderGroup[]
  seller: ParsedOrderGroup[]
  escrow: ParsedOrderGroup[]
  all: ParsedOrderGroup[]
}

export type MyOrderGroupQuery = Omit<OrderQuery, 'identity'> & {
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
  escrowPubkeys: string[]
  participants: PTag[]
  participantPubkeys: string[]
  orders: ParsedOrder[]
  payments: ParsedOrderPayment[]
  paymentAcks: ParsedOrderPaymentAck[]
  paymentNacks: ParsedOrderPaymentNack[]
  settlements: ParsedOrderPaymentSettlement[]
  cancellations: ParsedOrderCancel[]
  events: OrderGroupEvent[]
  validOrders: OrderGroupParticipantOrder[]
  ignoredEvents: OrderGroupEvent[]
  ignoredOrders: ParsedOrder[]
  latestByPubkey: Record<string, OrderGroupParticipantOrder>
  buyerOrder?: ParsedOrder
  escrowOrder?: ParsedOrder
  sellerOrder?: ParsedOrder
  payment?: ParsedOrderPayment
  buyerPaymentAck?: ParsedOrderPaymentAck
  sellerPaymentAck?: ParsedOrderPaymentAck
  paymentNack?: ParsedOrderPaymentNack
  settlement?: ParsedOrderPaymentSettlement
  cancellation?: ParsedOrderCancel
  stage: OrderStage
  confirmedCommitted: boolean
}

export type OrderGroupEvent =
  | ParsedOrder
  | ParsedOrderPayment
  | ParsedOrderPaymentAck
  | ParsedOrderPaymentNack
  | ParsedOrderPaymentSettlement
  | ParsedOrderCancel

export type OrderGroupQueryPool = Pick<AbstractSimplePool, 'querySync'>
export type OrderGroupSubscribePool = Pick<AbstractSimplePool, 'subscribeMap'>
export type OrderGroupSubscribeOptions = OrderSubscribeOptions & ReduceOrderGroupOptions
