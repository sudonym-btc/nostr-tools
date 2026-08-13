# Variable: accommodationListings

> `const` **accommodationListings**: `object`

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
