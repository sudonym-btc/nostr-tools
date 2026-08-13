# Type Alias: MarketplacePaymentValidationResult

> **MarketplacePaymentValidationResult** = `MarketplaceDriverValidationResult` & `object`

## Type Declaration

### amount?

> `optional` **amount?**: [`MarketplaceAmount`](MarketplaceAmount.md)

### amountMatched?

> `optional` **amountMatched?**: `boolean`

### arbiterMatched?

> `optional` **arbiterMatched?**: `boolean`

### assetMatched?

> `optional` **assetMatched?**: `boolean`

### confirmations?

> `optional` **confirmations?**: `number`

### data?

> `optional` **data?**: `Record`\<`string`, `unknown`\>

### driver

> **driver**: `string`

### error?

> `optional` **error?**: `string`

### orderEventId?

> `optional` **orderEventId?**: `string`

### proofEventId?

> `optional` **proofEventId?**: `string`

### recipientMatched?

> `optional` **recipientMatched?**: `boolean`

### status

> **status**: [`MarketplacePaymentValidationStatus`](MarketplacePaymentValidationStatus.md)

### terms?

> `optional` **terms?**: [`MarketplaceValidatedPaymentTerms`](MarketplaceValidatedPaymentTerms.md)
