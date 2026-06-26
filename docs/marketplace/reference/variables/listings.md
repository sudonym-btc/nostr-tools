# Variable: listings

> `const` **listings**: `object`

Defined in: [nostr-tools/marketplace/listing.ts:375](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/listing.ts#L375)

## Type Declaration

### anchor

> **anchor**: (`listing`) => `string` = `listingAnchor`

#### Parameters

##### listing

`NostrEvent` \| [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

#### Returns

`string`

### filters

> **filters**: `object`

#### filters.search

> **search**: (`query`) => `Filter` = `listingSearchFilter`

##### Parameters

###### query?

[`ListingSearchQuery`](../type-aliases/ListingSearchQuery.md) = `{}`

##### Returns

`Filter`

### findByAnchor

> **findByAnchor**: (`pool`, `relays`, `anchor`, `options`) => `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\> = `findListingByAnchor`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### anchor

`string`

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

### findById

> **findById**: (`pool`, `relays`, `id`, `options`) => `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\> = `findListingById`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### id

`string`

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

### findOne

> **findOne**: (`pool`, `relays`, `pubkey`, `query`, `options`) => `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\> = `findListing`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### pubkey

`string`

##### query?

`Omit`\<[`ListingSearchQuery`](../type-aliases/ListingSearchQuery.md), `"authors"` \| `"limit"`\> = `{}`

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

### parse

> **parse**: (`event`) => [`MarketplaceListing`](../type-aliases/MarketplaceListing.md) = `parseListingEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

### price

> **price**: (`listing`, `options`) => [`MarketplaceAmount`](../type-aliases/MarketplaceAmount.md) = `listingPriceAmount`

#### Parameters

##### listing

[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

##### options?

[`MarketplaceListingPriceOptions`](../type-aliases/MarketplaceListingPriceOptions.md) = `{}`

#### Returns

[`MarketplaceAmount`](../type-aliases/MarketplaceAmount.md)

### search

> **search**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)[]\> = `searchListings`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### query?

[`ListingSearchQuery`](../type-aliases/ListingSearchQuery.md) = `{}`

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)[]\>

### template

> **template**: (`listing`) => `EventTemplate` = `generateListingEventTemplate`

#### Parameters

##### listing

[`MarketplaceListingTemplate`](../type-aliases/MarketplaceListingTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validateListingEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
