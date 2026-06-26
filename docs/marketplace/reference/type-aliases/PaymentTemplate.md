# Type Alias: PaymentTemplate

> **PaymentTemplate** = [`PaymentLifecycleTemplate`](PaymentLifecycleTemplate.md) & `object`

Defined in: [nostr-tools/marketplace/payment-lifecycle.ts:100](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/payment-lifecycle.ts#L100)

## Type Declaration

### amount?

> `optional` **amount?**: [`MarketplaceAmount`](MarketplaceAmount.md)

### paymentAmountKeys?

> `optional` **paymentAmountKeys?**: [`PaymentAmountKeyTag`](PaymentAmountKeyTag.md)[]

### paymentProofKeys?

> `optional` **paymentProofKeys?**: [`PaymentProofKeyTag`](PaymentProofKeyTag.md)[]

### proof

> **proof**: [`PaymentProof`](PaymentProof.md) \| [`SealedPaymentProof`](SealedPaymentProof.md)

### sealedAmount?

> `optional` **sealedAmount?**: [`SealedPaymentAmount`](SealedPaymentAmount.md)
