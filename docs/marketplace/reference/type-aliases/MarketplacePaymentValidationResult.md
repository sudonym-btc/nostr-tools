# Type Alias: MarketplacePaymentValidationResult

> **MarketplacePaymentValidationResult** = `MarketplaceDriverValidationResult` & `object`

Defined in: [nostr-tools/marketplace/payment-validation.ts:47](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/payment-validation.ts#L47)

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
