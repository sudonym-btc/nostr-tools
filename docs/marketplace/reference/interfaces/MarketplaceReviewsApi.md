# Interface: MarketplaceReviewsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1010](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1010)

## Properties

### parse

> **parse**: (`event`) => [`ParsedReview`](../type-aliases/ParsedReview.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1011](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1011)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedReview`](../type-aliases/ParsedReview.md)

***

### resolveProof

> **resolveProof**: (`review`) => [`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1014](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1014)

#### Parameters

##### review

[`ParsedReview`](../type-aliases/ParsedReview.md)

#### Returns

[`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)

***

### revealedBuyerPubkey

> **revealedBuyerPubkey**: (`review`) => `string` \| `undefined`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1015](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1015)

#### Parameters

##### review

[`ParsedReview`](../type-aliases/ParsedReview.md)

#### Returns

`string` \| `undefined`

***

### template

> **template**: (`review`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1013](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1013)

#### Parameters

##### review

[`ReviewTemplate`](../type-aliases/ReviewTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1012](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1012)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedReview`](../type-aliases/ParsedReview.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1016](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1016)

#### Parameters

##### query?

[`ReviewSearchQuery`](../type-aliases/ReviewSearchQuery.md)

##### options?

[`ReviewSearchOptions`](../type-aliases/ReviewSearchOptions.md)

#### Returns

`Promise`\<[`ParsedReview`](../type-aliases/ParsedReview.md)[]\>
