# Type Alias: AuctionBidGroupSubscribeHandlers

> **AuctionBidGroupSubscribeHandlers** = `object`

Defined in: [nostr-tools/marketplace/auction-bid-group.ts:133](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/auction-bid-group.ts#L133)

## Properties

### onclose?

> `optional` **onclose?**: (`reasons`) => `void`

Defined in: [nostr-tools/marketplace/auction-bid-group.ts:139](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/auction-bid-group.ts#L139)

#### Parameters

##### reasons

`string`[]

#### Returns

`void`

***

### oneose?

> `optional` **oneose?**: () => `void`

Defined in: [nostr-tools/marketplace/auction-bid-group.ts:138](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/auction-bid-group.ts#L138)

#### Returns

`void`

***

### onevent?

> `optional` **onevent?**: (`event`) => `void`

Defined in: [nostr-tools/marketplace/auction-bid-group.ts:134](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/auction-bid-group.ts#L134)

#### Parameters

##### event

[`AuctionBidGroupEvent`](AuctionBidGroupEvent.md)

#### Returns

`void`

***

### ongroup?

> `optional` **ongroup?**: (`group`) => `void`

Defined in: [nostr-tools/marketplace/auction-bid-group.ts:135](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/auction-bid-group.ts#L135)

#### Parameters

##### group

[`ParsedAuctionBidGroup`](ParsedAuctionBidGroup.md)

#### Returns

`void`

***

### ongroups?

> `optional` **ongroups?**: (`groups`) => `void`

Defined in: [nostr-tools/marketplace/auction-bid-group.ts:136](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/auction-bid-group.ts#L136)

#### Parameters

##### groups

[`ParsedAuctionBidGroup`](ParsedAuctionBidGroup.md)[]

#### Returns

`void`

***

### oninvalid?

> `optional` **oninvalid?**: (`event`, `error`) => `void`

Defined in: [nostr-tools/marketplace/auction-bid-group.ts:137](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/auction-bid-group.ts#L137)

#### Parameters

##### event

`Event`

##### error

`Error`

#### Returns

`void`
