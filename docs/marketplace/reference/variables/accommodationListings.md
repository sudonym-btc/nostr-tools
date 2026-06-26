# Variable: accommodationListings

> `const` **accommodationListings**: `object`

Defined in: [nostr-tools/marketplace/listing/accommodation.ts:170](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/listing/accommodation.ts#L170)

## Type Declaration

### filters

> **filters**: `object`

#### filters.search

> **search**: (`query`) => `Filter` = `accommodationListingSearchFilter`

##### Parameters

###### query?

[`AccommodationListingSearchQuery`](../type-aliases/AccommodationListingSearchQuery.md) = `{}`

##### Returns

`Filter`

### parse

> **parse**: (`event`) => [`AccommodationMarketplaceListing`](../type-aliases/AccommodationMarketplaceListing.md) = `parseAccommodationListingEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`AccommodationMarketplaceListing`](../type-aliases/AccommodationMarketplaceListing.md)

### search

> **search**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`AccommodationMarketplaceListing`](../type-aliases/AccommodationMarketplaceListing.md)[]\> = `searchAccommodationListings`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### query?

[`AccommodationListingSearchQuery`](../type-aliases/AccommodationListingSearchQuery.md) = `{}`

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`AccommodationMarketplaceListing`](../type-aliases/AccommodationMarketplaceListing.md)[]\>

### template

> **template**: (`listing`) => `EventTemplate` = `generateAccommodationListingEventTemplate`

#### Parameters

##### listing

[`AccommodationListingTemplate`](../type-aliases/AccommodationListingTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validateAccommodationListingEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
