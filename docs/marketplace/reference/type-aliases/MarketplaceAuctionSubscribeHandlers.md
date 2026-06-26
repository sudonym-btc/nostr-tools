# Type Alias: MarketplaceAuctionSubscribeHandlers

> **MarketplaceAuctionSubscribeHandlers** = `object`

Defined in: [nostr-tools/marketplace/auction-query.ts:31](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L31)

## Properties

### onauction?

> `optional` **onauction?**: (`auction`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:33](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L33)

#### Parameters

##### auction

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

#### Returns

`void`

***

### onauctions?

> `optional` **onauctions?**: (`auctions`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:34](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L34)

#### Parameters

##### auctions

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)[]

#### Returns

`void`

***

### onclose?

> `optional` **onclose?**: (`reasons`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:37](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L37)

#### Parameters

##### reasons

`string`[]

#### Returns

`void`

***

### oneose?

> `optional` **oneose?**: () => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:36](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L36)

#### Returns

`void`

***

### onevent?

> `optional` **onevent?**: (`auction`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:32](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L32)

#### Parameters

##### auction

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

#### Returns

`void`

***

### oninvalid?

> `optional` **oninvalid?**: (`event`, `error`) => `void`

Defined in: [nostr-tools/marketplace/auction-query.ts:35](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-query.ts#L35)

#### Parameters

##### event

`Event`

##### error

`Error`

#### Returns

`void`
