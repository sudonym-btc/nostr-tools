import { verifyEvent } from '../pure.ts'
import {
  type MarketplaceAmount,
} from './helper.ts'
import {
  listingPriceAmount,
  parseListingEvent,
  type MarketplaceListing,
} from './listing.ts'
import type { ParsedOrder } from './order.ts'
import {
  isPaymentValidationAccepted,
  type MarketplacePaymentValidationResult,
} from './payment-validation.ts'

export type MarketplaceOrderValidationStatus = 'valid' | 'invalid' | 'pending' | 'unverifiable'

export type MarketplaceOrderValidationTotals = {
  paymentAmount?: MarketplaceAmount
  fundedAmount?: MarketplaceAmount
  securityBondAmount?: MarketplaceAmount
  escrowFee?: MarketplaceAmount
}

export type MarketplaceOrderValidationRequest = {
  order: ParsedOrder
  payments: MarketplacePaymentValidationResult[]
  settlementId?: string
  tradeId?: string
  now?: number
}

export type MarketplaceOrderValidationResult = {
  status: MarketplaceOrderValidationStatus
  orderEventId: string
  listingEventId?: string
  paymentEventIds: string[]
  expected?: {
    amount?: MarketplaceAmount
    securityBondAmount?: MarketplaceAmount
    unlockAt?: number
    maxUnlockAt?: number
  }
  totals: MarketplaceOrderValidationTotals
  listingMatched?: boolean
  sellerMatched?: boolean
  orderAmountMatched?: boolean
  paymentAmountMatched?: boolean
  securityBondMatched?: boolean
  timeoutMatched?: boolean
  settlementMatched?: boolean
  tradeMatched?: boolean
  errors: string[]
}

function listingAnchor(listing: MarketplaceListing): string {
  return `${listing.event.kind}:${listing.event.pubkey}:${listing.d}`
}

function parseAmountValue(amount: MarketplaceAmount): bigint {
  if (!/^\d+$/.test(amount.value)) throw new Error(`Invalid amount value: ${amount.value}`)
  return BigInt(amount.value)
}

function sameAmountUnit(left: MarketplaceAmount, right: MarketplaceAmount): boolean {
  return left.denomination === right.denomination && left.decimals === right.decimals
}

function amountEquals(left: MarketplaceAmount | undefined, right: MarketplaceAmount | undefined): boolean {
  return Boolean(left && right && sameAmountUnit(left, right) && left.value === right.value)
}

function amountGreaterOrEqual(left: MarketplaceAmount | undefined, right: MarketplaceAmount | undefined): boolean {
  return Boolean(left && right && sameAmountUnit(left, right) && parseAmountValue(left) >= parseAmountValue(right))
}

function multiplyAmount(amount: MarketplaceAmount, factor: number): MarketplaceAmount {
  if (!Number.isSafeInteger(factor) || factor < 1) throw new Error('Invalid amount multiplier')
  return {
    ...amount,
    value: (parseAmountValue(amount) * BigInt(factor)).toString(),
  }
}

function addAmount(
  current: MarketplaceAmount | undefined,
  next: MarketplaceAmount | undefined,
  label: string,
  errors: string[],
): MarketplaceAmount | undefined {
  if (!next) return current
  if (!current) return { ...next }
  if (!sameAmountUnit(current, next)) {
    errors.push(`${label} uses mixed amount units`)
    return current
  }
  return {
    ...current,
    value: (parseAmountValue(current) + parseAmountValue(next)).toString(),
  }
}

function timestampSeconds(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : undefined
}

function paymentAmount(payment: MarketplacePaymentValidationResult): MarketplaceAmount | undefined {
  return payment.terms?.paymentAmount ?? payment.amount
}

function invalidResult(
  order: ParsedOrder,
  status: MarketplaceOrderValidationStatus,
  errors: string[],
): MarketplaceOrderValidationResult {
  return {
    status,
    orderEventId: order.event.id,
    paymentEventIds: [],
    totals: {},
    errors,
  }
}

export function validateMarketplaceOrder(request: MarketplaceOrderValidationRequest): MarketplaceOrderValidationResult {
  const { order } = request
  const listingEvent = order.content.listing
  if (!listingEvent) {
    return invalidResult(order, 'unverifiable', ['Order does not include an embedded listing'])
  }

  let listing: MarketplaceListing
  try {
    if (!verifyEvent(listingEvent)) {
      return invalidResult(order, 'invalid', ['Embedded listing signature is invalid'])
    }
    listing = parseListingEvent(listingEvent)
  } catch (error) {
    return invalidResult(order, 'invalid', [
      error instanceof Error ? error.message : 'Embedded listing is invalid',
    ])
  }

  const errors: string[] = []
  const unverifiable: string[] = []
  const expectedAmount = multiplyAmount(
    listingPriceAmount(listing, {
      start: order.content.start,
      end: order.content.end,
    }),
    order.content.quantity,
  )
  const expectedSecurityBond = listing.securityDeposit
    ? multiplyAmount(listing.securityDeposit, order.content.quantity)
    : undefined
  const expectedUnlockAt = timestampSeconds(order.content.end)
  const maxUnlockAt = expectedUnlockAt === undefined && listing.maxDisputePeriod !== undefined
    ? order.event.created_at + listing.maxDisputePeriod
    : undefined

  const listingMatched = listingAnchor(listing) === order.listingAnchor
  if (!listingMatched) errors.push('Embedded listing does not match order listing anchor')

  const seller = order.participants.find(participant => participant.role === 'seller')
  const sellerMatched = seller?.pubkey === listing.event.pubkey
  if (!sellerMatched) errors.push('Order seller does not match embedded listing author')

  if (!listing.active) errors.push('Embedded listing is not active')

  const orderAmountMatched = amountEquals(order.content.amount, expectedAmount)
  if (!orderAmountMatched) errors.push('Order amount does not match embedded listing price')

  const acceptedPayments = request.payments.filter(isPaymentValidationAccepted)
  const pending = request.payments.some(payment => payment.status === 'pending')
  if (acceptedPayments.length === 0) {
    return {
      status: pending ? 'pending' : 'invalid',
      orderEventId: order.event.id,
      listingEventId: listing.event.id,
      paymentEventIds: [],
      expected: {
        amount: expectedAmount,
        ...(expectedSecurityBond ? { securityBondAmount: expectedSecurityBond } : {}),
        ...(expectedUnlockAt !== undefined ? { unlockAt: expectedUnlockAt } : {}),
        ...(maxUnlockAt !== undefined ? { maxUnlockAt } : {}),
      },
      totals: {},
      listingMatched,
      sellerMatched,
      orderAmountMatched,
      paymentAmountMatched: false,
      ...(expectedSecurityBond ? { securityBondMatched: false } : {}),
      errors: [...errors, 'No accepted payment validations for order'],
    }
  }

  const totals: MarketplaceOrderValidationTotals = {}
  let settlementMatched = true
  let tradeMatched = true
  let timeoutMatched = true

  for (const payment of acceptedPayments) {
    const terms = payment.terms
    const amount = paymentAmount(payment)
    if (!amount) unverifiable.push('Accepted payment validation did not return a payment amount')
    totals.paymentAmount = addAmount(totals.paymentAmount, amount, 'Payment amount', errors)
    totals.fundedAmount = addAmount(totals.fundedAmount, terms?.fundedAmount, 'Funded amount', errors)
    totals.securityBondAmount = addAmount(
      totals.securityBondAmount,
      terms?.securityBondAmount,
      'Security bond amount',
      errors,
    )
    totals.escrowFee = addAmount(totals.escrowFee, terms?.escrowFee, 'Escrow fee', errors)

    if (request.settlementId && terms?.settlementId && terms.settlementId !== request.settlementId) {
      settlementMatched = false
      errors.push('Payment settlement id does not match order group')
    }
    if (request.tradeId && terms?.tradeId && terms.tradeId !== request.tradeId) {
      tradeMatched = false
      errors.push('Payment trade id does not match order')
    }

    if (expectedUnlockAt !== undefined) {
      if (terms?.unlockAt === undefined) {
        timeoutMatched = false
        unverifiable.push('Accepted payment validation did not return an unlock time')
      } else if (terms.unlockAt !== expectedUnlockAt) {
        timeoutMatched = false
        errors.push('Payment unlock time does not match order end time')
      }
    } else if (maxUnlockAt !== undefined) {
      if (terms?.unlockAt === undefined) {
        timeoutMatched = false
        unverifiable.push('Accepted payment validation did not return an unlock time')
      } else if (terms.unlockAt < order.event.created_at || terms.unlockAt > maxUnlockAt) {
        timeoutMatched = false
        errors.push('Payment unlock time exceeds embedded listing dispute window')
      }
    }
  }

  const paymentAmountMatched = amountEquals(totals.paymentAmount, expectedAmount)
  if (!totals.paymentAmount) {
    unverifiable.push('Accepted payment validations did not return a payment amount total')
  } else if (!paymentAmountMatched) {
    errors.push('Accepted payment amount total does not match order amount')
  }

  const securityBondMatched = expectedSecurityBond
    ? amountGreaterOrEqual(totals.securityBondAmount, expectedSecurityBond)
    : undefined
  if (expectedSecurityBond && !totals.securityBondAmount) {
    unverifiable.push('Accepted payment validations did not return a security bond amount total')
  } else if (expectedSecurityBond && !securityBondMatched) {
    errors.push('Accepted payment security bond total is below embedded listing requirement')
  }

  return {
    status: errors.length > 0 ? 'invalid' : unverifiable.length > 0 ? 'unverifiable' : 'valid',
    orderEventId: order.event.id,
    listingEventId: listing.event.id,
    paymentEventIds: acceptedPayments
      .map(payment => payment.proofEventId)
      .filter((id): id is string => id !== undefined),
    expected: {
      amount: expectedAmount,
      ...(expectedSecurityBond ? { securityBondAmount: expectedSecurityBond } : {}),
      ...(expectedUnlockAt !== undefined ? { unlockAt: expectedUnlockAt } : {}),
      ...(maxUnlockAt !== undefined ? { maxUnlockAt } : {}),
    },
    totals,
    listingMatched,
    sellerMatched,
    orderAmountMatched,
    paymentAmountMatched,
    ...(securityBondMatched !== undefined ? { securityBondMatched } : {}),
    timeoutMatched,
    settlementMatched,
    tradeMatched,
    errors: [...errors, ...unverifiable],
  }
}

export function isOrderValidationAccepted(validation: MarketplaceOrderValidationResult | undefined): boolean {
  return validation?.status === 'valid'
}
