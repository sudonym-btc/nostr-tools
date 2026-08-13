# Interface: MarketplaceAuctionBidGroupsApi

## Properties

### chains

> **chains**: (`groups`) => [`ParsedAuctionBidChain`](../type-aliases/ParsedAuctionBidChain.md)[]

#### Parameters

##### groups

`Iterable`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)\>

#### Returns

[`ParsedAuctionBidChain`](../type-aliases/ParsedAuctionBidChain.md)[]

***

### filter

> **filter**: (`query`) => `Filter`

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

#### Returns

`Filter`

***

### filters

> **filters**: (`query`) => `Filter`[]

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

#### Returns

`Filter`[]

***

### group

> **group**: (`events`) => [`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)\>

#### Returns

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]

***

### reduce

> **reduce**: (`events`) => [`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)\>

#### Returns

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)

## Methods

### fetch()

> **fetch**(`query`, `options?`): `Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\>

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

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

##### handlers

[`AuctionBidGroupSubscribeHandlers`](../type-aliases/AuctionBidGroupSubscribeHandlers.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md)

#### Returns

`SubCloser`
