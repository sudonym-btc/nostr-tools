# Variable: marketplaceEventDecoder

> `const` **marketplaceEventDecoder**: `object`

Defined in: [nostr-tools/marketplace/event-decoder.ts:45](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/event-decoder.ts#L45)

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
