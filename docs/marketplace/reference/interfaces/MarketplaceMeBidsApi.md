# Interface: MarketplaceMeBidsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1085](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1085)

## Properties

### arbitrating

> **arbitrating**: [`MarketplaceMeBidRoleApi`](MarketplaceMeBidRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1096](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1096)

***

### placed

> **placed**: [`MarketplaceMeBidRoleApi`](MarketplaceMeBidRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1094](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1094)

***

### received

> **received**: [`MarketplaceMeBidRoleApi`](MarketplaceMeBidRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1095](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1095)

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceMeBidsSnapshot`](../type-aliases/MarketplaceMeBidsSnapshot.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1086](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1086)

#### Parameters

##### query?

[`MarketplaceMeBidsQuery`](../type-aliases/MarketplaceMeBidsQuery.md)

##### options?

[`AuctionBidGroupSearchOptions`](../type-aliases/AuctionBidGroupSearchOptions.md)

#### Returns

`Promise`\<[`MarketplaceMeBidsSnapshot`](../type-aliases/MarketplaceMeBidsSnapshot.md)\>

***

### watch()

> **watch**(`query?`, `options?`): [`MarketplaceMeBidsStream`](../type-aliases/MarketplaceMeBidsStream.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1090](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1090)

#### Parameters

##### query?

[`MarketplaceMeBidsQuery`](../type-aliases/MarketplaceMeBidsQuery.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md)

#### Returns

[`MarketplaceMeBidsStream`](../type-aliases/MarketplaceMeBidsStream.md)
