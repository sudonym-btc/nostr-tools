# Variable: auctionBidGroups

> `const` **auctionBidGroups**: `object`

Defined in: [nostr-tools/marketplace/auction-bid-group.ts:628](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/auction-bid-group.ts#L628)

## Type Declaration

### chains

> **chains**: (`groups`) => [`ParsedAuctionBidChain`](../type-aliases/ParsedAuctionBidChain.md)[] = `buildAuctionBidChains`

#### Parameters

##### groups

`Iterable`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)\>

#### Returns

[`ParsedAuctionBidChain`](../type-aliases/ParsedAuctionBidChain.md)[]

### eventKinds

> **eventKinds**: `number`[] = `auctionBidGroupEventKinds`

### fetch

> **fetch**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\> = `fetchAuctionBidGroups`

#### Parameters

##### pool

`AuctionBidGroupQueryPool`

##### relays

`string`[]

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

##### options?

[`AuctionBidGroupSearchOptions`](../type-aliases/AuctionBidGroupSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\>

### filter

> **filter**: (`query`) => `Filter` = `auctionBidGroupFilter`

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

#### Returns

`Filter`

### filterByBuyerIdentity

> **filterByBuyerIdentity**: (`groups`, `identity`) => [`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[] = `filterAuctionBidGroupsByBuyerIdentity`

#### Parameters

##### groups

`Iterable`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)\>

##### identity

[`MarketplaceOrderIdentity`](../type-aliases/MarketplaceOrderIdentity.md)

#### Returns

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]

### filters

> **filters**: (`query`) => `Filter`[] = `auctionBidGroupFilters`

#### Parameters

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

#### Returns

`Filter`[]

### group

> **group**: (`events`) => [`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[] = `groupAuctionBidEvents`

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)\>

#### Returns

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]

### parseEvent

> **parseEvent**: (`event`) => [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md) = `parseAuctionBidGroupEvent`

#### Parameters

##### event

`NostrEvent` \| [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)

#### Returns

[`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)

### reduce

> **reduce**: (`events`) => [`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md) = `reduceAuctionBidGroup`

#### Parameters

##### events

`Iterable`\<`NostrEvent` \| [`AuctionBidGroupEvent`](../type-aliases/AuctionBidGroupEvent.md)\>

#### Returns

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)

### roles

> **roles**: (`groups`, `identity`) => [`AuctionBidGroupRoles`](../type-aliases/AuctionBidGroupRoles.md) = `roleAuctionBidGroups`

#### Parameters

##### groups

[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]

##### identity

[`MarketplaceOrderIdentity`](../type-aliases/MarketplaceOrderIdentity.md)

#### Returns

[`AuctionBidGroupRoles`](../type-aliases/AuctionBidGroupRoles.md)

### subscribe

> **subscribe**: (`pool`, `relays`, `query`, `handlers`, `options`) => `SubCloser` = `subscribeAuctionBidGroups`

#### Parameters

##### pool

`AuctionBidGroupSubscribePool`

##### relays

`string`[]

##### query

[`AuctionBidGroupQuery`](../type-aliases/AuctionBidGroupQuery.md)

##### handlers

[`AuctionBidGroupSubscribeHandlers`](../type-aliases/AuctionBidGroupSubscribeHandlers.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md) = `{}`

#### Returns

`SubCloser`
