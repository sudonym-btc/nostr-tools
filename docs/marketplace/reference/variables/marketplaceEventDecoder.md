# Variable: marketplaceEventDecoder

> `const` **marketplaceEventDecoder**: `object`

Defined in: [nostr-tools/marketplace/event-decoder.ts:45](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/event-decoder.ts#L45)

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
