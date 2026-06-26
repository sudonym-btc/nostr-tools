# Variable: reviews

> `const` **reviews**: `object`

Defined in: [nostr-tools/marketplace/review.ts:183](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/review.ts#L183)

## Type Declaration

### filter

> **filter**: (`query`) => `Filter` = `reviewSearchFilter`

#### Parameters

##### query?

[`ReviewSearchQuery`](../type-aliases/ReviewSearchQuery.md) = `{}`

#### Returns

`Filter`

### parse

> **parse**: (`event`) => [`ParsedReview`](../type-aliases/ParsedReview.md) = `parseReviewEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedReview`](../type-aliases/ParsedReview.md)

### resolveProof

> **resolveProof**: (`review`) => [`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md) = `resolveReviewProof`

#### Parameters

##### review

[`ParsedReview`](../type-aliases/ParsedReview.md)

#### Returns

[`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)

### revealedBuyerPubkey

> **revealedBuyerPubkey**: (`review`) => `string` \| `undefined` = `revealedReviewBuyerPubkey`

#### Parameters

##### review

[`ParsedReview`](../type-aliases/ParsedReview.md)

#### Returns

`string` \| `undefined`

### search

> **search**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`ParsedReview`](../type-aliases/ParsedReview.md)[]\> = `searchReviews`

#### Parameters

##### pool

`ReviewQueryPool`

##### relays

`string`[]

##### query?

[`ReviewSearchQuery`](../type-aliases/ReviewSearchQuery.md) = `{}`

##### options?

[`ReviewSearchOptions`](../type-aliases/ReviewSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`ParsedReview`](../type-aliases/ParsedReview.md)[]\>

### template

> **template**: (`review`) => `EventTemplate` = `generateReviewEventTemplate`

#### Parameters

##### review

[`ReviewTemplate`](../type-aliases/ReviewTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validateReviewEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
