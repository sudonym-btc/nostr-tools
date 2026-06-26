# Interface: MarketplaceArbitrationServiceSelectionsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:949](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L949)

## Properties

### parse

> **parse**: (`event`) => [`ParsedArbitrationServiceSelection`](../type-aliases/ParsedArbitrationServiceSelection.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:950](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L950)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedArbitrationServiceSelection`](../type-aliases/ParsedArbitrationServiceSelection.md)

***

### template

> **template**: (`selection`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:952](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L952)

#### Parameters

##### selection

[`ArbitrationServiceSelectionTemplate`](../type-aliases/ArbitrationServiceSelectionTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:951](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L951)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
