import { sha256Hex, sortedJson, type PTag } from './helper.ts'

export type OrderGroupRole = 'buyer' | 'seller' | 'escrow'

export type OrderGroupParticipantEntry = {
  role: OrderGroupRole
  pubkey: string
}

const orderGroupRoles = new Set<OrderGroupRole>(['buyer', 'seller', 'escrow'])

export function isOrderGroupRole(role: string | undefined): role is OrderGroupRole {
  return !!role && orderGroupRoles.has(role as OrderGroupRole)
}

export function orderGroupParticipantEntries(participants: Iterable<PTag>): OrderGroupParticipantEntry[] {
  const entries: OrderGroupParticipantEntry[] = []
  for (const participant of participants) {
    if (!isOrderGroupRole(participant.role)) continue
    entries.push({ role: participant.role, pubkey: participant.pubkey })
  }
  return entries.sort((left, right) => {
    const role = left.role.localeCompare(right.role)
    return role === 0 ? left.pubkey.localeCompare(right.pubkey) : role
  })
}

export function orderGroupIdForRoleParticipants(
  tradeId: string,
  participants: Iterable<PTag | OrderGroupParticipantEntry>,
): string {
  const normalized: PTag[] = []
  for (const participant of participants) {
    normalized.push({
      pubkey: participant.pubkey,
      role: participant.role,
    })
  }
  return sha256Hex(sortedJson([tradeId, orderGroupParticipantEntries(normalized)]))
}
