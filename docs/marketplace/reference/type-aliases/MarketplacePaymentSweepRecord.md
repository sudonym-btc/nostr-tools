# Type Alias: MarketplacePaymentSweepRecord

> **MarketplacePaymentSweepRecord** = `object`

## Properties

### anchors?

> `optional` **anchors?**: [`PaymentLifecycleAnchors`](PaymentLifecycleAnchors.md)

***

### attempts

> **attempts**: `number`

***

### driver?

> `optional` **driver?**: `string`

***

### error?

> `optional` **error?**: `string`

***

### latest?

> `optional` **latest?**: [`MarketplacePaymentSweepState`](MarketplacePaymentSweepState.md)

***

### listingAnchor

> **listingAnchor**: `string`

***

### orderGroupId

> **orderGroupId**: `string`

***

### payment?

> `optional` **payment?**: [`ParsedPayment`](ParsedPayment.md)

***

### paymentId

> **paymentId**: `string`

***

### reason

> **reason**: `"payment"` \| `"settlement"` \| `"retry"`

***

### settlements

> **settlements**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)[]

***

### status

> **status**: [`MarketplacePaymentSweepStatus`](MarketplacePaymentSweepStatus.md)

***

### tradeId

> **tradeId**: `string`

***

### updatedAt

> **updatedAt**: `number`
