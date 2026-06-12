import type { ParticipantProofKeyTag, ParticipantProofTag } from './order.ts'
import { isOrderGroupRole, type OrderGroupRole } from './order-id.ts'
import { resolveParticipantProof as resolveParticipantProofTag } from './participant-proof.ts'
import type {
  Nip44DecryptSigner,
  OrderGroupResolutionStatus,
  ParsedOrderGroup,
  ResolvedOrderGroup,
  ResolvedTradeParticipant,
  ResolveOrderGroupParticipantsOptions,
} from './order-group-types.ts'

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
      const key = [proof.role, proof.participantPubkey, proof.proofId, proof.mode, proof.payload].join(':')
      if (seen.has(key)) continue
      seen.add(key)
      proofs.push(proof)
    }
  }
  return proofs
}

function participantProofKeysFor(group: ParsedOrderGroup): ParticipantProofKeyTag[] {
  const seen = new Set<string>()
  const keys: ParticipantProofKeyTag[] = []
  for (const order of group.orders) {
    for (const key of order.participantProofKeys) {
      const cacheKey = [key.proofId, key.recipientPubkey, key.senderPubkey, key.scheme, key.payload].join(':')
      if (seen.has(cacheKey)) continue
      seen.add(cacheKey)
      keys.push(key)
    }
  }
  return keys
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
  for (const arbiterPubkey of group.arbiterPubkeys) {
    participants.set(`arbiter:${arbiterPubkey}`, { role: 'arbiter', tradePubkey: arbiterPubkey })
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
    proofId: proof.proofId,
  }

  if (!isOrderGroupRole(proof.role)) {
    return { ...base, role: 'buyer', proofStatus: 'invalid', error: 'Invalid participant proof role' }
  }
  const resolved = await resolveParticipantProofTag(proof, {
    listingAnchor: group.listingAnchor,
    tradeId: group.tradeId,
    orderGroupId: group.id,
    role: proof.role,
    participantPubkey: proof.participantPubkey,
  }, {
    signer,
    signerPubkey,
    keys: participantProofKeysFor(group),
  })
  if (resolved.status === 'resolved') {
    return {
      ...base,
      proofStatus: 'resolved',
      realPubkey: resolved.realPubkey,
      authorizationEventId: resolved.authorizationEventId,
    }
  }
  return {
    ...base,
    proofStatus: resolved.status === 'missing' ? 'missing' : resolved.status,
    error: resolved.error,
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
    const publicArbiter = participant.role === 'arbiter' && group.arbiterPubkeys.includes(participant.tradePubkey)
    if (publicSeller || publicArbiter) {
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
