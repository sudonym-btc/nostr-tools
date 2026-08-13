# Variable: marketplaceEventDecoder

> `const` **marketplaceEventDecoder**: `object`

## Type Declaration

### decode

> **decode**: \<`T`\>(`event`, `parse`, `options`) => [`MarketplaceEventParseResult`](../type-aliases/MarketplaceEventParseResult.md)\<`T`\> = `decodeMarketplaceEvent`

#### Type Parameters

##### T

`T`

#### Parameters

##### event

`NostrEvent`

##### parse

(`event`) => `T`

##### options

[`MarketplaceEventDecodeOptions`](../type-aliases/MarketplaceEventDecodeOptions.md)

#### Returns

[`MarketplaceEventParseResult`](../type-aliases/MarketplaceEventParseResult.md)\<`T`\>
