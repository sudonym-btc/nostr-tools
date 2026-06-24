# Type Alias: MarketplaceArbitrationRuntime

> **MarketplaceArbitrationRuntime** = `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:869](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L869)

## Methods

### close()

> **close**(`reason?`): `void`

Defined in: [nostr-tools/marketplace/runtime-types.ts:870](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L870)

#### Parameters

##### reason?

`string`

#### Returns

`void`

***

### processAuction()

> **processAuction**(`auction`): `Promise`\<`void`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:872](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L872)

#### Parameters

##### auction

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

#### Returns

`Promise`\<`void`\>

***

### processAuctionBidGroup()

> **processAuctionBidGroup**(`auction`, `group`): `Promise`\<`void`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:873](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L873)

#### Parameters

##### auction

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

##### group

[`ParsedAuctionBidGroup`](ParsedAuctionBidGroup.md)

#### Returns

`Promise`\<`void`\>

***

### processGroup()

> **processGroup**(`group`): `Promise`\<`void`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:871](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L871)

#### Parameters

##### group

[`ParsedOrderGroup`](ParsedOrderGroup.md)

#### Returns

`Promise`\<`void`\>

***

### settleAuction()

> **settleAuction**(`auction`): `Promise`\<`void`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:874](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L874)

#### Parameters

##### auction

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

#### Returns

`Promise`\<`void`\>

***

### settleDueAuctions()

> **settleDueAuctions**(): `Promise`\<`void`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:875](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L875)

#### Returns

`Promise`\<`void`\>
