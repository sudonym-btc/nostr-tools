# Variable: structuredMessages

> `const` **structuredMessages**: `object`

Defined in: [nostr-tools/marketplace/order.ts:410](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/order.ts#L410)

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
