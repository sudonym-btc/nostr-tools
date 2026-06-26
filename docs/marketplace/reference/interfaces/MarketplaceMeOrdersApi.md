# Interface: MarketplaceMeOrdersApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1046](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1046)

## Properties

### arbitrating

> **arbitrating**: [`MarketplaceMeOrderRoleApi`](MarketplaceMeOrderRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1057](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1057)

***

### placed

> **placed**: [`MarketplaceMeOrderRoleApi`](MarketplaceMeOrderRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1055](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1055)

***

### received

> **received**: [`MarketplaceMeOrderRoleApi`](MarketplaceMeOrderRoleApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1056](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1056)

***

### resolveParticipants

> **resolveParticipants**: (`group`, `options`) => `Promise`\<[`ResolvedOrderGroup`](../type-aliases/ResolvedOrderGroup.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1058](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1058)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1047](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1047)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1051](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1051)

#### Parameters

##### query?

[`MarketplaceMeOrdersQuery`](../type-aliases/MarketplaceMeOrdersQuery.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) & [`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md)

#### Returns

[`MarketplaceMeOrdersStream`](../type-aliases/MarketplaceMeOrdersStream.md)
