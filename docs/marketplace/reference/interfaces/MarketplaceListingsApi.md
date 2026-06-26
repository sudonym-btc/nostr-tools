# Interface: MarketplaceListingsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:904](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L904)

## Properties

### anchor

> **anchor**: (`listing`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:905](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L905)

#### Parameters

##### listing

`NostrEvent` \| [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

#### Returns

`string`

***

### create

> **create**: (`listing`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:908](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L908)

#### Parameters

##### listing

[`MarketplaceListingTemplate`](../type-aliases/MarketplaceListingTemplate.md)

#### Returns

`EventTemplate`

***

### filters

> **filters**: `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:910](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L910)

#### search

> **search**: (`query`) => `Filter`

##### Parameters

###### query?

[`ListingSearchQuery`](../type-aliases/ListingSearchQuery.md) = `{}`

##### Returns

`Filter`

***

### parse

> **parse**: (`event`) => [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:906](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L906)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

***

### price

> **price**: (`listing`, `options`) => [`MarketplaceAmount`](../type-aliases/MarketplaceAmount.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:911](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L911)

#### Parameters

##### listing

[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

##### options?

[`MarketplaceListingPriceOptions`](../type-aliases/MarketplaceListingPriceOptions.md) = `{}`

#### Returns

[`MarketplaceAmount`](../type-aliases/MarketplaceAmount.md)

***

### template

> **template**: (`listing`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:909](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L909)

#### Parameters

##### listing

[`MarketplaceListingTemplate`](../type-aliases/MarketplaceListingTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:907](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L907)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### findByAnchor()

> **findByAnchor**(`anchor`, `options?`): `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:918](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L918)

#### Parameters

##### anchor

`string`

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md)

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

***

### findById()

> **findById**(`id`, `options?`): `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:917](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L917)

#### Parameters

##### id

`string`

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md)

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

***

### findOne()

> **findOne**(`pubkey`, `query?`, `options?`): `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:912](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L912)

#### Parameters

##### pubkey

`string`

##### query?

`Omit`\<[`ListingSearchQuery`](../type-aliases/ListingSearchQuery.md), `"authors"` \| `"limit"`\>

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md)

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

***

### search()

> **search**(`query?`, `options?`): `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:919](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L919)

#### Parameters

##### query?

[`ListingSearchQuery`](../type-aliases/ListingSearchQuery.md)

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md)

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)[]\>
