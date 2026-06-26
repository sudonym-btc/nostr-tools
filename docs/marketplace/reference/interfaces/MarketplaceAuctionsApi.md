# Interface: MarketplaceAuctionsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1181](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1181)

## Properties

### address

> **address**: (`auction`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1184](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1184)

#### Parameters

##### auction

`NostrEvent` \| [`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

#### Returns

`string`

***

### bidChainId

> **bidChainId**: (`seed`, `auctionAnchor`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1185](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1185)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1203](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1203)

***

### bidTemplate

> **bidTemplate**: (`bid`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1196](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1196)

#### Parameters

##### bid

[`MarketplaceAuctionBidTemplate`](../type-aliases/MarketplaceAuctionBidTemplate.md)

#### Returns

`EventTemplate`

***

### completes

> **completes**: [`MarketplaceAuctionCompletesApi`](MarketplaceAuctionCompletesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1202](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1202)

***

### completeTemplate

> **completeTemplate**: (`complete`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1199](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1199)

#### Parameters

##### complete

[`MarketplaceAuctionCompleteTemplate`](../type-aliases/MarketplaceAuctionCompleteTemplate.md)

#### Returns

`EventTemplate`

***

### filters

> **filters**: (`query`) => `Filter`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:1187](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1187)

#### Parameters

##### query?

[`MarketplaceAuctionSearchQuery`](../type-aliases/MarketplaceAuctionSearchQuery.md) = `{}`

#### Returns

`Filter`[]

***

### parse

> **parse**: (`event`) => [`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1182](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1182)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

***

### parseBid

> **parseBid**: (`event`) => [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1197](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1197)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

***

### parseComplete

> **parseComplete**: (`event`) => [`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1200](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1200)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)

***

### template

> **template**: (`auction`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1186](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1186)

#### Parameters

##### auction

[`MarketplaceAuctionTemplate`](../type-aliases/MarketplaceAuctionTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1183](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1183)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

***

### validateBid

> **validateBid**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1198](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1198)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

***

### validateComplete

> **validateComplete**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1201](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1201)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### bid()

> **bid**(`listing`, `bid`, `options?`): `AsyncIterable`\<[`MarketplaceAuctionBidState`](../type-aliases/MarketplaceAuctionBidState.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1204](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1204)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1188](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1188)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1190](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1190)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1214](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1214)

#### Parameters

##### request

[`MarketplaceAuctionSettlementRequest`](../type-aliases/MarketplaceAuctionSettlementRequest.md)

#### Returns

`AsyncIterable`\<[`MarketplaceAuctionSettlementState`](../type-aliases/MarketplaceAuctionSettlementState.md)\>

***

### subscribe()

> **subscribe**(`query`, `handlers`, `options?`): `SubCloser`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1191](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1191)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1189](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1189)

#### Parameters

##### query

[`MarketplaceAuctionScopeQuery`](../type-aliases/MarketplaceAuctionScopeQuery.md)

##### options?

[`MarketplaceAuctionScopeOptions`](../type-aliases/MarketplaceAuctionScopeOptions.md)

#### Returns

[`MarketplaceAuctionScopeStream`](../type-aliases/MarketplaceAuctionScopeStream.md)
