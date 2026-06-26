# Interface: MarketplaceAuctionCompletesApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1246](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1246)

## Properties

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1247](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1247)

#### Parameters

##### query?

[`MarketplaceAuctionCompleteSearchQuery`](../type-aliases/MarketplaceAuctionCompleteSearchQuery.md) = `{}`

#### Returns

`Filter`

## Methods

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1248](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1248)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1252](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1252)

#### Parameters

##### query

[`MarketplaceAuctionCompleteSearchQuery`](../type-aliases/MarketplaceAuctionCompleteSearchQuery.md)

##### handlers

[`MarketplaceAuctionCompleteSubscribeHandlers`](../type-aliases/MarketplaceAuctionCompleteSubscribeHandlers.md)

##### options?

[`MarketplaceAuctionCompleteSubscribeOptions`](../type-aliases/MarketplaceAuctionCompleteSubscribeOptions.md)

#### Returns

`SubCloser`
