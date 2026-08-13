# Interface: MarketplaceSessionPaymentMethodApi

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

### ensureUpToDate()

> **ensureUpToDate**(`options?`): `Promise`\<[`MarketplacePaymentMethodEnsureResult`](../type-aliases/MarketplacePaymentMethodEnsureResult.md)\>

#### Parameters

##### options?

[`MarketplacePaymentMethodEnsureOptions`](../type-aliases/MarketplacePaymentMethodEnsureOptions.md)

#### Returns

`Promise`\<[`MarketplacePaymentMethodEnsureResult`](../type-aliases/MarketplacePaymentMethodEnsureResult.md)\>

***

### find()

> **find**(): `Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>

#### Returns

`Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>

***

### findOne()

> **findOne**(`query?`): `Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>

#### Parameters

##### query?

[`PaymentMethodFindQuery`](../type-aliases/PaymentMethodFindQuery.md)

#### Returns

`Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>
