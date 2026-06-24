# Interface: MarketplaceAuctionBidGroupsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1259](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1259)

## Properties

### chains

> **chains**: (`groups`) => [`ParsedAuctionBidChain`](../type-aliases/ParsedAuctionBidChain.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:1264](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1264)

#### Parameters

##### groups

`Iterable`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)\>

#### Returns

[`ParsedAuctionBidChain`](../type-aliases/ParsedAuctionBidChain.md)[]

***

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1260](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1260)

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

#### Returns

`Filter`

***

### filters

> **filters**: (`query`) => `Filter`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:1261](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1261)

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

#### Returns

`Filter`[]

***

### group

> **group**: (`events`) => [`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:1263](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1263)

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)\>

#### Returns

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]

***

### reduce

> **reduce**: (`events`) => [`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1262](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1262)

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)\>

#### Returns

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)

## Methods

### fetch()

> **fetch**(`query`, `options?`): `Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1265](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1265)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1266](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1266)

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

##### handlers

[`AuctionBidGroupSubscribeHandlers`](../type-aliases/AuctionBidGroupSubscribeHandlers.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md)

#### Returns

`SubCloser`
