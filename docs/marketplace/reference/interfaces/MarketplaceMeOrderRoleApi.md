# Interface: MarketplaceMeOrderRoleApi

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

#### Parameters

##### query?

[`MarketplaceMeOrdersQuery`](../type-aliases/MarketplaceMeOrdersQuery.md)

##### options?

[`OrderGroupSearchOptions`](../type-aliases/OrderGroupSearchOptions.md)

#### Returns

`Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

***

### watch()

> **watch**(`query?`, `options?`): [`MarketplaceMeOrderRoleStream`](../type-aliases/MarketplaceMeOrderRoleStream.md)

#### Parameters

##### query?

[`MarketplaceMeOrdersQuery`](../type-aliases/MarketplaceMeOrdersQuery.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) & [`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md)

#### Returns

[`MarketplaceMeOrderRoleStream`](../type-aliases/MarketplaceMeOrderRoleStream.md)
