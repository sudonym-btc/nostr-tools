# Type Alias: MarketplaceAuctionScopeSnapshot

> **MarketplaceAuctionScopeSnapshot** = `object`

## Properties

### auction?

> `optional` **auction?**: [`ParsedMarketplaceAuction`](ParsedMarketplaceAuction.md)

***

### auctionAnchor

> **auctionAnchor**: `string`

***

### bidChains

> **bidChains**: [`ParsedAuctionBidChain`](ParsedAuctionBidChain.md)[]

***

### bidGroups

> **bidGroups**: [`ParsedAuctionBidGroup`](ParsedAuctionBidGroup.md)[]

***

### bids

> **bids**: [`ParsedMarketplaceAuctionBid`](ParsedMarketplaceAuctionBid.md)[]

***

### complete?

> `optional` **complete?**: [`ParsedMarketplaceAuctionComplete`](ParsedMarketplaceAuctionComplete.md)

***

### completes

> **completes**: [`ParsedMarketplaceAuctionComplete`](ParsedMarketplaceAuctionComplete.md)[]

***

### highestBid?

> `optional` **highestBid?**: [`ParsedAuctionBidChain`](ParsedAuctionBidChain.md)

***

### paymentAcks

> **paymentAcks**: [`ParsedPaymentAck`](ParsedPaymentAck.md)[]

***

### paymentNacks

> **paymentNacks**: [`ParsedPaymentNack`](ParsedPaymentNack.md)[]

***

### payments

> **payments**: [`ParsedPayment`](ParsedPayment.md)[]

***

### paymentSettlements

> **paymentSettlements**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)[]

***

### status

> **status**: `string`

***

### winningBid?

> `optional` **winningBid?**: [`ParsedAuctionBidGroup`](ParsedAuctionBidGroup.md)
