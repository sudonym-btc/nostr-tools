# Type Alias: MarketplaceOrderValidationResult

> **MarketplaceOrderValidationResult** = `object`

## Properties

### errors

> **errors**: `string`[]

***

### expected?

> `optional` **expected?**: `object`

#### amount?

> `optional` **amount?**: [`MarketplaceAmount`](MarketplaceAmount.md)

#### maxUnlockAt?

> `optional` **maxUnlockAt?**: `number`

#### securityBondAmount?

> `optional` **securityBondAmount?**: [`MarketplaceAmount`](MarketplaceAmount.md)

#### unlockAt?

> `optional` **unlockAt?**: `number`

***

### listingEventId?

> `optional` **listingEventId?**: `string`

***

### listingMatched?

> `optional` **listingMatched?**: `boolean`

***

### orderAmountMatched?

> `optional` **orderAmountMatched?**: `boolean`

***

### orderEventId

> **orderEventId**: `string`

***

### paymentAmountMatched?

> `optional` **paymentAmountMatched?**: `boolean`

***

### paymentEventIds

> **paymentEventIds**: `string`[]

***

### securityBondMatched?

> `optional` **securityBondMatched?**: `boolean`

***

### sellerMatched?

> `optional` **sellerMatched?**: `boolean`

***

### settlementMatched?

> `optional` **settlementMatched?**: `boolean`

***

### status

> **status**: [`MarketplaceOrderValidationStatus`](MarketplaceOrderValidationStatus.md)

***

### timeoutMatched?

> `optional` **timeoutMatched?**: `boolean`

***

### totals

> **totals**: [`MarketplaceOrderValidationTotals`](MarketplaceOrderValidationTotals.md)

***

### tradeMatched?

> `optional` **tradeMatched?**: `boolean`
