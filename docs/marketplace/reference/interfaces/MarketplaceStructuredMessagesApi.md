# Interface: MarketplaceStructuredMessagesApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1016](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1016)

## Properties

### template

> **template**: (`message`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1019](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1019)

#### Parameters

##### message

[`StructuredMessageTemplate`](../type-aliases/StructuredMessageTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1018](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1018)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### parse()

> **parse**(`event`): [`ParsedStructuredMessage`](../type-aliases/ParsedStructuredMessage.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1017](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1017)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedStructuredMessage`](../type-aliases/ParsedStructuredMessage.md)
