import {
  isTransactionHash,
  parseEventJson,
  requireString,
  type PaymentProof,
  type PaymentProofEvidence,
} from './helper.ts'

export function parsePaymentProof(json: unknown): PaymentProof | null | undefined {
  if (json === null) return null
  if (!json || typeof json !== 'object' || Array.isArray(json)) return undefined
  const record = json as Record<string, unknown>
  const listing = parseEventJson(record.listing, 'proof listing')
  const rawPaymentProof = record.paymentProof
  let paymentProof: PaymentProofEvidence | null = null
  if (rawPaymentProof && typeof rawPaymentProof === 'object' && !Array.isArray(rawPaymentProof)) {
    const proofRecord = rawPaymentProof as Record<string, unknown>
    paymentProof = {
      method: requireString(proofRecord.method, 'paymentProof.method'),
      params:
        proofRecord.params && typeof proofRecord.params === 'object' && !Array.isArray(proofRecord.params)
          ? (proofRecord.params as Record<string, unknown>)
          : {},
    }
    if (paymentProof.method === 'evm') {
      const txHash = paymentProof.params.txHash
      if (typeof txHash !== 'string' || !isTransactionHash(txHash)) throw new Error('Invalid EVM txHash')
    }
  }
  let escrow: PaymentProof['escrow']
  if (record.escrow && typeof record.escrow === 'object' && !Array.isArray(record.escrow)) {
    const escrowRecord = record.escrow as Record<string, unknown>
    escrow = {
      escrowService: parseEventJson(escrowRecord.escrowService, 'escrowService'),
      sellerEscrowMethod: parseEventJson(escrowRecord.sellerEscrowMethod, 'sellerEscrowMethod'),
    }
  }
  return { listing, paymentProof, ...(escrow ? { escrow } : {}) }
}
