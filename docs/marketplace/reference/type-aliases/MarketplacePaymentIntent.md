# Type Alias: MarketplacePaymentIntent

> **MarketplacePaymentIntent** = `MarketplaceDriverPaymentIntent` & `object`

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
