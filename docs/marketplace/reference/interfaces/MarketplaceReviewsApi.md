# Interface: MarketplaceReviewsApi

## Properties

### parse

> **parse**: (`event`) => [`ParsedReview`](../type-aliases/ParsedReview.md)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedReview`](../type-aliases/ParsedReview.md)

***

### resolveProof

> **resolveProof**: (`review`) => [`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)

#### Parameters

##### review

[`ParsedReview`](../type-aliases/ParsedReview.md)

#### Returns

[`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)

***

### revealedBuyerPubkey

> **revealedBuyerPubkey**: (`review`) => `string` \| `undefined`

#### Parameters

##### review

[`ParsedReview`](../type-aliases/ParsedReview.md)

#### Returns

`string` \| `undefined`

***

### template

> **template**: (`review`) => `EventTemplate`

#### Parameters

##### review

[`ReviewTemplate`](../type-aliases/ReviewTemplate.md)

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

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedReview`](../type-aliases/ParsedReview.md)[]\>

#### Parameters

##### query?

[`ReviewSearchQuery`](../type-aliases/ReviewSearchQuery.md)

##### options?

[`ReviewSearchOptions`](../type-aliases/ReviewSearchOptions.md)

#### Returns

`Promise`\<[`ParsedReview`](../type-aliases/ParsedReview.md)[]\>
