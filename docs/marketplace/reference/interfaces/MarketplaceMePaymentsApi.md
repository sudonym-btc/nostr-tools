# Interface: MarketplaceMePaymentsApi

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceMePaymentsSnapshot`](../type-aliases/MarketplaceMePaymentsSnapshot.md)\>

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

#### Parameters

##### query?

[`MarketplaceMePaymentsQuery`](../type-aliases/MarketplaceMePaymentsQuery.md)

##### options?

[`MarketplaceMePaymentsSubscribeOptions`](../type-aliases/MarketplaceMePaymentsSubscribeOptions.md)

#### Returns

[`MarketplaceMePaymentsStream`](../type-aliases/MarketplaceMePaymentsStream.md)
