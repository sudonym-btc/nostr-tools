# Type Alias: MarketplaceAuctionSubscribeHandlers

> **MarketplaceAuctionSubscribeHandlers** = `object`

## Properties

### onauction?

> `optional` **onauction?**: (`auction`) => `void`

#### Parameters

##### auction

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

#### Returns

`void`

***

### onauctions?

> `optional` **onauctions?**: (`auctions`) => `void`

#### Parameters

##### auctions

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)[]

#### Returns

`void`

***

### onclose?

> `optional` **onclose?**: (`reasons`) => `void`

#### Parameters

##### reasons

`string`[]

#### Returns

`void`

***

### oneose?

> `optional` **oneose?**: () => `void`

#### Returns

`void`

***

### onevent?

> `optional` **onevent?**: (`auction`) => `void`

#### Parameters

##### auction

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

#### Returns

`void`

***

### oninvalid?

> `optional` **oninvalid?**: (`event`, `error`) => `void`

#### Parameters

##### event

`Event`

##### error

`Error`

#### Returns

`void`
