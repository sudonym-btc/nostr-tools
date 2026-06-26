# Type Alias: OrderTemplate

> **OrderTemplate** = `Omit`\<[`OrderContent`](OrderContent.md), `"quantity"`\> & `object`

Defined in: [nostr-tools/marketplace/order.ts:92](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/order.ts#L92)

## Type Declaration

### createdAt?

> `optional` **createdAt?**: `number`

### extraTags?

> `optional` **extraTags?**: `string`[][]

### listingAnchor

> **listingAnchor**: `string`

### participantProofKeys?

> `optional` **participantProofKeys?**: [`ParticipantProofKeyTag`](ParticipantProofKeyTag.md)[]

### participantProofs?

> `optional` **participantProofs?**: [`ParticipantProofTag`](ParticipantProofTag.md)[]

### participants?

> `optional` **participants?**: [`MarketplaceParticipantTag`](MarketplaceParticipantTag.md)[]

### publishedAt?

> `optional` **publishedAt?**: `number`

### quantity?

> `optional` **quantity?**: `number`

### tradeId

> **tradeId**: `string`
