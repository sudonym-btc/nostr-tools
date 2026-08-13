# Variable: orders

> `const` **orders**: `object`

## Type Declaration

### cancelTemplate

> **cancelTemplate**: (`cancel`) => `EventTemplate` = `generateOrderCancelEventTemplate`

#### Parameters

##### cancel

[`OrderCancelTemplate`](../type-aliases/OrderCancelTemplate.md)

#### Returns

`EventTemplate`

### commitAuthorizationTemplate

> **commitAuthorizationTemplate**: (`auth`) => `EventTemplate` = `generateCommitAuthorizationEventTemplate`

#### Parameters

##### auth

[`CommitAuthorizationTemplate`](../type-aliases/CommitAuthorizationTemplate.md)

#### Returns

`EventTemplate`

### commitHash

> **commitHash**: (`content`) => `string` = `orderCommitHash`

#### Parameters

##### content

[`OrderContent`](../type-aliases/OrderContent.md)

#### Returns

`string`

### committedTerms

> **committedTerms**: (`content`) => `Record`\<`string`, `unknown`\> = `committedOrderTerms`

#### Parameters

##### content

[`OrderContent`](../type-aliases/OrderContent.md)

#### Returns

`Record`\<`string`, `unknown`\>

### filters

> **filters**: (`query`) => `Filter`[] = `orderQueries.filters`

#### Parameters

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md) = `{}`

#### Returns

`Filter`[]

### groups

> **groups**: `object` = `orderGroups`

#### groups.allowed

> **allowed**: (`event`, `anchor`) => `boolean` = `allowedInOrderGroup`

##### Parameters

###### event

`NostrEvent` \| [`OrderGroupEvent`](../type-aliases/OrderGroupEvent.md)

###### anchor

[`ParsedOrder`](../type-aliases/ParsedOrder.md) \| [`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

##### Returns

`boolean`

#### groups.eventKinds

> **eventKinds**: `number`[] = `orderGroupEventKinds`

#### groups.fetch

> **fetch**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\> = `fetchOrderGroups`

##### Parameters

###### pool

`OrderGroupQueryPool`

###### relays

`string`[]

###### query?

[`OrderGroupFilterQuery`](../type-aliases/OrderGroupFilterQuery.md) = `{}`

###### options?

[`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md) & `object` = `{}`

##### Returns

`Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

#### groups.filter

> **filter**: (`query`) => `Filter` = `orderGroupFilter`

##### Parameters

###### query?

[`OrderGroupFilterQuery`](../type-aliases/OrderGroupFilterQuery.md) = `{}`

##### Returns

`Filter`

#### groups.group

> **group**: (`events`, `options`) => [`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[] = `groupOrderEvents`

##### Parameters

###### events

`Iterable`\<`NostrEvent` \| [`OrderGroupEvent`](../type-aliases/OrderGroupEvent.md)\>

###### options?

[`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md) = `{}`

##### Returns

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]

#### groups.id

> **id**: (`tradeId`, `participants`) => `string` = `orderGroupIdForParticipants`

##### Parameters

###### tradeId

`string`

###### participants

`Iterable`\<[`MarketplaceParticipantTag`](../type-aliases/MarketplaceParticipantTag.md) \| [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)\>

##### Returns

`string`

#### groups.idForEvent

> **idForEvent**: (`event`) => `string` = `participantGroupIdForEvent`

##### Parameters

###### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

##### Returns

`string`

#### groups.idForOrder

> **idForOrder**: (`order`) => `string` = `orderGroupIdForOrder`

##### Parameters

###### order

`NostrEvent` \| [`ParsedOrder`](../type-aliases/ParsedOrder.md) \| [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

##### Returns

`string`

#### groups.parseEvent

> **parseEvent**: (`event`) => [`OrderGroupEvent`](../type-aliases/OrderGroupEvent.md) = `parseOrderGroupEvent`

##### Parameters

###### event

`NostrEvent` \| [`OrderGroupEvent`](../type-aliases/OrderGroupEvent.md)

##### Returns

[`OrderGroupEvent`](../type-aliases/OrderGroupEvent.md)

#### groups.parseParticipantEvent

> **parseParticipantEvent**: (`event`) => [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md) = `parseParticipantGroupEvent`

##### Parameters

###### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

##### Returns

[`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### groups.participantEntries

> **participantEntries**: (`event`) => [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[] = `participantGroupRoleParticipants`

##### Parameters

###### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

##### Returns

[`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[]

#### groups.participantPubkeys

> **participantPubkeys**: (`event`) => `string`[] = `participantGroupParticipantPubkeys`

##### Parameters

###### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

##### Returns

`string`[]

#### groups.participants

> **participants**: (`order`) => `string`[] = `orderGroupParticipantPubkeys`

##### Parameters

###### order

`NostrEvent` \| [`ParsedOrder`](../type-aliases/ParsedOrder.md) \| [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

##### Returns

`string`[]

#### groups.pubkeyFromListingAnchor

> **pubkeyFromListingAnchor**: (`listingAnchor`) => `string`

##### Parameters

###### listingAnchor

`string`

##### Returns

`string`

#### groups.reduce

> **reduce**: (`events`, `options`) => [`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md) = `reduceOrderGroup`

##### Parameters

###### events

`Iterable`\<`NostrEvent` \| [`OrderGroupEvent`](../type-aliases/OrderGroupEvent.md)\>

###### options?

[`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md) = `{}`

##### Returns

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

#### groups.resolveAndValidate

> **resolveAndValidate**: (`group`, `options`) => `Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\> = `resolveAndValidateOrderGroup`

##### Parameters

###### group

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

###### options?

[`ResolveAndValidateOrderGroupOptions`](../type-aliases/ResolveAndValidateOrderGroupOptions.md) = `{}`

##### Returns

`Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\>

#### groups.resolveParticipants

> **resolveParticipants**: (`group`, `options`) => `Promise`\<[`ResolvedOrderGroup`](../type-aliases/ResolvedOrderGroup.md)\> = `resolveOrderGroupParticipants`

##### Parameters

###### group

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

###### options?

[`ResolveOrderGroupParticipantsOptions`](../type-aliases/ResolveOrderGroupParticipantsOptions.md) = `{}`

##### Returns

`Promise`\<[`ResolvedOrderGroup`](../type-aliases/ResolvedOrderGroup.md)\>

#### groups.roles

> **roles**: (`groups`, `identity`) => [`OrderGroupRoles`](../type-aliases/OrderGroupRoles.md) = `roleOrderGroups`

##### Parameters

###### groups

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]

###### identity

[`MarketplaceOrderIdentity`](../type-aliases/MarketplaceOrderIdentity.md)

##### Returns

[`OrderGroupRoles`](../type-aliases/OrderGroupRoles.md)

#### groups.search

> **search**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\> = `searchOrderGroups`

##### Parameters

###### pool

`OrderGroupQueryPool`

###### relays

`string`[]

###### query?

[`OrderQuery`](../type-aliases/OrderQuery.md) = `{}`

###### options?

[`OrderGroupSearchOptions`](../type-aliases/OrderGroupSearchOptions.md) = `{}`

##### Returns

`Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

#### groups.subscribe

> **subscribe**: (`pool`, `relays`, `query`, `handlers`, `options`) => `SubCloser` = `subscribeOrderGroups`

##### Parameters

###### pool

`OrderGroupSubscribePool`

###### relays

`string`[]

###### query

[`OrderQuery`](../type-aliases/OrderQuery.md)

###### handlers

[`OrderGroupSubscribeHandlers`](../type-aliases/OrderGroupSubscribeHandlers.md)

###### options?

`OrderGroupSubscribeOptions` = `{}`

##### Returns

`SubCloser`

#### groups.validateOrder

> **validateOrder**: (`request`) => [`MarketplaceOrderValidationResult`](../type-aliases/MarketplaceOrderValidationResult.md) = `validateMarketplaceOrder`

##### Parameters

###### request

[`MarketplaceOrderValidationRequest`](../type-aliases/MarketplaceOrderValidationRequest.md)

##### Returns

[`MarketplaceOrderValidationResult`](../type-aliases/MarketplaceOrderValidationResult.md)

#### groups.validatePayments

> **validatePayments**: (`group`, `options`) => `Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\> = `validateOrderGroupPayments`

##### Parameters

###### group

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

###### options?

[`ValidateOrderGroupPaymentsOptions`](../type-aliases/ValidateOrderGroupPaymentsOptions.md) = `{}`

##### Returns

`Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\>

### hashParticipantProofPayload

> **hashParticipantProofPayload**: (`payload`) => `string`

#### Parameters

##### payload

`string`

#### Returns

`string`

### identityPubkeys

> **identityPubkeys**: (`identity`, `fallbackRoles`) => `string`[] = `orderQueries.identityPubkeys`

#### Parameters

##### identity?

[`MarketplaceOrderIdentity`](../type-aliases/MarketplaceOrderIdentity.md) = `{}`

##### fallbackRoles?

[`MarketplaceParticipantGroupRole`](../type-aliases/MarketplaceParticipantGroupRole.md)[] = `...`

#### Returns

`string`[]

### parse

> **parse**: (`event`) => [`ParsedOrder`](../type-aliases/ParsedOrder.md) = `parseOrderEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedOrder`](../type-aliases/ParsedOrder.md)

### parseCancel

> **parseCancel**: (`event`) => [`ParsedOrderCancel`](../type-aliases/ParsedOrderCancel.md) = `parseOrderCancelEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedOrderCancel`](../type-aliases/ParsedOrderCancel.md)

### parseParticipantProofKeyTag

> **parseParticipantProofKeyTag**: (`tag`) => `ProofDisclosureKeyTag` \| `null`

#### Parameters

##### tag

`string`[]

#### Returns

`ProofDisclosureKeyTag` \| `null`

### parseParticipantProofTag

> **parseParticipantProofTag**: (`tag`) => [`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md) \| `null`

#### Parameters

##### tag

`string`[]

#### Returns

[`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md) \| `null`

### parsePayment

> **parsePayment**: (`event`) => [`ParsedPayment`](../type-aliases/ParsedPayment.md) = `parsePaymentEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedPayment`](../type-aliases/ParsedPayment.md)

### parsePaymentAck

> **parsePaymentAck**: (`event`) => [`ParsedPaymentAck`](../type-aliases/ParsedPaymentAck.md) = `parsePaymentAckEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedPaymentAck`](../type-aliases/ParsedPaymentAck.md)

### parsePaymentNack

> **parsePaymentNack**: (`event`) => [`ParsedPaymentNack`](../type-aliases/ParsedPaymentNack.md) = `parsePaymentNackEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedPaymentNack`](../type-aliases/ParsedPaymentNack.md)

### parsePaymentSettlement

> **parsePaymentSettlement**: (`event`) => [`ParsedPaymentSettlement`](../type-aliases/ParsedPaymentSettlement.md) = `parsePaymentSettlementEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedPaymentSettlement`](../type-aliases/ParsedPaymentSettlement.md)

### participantProofKeyTag

> **participantProofKeyTag**: (`key`) => `string`[]

#### Parameters

##### key

`ProofDisclosureKeyTag`

#### Returns

`string`[]

### participantProofTag

> **participantProofTag**: (`proof`) => `string`[]

#### Parameters

##### proof

[`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md)

#### Returns

`string`[]

### paymentAckTemplate

> **paymentAckTemplate**: (`ack`) => `EventTemplate` = `generatePaymentAckEventTemplate`

#### Parameters

##### ack

[`PaymentAckTemplate`](../type-aliases/PaymentAckTemplate.md)

#### Returns

`EventTemplate`

### paymentNackTemplate

> **paymentNackTemplate**: (`nack`) => `EventTemplate` = `generatePaymentNackEventTemplate`

#### Parameters

##### nack

[`PaymentNackTemplate`](../type-aliases/PaymentNackTemplate.md)

#### Returns

`EventTemplate`

### paymentSettlementTemplate

> **paymentSettlementTemplate**: (`settlement`) => `EventTemplate` = `generatePaymentSettlementEventTemplate`

#### Parameters

##### settlement

[`PaymentSettlementTemplate`](../type-aliases/PaymentSettlementTemplate.md)

#### Returns

`EventTemplate`

### paymentTemplate

> **paymentTemplate**: (`payment`) => `EventTemplate` = `generatePaymentEventTemplate`

#### Parameters

##### payment

[`PaymentTemplate`](../type-aliases/PaymentTemplate.md)

#### Returns

`EventTemplate`

### search

> **search**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`ParsedOrder`](../type-aliases/ParsedOrder.md)[]\> = `orderQueries.search`

#### Parameters

##### pool

`OrderQueryPool`

##### relays

`string`[]

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md) = `{}`

##### options?

[`OrderSearchOptions`](../type-aliases/OrderSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`ParsedOrder`](../type-aliases/ParsedOrder.md)[]\>

### subscribe

> **subscribe**: (`pool`, `relays`, `query`, `handlers`, `options`) => `SubCloser` = `orderQueries.subscribe`

#### Parameters

##### pool

`OrderSubscribePool`

##### relays

`string`[]

##### query

[`OrderQuery`](../type-aliases/OrderQuery.md)

##### handlers

[`OrderSubscribeHandlers`](../type-aliases/OrderSubscribeHandlers.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) = `{}`

#### Returns

`SubCloser`

### template

> **template**: (`order`) => `EventTemplate` = `generateOrderEventTemplate`

#### Parameters

##### order

[`OrderTemplate`](../type-aliases/OrderTemplate.md)

#### Returns

`EventTemplate`

### tradeKeyAuthorizationTemplate

> **tradeKeyAuthorizationTemplate**: (`auth`) => `EventTemplate` = `generateTradeKeyAuthorizationEventTemplate`

#### Parameters

##### auth

[`TradeKeyAuthorizationTemplate`](../type-aliases/TradeKeyAuthorizationTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validateOrderEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
