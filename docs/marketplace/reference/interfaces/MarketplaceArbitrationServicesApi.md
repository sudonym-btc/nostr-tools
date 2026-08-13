# Interface: MarketplaceArbitrationServicesApi

## Properties

### calculateFee

> **calculateFee**: (`fee`, `amount`, `asset`) => `bigint`

#### Parameters

##### fee

[`ArbitrationFee`](../type-aliases/ArbitrationFee.md)

##### amount

`bigint`

##### asset?

`string` = `'native'`

#### Returns

`bigint`

***

### filter

> **filter**: (`query`) => `Filter`

#### Parameters

##### query?

[`ArbitrationServiceFindQuery`](../type-aliases/ArbitrationServiceFindQuery.md) = `{}`

#### Returns

`Filter`

***

### parse

> **parse**: (`event`) => [`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)

***

### template

> **template**: (`service`) => `EventTemplate`

#### Parameters

##### service

[`ArbitrationServiceTemplate`](../type-aliases/ArbitrationServiceTemplate.md)

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

> **findOne**(`query?`, `options?`): `Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md) \| `null`\>

#### Parameters

##### query?

[`ArbitrationServiceFindQuery`](../type-aliases/ArbitrationServiceFindQuery.md)

##### options?

[`ArbitrationServiceSearchOptions`](../type-aliases/ArbitrationServiceSearchOptions.md)

#### Returns

`Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md) \| `null`\>

***

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)[]\>

#### Parameters

##### query?

[`ArbitrationServiceFindQuery`](../type-aliases/ArbitrationServiceFindQuery.md)

##### options?

[`ArbitrationServiceSearchOptions`](../type-aliases/ArbitrationServiceSearchOptions.md)

#### Returns

`Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)[]\>
