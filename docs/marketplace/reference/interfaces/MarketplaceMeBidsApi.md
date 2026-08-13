# Interface: MarketplaceMeBidsApi

## Properties

### arbitrating

> **arbitrating**: [`MarketplaceMeBidRoleApi`](MarketplaceMeBidRoleApi.md)

***

### placed

> **placed**: [`MarketplaceMeBidRoleApi`](MarketplaceMeBidRoleApi.md)

***

### received

> **received**: [`MarketplaceMeBidRoleApi`](MarketplaceMeBidRoleApi.md)

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceMeBidsSnapshot`](../type-aliases/MarketplaceMeBidsSnapshot.md)\>

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

#### Parameters

##### query?

[`MarketplaceMeBidsQuery`](../type-aliases/MarketplaceMeBidsQuery.md)

##### options?

[`AuctionBidGroupSubscribeOptions`](../type-aliases/AuctionBidGroupSubscribeOptions.md)

#### Returns

[`MarketplaceMeBidsStream`](../type-aliases/MarketplaceMeBidsStream.md)
