export * from './order-group-types.ts'
export * from './order-group-core.ts'
export * from './order-group-resolution.ts'
export * from './order-group-payment.ts'
export * from './order-group-query.ts'
export * from './order-validation.ts'

import {
  allowedInOrderGroup,
  groupOrderEvents,
  orderGroupFilter,
  orderGroupEventKinds,
  orderGroupIdForOrder,
  orderGroupIdForParticipants,
  orderGroupParticipantPubkeys,
  participantGroupIdForEvent,
  participantGroupParticipantPubkeys,
  participantGroupRoleParticipants,
  parseParticipantGroupEvent,
  parseOrderGroupEvent,
  pubkeyFromListingAnchor,
  reduceOrderGroup,
} from './order-group-core.ts'
import { resolveOrderGroupParticipants } from './order-group-resolution.ts'
import { resolveAndValidateOrderGroup, validateOrderGroupPayments } from './order-group-payment.ts'
import { validateMarketplaceOrder } from './order-validation.ts'
import {
  bucketOrderGroups,
  fetchOrderGroups,
  searchMyOrderGroups,
  searchOrderGroups,
  subscribeMyOrderGroups,
  subscribeOrderGroups,
} from './order-group-query.ts'

export const orderGroups = {
  id: orderGroupIdForParticipants,
  idForOrder: orderGroupIdForOrder,
  idForEvent: participantGroupIdForEvent,
  participants: orderGroupParticipantPubkeys,
  participantPubkeys: participantGroupParticipantPubkeys,
  participantEntries: participantGroupRoleParticipants,
  pubkeyFromListingAnchor,
  eventKinds: orderGroupEventKinds,
  filter: orderGroupFilter,
  parseEvent: parseOrderGroupEvent,
  parseParticipantEvent: parseParticipantGroupEvent,
  allowed: allowedInOrderGroup,
  resolveParticipants: resolveOrderGroupParticipants,
  validatePayments: validateOrderGroupPayments,
  validateOrder: validateMarketplaceOrder,
  resolveAndValidate: resolveAndValidateOrderGroup,
  reduce: reduceOrderGroup,
  group: groupOrderEvents,
  fetch: fetchOrderGroups,
  search: searchOrderGroups,
  subscribe: subscribeOrderGroups,
  buckets: bucketOrderGroups,
  mine: searchMyOrderGroups,
  subscribeMine: subscribeMyOrderGroups,
}
