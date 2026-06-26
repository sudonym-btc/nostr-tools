# Interface: MarketplaceMePaymentsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1158](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1158)

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceMePaymentsSnapshot`](../type-aliases/MarketplaceMePaymentsSnapshot.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1159](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1159)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1163](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1163)

#### Parameters

##### query?

[`MarketplaceMePaymentsQuery`](../type-aliases/MarketplaceMePaymentsQuery.md)

##### options?

[`MarketplaceMePaymentsSubscribeOptions`](../type-aliases/MarketplaceMePaymentsSubscribeOptions.md)

#### Returns

[`MarketplaceMePaymentsStream`](../type-aliases/MarketplaceMePaymentsStream.md)
