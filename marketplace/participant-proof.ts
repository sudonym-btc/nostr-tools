import type { Event, EventTemplate } from '../core.ts'
import { TradeKeyAuthorization } from '../kinds.ts'
import { decrypt, encrypt, getConversationKey } from '../nip44.ts'
import { getPublicKey, verifyEvent } from '../pure.ts'
import { bytesToHex, hexToBytes } from '../utils.ts'
import { now, parseEventJson, tagValue } from './helper.ts'
import { randomBytes } from '@noble/hashes/utils.js'

export type ParticipantProofMode = 'public' | 'sealed:v1'
export type ParticipantProofKeyScheme = 'nip44'

export type ProofDisclosureKeyTag = {
  version: 1
  proofId: string
  recipientPubkey: string
  senderPubkey: string
  scheme: ParticipantProofKeyScheme
  payload: string
}

export type ParticipantProofTag = {
  version: 1
  role: string
  participantPubkey: string
  proofId: string
  mode: ParticipantProofMode
  payload: string
}

export type ParticipantProofKeyTag = ProofDisclosureKeyTag

export type TradeKeyAuthorizationContent = {
  version: number
  role: string
  participantPubkey: string
}

export type TradeKeyAuthorizationTemplate = TradeKeyAuthorizationContent & {
  listingAnchor: string
  tradeId: string
  orderGroupId?: string
  createdAt?: number
}

export type ParticipantProofContext = {
  listingAnchor: string
  tradeId: string
  orderGroupId?: string
  role?: string
  participantPubkey?: string
  requireOrderGroupId?: boolean
}

export type ParticipantProofResolutionStatus =
  | 'missing'
  | 'unsupported'
  | 'invalid'
  | 'not_for_us'
  | 'resolved'

export type ParticipantProofResolution = {
  status: ParticipantProofResolutionStatus
  role?: string
  participantPubkey?: string
  proofId?: string
  realPubkey?: string
  authorizationEventId?: string
  error?: string
}

export type ParticipantProofDecryptSigner = {
  getPublicKey?: () => Promise<string> | string
  nip44Decrypt: (pubkey: string, ciphertext: string) => Promise<string> | string
}

export type ParticipantProofEncryptSigner = {
  getPublicKey?: () => Promise<string> | string
  nip44Encrypt: (pubkey: string, plaintext: string) => Promise<string> | string
}

export type ResolveParticipantProofOptions = {
  keys?: ProofDisclosureKeyTag[]
  signer?: ParticipantProofDecryptSigner
  signerPubkey?: string
}

export type SealedProofPayload = {
  payload: string
  disclosureKey: Uint8Array
}

export type SealedParticipantProof = {
  proof: ParticipantProofTag
  disclosureKey: Uint8Array
}

const disclosureKeyHex = /^[a-f0-9]{64}$/

function hasTag(event: { tags: string[][] }, name: string, value: string): boolean {
  return event.tags.some(tag => tag[0] === name && tag[1] === value)
}

function parseTradeKeyAuthorizationContent(content: string): TradeKeyAuthorizationContent {
  const json = JSON.parse(content) as Record<string, unknown>
  if (json.version !== 1 || typeof json.role !== 'string' || typeof json.participantPubkey !== 'string') {
    throw new Error('Invalid trade key authorization content')
  }
  return { version: 1, role: json.role, participantPubkey: json.participantPubkey }
}

function proofBase(proof: ParticipantProofTag): ParticipantProofResolution {
  return {
    status: 'invalid',
    role: proof.role,
    participantPubkey: proof.participantPubkey,
    proofId: proof.proofId,
  }
}

export function generateTradeKeyAuthorizationEventTemplate(auth: TradeKeyAuthorizationTemplate): EventTemplate {
  return {
    kind: TradeKeyAuthorization,
    created_at: auth.createdAt ?? now(),
    tags: [
      ['a', auth.listingAnchor],
      ['trade', auth.tradeId],
      ...(auth.orderGroupId ? [['d', auth.orderGroupId]] : []),
    ],
    content: JSON.stringify({ version: auth.version, role: auth.role, participantPubkey: auth.participantPubkey }),
  }
}

export function participantProofTag(proof: ParticipantProofTag): string[] {
  return [
    'participant_proof',
    proof.version.toString(),
    proof.role,
    proof.participantPubkey,
    proof.proofId,
    proof.mode,
    proof.payload,
  ]
}

export function parseParticipantProofTag(tag: string[]): ParticipantProofTag | null {
  if (tag.length < 7 || tag[0] !== 'participant_proof') return null
  if (tag[1] !== '1') throw new Error('Unsupported participant proof version')
  const mode = tag[5]
  if (mode !== 'public' && mode !== 'sealed:v1') throw new Error('Unsupported participant proof mode')
  return {
    version: 1,
    role: tag[2],
    participantPubkey: tag[3],
    proofId: tag[4],
    mode,
    payload: tag[6],
  }
}

export function participantProofKeyTag(key: ParticipantProofKeyTag): string[] {
  return [
    'participant_proof_key',
    key.version.toString(),
    key.proofId,
    key.recipientPubkey,
    key.senderPubkey,
    key.scheme,
    key.payload,
  ]
}

export function parseParticipantProofKeyTag(tag: string[]): ParticipantProofKeyTag | null {
  if (tag.length < 7 || tag[0] !== 'participant_proof_key') return null
  if (tag[1] !== '1') throw new Error('Unsupported participant proof key version')
  if (tag[5] !== 'nip44') throw new Error('Unsupported participant proof key scheme')
  return {
    version: 1,
    proofId: tag[2],
    recipientPubkey: tag[3],
    senderPubkey: tag[4],
    scheme: 'nip44',
    payload: tag[6],
  }
}

export function hashParticipantProofPayload(payload: string): string {
  const event = parseEventJson(payload, 'trade key authorization')
  return event.id
}

export function sealProofPayload(payload: string, disclosureKey: Uint8Array = randomBytes(32)): SealedProofPayload {
  if (disclosureKey.length !== 32) throw new Error('Proof disclosure key must be 32 bytes')
  return {
    payload: encrypt(payload, disclosureKey),
    disclosureKey,
  }
}

export function openSealedProofPayload(payload: string, disclosureKey: Uint8Array): string {
  if (disclosureKey.length !== 32) throw new Error('Proof disclosure key must be 32 bytes')
  return decrypt(payload, disclosureKey)
}

export function proofDisclosureKeyWrap(opts: {
  proofId: string
  recipientPubkey: string
  senderSecretKey: Uint8Array
  disclosureKey: Uint8Array
}): ProofDisclosureKeyTag {
  if (opts.disclosureKey.length !== 32) throw new Error('Proof disclosure key must be 32 bytes')
  const senderPubkey = getPublicKey(opts.senderSecretKey)
  const conversationKey = getConversationKey(opts.senderSecretKey, opts.recipientPubkey)
  return {
    version: 1,
    proofId: opts.proofId,
    recipientPubkey: opts.recipientPubkey,
    senderPubkey,
    scheme: 'nip44',
    payload: encrypt(bytesToHex(opts.disclosureKey), conversationKey),
  }
}

export async function proofDisclosureKeyWrapWithSigner(opts: {
  proofId: string
  recipientPubkey: string
  senderPubkey?: string
  signer: ParticipantProofEncryptSigner
  disclosureKey: Uint8Array
}): Promise<ProofDisclosureKeyTag> {
  if (opts.disclosureKey.length !== 32) throw new Error('Proof disclosure key must be 32 bytes')
  const senderPubkey = opts.senderPubkey ?? await opts.signer.getPublicKey?.()
  if (!senderPubkey) throw new Error('Proof disclosure-key sender pubkey is required')
  return {
    version: 1,
    proofId: opts.proofId,
    recipientPubkey: opts.recipientPubkey,
    senderPubkey,
    scheme: 'nip44',
    payload: await opts.signer.nip44Encrypt(opts.recipientPubkey, bytesToHex(opts.disclosureKey)),
  }
}

export async function unwrapProofDisclosureKey(
  proofId: string,
  options: ResolveParticipantProofOptions,
): Promise<Uint8Array | undefined> {
  if (!options.signer) return undefined
  const signerPubkey = options.signerPubkey ?? await options.signer.getPublicKey?.()
  const candidates = (options.keys ?? []).filter(key =>
    key.proofId === proofId && (!signerPubkey || key.recipientPubkey === signerPubkey),
  )
  for (const key of candidates) {
    try {
      const plaintext = await options.signer.nip44Decrypt(key.senderPubkey, key.payload)
      const normalized = plaintext.toLowerCase()
      if (!disclosureKeyHex.test(normalized)) throw new Error('Invalid proof disclosure key')
      return hexToBytes(normalized)
    } catch (_) {
      continue
    }
  }
  return undefined
}

export function publicParticipantProof(authorization: Event | string): ParticipantProofTag {
  const payload = typeof authorization === 'string' ? authorization : JSON.stringify(authorization)
  const event = parseEventJson(payload, 'trade key authorization')
  const content = parseTradeKeyAuthorizationContent(event.content)
  return {
    version: 1,
    role: content.role,
    participantPubkey: content.participantPubkey,
    proofId: event.id,
    mode: 'public',
    payload,
  }
}

export function sealedParticipantProof(
  authorization: Event | string,
  disclosureKey: Uint8Array = randomBytes(32),
): SealedParticipantProof {
  const payload = typeof authorization === 'string' ? authorization : JSON.stringify(authorization)
  const event = parseEventJson(payload, 'trade key authorization')
  const content = parseTradeKeyAuthorizationContent(event.content)
  const sealed = sealProofPayload(payload, disclosureKey)
  return {
    proof: {
      version: 1,
      role: content.role,
      participantPubkey: content.participantPubkey,
      proofId: event.id,
      mode: 'sealed:v1',
      payload: sealed.payload,
    },
    disclosureKey: sealed.disclosureKey,
  }
}

export function participantProofKeyWrap(opts: {
  proofId: string
  recipientPubkey: string
  senderSecretKey: Uint8Array
  disclosureKey: Uint8Array
}): ParticipantProofKeyTag {
  return proofDisclosureKeyWrap(opts)
}

export function validateTradeKeyAuthorization(
  authorization: Event,
  context: ParticipantProofContext,
): ParticipantProofResolution {
  try {
    if (authorization.kind !== TradeKeyAuthorization) throw new Error('Invalid trade key authorization kind')
    if (!verifyEvent(authorization)) throw new Error('Invalid trade key authorization signature')
    if (!hasTag(authorization, 'a', context.listingAnchor)) {
      throw new Error('Trade key authorization listing anchor mismatch')
    }
    if (!hasTag(authorization, 'trade', context.tradeId)) {
      throw new Error('Trade key authorization trade id mismatch')
    }
    const authorizationGroupId = tagValue(authorization, 'd')
    if (context.requireOrderGroupId && !authorizationGroupId) {
      throw new Error('Trade key authorization order group id is required')
    }
    if (authorizationGroupId && context.orderGroupId && authorizationGroupId !== context.orderGroupId) {
      throw new Error('Trade key authorization order group id mismatch')
    }
    const content = parseTradeKeyAuthorizationContent(authorization.content)
    if (context.role && content.role !== context.role) throw new Error('Trade key authorization role mismatch')
    if (context.participantPubkey && content.participantPubkey !== context.participantPubkey) {
      throw new Error('Trade key authorization participant pubkey mismatch')
    }
    return {
      status: 'resolved',
      role: content.role,
      participantPubkey: content.participantPubkey,
      proofId: authorization.id,
      realPubkey: authorization.pubkey,
      authorizationEventId: authorization.id,
    }
  } catch (err) {
    return { status: 'invalid', error: err instanceof Error ? err.message : 'Invalid trade key authorization' }
  }
}

export function resolvePublicParticipantProof(
  proof: ParticipantProofTag,
  context: ParticipantProofContext,
): ParticipantProofResolution {
  const base = proofBase(proof)
  if (proof.mode !== 'public') return { ...base, status: 'unsupported', error: 'Participant proof is not public' }
  try {
    const authorization = parseEventJson(proof.payload, 'trade key authorization')
    if (authorization.id !== proof.proofId) throw new Error('Participant proof id mismatch')
    const resolved = validateTradeKeyAuthorization(authorization, {
      ...context,
      role: context.role ?? proof.role,
      participantPubkey: context.participantPubkey ?? proof.participantPubkey,
    })
    return resolved.status === 'resolved' ? { ...resolved, proofId: proof.proofId } : { ...base, ...resolved }
  } catch (err) {
    return { ...base, status: 'invalid', error: err instanceof Error ? err.message : 'Invalid participant proof' }
  }
}

export async function resolveParticipantProof(
  proof: ParticipantProofTag,
  context: ParticipantProofContext,
  options: ResolveParticipantProofOptions = {},
): Promise<ParticipantProofResolution> {
  if (proof.mode === 'public') return resolvePublicParticipantProof(proof, context)
  const base = proofBase(proof)
  if (proof.mode !== 'sealed:v1') return { ...base, status: 'unsupported', error: 'Unsupported participant proof mode' }
  const disclosureKey = await unwrapProofDisclosureKey(proof.proofId, options)
  if (!disclosureKey) return { ...base, status: 'not_for_us', error: 'No participant proof key for signer' }
  try {
    const authorization = parseEventJson(openSealedProofPayload(proof.payload, disclosureKey), 'trade key authorization')
    if (authorization.id !== proof.proofId) throw new Error('Participant proof id mismatch')
    const resolved = validateTradeKeyAuthorization(authorization, {
      ...context,
      role: context.role ?? proof.role,
      participantPubkey: context.participantPubkey ?? proof.participantPubkey,
    })
    return resolved.status === 'resolved' ? { ...resolved, proofId: proof.proofId } : { ...base, ...resolved }
  } catch (err) {
    return { ...base, status: 'invalid', error: err instanceof Error ? err.message : 'Invalid participant proof' }
  }
}

export const participantProofs = {
  tradeKeyAuthorizationTemplate: generateTradeKeyAuthorizationEventTemplate,
  proofTag: participantProofTag,
  parseProofTag: parseParticipantProofTag,
  keyTag: participantProofKeyTag,
  parseKeyTag: parseParticipantProofKeyTag,
  hashPayload: hashParticipantProofPayload,
  publicProof: publicParticipantProof,
  sealedProof: sealedParticipantProof,
  keyWrap: participantProofKeyWrap,
  sealPayload: sealProofPayload,
  openPayload: openSealedProofPayload,
  disclosureKeyWrap: proofDisclosureKeyWrap,
  disclosureKeyWrapWithSigner: proofDisclosureKeyWrapWithSigner,
  unwrapDisclosureKey: unwrapProofDisclosureKey,
  validateAuthorization: validateTradeKeyAuthorization,
  resolvePublic: resolvePublicParticipantProof,
  resolve: resolveParticipantProof,
}
