# Interface: MarketplaceAuctionCompletesApi

## Properties

### filter

> **filter**: (`query`) => `Filter`

#### Parameters

##### query?

[`MarketplaceAuctionCompleteSearchQuery`](../type-aliases/MarketplaceAuctionCompleteSearchQuery.md) = `{}`

#### Returns

`Filter`

## Methods

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)[]\>

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

#### Parameters

##### query

[`MarketplaceAuctionCompleteSearchQuery`](../type-aliases/MarketplaceAuctionCompleteSearchQuery.md)

##### handlers

[`MarketplaceAuctionCompleteSubscribeHandlers`](../type-aliases/MarketplaceAuctionCompleteSubscribeHandlers.md)

##### options?

[`MarketplaceAuctionCompleteSubscribeOptions`](../type-aliases/MarketplaceAuctionCompleteSubscribeOptions.md)

#### Returns

`SubCloser`
