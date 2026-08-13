# Interface: MarketplaceAuctionsApi

## Properties

### address

> **address**: (`auction`) => `string`

#### Parameters

##### auction

`NostrEvent` \| [`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

#### Returns

`string`

***

### bidChainId

> **bidChainId**: (`seed`, `auctionAnchor`) => `string`

#### Parameters

##### seed

`string`

##### auctionAnchor

`string`

#### Returns

`string`

***

### bidGroups

> **bidGroups**: [`MarketplaceAuctionBidGroupsApi`](MarketplaceAuctionBidGroupsApi.md)

***

### bidTemplate

> **bidTemplate**: (`bid`) => `EventTemplate`

#### Parameters

##### bid

[`MarketplaceAuctionBidTemplate`](../type-aliases/MarketplaceAuctionBidTemplate.md)

#### Returns

`EventTemplate`

***

### completes

> **completes**: [`MarketplaceAuctionCompletesApi`](MarketplaceAuctionCompletesApi.md)

***

### completeTemplate

> **completeTemplate**: (`complete`) => `EventTemplate`

#### Parameters

##### complete

[`MarketplaceAuctionCompleteTemplate`](../type-aliases/MarketplaceAuctionCompleteTemplate.md)

#### Returns

`EventTemplate`

***

### filters

> **filters**: (`query`) => `Filter`[]

#### Parameters

##### query?

[`MarketplaceAuctionSearchQuery`](../type-aliases/MarketplaceAuctionSearchQuery.md) = `{}`

#### Returns

`Filter`[]

***

### parse

> **parse**: (`event`) => [`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

***

### parseBid

> **parseBid**: (`event`) => [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

***

### parseComplete

> **parseComplete**: (`event`) => [`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)

***

### template

> **template**: (`auction`) => `EventTemplate`

#### Parameters

##### auction

[`MarketplaceAuctionTemplate`](../type-aliases/MarketplaceAuctionTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

***

### validateBid

> **validateBid**: (`event`) => `boolean`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

***

### validateComplete

> **validateComplete**: (`event`) => `boolean`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### bid()

> **bid**(`listing`, `bid`, `options?`): `AsyncIterable`\<[`MarketplaceAuctionBidState`](../type-aliases/MarketplaceAuctionBidState.md)\>

#### Parameters

##### listing

`NostrEvent` \| [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

##### bid

`Omit`\<`Partial`\<[`MarketplaceAuctionBidTemplate`](../type-aliases/MarketplaceAuctionBidTemplate.md)\>, `"amount"`\> & `object`

##### options?

[`MarketplacePayOptions`](../type-aliases/MarketplacePayOptions.md) & `object`

#### Returns

`AsyncIterable`\<[`MarketplaceAuctionBidState`](../type-aliases/MarketplaceAuctionBidState.md)\>

***

### get()

> **get**(`query`, `options?`): `Promise`\<[`MarketplaceAuctionScopesSnapshot`](../type-aliases/MarketplaceAuctionScopesSnapshot.md)\>

#### Parameters

##### query

[`MarketplaceAuctionScopeQuery`](../type-aliases/MarketplaceAuctionScopeQuery.md)

##### options?

[`MarketplaceAuctionScopeOptions`](../type-aliases/MarketplaceAuctionScopeOptions.md)

#### Returns

`Promise`\<[`MarketplaceAuctionScopesSnapshot`](../type-aliases/MarketplaceAuctionScopesSnapshot.md)\>

***

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)[]\>

#### Parameters

##### query?

[`MarketplaceAuctionSearchQuery`](../type-aliases/MarketplaceAuctionSearchQuery.md)

##### options?

[`MarketplaceAuctionSearchOptions`](../type-aliases/MarketplaceAuctionSearchOptions.md)

#### Returns

`Promise`\<[`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)[]\>

***

### settle()

> **settle**(`request`): `AsyncIterable`\<[`MarketplaceAuctionSettlementState`](../type-aliases/MarketplaceAuctionSettlementState.md)\>

#### Parameters

##### request

[`MarketplaceAuctionSettlementRequest`](../type-aliases/MarketplaceAuctionSettlementRequest.md)

#### Returns

`AsyncIterable`\<[`MarketplaceAuctionSettlementState`](../type-aliases/MarketplaceAuctionSettlementState.md)\>

***

### subscribe()

> **subscribe**(`query`, `handlers`, `options?`): `SubCloser`

#### Parameters

##### query

[`MarketplaceAuctionSearchQuery`](../type-aliases/MarketplaceAuctionSearchQuery.md)

##### handlers

[`MarketplaceAuctionSubscribeHandlers`](../type-aliases/MarketplaceAuctionSubscribeHandlers.md)

##### options?

[`MarketplaceAuctionSubscribeOptions`](../type-aliases/MarketplaceAuctionSubscribeOptions.md)

#### Returns

`SubCloser`

***

### watch()

> **watch**(`query`, `options?`): [`MarketplaceAuctionScopeStream`](../type-aliases/MarketplaceAuctionScopeStream.md)

#### Parameters

##### query

[`MarketplaceAuctionScopeQuery`](../type-aliases/MarketplaceAuctionScopeQuery.md)

##### options?

[`MarketplaceAuctionScopeOptions`](../type-aliases/MarketplaceAuctionScopeOptions.md)

#### Returns

[`MarketplaceAuctionScopeStream`](../type-aliases/MarketplaceAuctionScopeStream.md)
