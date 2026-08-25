# Type Alias: MarketplaceEscrowRecordBase

> **MarketplaceEscrowRecordBase** = `object`

## Properties

### actionReason?

> `optional` **actionReason?**: [`MarketplaceEscrowActionUnavailable`](MarketplaceEscrowActionUnavailable.md)

***

### actions

> **actions**: [`MarketplaceEscrowAction`](MarketplaceEscrowAction.md)[]

***

### driver?

> `optional` **driver?**: [`MarketplaceSessionDriverState`](MarketplaceSessionDriverState.md)

***

### id

> **id**: `string`

***

### kind

> **kind**: `"order"` \| `"auction_bid"`

***

### listingAnchor

> **listingAnchor**: `string`

***

### payment?

> `optional` **payment?**: [`ParsedPayment`](ParsedPayment.md)

***

### stage

> **stage**: `string`

***

### tradeId

> **tradeId**: `string`

***

### updatedAt

> **updatedAt**: `number`

***

### validation?

> `optional` **validation?**: [`MarketplacePaymentValidationResult`](MarketplacePaymentValidationResult.md)
