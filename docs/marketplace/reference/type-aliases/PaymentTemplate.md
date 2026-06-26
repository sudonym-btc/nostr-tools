# Type Alias: PaymentTemplate

> **PaymentTemplate** = [`PaymentLifecycleTemplate`](PaymentLifecycleTemplate.md) & `object`

Defined in: [nostr-tools/marketplace/payment-lifecycle.ts:100](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/payment-lifecycle.ts#L100)

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
