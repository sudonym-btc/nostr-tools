import { TradeKeyAuthorization } from '../kinds.ts'
import { verifyEvent } from '../pure.ts'
import { parseEventJson, sha256Hex } from './helper.ts'
import type { ParticipantProofTag } from './order.ts'
import { isOrderGroupRole, type OrderGroupRole } from './order-id.ts'
import type {
  Nip44DecryptSigner,
  OrderGroupResolutionStatus,
  ParsedOrderGroup,
  ResolvedOrderGroup,
  ResolvedTradeParticipant,
  ResolveOrderGroupParticipantsOptions,
} from './order-group-types.ts'

function hasTag(event: { tags: string[][] }, name: string, value: string): boolean {
  return event.tags.some(tag => tag[0] === name && tag[1] === value)
}

function parseTradeKeyAuthorizationContent(content: string): { role: string; participantPubkey: string } {
  const json = JSON.parse(content) as Record<string, unknown>
  if (typeof json.role !== 'string' || typeof json.participantPubkey !== 'string') {
    throw new Error('Invalid trade key authorization content')
  }
  return { role: json.role, participantPubkey: json.participantPubkey }
}

function participantProofsFor(
  group: ParsedOrderGroup,
  role: OrderGroupRole,
  tradePubkey: string,
): ParticipantProofTag[] {
  const seen = new Set<string>()
  const proofs: ParticipantProofTag[] = []
  for (const order of group.orders) {
    for (const proof of order.participantProofs) {
      if (proof.role !== role || proof.participantPubkey !== tradePubkey) continue
      const key = [proof.role, proof.participantPubkey, proof.recipientPubkey, proof.payloadHash, proof.payload].join(
        ':',
      )
      if (seen.has(key)) continue
      seen.add(key)
      proofs.push(proof)
    }
  }
  return proofs
}

function publicParticipants(group: ParsedOrderGroup): { role: OrderGroupRole; tradePubkey: string }[] {
  const participants = new Map<string, { role: OrderGroupRole; tradePubkey: string }>()
  for (const participant of group.participants) {
    if (isOrderGroupRole(participant.role)) {
      participants.set(`${participant.role}:${participant.pubkey}`, {
        role: participant.role,
        tradePubkey: participant.pubkey,
      })
    }
  }
  participants.set(`seller:${group.sellerPubkey}`, { role: 'seller', tradePubkey: group.sellerPubkey })
  for (const escrowPubkey of group.escrowPubkeys) {
    participants.set(`escrow:${escrowPubkey}`, { role: 'escrow', tradePubkey: escrowPubkey })
  }
  return [...participants.values()].sort((a, b) => {
    const role = a.role.localeCompare(b.role)
    return role === 0 ? a.tradePubkey.localeCompare(b.tradePubkey) : role
  })
}

async function resolveParticipantProof(
  group: ParsedOrderGroup,
  proof: ParticipantProofTag,
  signer: Nip44DecryptSigner | undefined,
  signerPubkey: string | undefined,
): Promise<ResolvedTradeParticipant> {
  const base = {
    role: proof.role as OrderGroupRole,
    tradePubkey: proof.participantPubkey,
    proofRecipientPubkey: proof.recipientPubkey,
    proofPayloadHash: proof.payloadHash,
  }

  if (!isOrderGroupRole(proof.role)) {
    return { ...base, role: 'buyer', proofStatus: 'invalid', error: 'Invalid participant proof role' }
  }
  if (proof.scheme !== 'nip44') {
    return { ...base, proofStatus: 'unsupported', error: 'Unsupported participant proof scheme' }
  }
  if (!signer) return { ...base, proofStatus: 'not_for_us', error: 'No signer available for participant proof' }
  if (signerPubkey && proof.recipientPubkey !== signerPubkey) {
    return { ...base, proofStatus: 'not_for_us', error: 'Participant proof is addressed to another recipient' }
  }

  let plaintext: string
  try {
    plaintext = await signer.nip44Decrypt(proof.participantPubkey, proof.payload)
  } catch (err) {
    return {
      ...base,
      proofStatus: 'not_for_us',
      error: err instanceof Error ? err.message : 'Unable to decrypt participant proof',
    }
  }

  try {
    if (sha256Hex(plaintext) !== proof.payloadHash) throw new Error('Participant proof payload hash mismatch')
    const authorization = parseEventJson(plaintext, 'trade key authorization')
    if (authorization.kind !== TradeKeyAuthorization) throw new Error('Invalid trade key authorization kind')
    if (!verifyEvent(authorization)) throw new Error('Invalid trade key authorization signature')
    if (!hasTag(authorization, 'a', group.listingAnchor)) {
      throw new Error('Trade key authorization listing anchor mismatch')
    }
    if (!hasTag(authorization, 'trade', group.tradeId)) throw new Error('Trade key authorization trade id mismatch')
    if (hasTag(authorization, 'd', group.id) === false && authorization.tags.some(tag => tag[0] === 'd')) {
      throw new Error('Trade key authorization order group id mismatch')
    }
    const content = parseTradeKeyAuthorizationContent(authorization.content)
    if (content.role !== proof.role) throw new Error('Trade key authorization role mismatch')
    if (content.participantPubkey !== proof.participantPubkey) {
      throw new Error('Trade key authorization participant pubkey mismatch')
    }
    return {
      ...base,
      proofStatus: 'resolved',
      realPubkey: authorization.pubkey,
      authorizationEventId: authorization.id,
    }
  } catch (err) {
    return {
      ...base,
      proofStatus: 'invalid',
      error: err instanceof Error ? err.message : 'Invalid participant proof',
    }
  }
}

function resolutionStatus(participants: ResolvedTradeParticipant[]): OrderGroupResolutionStatus {
  if (participants.some(participant => participant.proofStatus === 'invalid')) return 'invalid'
  if (participants.every(participant => participant.proofStatus === 'public')) return 'public_only'
  if (
    participants.every(participant => participant.proofStatus === 'public' || participant.proofStatus === 'resolved')
  ) {
    return 'complete'
  }
  return 'partial'
}

export async function resolveOrderGroupParticipants(
  group: ParsedOrderGroup,
  options: ResolveOrderGroupParticipantsOptions = {},
): Promise<ResolvedOrderGroup> {
  const signerPubkey = options.signerPubkey ?? (await options.signer?.getPublicKey?.())
  const resolved: ResolvedTradeParticipant[] = []

  for (const participant of publicParticipants(group)) {
    const publicSeller = participant.role === 'seller' && participant.tradePubkey === group.listingOwnerPubkey
    const publicEscrow = participant.role === 'escrow' && group.escrowPubkeys.includes(participant.tradePubkey)
    if (publicSeller || publicEscrow) {
      resolved.push({
        ...participant,
        realPubkey: participant.tradePubkey,
        proofStatus: 'public',
      })
      continue
    }

    const proofs = participantProofsFor(group, participant.role, participant.tradePubkey)
    if (proofs.length === 0) {
      resolved.push({ ...participant, proofStatus: 'missing', error: 'No participant proof found' })
      continue
    }

    const attempts: ResolvedTradeParticipant[] = []
    for (const proof of proofs) {
      const attempt = await resolveParticipantProof(group, proof, options.signer, signerPubkey)
      attempts.push(attempt)
      if (attempt.proofStatus === 'resolved' || attempt.proofStatus === 'invalid') break
    }
    resolved.push(attempts.find(attempt => attempt.proofStatus === 'resolved') ?? attempts[0])
  }

  return { group, participants: resolved, status: resolutionStatus(resolved) }
}
