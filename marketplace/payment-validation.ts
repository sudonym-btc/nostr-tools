import type { MarketplaceAmount, PaymentProofEvidence } from './helper.ts'
import type {
  MarketplaceDriverValidationExpected,
  MarketplaceDriverValidationPolicy,
  MarketplaceDriverValidationRequest,
  MarketplaceDriverValidationResult,
  MarketplaceDriverValidationStatus,
  MarketplaceDriverValidatedPaymentTerms,
} from '@sudonym-btc/marketplace-driver-interface'

export type MarketplacePaymentValidationStatus = MarketplaceDriverValidationStatus
export type MarketplaceValidatedPaymentTerms = MarketplaceDriverValidatedPaymentTerms

export type MarketplacePaymentValidationExpected = MarketplaceDriverValidationExpected & {
  settlementId?: string
  tradeId?: string
  listingAnchor?: string
  amount?: MarketplaceAmount
  asset?: {
    currency?: string
    denomination?: string
    decimals?: number
    assetId?: string
  }
  contract?: {
    type?: string
    chainId?: number
    address?: string
    bytecodeHash?: string
    params?: Record<string, unknown>
  }
  participants?: {
    buyer?: { pubkey?: string; address?: string }
    seller?: { pubkey?: string; address?: string }
    arbiter?: { pubkey?: string; address?: string }
  }
  fee?: MarketplaceAmount
}

export type MarketplacePaymentValidationRequest = MarketplaceDriverValidationRequest & {
  driver: string
  proof: PaymentProofEvidence
  expected?: MarketplacePaymentValidationExpected
  now?: number
}

export type MarketplacePaymentValidationResult = MarketplaceDriverValidationResult & {
  driver: string
  status: MarketplacePaymentValidationStatus
  orderEventId?: string
  proofEventId?: string
  amount?: MarketplaceAmount
  terms?: MarketplaceValidatedPaymentTerms
  amountMatched?: boolean
  assetMatched?: boolean
  recipientMatched?: boolean
  arbiterMatched?: boolean
  confirmations?: number
  data?: Record<string, unknown>
  error?: string
}

export type MarketplacePaymentValidationPolicy = MarketplaceDriverValidationPolicy<
  MarketplacePaymentValidationRequest,
  MarketplacePaymentValidationResult
> & {
  driver?: string | '*'
  id?: string
  method?: string
  canValidate?: (request: MarketplacePaymentValidationRequest) => boolean | Promise<boolean>
  validatePayment: (request: MarketplacePaymentValidationRequest) => Promise<MarketplacePaymentValidationResult>
}

export function marketplaceAmountsEqual(left: MarketplaceAmount | undefined, right: MarketplaceAmount | undefined): boolean {
  return Boolean(
    left &&
    right &&
    left.value === right.value &&
    left.denomination === right.denomination &&
    left.decimals === right.decimals,
  )
}

export function normalizePaymentValidationResult(
  result: MarketplacePaymentValidationResult,
  paymentAmount: MarketplaceAmount,
): MarketplacePaymentValidationResult {
  const amountMatched = result.amount
    ? marketplaceAmountsEqual(result.amount, paymentAmount)
    : false
  if (result.status === 'valid' && amountMatched !== true) {
    return {
      ...result,
      status: 'invalid',
      amountMatched: false,
      error: result.error ?? 'Payment amount does not match payment event amount',
    }
  }
  return {
    ...result,
    ...(amountMatched !== undefined ? { amountMatched } : {}),
  }
}

export function isPaymentValidationAccepted(validation: MarketplacePaymentValidationResult): boolean {
  return validation.status === 'valid' && validation.amountMatched === true
}
