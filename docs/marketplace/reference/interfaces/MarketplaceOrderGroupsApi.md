# Interface: MarketplaceOrderGroupsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:955](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L955)

## Properties

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:962](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L962)

#### Parameters

##### query?

[`OrderGroupFilterQuery`](../type-aliases/OrderGroupFilterQuery.md) = `{}`

#### Returns

`Filter`

***

### group

> **group**: (`events`, `options`) => [`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:965](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L965)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:956](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L956)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:958](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L958)

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

`string`

***

### idForOrder

> **idForOrder**: (`order`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:957](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L957)

#### Parameters

##### order

`NostrEvent` \| [`ParsedOrder`](../type-aliases/ParsedOrder.md) \| [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

#### Returns

`string`

***

### parseParticipantEvent

> **parseParticipantEvent**: (`event`) => [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:963](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L963)

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

[`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

***

### participantEntries

> **participantEntries**: (`event`) => [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:961](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L961)

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

[`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[]

***

### participantPubkeys

> **participantPubkeys**: (`event`) => `string`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:960](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L960)

#### Parameters

##### event

`NostrEvent` \| [`ParticipantGroupEvent`](../type-aliases/ParticipantGroupEvent.md)

#### Returns

`string`[]

***

### participants

> **participants**: (`order`) => `string`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:959](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L959)

#### Parameters

##### order

`NostrEvent` \| [`ParsedOrder`](../type-aliases/ParsedOrder.md) \| [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

#### Returns

`string`[]

***

### reduce

> **reduce**: (`events`, `options`) => [`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:964](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L964)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:966](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L966)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:972](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L972)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:968](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L968)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:973](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L973)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:979](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L979)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:974](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L974)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:967](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L967)

#### Parameters

##### group

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

##### options?

[`ResolveAndValidateOrderGroupOptions`](../type-aliases/ResolveAndValidateOrderGroupOptions.md)

#### Returns

`Promise`\<[`ValidatedOrderGroup`](../type-aliases/ValidatedOrderGroup.md)\>
