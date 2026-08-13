# Variable: arbitrationServiceSelections

> `const` **arbitrationServiceSelections**: `object`

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
