# Type Alias: MarketplacePaymentIntent

> **MarketplacePaymentIntent** = `MarketplaceDriverPaymentIntent` & `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:372](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L372)

## Type Declaration

### amount

> **amount**: [`MarketplaceAmount`](MarketplaceAmount.md)

### asset

> **asset**: [`MarketplacePaymentAsset`](MarketplacePaymentAsset.md)

### contract

> **contract**: [`MarketplacePaymentContract`](MarketplacePaymentContract.md)

### fee

> **fee**: [`MarketplaceAmount`](MarketplaceAmount.md)

### method

> **method**: [`PaymentMethod`](PaymentMethod.md)

### participants

> **participants**: `object`

#### participants.arbiter

> **arbiter**: [`MarketplacePaymentIdentity`](MarketplacePaymentIdentity.md)

#### participants.buyer?

> `optional` **buyer?**: [`MarketplacePaymentIdentity`](MarketplacePaymentIdentity.md)

#### participants.seller

> **seller**: [`MarketplacePaymentIdentity`](MarketplacePaymentIdentity.md)

### policy

> **policy**: [`MarketplacePaymentPolicy`](MarketplacePaymentPolicy.md)
