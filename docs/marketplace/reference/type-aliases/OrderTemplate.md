# Type Alias: OrderTemplate

> **OrderTemplate** = `Omit`\<[`OrderContent`](OrderContent.md), `"quantity"`\> & `object`

Defined in: [nostr-tools/marketplace/order.ts:92](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/order.ts#L92)

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
