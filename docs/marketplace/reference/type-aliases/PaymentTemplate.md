# Type Alias: PaymentTemplate

> **PaymentTemplate** = [`PaymentLifecycleTemplate`](PaymentLifecycleTemplate.md) & `object`

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
