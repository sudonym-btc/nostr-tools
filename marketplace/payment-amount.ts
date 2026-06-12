import {
  normalizeMarketplaceAmount,
  parseAmount,
  sha256Hex,
  sortedJson,
  type MarketplaceAmount,
} from './helper.ts'
import {
  openSealedProofPayload,
  proofDisclosureKeyWrap,
  sealProofPayload,
  unwrapProofDisclosureKey,
  type ParticipantProofDecryptSigner,
  type ProofDisclosureKeyTag,
} from './participant-proof.ts'

export type PaymentAmountPrivacy = 'public' | 'sealed'

export type SealedPaymentAmount = {
  version: 1
  mode: 'sealed:v1'
  proofId: string
  payload: string
}

export type PaymentAmountKeyTag = ProofDisclosureKeyTag

export type PaymentAmountResolutionStatus = 'missing' | 'invalid' | 'not_for_us' | 'resolved'

export type PaymentAmountResolution = {
  status: PaymentAmountResolutionStatus
  proofId?: string
  amount?: MarketplaceAmount
  error?: string
}

export type ResolvePaymentAmountOptions = {
  keys?: PaymentAmountKeyTag[]
  signer?: ParticipantProofDecryptSigner
  signerPubkey?: string
}

export type PaymentAmountFields = {
  amount?: MarketplaceAmount
  sealedAmount?: SealedPaymentAmount
}

export type PaymentAmountContainer = (PaymentAmountFields & {
  paymentAmountKeys?: PaymentAmountKeyTag[]
}) | {
  content: PaymentAmountFields
  paymentAmountKeys?: PaymentAmountKeyTag[]
}

export type BuildPaymentAmountPayloadOptions = {
  mode?: PaymentAmountPrivacy
  senderSecretKey: Uint8Array
  recipientPubkeys: Iterable<string | undefined>
}

export function paymentAmountId(amount: MarketplaceAmount): string {
  return sha256Hex(sortedJson(normalizeMarketplaceAmount(amount)))
}

export function isSealedPaymentAmount(value: unknown): value is SealedPaymentAmount {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).version === 1 &&
    (value as Record<string, unknown>).mode === 'sealed:v1' &&
    typeof (value as Record<string, unknown>).proofId === 'string' &&
    typeof (value as Record<string, unknown>).payload === 'string',
  )
}

export function parseSealedPaymentAmount(value: unknown): SealedPaymentAmount | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  if (record.mode === undefined) return undefined
  if (!isSealedPaymentAmount(value)) throw new Error('Invalid sealed payment amount')
  return value
}

export function sealPaymentAmount(amount: MarketplaceAmount, disclosureKey?: Uint8Array): {
  amount: SealedPaymentAmount
  disclosureKey: Uint8Array
} {
  const normalized = normalizeMarketplaceAmount(amount)
  const sealed = sealProofPayload(JSON.stringify(normalized), disclosureKey)
  return {
    amount: {
      version: 1,
      mode: 'sealed:v1',
      proofId: paymentAmountId(normalized),
      payload: sealed.payload,
    },
    disclosureKey: sealed.disclosureKey,
  }
}

export function paymentAmountKeyTag(key: PaymentAmountKeyTag): string[] {
  return [
    'payment_amount_key',
    key.version.toString(),
    key.proofId,
    key.recipientPubkey,
    key.senderPubkey,
    key.scheme,
    key.payload,
  ]
}

export function parsePaymentAmountKeyTag(tag: string[]): PaymentAmountKeyTag | null {
  if (tag.length < 7 || tag[0] !== 'payment_amount_key') return null
  if (tag[1] !== '1') throw new Error('Unsupported payment amount key version')
  if (tag[5] !== 'nip44') throw new Error('Unsupported payment amount key scheme')
  return {
    version: 1,
    proofId: tag[2],
    recipientPubkey: tag[3],
    senderPubkey: tag[4],
    scheme: 'nip44',
    payload: tag[6],
  }
}

export function buildPaymentAmountPayload(
  amount: MarketplaceAmount,
  options: BuildPaymentAmountPayloadOptions,
): PaymentAmountFields & { paymentAmountKeys: PaymentAmountKeyTag[] } {
  const normalized = normalizeMarketplaceAmount(amount)
  if ((options.mode ?? 'public') === 'public') return { amount: normalized, paymentAmountKeys: [] }
  const sealed = sealPaymentAmount(normalized)
  const recipientPubkeys = [...new Set([...options.recipientPubkeys].filter((pubkey): pubkey is string =>
    typeof pubkey === 'string' && pubkey.length > 0,
  ))]
  return {
    sealedAmount: sealed.amount,
    paymentAmountKeys: recipientPubkeys.map(recipientPubkey => proofDisclosureKeyWrap({
      proofId: sealed.amount.proofId,
      recipientPubkey,
      senderSecretKey: options.senderSecretKey,
      disclosureKey: sealed.disclosureKey,
    })),
  }
}

function paymentAmountFields(container: PaymentAmountContainer): PaymentAmountFields & {
  paymentAmountKeys?: PaymentAmountKeyTag[]
} {
  if ('content' in container) {
    return {
      ...container.content,
      paymentAmountKeys: container.paymentAmountKeys,
    }
  }
  return container
}

export async function resolvePaymentAmount(
  container: PaymentAmountContainer,
  options: ResolvePaymentAmountOptions = {},
): Promise<PaymentAmountResolution> {
  const payment = paymentAmountFields(container)
  if (payment.amount) {
    const amount = normalizeMarketplaceAmount(payment.amount)
    return { status: 'resolved', amount, proofId: paymentAmountId(amount) }
  }
  if (!payment.sealedAmount) return { status: 'missing' }
  const disclosureKey = await unwrapProofDisclosureKey(payment.sealedAmount.proofId, {
    keys: options.keys ?? payment.paymentAmountKeys,
    signer: options.signer,
    signerPubkey: options.signerPubkey,
  })
  if (!disclosureKey) {
    return { status: 'not_for_us', proofId: payment.sealedAmount.proofId, error: 'No payment amount key for signer' }
  }
  try {
    const decoded = JSON.parse(openSealedProofPayload(payment.sealedAmount.payload, disclosureKey))
    const amount = parseAmount(decoded)
    if (!amount) throw new Error('Invalid decrypted payment amount')
    const proofId = paymentAmountId(amount)
    if (proofId !== payment.sealedAmount.proofId) throw new Error('Payment amount id mismatch')
    return { status: 'resolved', proofId, amount }
  } catch (err) {
    return {
      status: 'invalid',
      proofId: payment.sealedAmount.proofId,
      error: err instanceof Error ? err.message : 'Invalid sealed payment amount',
    }
  }
}

export const paymentAmounts = {
  id: paymentAmountId,
  isSealed: isSealedPaymentAmount,
  parseSealed: parseSealedPaymentAmount,
  seal: sealPaymentAmount,
  build: buildPaymentAmountPayload,
  keyTag: paymentAmountKeyTag,
  parseKeyTag: parsePaymentAmountKeyTag,
  resolve: resolvePaymentAmount,
}
