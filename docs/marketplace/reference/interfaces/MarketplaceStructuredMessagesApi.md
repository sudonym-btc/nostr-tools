# Interface: MarketplaceStructuredMessagesApi

## Properties

### template

> **template**: (`message`) => `EventTemplate`

#### Parameters

##### message

[`StructuredMessageTemplate`](../type-aliases/StructuredMessageTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### parse()

> **parse**(`event`): [`ParsedStructuredMessage`](../type-aliases/ParsedStructuredMessage.md)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedStructuredMessage`](../type-aliases/ParsedStructuredMessage.md)
