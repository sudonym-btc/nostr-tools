# Type Alias: PaymentSettlementContent

> **PaymentSettlementContent** = `object`

## Properties

### action

> **action**: [`PaymentSettlementAction`](PaymentSettlementAction.md)

***

### data?

> `optional` **data?**: `Record`\<`string`, `unknown`\>

***

### inputs?

> `optional` **inputs?**: `Record`\<`string`, `unknown`\>[]

***

### method

> **method**: [`PaymentMethod`](PaymentMethod.md)

***

### outputs?

> `optional` **outputs?**: [`PaymentSettlementOutput`](PaymentSettlementOutput.md)[]

***

### proof?

> `optional` **proof?**: [`PaymentProof`](PaymentProof.md)

Public settlement proof, when the driver explicitly permits disclosure.

***

### sealedProof?

> `optional` **sealedProof?**: [`SealedPaymentProof`](SealedPaymentProof.md)

Whole-proof ciphertext for confidential or bearer settlement results.
