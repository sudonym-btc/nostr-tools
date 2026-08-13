# Type Alias: ParsedAuctionBidGroup

> **ParsedAuctionBidGroup** = `object`

## Properties

### amount

> **amount**: [`MarketplaceAmount`](MarketplaceAmount.md)

***

### auctionAnchor

> **auctionAnchor**: `string`

***

### bid

> **bid**: [`ParsedMarketplaceAuctionBid`](ParsedMarketplaceAuctionBid.md)

***

### bids

> **bids**: [`ParsedMarketplaceAuctionBid`](ParsedMarketplaceAuctionBid.md)[]

***

### events

> **events**: [`AuctionBidGroupEvent`](AuctionBidGroupEvent.md)[]

***

### id

> **id**: `string`

***

### ignoredEvents

> **ignoredEvents**: [`AuctionBidGroupEvent`](AuctionBidGroupEvent.md)[]

***

### listingAnchor

> **listingAnchor**: `string`

***

### participantPubkeys

> **participantPubkeys**: `string`[]

***

### participants

> **participants**: [`MarketplaceParticipantTag`](MarketplaceParticipantTag.md)[]

***

### payment?

> `optional` **payment?**: [`ParsedPayment`](ParsedPayment.md)

***

### paymentAck?

> `optional` **paymentAck?**: [`ParsedPaymentAck`](ParsedPaymentAck.md)

***

### paymentAcks

> **paymentAcks**: [`ParsedPaymentAck`](ParsedPaymentAck.md)[]

***

### paymentNack?

> `optional` **paymentNack?**: [`ParsedPaymentNack`](ParsedPaymentNack.md)

***

### paymentNacks

> **paymentNacks**: [`ParsedPaymentNack`](ParsedPaymentNack.md)[]

***

### payments

> **payments**: [`ParsedPayment`](ParsedPayment.md)[]

***

### settlement?

> `optional` **settlement?**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)

***

### settlements

> **settlements**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)[]

***

### stage

> **stage**: [`AuctionBidGroupStage`](AuctionBidGroupStage.md)

***

### tradeId

> **tradeId**: `string`
