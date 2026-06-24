# Variable: auctions

> `const` **auctions**: `object`

Defined in: [nostr-tools/marketplace/auction.ts:417](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/auction.ts#L417)

## Type Declaration

### address

> **address**: (`auction`) => `string` = `auctionAddress`

#### Parameters

##### auction

`NostrEvent` \| [`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

#### Returns

`string`

### bidChainId

> **bidChainId**: (`seed`, `auctionAnchor`) => `string` = `auctionBidChainId`

#### Parameters

##### seed

`string`

##### auctionAnchor

`string`

#### Returns

`string`

### bidTemplate

> **bidTemplate**: (`bid`) => `EventTemplate` = `generateAuctionBidEventTemplate`

#### Parameters

##### bid

[`MarketplaceAuctionBidTemplate`](../type-aliases/MarketplaceAuctionBidTemplate.md)

#### Returns

`EventTemplate`

### completeTemplate

> **completeTemplate**: (`complete`) => `EventTemplate` = `generateAuctionCompleteEventTemplate`

#### Parameters

##### complete

[`MarketplaceAuctionCompleteTemplate`](../type-aliases/MarketplaceAuctionCompleteTemplate.md)

#### Returns

`EventTemplate`

### parse

> **parse**: (`event`) => [`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md) = `parseAuctionEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuction`](../type-aliases/ParsedMarketplaceAuction.md)

### parseBid

> **parseBid**: (`event`) => [`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md) = `parseAuctionBidEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuctionBid`](../type-aliases/ParsedMarketplaceAuctionBid.md)

### parseComplete

> **parseComplete**: (`event`) => [`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md) = `parseAuctionCompleteEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceAuctionComplete`](../type-aliases/ParsedMarketplaceAuctionComplete.md)

### template

> **template**: (`auction`) => `EventTemplate` = `generateAuctionEventTemplate`

#### Parameters

##### auction

[`MarketplaceAuctionTemplate`](../type-aliases/MarketplaceAuctionTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validateAuctionEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

### validateBid

> **validateBid**: (`event`) => `boolean` = `validateAuctionBidEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

### validateComplete

> **validateComplete**: (`event`) => `boolean` = `validateAuctionCompleteEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
