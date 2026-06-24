# Interface: MarketplaceMeBidRoleApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1074](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1074)

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`ParsedAuctionBidGroup`](../type-aliases/ParsedAuctionBidGroup.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1075](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1075)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1079](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1079)

#### Parameters

##### query?

[`MarketplaceMeBidsQuery`](../type-aliases/MarketplaceMeBidsQuery.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md)

#### Returns

[`MarketplaceMeBidRoleStream`](../type-aliases/MarketplaceMeBidRoleStream.md)
