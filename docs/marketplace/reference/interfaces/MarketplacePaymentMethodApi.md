# Interface: MarketplacePaymentMethodApi

## Properties

### canonicalAssetId

> **canonicalAssetId**: (`assetId`) => `string`

#### Parameters

##### assetId

`string`

#### Returns

`string`

***

### filter

> **filter**: (`query`) => `Filter`

#### Parameters

##### query?

[`PaymentMethodFindQuery`](../type-aliases/PaymentMethodFindQuery.md) = `{}`

#### Returns

`Filter`

***

### parse

> **parse**: (`event`) => [`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md)

***

### template

> **template**: (`method`) => `EventTemplate`

#### Parameters

##### method

[`PaymentMethodTemplate`](../type-aliases/PaymentMethodTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### findOne()

> **findOne**(`query?`, `options?`): `Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>

#### Parameters

##### query?

[`PaymentMethodFindQuery`](../type-aliases/PaymentMethodFindQuery.md)

##### options?

[`PaymentMethodFindOptions`](../type-aliases/PaymentMethodFindOptions.md)

#### Returns

`Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>
