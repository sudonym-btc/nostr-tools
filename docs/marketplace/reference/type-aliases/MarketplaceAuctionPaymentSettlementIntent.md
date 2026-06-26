# Type Alias: MarketplaceAuctionPaymentSettlementIntent

> **MarketplaceAuctionPaymentSettlementIntent** = `MarketplaceDriverAuctionSettlementIntent`\<[`PaymentProofEvidence`](PaymentProofEvidence.md), [`MarketplacePaymentValidationExpected`](MarketplacePaymentValidationExpected.md)\> & `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:481](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L481)

## Type Declaration

### bid

> **bid**: [`ParsedMarketplaceAuctionBid`](ParsedMarketplaceAuctionBid.md)

### data?

> `optional` **data?**: `Record`\<`string`, `unknown`\>

### expected?

> `optional` **expected?**: [`MarketplacePaymentValidationExpected`](MarketplacePaymentValidationExpected.md)

### payment

> **payment**: [`ParsedPayment`](ParsedPayment.md)

### proof

> **proof**: [`PaymentProofEvidence`](PaymentProofEvidence.md)

### recycleArgs?

> `optional` **recycleArgs?**: `unknown`

### refundPercent?

> `optional` **refundPercent?**: `number`

### targetOrderGroupId?

> `optional` **targetOrderGroupId?**: `string`

### targetTradeId?

> `optional` **targetTradeId?**: `string`

### targetUnlockAt?

> `optional` **targetUnlockAt?**: `number`

### validation

> **validation**: [`MarketplacePaymentValidationResult`](MarketplacePaymentValidationResult.md)

### winner?

> `optional` **winner?**: [`MarketplaceAuctionBidValidation`](MarketplaceAuctionBidValidation.md)
