# Interface: MarketplaceMeOrdersApi

## Properties

### arbitrating

> **arbitrating**: [`MarketplaceMeOrderRoleApi`](MarketplaceMeOrderRoleApi.md)

***

### placed

> **placed**: [`MarketplaceMeOrderRoleApi`](MarketplaceMeOrderRoleApi.md)

***

### received

> **received**: [`MarketplaceMeOrderRoleApi`](MarketplaceMeOrderRoleApi.md)

***

### resolveParticipants

> **resolveParticipants**: (`group`, `options`) => `Promise`\<[`ResolvedOrderGroup`](../type-aliases/ResolvedOrderGroup.md)\>

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

#### Parameters

##### query?

[`MarketplaceMeOrdersQuery`](../type-aliases/MarketplaceMeOrdersQuery.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) & [`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md)

#### Returns

[`MarketplaceMeOrdersStream`](../type-aliases/MarketplaceMeOrdersStream.md)
