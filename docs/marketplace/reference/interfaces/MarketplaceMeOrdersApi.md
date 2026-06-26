# Interface: MarketplaceMeOrdersApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1049](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1049)

## Properties

### arbitrating

> **arbitrating**: [`MarketplaceMeOrderRoleApi`](MarketplaceMeOrderRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1060](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1060)

***

### placed

> **placed**: [`MarketplaceMeOrderRoleApi`](MarketplaceMeOrderRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1058](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1058)

***

### received

> **received**: [`MarketplaceMeOrderRoleApi`](MarketplaceMeOrderRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1059](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1059)

***

### resolveParticipants

> **resolveParticipants**: (`group`, `options`) => `Promise`\<[`ResolvedOrderGroup`](../type-aliases/ResolvedOrderGroup.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1061](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1061)

#### Parameters

##### group

[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)

##### options?

[`ResolveOrderGroupParticipantsOptions`](../type-aliases/ResolveOrderGroupParticipantsOptions.md) = `{}`

#### Returns

`Promise`\<[`ResolvedOrderGroup`](../type-aliases/ResolvedOrderGroup.md)\>

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceMeOrdersSnapshot`](../type-aliases/MarketplaceMeOrdersSnapshot.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1050](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1050)

#### Parameters

##### query?

[`MarketplaceMeOrdersQuery`](../type-aliases/MarketplaceMeOrdersQuery.md)

##### options?

[`OrderGroupSearchOptions`](../type-aliases/OrderGroupSearchOptions.md)

#### Returns

`Promise`\<[`MarketplaceMeOrdersSnapshot`](../type-aliases/MarketplaceMeOrdersSnapshot.md)\>

***

### watch()

> **watch**(`query?`, `options?`): [`MarketplaceMeOrdersStream`](../type-aliases/MarketplaceMeOrdersStream.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1054](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1054)

#### Parameters

##### query?

[`MarketplaceMeOrdersQuery`](../type-aliases/MarketplaceMeOrdersQuery.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) & [`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md)

#### Returns

[`MarketplaceMeOrdersStream`](../type-aliases/MarketplaceMeOrdersStream.md)
