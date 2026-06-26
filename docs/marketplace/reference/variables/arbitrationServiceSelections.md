# Variable: arbitrationServiceSelections

> `const` **arbitrationServiceSelections**: `object`

Defined in: [nostr-tools/marketplace/arbitrationservice.ts:256](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/arbitrationservice.ts#L256)

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
