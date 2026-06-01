import type { Event } from '../core.ts'
import {
  CommitAuthorization,
  EscrowMethod,
  EscrowService,
  EscrowServiceSelection,
  MarketplaceOrderCancel,
  MarketplaceOrder,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
  MarketplaceReview,
  MarketplaceSeed,
  StructuredMessage,
  TradeKeyAuthorization,
} from '../kinds.ts'
import { bytesToHex, utf8Encoder } from '../utils.ts'
import { sha256 } from '@noble/hashes/sha2.js'

export const escrowMethodKind = EscrowMethod
export const escrowServiceKind = EscrowService
export const escrowServiceSelectionKind = EscrowServiceSelection
export const orderKind = MarketplaceOrder
export const paymentKind = MarketplacePayment
export const paymentAckKind = MarketplacePaymentAck
export const paymentNackKind = MarketplacePaymentNack
export const paymentSettlementKind = MarketplacePaymentSettlement
export const orderCancelKind = MarketplaceOrderCancel
export const reviewKind = MarketplaceReview
export const seedKind = MarketplaceSeed
export const commitAuthorizationKind = CommitAuthorization
export const tradeKeyAuthorizationKind = TradeKeyAuthorization
export const structuredMessageKind = StructuredMessage

export type RentOrBuy = 'rent' | 'buy'
export type OrderStage = 'negotiate' | 'commit' | 'settled' | 'cancel'
export type OrderParticipantRole = 'buyer' | 'seller' | 'escrow' | string
export type EscrowType = 'EVM' | string
export type PaymentMethod = 'zap' | 'evm' | string
export type PaymentAckStatus = 'accepted'
export type PaymentNackStatus = 'rejected'
export type PaymentSettlementAction =
  | 'release'
  | 'refund'
  | 'split'
  | 'timeout_claim'
  | 'auction_refund'
  | string
export type MarketplaceAmount = {
  value: string
  denomination: string
  decimals: number
}

export type MarketplacePrice = {
  amount: string
  currency: string
  frequency?: string
}

export type CancellationPolicy = {
  refundFraction: number
  secondsBeforeStart?: number
  secondsAfterOrder?: number
}

export type PTag = {
  pubkey: string
  relayHint?: string
  role?: OrderParticipantRole
}

export type PaymentProofEvidence = {
  method: PaymentMethod
  params: Record<string, unknown>
}

export type PaymentProof = {
  listing: Event
  paymentProof: PaymentProofEvidence | null
  escrow?: {
    escrowService: string | Event
    sellerEscrowMethod: string | Event
  }
}

const evmAddress = /^0x[a-fA-F0-9]{40}$/
const isoDuration = /^P(?=\d|T\d)(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$/
const transactionHash = /^0x[a-fA-F0-9]{64}$/

export function now(): number {
  return Math.floor(Date.now() / 1000)
}

export function firstTag(event: Event, name: string): string[] | undefined {
  return event.tags.find(tag => tag[0] === name)
}

export function tagValue(event: Event, name: string): string | undefined {
  return firstTag(event, name)?.[1]
}

export function tagValues(event: Event, name: string): string[] {
  return event.tags.filter(tag => tag[0] === name && tag[1]).map(tag => tag[1])
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`Invalid ${field}`)
  return value
}

export function parseJsonObject(content: string, label: string): Record<string, unknown> {
  try {
    const decoded = JSON.parse(content)
    if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) throw new Error()
    return decoded as Record<string, unknown>
  } catch (_) {
    throw new Error(`Invalid ${label} JSON`)
  }
}

export function parseStrictBool(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) return defaultValue
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`Invalid boolean value: ${value}`)
}

export function parseOptionalInt(value: string | undefined, field: string): number | undefined {
  if (value === undefined) return undefined
  if (!/^-?\d+$/.test(value)) throw new Error(`Invalid ${field}`)
  return Number.parseInt(value, 10)
}

export function parsePositiveInt(value: string | undefined, field: string, defaultValue: number): number {
  const parsed = parseOptionalInt(value, field) ?? defaultValue
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`Invalid ${field}`)
  return parsed
}

export function parseNonNegativeIntValue(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid ${field}`)
  return value
}

export function parseAmount(json: unknown): MarketplaceAmount | undefined {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return undefined
  const value = (json as Record<string, unknown>).value
  const denomination = (json as Record<string, unknown>).denomination
  const decimals = (json as Record<string, unknown>).decimals
  if (typeof value !== 'string' || typeof denomination !== 'string' || typeof decimals !== 'number') return undefined
  if (!Number.isSafeInteger(decimals) || decimals < 0) return undefined
  return { value, denomination, decimals }
}

export function parseEventJson(value: unknown, label: string): Event {
  const raw = typeof value === 'string' ? JSON.parse(value) : value
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`Invalid ${label}`)
  const event = raw as Event
  if (
    typeof event.kind !== 'number' ||
    typeof event.pubkey !== 'string' ||
    typeof event.created_at !== 'number' ||
    typeof event.content !== 'string' ||
    !Array.isArray(event.tags)
  ) {
    throw new Error(`Invalid ${label}`)
  }
  return event
}

export function eventToEscrowContextValue(event: Event | string): string {
  return typeof event === 'string' ? event : JSON.stringify(event)
}

export function sortedJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(sortedJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map(key => `${JSON.stringify(key)}:${sortedJson((value as Record<string, unknown>)[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export function sha256Hex(text: string): string {
  return bytesToHex(sha256(utf8Encoder.encode(text)))
}

export function tagForBoolean(name: string, value: boolean): string[] {
  return [name, value ? 'true' : 'false']
}

export function amountToTag(name: string, amount: MarketplaceAmount): string[] {
  return [name, amount.value, amount.denomination, amount.decimals.toString()]
}

export function amountFromTag(tag: string[] | undefined): MarketplaceAmount | undefined {
  if (!tag || tag.length < 4) return undefined
  const decimals = Number.parseInt(tag[3], 10)
  if (!Number.isSafeInteger(decimals) || decimals < 0) throw new Error(`Invalid ${tag[0]} decimals`)
  return { value: tag[1], denomination: tag[2], decimals }
}

export function parseCancellationPolicy(tag: string[]): CancellationPolicy {
  const fields: Record<string, string> = {}
  for (let i = 1; i < tag.length - 1; i += 2) fields[tag[i]] = tag[i + 1]
  const refundFraction = Number.parseFloat(fields.refundFraction)
  if (!Number.isFinite(refundFraction) || refundFraction < 0 || refundFraction > 1) {
    throw new Error('Invalid cancellationPolicy refundFraction')
  }
  const secondsBeforeStart = parseOptionalInt(fields.secondsBeforeStart, 'secondsBeforeStart')
  const secondsAfterOrder = parseOptionalInt(fields.secondsAfterOrder, 'secondsAfterOrder')
  if (secondsBeforeStart === undefined && secondsAfterOrder === undefined) {
    throw new Error('Invalid cancellationPolicy time window')
  }
  return { refundFraction, secondsBeforeStart, secondsAfterOrder }
}

export function cancellationPolicyTag(policy: CancellationPolicy): string[] {
  if (policy.secondsBeforeStart === undefined && policy.secondsAfterOrder === undefined) {
    throw new Error('Cancellation policy requires a time window')
  }
  if (policy.refundFraction < 0 || policy.refundFraction > 1) {
    throw new Error('Cancellation policy refundFraction must be from 0 to 1')
  }
  return [
    'cancellationPolicy',
    'refundFraction',
    policy.refundFraction.toString(),
    ...(policy.secondsBeforeStart !== undefined ? ['secondsBeforeStart', policy.secondsBeforeStart.toString()] : []),
    ...(policy.secondsAfterOrder !== undefined ? ['secondsAfterOrder', policy.secondsAfterOrder.toString()] : []),
  ]
}

export function parsePTag(tag: string[]): PTag | null {
  if (tag[0] !== 'p' || !tag[1]) return null
  return { pubkey: tag[1], relayHint: tag[2] ?? '', ...(tag[3] ? { role: tag[3] } : {}) }
}

export function pTag(participant: PTag): string[] {
  return ['p', participant.pubkey, participant.relayHint ?? '', ...(participant.role ? [participant.role] : [])]
}

export function isIsoDuration(value: string): boolean {
  return isoDuration.test(value)
}

export function isEvmAddress(value: string): boolean {
  return evmAddress.test(value)
}

export function isTransactionHash(value: string): boolean {
  return transactionHash.test(value)
}
