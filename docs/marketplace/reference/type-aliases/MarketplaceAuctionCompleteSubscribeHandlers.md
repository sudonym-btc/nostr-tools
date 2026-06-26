# Type Alias: MarketplaceAuctionCompleteSubscribeHandlers

> **MarketplaceAuctionCompleteSubscribeHandlers** = `object`

Defined in: [nostr-tools/marketplace/auction-query.ts:59](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L59)

## Properties

### onclose?

> `optional` **onclose?**: (`reasons`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:65](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L65)

#### Parameters

##### reasons

`string`[]

#### Returns

`void`

***

### oncomplete?

> `optional` **oncomplete?**: (`complete`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:61](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L61)

#### Parameters

##### complete

[`ParsedMarketplaceAuctionComplete`](ParsedMarketplaceAuctionComplete.md)

#### Returns

`void`

***

### oncompletes?

> `optional` **oncompletes?**: (`completes`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:62](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L62)

#### Parameters

##### completes

[`ParsedMarketplaceAuctionComplete`](ParsedMarketplaceAuctionComplete.md)[]

#### Returns

`void`

***

### oneose?

> `optional` **oneose?**: () => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:64](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L64)

#### Returns

`void`

***

### onevent?

> `optional` **onevent?**: (`complete`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:60](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L60)

#### Parameters

##### complete

[`ParsedMarketplaceAuctionComplete`](ParsedMarketplaceAuctionComplete.md)

#### Returns

`void`

***

### oninvalid?

> `optional` **oninvalid?**: (`event`, `error`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:63](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L63)

#### Parameters

##### event

`Event`

##### error

`Error`

#### Returns

`void`
