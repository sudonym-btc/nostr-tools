# Interface: MarketplaceArbitrationServicesApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:942](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L942)

## Properties

### calculateFee

> **calculateFee**: (`fee`, `amount`, `asset`) => `bigint`

Defined in: [nostr-tools/marketplace/runtime-types.ts:949](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L949)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:946](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L946)

#### Parameters

##### query?

[`ArbitrationServiceFindQuery`](../type-aliases/ArbitrationServiceFindQuery.md) = `{}`

#### Returns

`Filter`

***

### parse

> **parse**: (`event`) => [`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:943](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L943)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)

***

### template

> **template**: (`service`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:945](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L945)

#### Parameters

##### service

[`ArbitrationServiceTemplate`](../type-aliases/ArbitrationServiceTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:944](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L944)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### findOne()

> **findOne**(`query?`, `options?`): `Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md) \| `null`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:948](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L948)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:947](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L947)

#### Parameters

##### query?

[`ArbitrationServiceFindQuery`](../type-aliases/ArbitrationServiceFindQuery.md)

##### options?

[`ArbitrationServiceSearchOptions`](../type-aliases/ArbitrationServiceSearchOptions.md)

#### Returns

`Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)[]\>
