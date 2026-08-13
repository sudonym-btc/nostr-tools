# Interface: MarketplaceMeBidRoleApi

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\>

#### Parameters

##### query?

[`MarketplaceMeBidsQuery`](../type-aliases/MarketplaceMeBidsQuery.md)

##### options?

[`AuctionBidGroupSearchOptions`](../type-aliases/AuctionBidGroupSearchOptions.md)

#### Returns

`Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\>

***

### watch()

> **watch**(`query?`, `options?`): [`MarketplaceMeBidRoleStream`](../type-aliases/MarketplaceMeBidRoleStream.md)

#### Parameters

##### query?

[`MarketplaceMeBidsQuery`](../type-aliases/MarketplaceMeBidsQuery.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md)

#### Returns

[`MarketplaceMeBidRoleStream`](../type-aliases/MarketplaceMeBidRoleStream.md)
