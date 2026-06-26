# Interface: MarketplaceMeBidRoleApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1074](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1074)

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1075](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1075)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1079](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1079)

#### Parameters

##### query?

[`MarketplaceMeBidsQuery`](../type-aliases/MarketplaceMeBidsQuery.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md)

#### Returns

[`MarketplaceMeBidRoleStream`](../type-aliases/MarketplaceMeBidRoleStream.md)
