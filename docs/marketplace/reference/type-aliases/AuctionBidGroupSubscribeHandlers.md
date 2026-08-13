# Type Alias: AuctionBidGroupSubscribeHandlers

> **AuctionBidGroupSubscribeHandlers** = `object`

## Properties

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

> `optional` **onevent?**: (`event`) => `void`

#### Parameters

##### event

[`AuctionBidGroupEvent`](AuctionBidGroupEvent.md)

#### Returns

`void`

***

### ongroup?

> `optional` **ongroup?**: (`group`) => `void`

#### Parameters

##### group

[`ParsedAuctionBidGroup`](ParsedAuctionBidGroup.md)

#### Returns

`void`

***

### ongroups?

> `optional` **ongroups?**: (`groups`) => `void`

#### Parameters

##### groups

[`ParsedAuctionBidGroup`](ParsedAuctionBidGroup.md)[]

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
