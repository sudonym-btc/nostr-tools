# Variable: arbitrationServiceSelections

> `const` **arbitrationServiceSelections**: `object`

Defined in: [nostr-tools/marketplace/arbitrationservice.ts:256](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/arbitrationservice.ts#L256)

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
