# Interface: MarketplaceAuctionsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1178](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1178)

## Properties

### address

> **address**: (`auction`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1181](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1181)

#### Parameters

##### auction

`NostrEvent` \| [`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

#### Returns

`string`

***

### bidChainId

> **bidChainId**: (`seed`, `auctionAnchor`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1182](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1182)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1200](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1200)

***

### bidTemplate

> **bidTemplate**: (`bid`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1193](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1193)

#### Parameters

##### bid

[`MarketplaceAuctionBidTemplate`](../type-aliases/MarketplaceAuctionBidTemplate.md)

#### Returns

`EventTemplate`

***

### completes

> **completes**: [`MarketplaceAuctionCompletesApi`](MarketplaceAuctionCompletesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1199](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1199)

***

### completeTemplate

> **completeTemplate**: (`complete`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1196](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1196)

#### Parameters

##### complete

[`MarketplaceAuctionCompleteTemplate`](../type-aliases/MarketplaceAuctionCompleteTemplate.md)

#### Returns

`EventTemplate`

***

### filters

> **filters**: (`query`) => `Filter`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:1184](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1184)

#### Parameters

##### query?

[`MarketplaceAuctionSearchQuery`](../type-aliases/MarketplaceAuctionSearchQuery.md) = `{}`

#### Returns

`Filter`[]

***

### parse

> **parse**: (`event`) => [`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1179](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1179)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

***

### parseBid

> **parseBid**: (`event`) => [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1194](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1194)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

***

### parseComplete

> **parseComplete**: (`event`) => [`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1197](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1197)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)

***

### template

> **template**: (`auction`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1183](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1183)

#### Parameters

##### auction

[`MarketplaceAuctionTemplate`](../type-aliases/MarketplaceAuctionTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1180](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1180)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

***

### validateBid

> **validateBid**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1195](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1195)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

***

### validateComplete

> **validateComplete**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1198](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1198)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### bid()

> **bid**(`listing`, `bid`, `options?`): `AsyncIterable`\<[`MarketplaceAuctionBidState`](../type-aliases/MarketplaceAuctionBidState.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1201](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1201)

#### Parameters

##### listing

`NostrEvent` \| [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

##### bid

`Partial`\<[`MarketplaceAuctionBidTemplate`](../type-aliases/MarketplaceAuctionBidTemplate.md)\> & `object`

##### options?

[`MarketplacePayOptions`](../type-aliases/MarketplacePayOptions.md) & `object`

#### Returns

`AsyncIterable`\<[`MarketplaceAuctionBidState`](../type-aliases/MarketplaceAuctionBidState.md)\>

***

### get()

> **get**(`query`, `options?`): `Promise`\<[`MarketplaceAuctionScopesSnapshot`](../type-aliases/MarketplaceAuctionScopesSnapshot.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1185](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1185)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1187](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1187)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1211](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1211)

#### Parameters

##### request

[`MarketplaceAuctionSettlementRequest`](../type-aliases/MarketplaceAuctionSettlementRequest.md)

#### Returns

`AsyncIterable`\<[`MarketplaceAuctionSettlementState`](../type-aliases/MarketplaceAuctionSettlementState.md)\>

***

### subscribe()

> **subscribe**(`query`, `handlers`, `options?`): `SubCloser`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1188](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1188)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1186](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1186)

#### Parameters

##### query

[`MarketplaceAuctionScopeQuery`](../type-aliases/MarketplaceAuctionScopeQuery.md)

##### options?

[`MarketplaceAuctionScopeOptions`](../type-aliases/MarketplaceAuctionScopeOptions.md)

#### Returns

[`MarketplaceAuctionScopeStream`](../type-aliases/MarketplaceAuctionScopeStream.md)
