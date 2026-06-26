# Interface: MarketplaceAuctionBidGroupsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1262](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1262)

## Properties

### chains

> **chains**: (`groups`) => [`ParsedAuctionBidChain`](../type-aliases/ParsedAuctionBidChain.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:1267](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1267)

#### Parameters

##### groups

`Iterable`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)\>

#### Returns

[`ParsedAuctionBidChain`](../type-aliases/ParsedAuctionBidChain.md)[]

***

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1263](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1263)

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

#### Returns

`Filter`

***

### filters

> **filters**: (`query`) => `Filter`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:1264](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1264)

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

#### Returns

`Filter`[]

***

### group

> **group**: (`events`) => [`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:1266](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1266)

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)\>

#### Returns

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]

***

### reduce

> **reduce**: (`events`) => [`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1265](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1265)

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)\>

#### Returns

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)

## Methods

### fetch()

> **fetch**(`query`, `options?`): `Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1268](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1268)

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

##### options?

[`AuctionBidGroupSearchOptions`](../type-aliases/AuctionBidGroupSearchOptions.md)

#### Returns

`Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\>

***

### subscribe()

> **subscribe**(`query`, `handlers`, `options?`): `SubCloser`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1269](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1269)

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

##### handlers

[`AuctionBidGroupSubscribeHandlers`](../type-aliases/AuctionBidGroupSubscribeHandlers.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md)

#### Returns

`SubCloser`
