# Interface: MarketplaceOrderGroupsApi

## Properties

### filter

> **filter**: (`query`) => `Filter`

#### Parameters

##### query?

[`OrderGroupFilterQuery`](../type-aliases/OrderGroupFilterQuery.md) = `{}`

#### Returns

`Filter`

***

### group

> **group**: (`events`, `options`) => [`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`OrderGroupEvent`](../type-aliases/OrderGroupEvent.md)\>

##### options?

[`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md) = `{}`

#### Returns

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]

***

### id

> **id**: (`tradeId`, `participants`) => `string`

#### Parameters

##### tradeId

`string`

##### participants

`Iterable`\<[`MarketplaceParticipantTag`](../type-aliases/MarketplaceParticipantTag.md) \| [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)\>

#### Returns

`string`

***

### idForEvent

> **idForEvent**: (`event`) => `string`

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

`string`

***

### idForOrder

> **idForOrder**: (`order`) => `string`

#### Parameters

##### order

`NostrEvent` \| [`ParsedOrder`](../type-aliases/ParsedOrder.md) \| [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

#### Returns

`string`

***

### parseParticipantEvent

> **parseParticipantEvent**: (`event`) => [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

[`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

***

### participantEntries

> **participantEntries**: (`event`) => [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[]

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

[`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[]

***

### participantPubkeys

> **participantPubkeys**: (`event`) => `string`[]

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

`string`[]

***

### participants

> **participants**: (`order`) => `string`[]

#### Parameters

##### order

`NostrEvent` \| [`ParsedOrder`](../type-aliases/ParsedOrder.md) \| [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

#### Returns

`string`[]

***

### reduce

> **reduce**: (`events`, `options`) => [`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`OrderGroupEvent`](../type-aliases/OrderGroupEvent.md)\>

##### options?

[`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md) = `{}`

#### Returns

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

***

### resolveParticipants

> **resolveParticipants**: (`group`, `options`) => `Promise`\<[`ResolvedOrderGroup`](../type-aliases/ResolvedOrderGroup.md)\>

#### Parameters

##### group

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

##### options?

[`ResolveOrderGroupParticipantsOptions`](../type-aliases/ResolveOrderGroupParticipantsOptions.md) = `{}`

#### Returns

`Promise`\<[`ResolvedOrderGroup`](../type-aliases/ResolvedOrderGroup.md)\>

## Methods

### fetch()

> **fetch**(`query?`, `options?`): `Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

#### Parameters

##### query?

[`OrderGroupFilterQuery`](../type-aliases/OrderGroupFilterQuery.md)

##### options?

[`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md)

#### Returns

`Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

***

### resolveAndValidate()

> **resolveAndValidate**(`group`, `options?`): `Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\>

#### Parameters

##### group

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

##### options?

[`ResolveAndValidateOrderGroupOptions`](../type-aliases/ResolveAndValidateOrderGroupOptions.md)

#### Returns

`Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\>

***

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

#### Parameters

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md)

##### options?

[`OrderGroupSearchOptions`](../type-aliases/OrderGroupSearchOptions.md)

#### Returns

`Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

***

### stream()

> **stream**(`query?`, `options?`): [`MarketplaceOrderGroupStream`](../type-aliases/MarketplaceOrderGroupStream.md)

#### Parameters

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) & [`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md)

#### Returns

[`MarketplaceOrderGroupStream`](../type-aliases/MarketplaceOrderGroupStream.md)

***

### subscribe()

> **subscribe**(`query`, `handlers`, `options?`): `SubCloser`

#### Parameters

##### query

[`OrderQuery`](../type-aliases/OrderQuery.md)

##### handlers

[`OrderGroupSubscribeHandlers`](../type-aliases/OrderGroupSubscribeHandlers.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) & [`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md)

#### Returns

`SubCloser`

***

### validatePayments()

> **validatePayments**(`group`, `options?`): `Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\>

#### Parameters

##### group

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

##### options?

[`ResolveAndValidateOrderGroupOptions`](../type-aliases/ResolveAndValidateOrderGroupOptions.md)

#### Returns

`Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\>
