# Type Alias: MarketplacePaymentMethodEnsureOptions

> **MarketplacePaymentMethodEnsureOptions** = [`MarketplacePaymentMethodDefaults`](MarketplacePaymentMethodDefaults.md) & `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:325](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L325)

## Type Declaration

### createdAt?

> `optional` **createdAt?**: `number`

### force?

> `optional` **force?**: `boolean`

### listingsQuery?

> `optional` **listingsQuery?**: `Omit`\<[`ListingSearchQuery`](ListingSearchQuery.md), `"authors"` \| `"limit"`\> & `object`

#### Type Declaration

##### limit?

> `optional` **limit?**: `number`

### requireListings?

> `optional` **requireListings?**: `boolean`
