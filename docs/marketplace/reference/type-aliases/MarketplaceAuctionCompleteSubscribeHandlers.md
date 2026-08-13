# Type Alias: MarketplaceAuctionCompleteSubscribeHandlers

> **MarketplaceAuctionCompleteSubscribeHandlers** = `object`

## Properties

### onclose?

> `optional` **onclose?**: (`reasons`) => `void`

#### Parameters

##### reasons

`string`[]

#### Returns

`void`

***

### oncomplete?

> `optional` **oncomplete?**: (`complete`) => `void`

#### Parameters

##### complete

[`ParsedMarketplaceAuctionComplete`](ParsedMarketplaceAuctionComplete.md)

#### Returns

`void`

***

### oncompletes?

> `optional` **oncompletes?**: (`completes`) => `void`

#### Parameters

##### completes

[`ParsedMarketplaceAuctionComplete`](ParsedMarketplaceAuctionComplete.md)[]

#### Returns

`void`

***

### oneose?

> `optional` **oneose?**: () => `void`

#### Returns

`void`

***

### onevent?

> `optional` **onevent?**: (`complete`) => `void`

#### Parameters

##### complete

[`ParsedMarketplaceAuctionComplete`](ParsedMarketplaceAuctionComplete.md)

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
