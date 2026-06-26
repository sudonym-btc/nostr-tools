# Variable: structuredMessages

> `const` **structuredMessages**: `object`

Defined in: [nostr-tools/marketplace/order.ts:410](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order.ts#L410)

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
