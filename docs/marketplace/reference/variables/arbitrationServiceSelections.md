# Variable: arbitrationServiceSelections

> `const` **arbitrationServiceSelections**: `object`

Defined in: [nostr-tools/marketplace/arbitrationservice.ts:256](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/arbitrationservice.ts#L256)

## Type Declaration

### parse

> **parse**: (`event`) => [`ParsedArbitrationServiceSelection`](../type-aliases/ParsedArbitrationServiceSelection.md) = `parseArbitrationServiceSelectionEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedArbitrationServiceSelection`](../type-aliases/ParsedArbitrationServiceSelection.md)

### template

> **template**: (`selection`) => `EventTemplate` = `generateArbitrationServiceSelectionEventTemplate`

#### Parameters

##### selection

[`ArbitrationServiceSelectionTemplate`](../type-aliases/ArbitrationServiceSelectionTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validateArbitrationServiceSelectionEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
