import {
  isMarketplaceParticipantGroupRole,
  marketplaceParticipantEntries,
  participantGroupIdForParticipants,
  type MarketplaceParticipantEntry,
  type MarketplaceParticipantGroupRole,
  type MarketplaceParticipantTag,
} from './participant.ts'

export type OrderGroupRole = MarketplaceParticipantGroupRole

export type OrderGroupParticipantEntry = MarketplaceParticipantEntry

export function isOrderGroupRole(role: string | undefined): role is OrderGroupRole {
  return isMarketplaceParticipantGroupRole(role)
}

export function orderGroupParticipantEntries(
  participants: Iterable<MarketplaceParticipantTag | OrderGroupParticipantEntry>,
): OrderGroupParticipantEntry[] {
  return marketplaceParticipantEntries(participants)
}

export function orderGroupIdForRoleParticipants(
  tradeId: string,
  participants: Iterable<MarketplaceParticipantTag | OrderGroupParticipantEntry>,
): string {
  return participantGroupIdForParticipants(tradeId, participants)
}
