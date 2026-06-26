# Interface: MarketplaceMeBidsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1088](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1088)

## Properties

### arbitrating

> **arbitrating**: [`MarketplaceMeBidRoleApi`](MarketplaceMeBidRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1099](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1099)

***

### placed

> **placed**: [`MarketplaceMeBidRoleApi`](MarketplaceMeBidRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1097](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1097)

***

### received

> **received**: [`MarketplaceMeBidRoleApi`](MarketplaceMeBidRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1098](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1098)

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceMeBidsSnapshot`](../type-aliases/MarketplaceMeBidsSnapshot.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1089](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1089)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1093](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1093)

#### Parameters

##### query?

[`MarketplaceMeBidsQuery`](../type-aliases/MarketplaceMeBidsQuery.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md)

#### Returns

[`MarketplaceMeBidsStream`](../type-aliases/MarketplaceMeBidsStream.md)
