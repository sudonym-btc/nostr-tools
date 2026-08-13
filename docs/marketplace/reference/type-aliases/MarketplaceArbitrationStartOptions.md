# Type Alias: MarketplaceArbitrationStartOptions

> **MarketplaceArbitrationStartOptions** = `Omit`\<[`OrderQuery`](OrderQuery.md), `"identity"`\> & [`OrderSubscribeOptions`](OrderSubscribeOptions.md) & [`ReduceOrderGroupOptions`](ReduceOrderGroupOptions.md) & `object`

## Type Declaration

### auctionBidQuery?

> `optional` **auctionBidQuery?**: `Omit`\<[`AuctionBidGroupQuery`](AuctionBidGroupQuery.md), `"auctionAnchor"` \| `"participantPubkeys"`\>

### auctionQuery?

> `optional` **auctionQuery?**: `Omit`\<[`MarketplaceAuctionSearchQuery`](MarketplaceAuctionSearchQuery.md), `"arbiterPubkeys"`\>

### auctions?

> `optional` **auctions?**: `boolean`

### auctionSettlement?

> `optional` **auctionSettlement?**: `Omit`\<[`MarketplaceAuctionSettlementRequest`](MarketplaceAuctionSettlementRequest.md), `"auctionAnchor"` \| `"auctionId"` \| `"listingAnchor"`\>

### auctionSettlementSweepIntervalMs?

> `optional` **auctionSettlementSweepIntervalMs?**: `number`

### autoAck?

> `optional` **autoAck?**: `boolean`

### autoNack?

> `optional` **autoNack?**: `boolean`

### autoSettleAuctions?

> `optional` **autoSettleAuctions?**: `boolean`

### identity?

> `optional` **identity?**: [`MarketplaceOrderIdentity`](MarketplaceOrderIdentity.md)

### now?

> `optional` **now?**: `number`

### onstate?

> `optional` **onstate?**: (`event`) => `void` \| `Promise`\<`void`\>

#### Parameters

##### event

[`MarketplaceArbitrationStartEvent`](MarketplaceArbitrationStartEvent.md)

#### Returns

`void` \| `Promise`\<`void`\>

### orders?

> `optional` **orders?**: `boolean`
