# Type Alias: MarketplacePaymentValidationExpected

> **MarketplacePaymentValidationExpected** = `MarketplaceDriverValidationExpected` & `object`

Defined in: [nostr-tools/marketplace/payment-validation.ts:14](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/payment-validation.ts#L14)

## Type Declaration

### amount?

> `optional` **amount?**: [`MarketplaceAmount`](MarketplaceAmount.md)

### asset?

> `optional` **asset?**: `object`

#### asset.assetId?

> `optional` **assetId?**: `string`

#### asset.currency?

> `optional` **currency?**: `string`

#### asset.decimals?

> `optional` **decimals?**: `number`

#### asset.denomination?

> `optional` **denomination?**: `string`

### contract?

> `optional` **contract?**: `object`

#### contract.address?

> `optional` **address?**: `string`

#### contract.bytecodeHash?

> `optional` **bytecodeHash?**: `string`

#### contract.chainId?

> `optional` **chainId?**: `number`

#### contract.params?

> `optional` **params?**: `Record`\<`string`, `unknown`\>

#### contract.type?

> `optional` **type?**: `string`

### fee?

> `optional` **fee?**: [`MarketplaceAmount`](MarketplaceAmount.md)

### listingAnchor?

> `optional` **listingAnchor?**: `string`

### participants?

> `optional` **participants?**: `object`

#### participants.arbiter?

> `optional` **arbiter?**: `object`

#### participants.arbiter.address?

> `optional` **address?**: `string`

#### participants.arbiter.pubkey?

> `optional` **pubkey?**: `string`

#### participants.buyer?

> `optional` **buyer?**: `object`

#### participants.buyer.address?

> `optional` **address?**: `string`

#### participants.buyer.pubkey?

> `optional` **pubkey?**: `string`

#### participants.seller?

> `optional` **seller?**: `object`

#### participants.seller.address?

> `optional` **address?**: `string`

#### participants.seller.pubkey?

> `optional` **pubkey?**: `string`

### settlementId?

> `optional` **settlementId?**: `string`

### tradeId?

> `optional` **tradeId?**: `string`
