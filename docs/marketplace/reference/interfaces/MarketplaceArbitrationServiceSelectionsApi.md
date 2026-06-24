# Interface: MarketplaceArbitrationServiceSelectionsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:949](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L949)

## Properties

### parse

> **parse**: (`event`) => [`ParsedArbitrationServiceSelection`](../type-aliases/ParsedArbitrationServiceSelection.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:950](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L950)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedArbitrationServiceSelection`](../type-aliases/ParsedArbitrationServiceSelection.md)

***

### template

> **template**: (`selection`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:952](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L952)

#### Parameters

##### selection

[`ArbitrationServiceSelectionTemplate`](../type-aliases/ArbitrationServiceSelectionTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:951](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L951)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
