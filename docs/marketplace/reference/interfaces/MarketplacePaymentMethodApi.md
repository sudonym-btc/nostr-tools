# Interface: MarketplacePaymentMethodApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:930](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L930)

## Properties

### canonicalAssetId

> **canonicalAssetId**: (`assetId`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:936](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L936)

#### Parameters

##### assetId

`string`

#### Returns

`string`

***

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:934](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L934)

#### Parameters

##### query?

[`PaymentMethodFindQuery`](../type-aliases/PaymentMethodFindQuery.md) = `{}`

#### Returns

`Filter`

***

### parse

> **parse**: (`event`) => [`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:931](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L931)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md)

***

### template

> **template**: (`method`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:933](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L933)

#### Parameters

##### method

[`PaymentMethodTemplate`](../type-aliases/PaymentMethodTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:932](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L932)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### findOne()

> **findOne**(`query?`, `options?`): `Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:935](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L935)

#### Parameters

##### query?

[`PaymentMethodFindQuery`](../type-aliases/PaymentMethodFindQuery.md)

##### options?

[`PaymentMethodFindOptions`](../type-aliases/PaymentMethodFindOptions.md)

#### Returns

`Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>
