export * from './order-group-types.ts'
export * from './order-group-core.ts'
export * from './order-group-resolution.ts'
export * from './order-group-payment.ts'
export * from './order-group-query.ts'

import {
  allowedInOrderGroup,
  groupOrderEvents,
  orderGroupFilter,
  orderGroupEventKinds,
  orderGroupIdForOrder,
  orderGroupIdForParticipants,
  orderGroupParticipantPubkeys,
  parseOrderGroupEvent,
  pubkeyFromListingAnchor,
  reduceOrderGroup,
} from './order-group-core.ts'
import { resolveOrderGroupParticipants } from './order-group-resolution.ts'
import { resolveAndValidateOrderGroup, validateOrderGroupPayments } from './order-group-payment.ts'
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
  participants: orderGroupParticipantPubkeys,
  pubkeyFromListingAnchor,
  eventKinds: orderGroupEventKinds,
  filter: orderGroupFilter,
  parseEvent: parseOrderGroupEvent,
  allowed: allowedInOrderGroup,
  resolveParticipants: resolveOrderGroupParticipants,
  validatePayments: validateOrderGroupPayments,
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
