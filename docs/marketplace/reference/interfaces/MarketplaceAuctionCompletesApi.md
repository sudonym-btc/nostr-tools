# Interface: MarketplaceAuctionCompletesApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1249](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1249)

## Properties

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1250](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1250)

#### Parameters

##### query?

[`MarketplaceAuctionCompleteSearchQuery`](../type-aliases/MarketplaceAuctionCompleteSearchQuery.md) = `{}`

#### Returns

`Filter`

## Methods

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1251](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1251)

#### Parameters

##### query?

[`MarketplaceAuctionCompleteSearchQuery`](../type-aliases/MarketplaceAuctionCompleteSearchQuery.md)

##### options?

[`MarketplaceAuctionCompleteSearchOptions`](../type-aliases/MarketplaceAuctionCompleteSearchOptions.md)

#### Returns

`Promise`\<[`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)[]\>

***

### subscribe()

> **subscribe**(`query`, `handlers`, `options?`): `SubCloser`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1255](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1255)

#### Parameters

##### query

[`MarketplaceAuctionCompleteSearchQuery`](../type-aliases/MarketplaceAuctionCompleteSearchQuery.md)

##### handlers

[`MarketplaceAuctionCompleteSubscribeHandlers`](../type-aliases/MarketplaceAuctionCompleteSubscribeHandlers.md)

##### options?

[`MarketplaceAuctionCompleteSubscribeOptions`](../type-aliases/MarketplaceAuctionCompleteSubscribeOptions.md)

#### Returns

`SubCloser`
