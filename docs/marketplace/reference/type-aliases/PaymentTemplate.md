# Type Alias: PaymentTemplate

> **PaymentTemplate** = [`PaymentLifecycleTemplate`](PaymentLifecycleTemplate.md) & `object`

Defined in: [nostr-tools/marketplace/payment-lifecycle.ts:100](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/payment-lifecycle.ts#L100)

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
