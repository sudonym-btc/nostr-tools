# Variable: arbitrationServices

> `const` **arbitrationServices**: `object`

Defined in: [nostr-tools/marketplace/arbitrationservice.ts:246](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/arbitrationservice.ts#L246)

## Type Declaration

### calculateFee

> **calculateFee**: (`fee`, `amount`, `asset`) => `bigint` = `calculateArbitrationFee`

#### Parameters

##### fee

[`ArbitrationFee`](../type-aliases/ArbitrationFee.md)

##### amount

`bigint`

##### asset?

`string` = `'native'`

#### Returns

`bigint`

### filter

> **filter**: (`query`) => `Filter` = `arbitrationServiceFilter`

#### Parameters

##### query?

[`ArbitrationServiceFindQuery`](../type-aliases/ArbitrationServiceFindQuery.md) = `{}`

#### Returns

`Filter`

### findOne

> **findOne**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md) \| `null`\> = `findArbitrationService`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### query?

[`ArbitrationServiceFindQuery`](../type-aliases/ArbitrationServiceFindQuery.md) = `{}`

##### options?

[`ArbitrationServiceSearchOptions`](../type-aliases/ArbitrationServiceSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md) \| `null`\>

### parse

> **parse**: (`event`) => [`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md) = `parseArbitrationServiceEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)

### search

> **search**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)[]\> = `searchArbitrationServices`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### query?

[`ArbitrationServiceFindQuery`](../type-aliases/ArbitrationServiceFindQuery.md) = `{}`

##### options?

[`ArbitrationServiceSearchOptions`](../type-aliases/ArbitrationServiceSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`ParsedArbitrationService`](../type-aliases/ParsedArbitrationService.md)[]\>

### template

> **template**: (`service`) => `EventTemplate` = `generateArbitrationServiceEventTemplate`

#### Parameters

##### service

[`ArbitrationServiceTemplate`](../type-aliases/ArbitrationServiceTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validateArbitrationServiceEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
