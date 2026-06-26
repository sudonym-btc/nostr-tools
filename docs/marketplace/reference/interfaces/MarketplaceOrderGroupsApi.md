# Interface: MarketplaceOrderGroupsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:958](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L958)

## Properties

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:965](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L965)

#### Parameters

##### query?

[`OrderGroupFilterQuery`](../type-aliases/OrderGroupFilterQuery.md) = `{}`

#### Returns

`Filter`

***

### group

> **group**: (`events`, `options`) => [`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:968](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L968)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:959](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L959)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:961](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L961)

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

`string`

***

### idForOrder

> **idForOrder**: (`order`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:960](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L960)

#### Parameters

##### order

`NostrEvent` \| [`ParsedOrder`](../type-aliases/ParsedOrder.md) \| [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

#### Returns

`string`

***

### parseParticipantEvent

> **parseParticipantEvent**: (`event`) => [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:966](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L966)

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

[`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

***

### participantEntries

> **participantEntries**: (`event`) => [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:964](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L964)

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

[`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[]

***

### participantPubkeys

> **participantPubkeys**: (`event`) => `string`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:963](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L963)

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

`string`[]

***

### participants

> **participants**: (`order`) => `string`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:962](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L962)

#### Parameters

##### order

`NostrEvent` \| [`ParsedOrder`](../type-aliases/ParsedOrder.md) \| [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

#### Returns

`string`[]

***

### reduce

> **reduce**: (`events`, `options`) => [`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:967](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L967)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:969](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L969)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:975](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L975)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:971](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L971)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:976](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L976)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:982](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L982)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:977](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L977)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:970](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L970)

#### Parameters

##### group

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

##### options?

[`ResolveAndValidateOrderGroupOptions`](../type-aliases/ResolveAndValidateOrderGroupOptions.md)

#### Returns

`Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\>
