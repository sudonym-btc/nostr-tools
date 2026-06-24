# Interface: MarketplaceReviewsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1007](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1007)

## Properties

### parse

> **parse**: (`event`) => [`ParsedReview`](../type-aliases/ParsedReview.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1008](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1008)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedReview`](../type-aliases/ParsedReview.md)

***

### resolveProof

> **resolveProof**: (`review`) => [`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1011](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1011)

#### Parameters

##### review

[`ParsedReview`](../type-aliases/ParsedReview.md)

#### Returns

[`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)

***

### revealedBuyerPubkey

> **revealedBuyerPubkey**: (`review`) => `string` \| `undefined`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1012](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1012)

#### Parameters

##### review

[`ParsedReview`](../type-aliases/ParsedReview.md)

#### Returns

`string` \| `undefined`

***

### template

> **template**: (`review`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1010](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1010)

#### Parameters

##### review

[`ReviewTemplate`](../type-aliases/ReviewTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1009](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1009)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedReview`](../type-aliases/ParsedReview.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1013](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1013)

#### Parameters

##### query?

[`ReviewSearchQuery`](../type-aliases/ReviewSearchQuery.md)

##### options?

[`ReviewSearchOptions`](../type-aliases/ReviewSearchOptions.md)

#### Returns

`Promise`\<[`ParsedReview`](../type-aliases/ParsedReview.md)[]\>
