# Variable: accommodationListings

> `const` **accommodationListings**: `object`

Defined in: [nostr-tools/marketplace/listing/accommodation.ts:170](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/listing/accommodation.ts#L170)

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
