import {
  isMarketplaceDriverEncryptedPaymentProofParams,
  type MarketplaceDriverPaymentProofParamsDecryptor,
  type MarketplaceDriverEncryptedPaymentProofParams,
  type MarketplaceDriverPaymentTerms,
  type MarketplaceDriverSealedPaymentTerms,
} from '@sudonym-btc/marketplace-driver-interface'
import {
  parseEventJson,
  requireString,
  sha256Hex,
  sortedJson,
  type PaymentProof,
  type PaymentProofEvidence,
} from './helper.ts'
import {
  openSealedProofPayload,
  proofDisclosureKeyWrap,
  proofDisclosureKeyWrapWithSigner,
  sealProofPayload,
  unwrapProofDisclosureKey,
  type ParticipantProofDecryptSigner,
  type ParticipantProofEncryptSigner,
  type ProofDisclosureKeyTag,
} from './participant-proof.ts'

export type PaymentProofPrivacy = 'public' | 'sealed' | 'params'
export type PaymentTermsPrivacy = 'public' | 'sealed'

export type SealedPaymentProof = {
  version: 1
  mode: 'sealed:v1'
  proofId: string
  payload: string
}

export type SealedPaymentTerms = MarketplaceDriverSealedPaymentTerms
export type EncryptedPaymentProofParams = MarketplaceDriverEncryptedPaymentProofParams
export type PaymentProofKeyTag = ProofDisclosureKeyTag

export type PaymentProofResolutionStatus = 'missing' | 'invalid' | 'not_for_us' | 'resolved'
export type PaymentProofParamsResolutionStatus = 'clear' | 'invalid' | 'not_for_us' | 'resolved'
export type PaymentTermsResolutionStatus = 'clear' | 'invalid' | 'not_for_us' | 'resolved'

export type PaymentProofResolution = {
  status: PaymentProofResolutionStatus
  proofId?: string
  proof?: PaymentProof
  error?: string
}

export type PaymentProofParamsResolution = {
  status: PaymentProofParamsResolutionStatus
  proofId?: string
  params?: Record<string, unknown>
  error?: string
}

export type PaymentTermsResolution = {
  status: PaymentTermsResolutionStatus
  proofId?: string
  terms?: MarketplaceDriverPaymentTerms
  error?: string
}

export type ResolvePaymentProofOptions = {
  keys?: PaymentProofKeyTag[]
  signer?: ParticipantProofDecryptSigner
  signerPubkey?: string
}

export type PaymentProofFields = {
  proof?: PaymentProof
  sealedProof?: SealedPaymentProof
}

export type PaymentProofContainer = (PaymentProofFields & {
  paymentProofKeys?: PaymentProofKeyTag[]
}) | {
  content: PaymentProofFields
  paymentProofKeys?: PaymentProofKeyTag[]
}

export type BuildPaymentProofPayloadOptions = {
  mode?: PaymentProofPrivacy
  termsMode?: PaymentTermsPrivacy
  senderSecretKey: Uint8Array
  recipientPubkeys: Iterable<string | undefined>
}

export type BuildPaymentProofPayloadWithSignerOptions = {
  signer: ParticipantProofEncryptSigner
  senderPubkey?: string
  recipientPubkeys: Iterable<string | undefined>
}

function isPaymentTerms(value: unknown): value is MarketplaceDriverPaymentTerms {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).version === 1 &&
    (value as Record<string, unknown>).asset &&
    typeof (value as Record<string, unknown>).asset === 'object' &&
    Array.isArray((value as Record<string, unknown>).parties) &&
    (value as Record<string, unknown>).lock &&
    typeof (value as Record<string, unknown>).lock === 'object',
  )
}

function parsePaymentTerms(value: unknown): MarketplaceDriverPaymentTerms | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  if (!isPaymentTerms(value)) throw new Error('Invalid payment proof terms')
  return value
}

export function parsePaymentProof(json: unknown): PaymentProof | null | undefined {
  if (json === null) return null
  if (!json || typeof json !== 'object' || Array.isArray(json)) return undefined
  const record = json as Record<string, unknown>
  const rawPaymentProof = record.paymentProof
  let paymentProof: PaymentProofEvidence | null = null
  if (rawPaymentProof && typeof rawPaymentProof === 'object' && !Array.isArray(rawPaymentProof)) {
    const proofRecord = rawPaymentProof as Record<string, unknown>
    const terms = parsePaymentTerms(proofRecord.terms)
    const sealedTerms = parseSealedPaymentTerms(proofRecord.sealedTerms)
    if (!terms && !sealedTerms) throw new Error('Payment proof requires terms')
    const driver = requireString(proofRecord.driver, 'paymentProof.driver')
    const params =
      proofRecord.params && typeof proofRecord.params === 'object' && !Array.isArray(proofRecord.params)
        ? (proofRecord.params as Record<string, unknown>)
        : {}
    paymentProof = terms
      ? { driver, terms, params }
      : { driver, sealedTerms: sealedTerms!, params }
  }
  let arbitration: PaymentProof['arbitration']
  if (record.arbitration && typeof record.arbitration === 'object' && !Array.isArray(record.arbitration)) {
    const arbitrationRecord = record.arbitration as Record<string, unknown>
    arbitration = {
      arbitrationService: parseEventJson(arbitrationRecord.arbitrationService, 'arbitrationService'),
      paymentMethod: parseEventJson(arbitrationRecord.paymentMethod, 'paymentMethod'),
    }
  }
  return { paymentProof, ...(arbitration ? { arbitration } : {}) }
}

export function paymentProofId(proof: PaymentProof): string {
  return sha256Hex(sortedJson(proof))
}

export function paymentProofParamsId(params: Record<string, unknown>): string {
  return sha256Hex(sortedJson(params))
}

export function paymentTermsId(terms: MarketplaceDriverPaymentTerms): string {
  return sha256Hex(sortedJson(terms))
}

export function isSealedPaymentProof(value: unknown): value is SealedPaymentProof {
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

export function isSealedPaymentTerms(value: unknown): value is SealedPaymentTerms {
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

export function parseSealedPaymentTerms(value: unknown): SealedPaymentTerms | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  if (record.mode === undefined) return undefined
  if (!isSealedPaymentTerms(value)) throw new Error('Invalid sealed payment terms')
  return value
}

export function parseSealedPaymentProof(value: unknown): SealedPaymentProof | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  if (record.mode === undefined) return undefined
  if (!isSealedPaymentProof(value)) throw new Error('Invalid sealed payment proof')
  return value
}

export function sealPaymentTerms(terms: MarketplaceDriverPaymentTerms, disclosureKey?: Uint8Array): {
  terms: SealedPaymentTerms
  disclosureKey: Uint8Array
} {
  const sealed = sealProofPayload(JSON.stringify(terms), disclosureKey)
  return {
    terms: {
      version: 1,
      mode: 'sealed:v1',
      proofId: paymentTermsId(terms),
      payload: sealed.payload,
    },
    disclosureKey: sealed.disclosureKey,
  }
}

export function sealPaymentProofParams(params: Record<string, unknown>, disclosureKey?: Uint8Array): {
  params: EncryptedPaymentProofParams
  disclosureKey: Uint8Array
} {
  const sealed = sealProofPayload(JSON.stringify(params), disclosureKey)
  return {
    params: {
      encrypted: true,
      version: 1,
      scheme: 'nip44',
      proofId: paymentProofParamsId(params),
      payload: sealed.payload,
    },
    disclosureKey: sealed.disclosureKey,
  }
}

export function sealPaymentProof(proof: PaymentProof, disclosureKey?: Uint8Array): {
  proof: SealedPaymentProof
  disclosureKey: Uint8Array
} {
  const payload = JSON.stringify(proof)
  const sealed = sealProofPayload(payload, disclosureKey)
  return {
    proof: {
      version: 1,
      mode: 'sealed:v1',
      proofId: paymentProofId(proof),
      payload: sealed.payload,
    },
    disclosureKey: sealed.disclosureKey,
  }
}

export function paymentProofKeyTag(key: PaymentProofKeyTag): string[] {
  return [
    'payment_proof_key',
    key.version.toString(),
    key.proofId,
    key.recipientPubkey,
    key.senderPubkey,
    key.scheme,
    key.payload,
  ]
}

export function parsePaymentProofKeyTag(tag: string[]): PaymentProofKeyTag | null {
  if (tag.length < 7 || tag[0] !== 'payment_proof_key') return null
  if (tag[1] !== '1') throw new Error('Unsupported payment proof key version')
  if (tag[5] !== 'nip44') throw new Error('Unsupported payment proof key scheme')
  return {
    version: 1,
    proofId: tag[2],
    recipientPubkey: tag[3],
    senderPubkey: tag[4],
    scheme: 'nip44',
    payload: tag[6],
  }
}

export function buildPaymentProofPayload(
  proof: PaymentProof,
  options: BuildPaymentProofPayloadOptions,
): { proof: PaymentProof | SealedPaymentProof; paymentProofKeys: PaymentProofKeyTag[] } {
  const mode = options.mode ?? 'public'
  const termsMode = options.termsMode ?? 'public'
  if (mode === 'public' && termsMode === 'public') return { proof, paymentProofKeys: [] }
  const recipientPubkeys = [...new Set([...options.recipientPubkeys].filter((pubkey): pubkey is string =>
    typeof pubkey === 'string' && pubkey.length > 0,
  ))]
  if ((mode !== 'public' || termsMode === 'sealed') && recipientPubkeys.length === 0) {
    throw new Error('Protected payment proof requires at least one disclosure-key recipient')
  }
  if (mode === 'public' && termsMode === 'sealed') {
    if (!proof.paymentProof?.terms) return { proof, paymentProofKeys: [] }
    const sealedTerms = sealPaymentTerms(proof.paymentProof.terms)
    return {
      proof: {
        ...proof,
        paymentProof: {
          driver: proof.paymentProof.driver,
          sealedTerms: sealedTerms.terms,
          params: proof.paymentProof.params,
        },
      },
      paymentProofKeys: recipientPubkeys.map(recipientPubkey => proofDisclosureKeyWrap({
        proofId: sealedTerms.terms.proofId,
        recipientPubkey,
        senderSecretKey: options.senderSecretKey,
        disclosureKey: sealedTerms.disclosureKey,
      })),
    }
  }
  if (mode === 'params') {
    if (!proof.paymentProof || isMarketplaceDriverEncryptedPaymentProofParams(proof.paymentProof.params)) {
      return { proof, paymentProofKeys: [] }
    }
    const sealed = sealPaymentProofParams(proof.paymentProof.params as Record<string, unknown>)
    const terms = proof.paymentProof.terms
    const sealedTerms = termsMode === 'sealed' && terms ? sealPaymentTerms(terms) : undefined
    return {
      proof: {
        ...proof,
        paymentProof: sealedTerms
          ? {
              driver: proof.paymentProof.driver,
              sealedTerms: sealedTerms.terms,
              params: sealed.params,
            }
          : {
              ...proof.paymentProof,
              params: sealed.params,
            },
      },
      paymentProofKeys: [
        ...recipientPubkeys.map(recipientPubkey => proofDisclosureKeyWrap({
          proofId: sealed.params.proofId,
          recipientPubkey,
          senderSecretKey: options.senderSecretKey,
          disclosureKey: sealed.disclosureKey,
        })),
        ...(sealedTerms
          ? recipientPubkeys.map(recipientPubkey => proofDisclosureKeyWrap({
              proofId: sealedTerms.terms.proofId,
              recipientPubkey,
              senderSecretKey: options.senderSecretKey,
              disclosureKey: sealedTerms.disclosureKey,
            }))
          : []),
      ],
    }
  }
  const sealed = sealPaymentProof(proof)
  return {
    proof: sealed.proof,
    paymentProofKeys: recipientPubkeys.map(recipientPubkey => proofDisclosureKeyWrap({
      proofId: sealed.proof.proofId,
      recipientPubkey,
      senderSecretKey: options.senderSecretKey,
      disclosureKey: sealed.disclosureKey,
    })),
  }
}

/** Seal a complete proof when the publisher is a remote signer. */
export async function buildPaymentProofPayloadWithSigner(
  proof: PaymentProof,
  options: BuildPaymentProofPayloadWithSignerOptions,
): Promise<{ proof: SealedPaymentProof; paymentProofKeys: PaymentProofKeyTag[] }> {
  const recipientPubkeys = [...new Set([...options.recipientPubkeys].filter((pubkey): pubkey is string =>
    typeof pubkey === 'string' && pubkey.length > 0,
  ))]
  if (recipientPubkeys.length === 0) {
    throw new Error('Protected payment proof requires at least one disclosure-key recipient')
  }
  const sealed = sealPaymentProof(proof)
  const paymentProofKeys = await Promise.all(recipientPubkeys.map(recipientPubkey =>
    proofDisclosureKeyWrapWithSigner({
      proofId: sealed.proof.proofId,
      recipientPubkey,
      ...(options.senderPubkey ? { senderPubkey: options.senderPubkey } : {}),
      signer: options.signer,
      disclosureKey: sealed.disclosureKey,
    }),
  ))
  return { proof: sealed.proof, paymentProofKeys }
}

function paymentProofFields(container: PaymentProofContainer): PaymentProofFields & {
  paymentProofKeys?: PaymentProofKeyTag[]
} {
  if ('content' in container) {
    return {
      ...container.content,
      paymentProofKeys: container.paymentProofKeys,
    }
  }
  return container
}

export async function resolvePaymentTerms(
  proof: PaymentProofEvidence,
  options: ResolvePaymentProofOptions = {},
): Promise<PaymentTermsResolution> {
  if (proof.terms) return { status: 'clear', terms: proof.terms, proofId: paymentTermsId(proof.terms) }
  if (!proof.sealedTerms) return { status: 'invalid', error: 'Payment proof terms are missing' }
  const disclosureKey = await unwrapProofDisclosureKey(proof.sealedTerms.proofId, options)
  if (!disclosureKey) {
    return { status: 'not_for_us', proofId: proof.sealedTerms.proofId, error: 'No payment terms key for signer' }
  }
  try {
    const decoded = JSON.parse(openSealedProofPayload(proof.sealedTerms.payload, disclosureKey))
    const terms = parsePaymentTerms(decoded)
    if (!terms) throw new Error('Invalid decrypted payment terms')
    const proofId = paymentTermsId(terms)
    if (proofId !== proof.sealedTerms.proofId) throw new Error('Payment terms id mismatch')
    return { status: 'resolved', proofId, terms }
  } catch (err) {
    return {
      status: 'invalid',
      proofId: proof.sealedTerms.proofId,
      error: err instanceof Error ? err.message : 'Invalid sealed payment terms',
    }
  }
}

export async function resolvePaymentProofParams(
  proof: PaymentProofEvidence,
  options: ResolvePaymentProofOptions = {},
): Promise<PaymentProofParamsResolution> {
  if (!isMarketplaceDriverEncryptedPaymentProofParams(proof.params)) {
    return { status: 'clear', params: proof.params as Record<string, unknown> }
  }
  const encrypted = proof.params
  const disclosureKey = await unwrapProofDisclosureKey(encrypted.proofId, options)
  if (!disclosureKey) {
    return { status: 'not_for_us', proofId: encrypted.proofId, error: 'No payment proof params key for signer' }
  }
  try {
    const decoded = JSON.parse(openSealedProofPayload(encrypted.payload, disclosureKey))
    if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) {
      throw new Error('Invalid decrypted payment proof params')
    }
    const params = decoded as Record<string, unknown>
    const proofId = paymentProofParamsId(params)
    if (proofId !== encrypted.proofId) throw new Error('Payment proof params id mismatch')
    return { status: 'resolved', proofId, params }
  } catch (err) {
    return {
      status: 'invalid',
      proofId: encrypted.proofId,
      error: err instanceof Error ? err.message : 'Invalid payment proof params',
    }
  }
}

export async function resolvePaymentProofEvidence(
  proof: PaymentProofEvidence,
  options: ResolvePaymentProofOptions = {},
): Promise<{
  status: 'resolved' | 'invalid' | 'not_for_us'
  proof?: PaymentProofEvidence & { terms: MarketplaceDriverPaymentTerms }
  proofId?: string
  error?: string
}> {
  const termsResolution = await resolvePaymentTerms(proof, options)
  if (
    termsResolution.status !== 'clear' &&
    termsResolution.status !== 'resolved'
  ) {
    return {
      status: termsResolution.status === 'not_for_us' ? 'not_for_us' : 'invalid',
      proofId: termsResolution.proofId,
      error: termsResolution.error ?? 'Payment terms could not be resolved',
    }
  }
  const paramsResolution = await resolvePaymentProofParams(proof, options)
  if (
    paramsResolution.status !== 'clear' &&
    paramsResolution.status !== 'resolved'
  ) {
    return {
      status: paramsResolution.status === 'not_for_us' ? 'not_for_us' : 'invalid',
      proofId: paramsResolution.proofId,
      error: paramsResolution.error ?? 'Payment proof params could not be resolved',
    }
  }
  if (!termsResolution.terms || !paramsResolution.params) {
    return { status: 'invalid', error: 'Payment proof evidence could not be resolved' }
  }
  return {
    status: 'resolved',
    proof: {
      driver: proof.driver,
      terms: termsResolution.terms,
      params: paramsResolution.params,
    },
  }
}

export function paymentProofParamsDecryptor(
  options: ResolvePaymentProofOptions = {},
): MarketplaceDriverPaymentProofParamsDecryptor {
  return async proof => {
    const resolution = await resolvePaymentProofParams(proof, options)
    if ((resolution.status === 'clear' || resolution.status === 'resolved') && resolution.params) return resolution.params
    throw new Error(resolution.error ?? 'Payment proof params could not be resolved')
  }
}

export async function resolvePaymentProof(
  container: PaymentProofContainer,
  options: ResolvePaymentProofOptions = {},
): Promise<PaymentProofResolution> {
  const payment = paymentProofFields(container)
  if (payment.proof) return { status: 'resolved', proof: payment.proof, proofId: paymentProofId(payment.proof) }
  if (!payment.sealedProof) return { status: 'missing' }
  const disclosureKey = await unwrapProofDisclosureKey(payment.sealedProof.proofId, {
    keys: options.keys ?? payment.paymentProofKeys,
    signer: options.signer,
    signerPubkey: options.signerPubkey,
  })
  if (!disclosureKey) {
    return { status: 'not_for_us', proofId: payment.sealedProof.proofId, error: 'No payment proof key for signer' }
  }
  try {
    const decoded = JSON.parse(openSealedProofPayload(payment.sealedProof.payload, disclosureKey))
    const proof = parsePaymentProof(decoded)
    if (!proof) throw new Error('Invalid decrypted payment proof')
    const proofId = paymentProofId(proof)
    if (proofId !== payment.sealedProof.proofId) throw new Error('Payment proof id mismatch')
    return { status: 'resolved', proofId, proof }
  } catch (err) {
    return {
      status: 'invalid',
      proofId: payment.sealedProof.proofId,
      error: err instanceof Error ? err.message : 'Invalid sealed payment proof',
    }
  }
}

export const paymentProofs = {
  id: paymentProofId,
  paramsId: paymentProofParamsId,
  termsId: paymentTermsId,
  parse: parsePaymentProof,
  isSealed: isSealedPaymentProof,
  parseSealed: parseSealedPaymentProof,
  isSealedTerms: isSealedPaymentTerms,
  parseSealedTerms: parseSealedPaymentTerms,
  sealTerms: sealPaymentTerms,
  resolveTerms: resolvePaymentTerms,
  sealParams: sealPaymentProofParams,
  resolveParams: resolvePaymentProofParams,
  resolveEvidence: resolvePaymentProofEvidence,
  paramsDecryptor: paymentProofParamsDecryptor,
  seal: sealPaymentProof,
  build: buildPaymentProofPayload,
  buildWithSigner: buildPaymentProofPayloadWithSigner,
  keyTag: paymentProofKeyTag,
  parseKeyTag: parsePaymentProofKeyTag,
  resolve: resolvePaymentProof,
}
