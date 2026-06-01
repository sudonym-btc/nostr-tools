import type { MarketplaceAmount, PaymentMethod, PaymentProofEvidence } from './helper.ts'

export type MarketplacePaymentValidationStatus = 'valid' | 'invalid' | 'pending' | 'expired' | 'unverifiable'

export type MarketplacePaymentValidationExpected = {
  settlementId: string
  tradeId: string
  listingAnchor: string
  amount?: MarketplaceAmount
  asset?: {
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
    escrow?: { pubkey?: string; address?: string }
  }
  fee?: MarketplaceAmount
}

export type MarketplacePaymentValidationRequest = {
  method: PaymentMethod
  proof: PaymentProofEvidence
  expected: MarketplacePaymentValidationExpected
  now?: number
}

export type MarketplacePaymentValidationResult = {
  method: PaymentMethod
  status: MarketplacePaymentValidationStatus
  orderEventId?: string
  proofEventId?: string
  amountMatched?: boolean
  assetMatched?: boolean
  recipientMatched?: boolean
  escrowMatched?: boolean
  confirmations?: number
  data?: Record<string, unknown>
  error?: string
}

export type MarketplacePaymentValidationPolicy = {
  method: PaymentMethod | '*'
  canValidate?: (request: MarketplacePaymentValidationRequest) => boolean | Promise<boolean>
  validatePayment: (request: MarketplacePaymentValidationRequest) => Promise<MarketplacePaymentValidationResult>
}
