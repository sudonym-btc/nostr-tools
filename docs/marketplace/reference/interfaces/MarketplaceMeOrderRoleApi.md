# Interface: MarketplaceMeOrderRoleApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1035](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1035)

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1036](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1036)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1040](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1040)

#### Parameters

##### query?

[`MarketplaceMeOrdersQuery`](../type-aliases/MarketplaceMeOrdersQuery.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) & [`ReduceOrderGroupOptions`](../type-aliases/ReduceOrderGroupOptions.md)

#### Returns

[`MarketplaceMeOrderRoleStream`](../type-aliases/MarketplaceMeOrderRoleStream.md)
