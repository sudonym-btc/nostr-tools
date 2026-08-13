# Variable: structuredMessages

> `const` **structuredMessages**: `object`

## Type Declaration

### parse

> **parse**: (`event`) => [`ParsedStructuredMessage`](../type-aliases/ParsedStructuredMessage.md) = `parseStructuredMessageEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedStructuredMessage`](../type-aliases/ParsedStructuredMessage.md)

### template

> **template**: (`message`) => `EventTemplate` = `generateStructuredMessageEventTemplate`

#### Parameters

##### message

[`StructuredMessageTemplate`](../type-aliases/StructuredMessageTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validateStructuredMessageEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
