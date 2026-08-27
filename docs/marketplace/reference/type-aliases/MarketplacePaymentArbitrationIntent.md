# Type Alias: MarketplacePaymentArbitrationIntent

> **MarketplacePaymentArbitrationIntent** = `object`

## Properties

### action

> **action**: [`PaymentSettlementAction`](PaymentSettlementAction.md)

***

### data?

> `optional` **data?**: `Record`\<`string`, `unknown`\>

***

### decryptParams?

> `optional` **decryptParams?**: `MarketplaceDriverPaymentProofParamsDecryptor`

***

### expected?

> `optional` **expected?**: [`MarketplacePaymentValidationExpected`](MarketplacePaymentValidationExpected.md)

***

### group

> **group**: [`ParsedOrderGroup`](ParsedOrderGroup.md)

***

### outputs?

> `optional` **outputs?**: [`PaymentSettlementOutput`](PaymentSettlementOutput.md)[]

***

### payment

> **payment**: [`ParsedPayment`](ParsedPayment.md)

***

### proof

> **proof**: [`PaymentProofEvidence`](PaymentProofEvidence.md)

***

### purpose

> **purpose**: `"order"`

***

### reason?

> `optional` **reason?**: `string`
