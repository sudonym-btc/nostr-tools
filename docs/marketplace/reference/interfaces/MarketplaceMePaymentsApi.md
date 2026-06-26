# Interface: MarketplaceMePaymentsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1161](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1161)

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceMePaymentsSnapshot`](../type-aliases/MarketplaceMePaymentsSnapshot.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1162](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1162)

#### Parameters

##### query?

[`MarketplaceMePaymentsQuery`](../type-aliases/MarketplaceMePaymentsQuery.md)

##### options?

[`MarketplaceMePaymentsSearchOptions`](../type-aliases/MarketplaceMePaymentsSearchOptions.md)

#### Returns

`Promise`\<[`MarketplaceMePaymentsSnapshot`](../type-aliases/MarketplaceMePaymentsSnapshot.md)\>

***

### watch()

> **watch**(`query?`, `options?`): [`MarketplaceMePaymentsStream`](../type-aliases/MarketplaceMePaymentsStream.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1166](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1166)

#### Parameters

##### query?

[`MarketplaceMePaymentsQuery`](../type-aliases/MarketplaceMePaymentsQuery.md)

##### options?

[`MarketplaceMePaymentsSubscribeOptions`](../type-aliases/MarketplaceMePaymentsSubscribeOptions.md)

#### Returns

[`MarketplaceMePaymentsStream`](../type-aliases/MarketplaceMePaymentsStream.md)
