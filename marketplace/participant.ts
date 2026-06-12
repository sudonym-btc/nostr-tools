import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, utf8Encoder } from '../utils.ts'

export type MarketplaceParticipantRole = 'buyer' | 'seller' | 'arbiter' | string
export type MarketplaceParticipantGroupRole = 'buyer' | 'seller' | 'arbiter'

export type MarketplaceParticipantTag = {
  pubkey: string
  relayHint?: string
  role?: MarketplaceParticipantRole
}

export type MarketplaceParticipantEntry = {
  role: MarketplaceParticipantGroupRole
  pubkey: string
}

export type MarketplaceParticipantRecord = {
  tradeId: string
  participants: Iterable<MarketplaceParticipantTag | MarketplaceParticipantEntry>
}

const marketplaceParticipantGroupRoles = new Set<MarketplaceParticipantGroupRole>(['buyer', 'seller', 'arbiter'])

function sortedJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(sortedJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map(key => `${JSON.stringify(key)}:${sortedJson((value as Record<string, unknown>)[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function sha256Hex(text: string): string {
  return bytesToHex(sha256(utf8Encoder.encode(text)))
}

function uniqueSorted(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
    .sort((a, b) => a.localeCompare(b))
}

export function isMarketplaceParticipantGroupRole(
  role: string | undefined,
): role is MarketplaceParticipantGroupRole {
  return !!role && marketplaceParticipantGroupRoles.has(role as MarketplaceParticipantGroupRole)
}

export function parseParticipantTag(tag: string[]): MarketplaceParticipantTag | null {
  if (tag[0] !== 'p' || !tag[1]) return null
  return { pubkey: tag[1], relayHint: tag[2] ?? '', ...(tag[3] ? { role: tag[3] } : {}) }
}

export function participantTag(participant: MarketplaceParticipantTag): string[] {
  return ['p', participant.pubkey, participant.relayHint ?? '', ...(participant.role ? [participant.role] : [])]
}

export function marketplaceParticipantEntries(
  participants: Iterable<MarketplaceParticipantTag | MarketplaceParticipantEntry>,
): MarketplaceParticipantEntry[] {
  const entries: MarketplaceParticipantEntry[] = []
  for (const participant of participants) {
    if (!isMarketplaceParticipantGroupRole(participant.role)) continue
    entries.push({ role: participant.role, pubkey: participant.pubkey })
  }
  return entries.sort((left, right) => {
    const role = left.role.localeCompare(right.role)
    return role === 0 ? left.pubkey.localeCompare(right.pubkey) : role
  })
}

export function marketplaceParticipantPubkeys(
  participants: Iterable<MarketplaceParticipantTag | MarketplaceParticipantEntry>,
): string[] {
  return uniqueSorted(marketplaceParticipantEntries(participants).map(participant => participant.pubkey))
}

export function participantGroupIdForParticipants(
  tradeId: string,
  participants: Iterable<MarketplaceParticipantTag | MarketplaceParticipantEntry>,
): string {
  return sha256Hex(sortedJson([tradeId, marketplaceParticipantEntries(participants)]))
}

export function participantGroupIdForRecord(record: MarketplaceParticipantRecord): string {
  return participantGroupIdForParticipants(record.tradeId, record.participants)
}

export const participants = {
  tag: participantTag,
  parseTag: parseParticipantTag,
  entries: marketplaceParticipantEntries,
  pubkeys: marketplaceParticipantPubkeys,
  groupId: participantGroupIdForParticipants,
  groupIdForRecord: participantGroupIdForRecord,
  isGroupRole: isMarketplaceParticipantGroupRole,
}
