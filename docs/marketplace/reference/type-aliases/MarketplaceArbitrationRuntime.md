# Type Alias: MarketplaceArbitrationRuntime

> **MarketplaceArbitrationRuntime** = `object`

## Methods

### close()

> **close**(`reason?`): `void`

#### Parameters

##### reason?

`string`

#### Returns

`void`

***

### processAuction()

> **processAuction**(`auction`): `Promise`\<`void`\>

#### Parameters

##### auction

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

#### Returns

`Promise`\<`void`\>

***

### processAuctionBidGroup()

> **processAuctionBidGroup**(`auction`, `group`): `Promise`\<`void`\>

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

#### Parameters

##### group

[`ParsedOrderGroup`](ParsedOrderGroup.md)

#### Returns

`Promise`\<`void`\>

***

### settleAuction()

> **settleAuction**(`auction`): `Promise`\<`void`\>

#### Parameters

##### auction

[`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

#### Returns

`Promise`\<`void`\>

***

### settleDueAuctions()

> **settleDueAuctions**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
