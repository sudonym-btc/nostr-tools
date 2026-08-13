# Interface: MarketplaceListingsApi

## Properties

### anchor

> **anchor**: (`listing`) => `string`

#### Parameters

##### listing

`NostrEvent` \| [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

#### Returns

`string`

***

### create

> **create**: (`listing`) => `EventTemplate`

#### Parameters

##### listing

[`MarketplaceListingTemplate`](../type-aliases/MarketplaceListingTemplate.md)

#### Returns

`EventTemplate`

***

### filters

> **filters**: `object`

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

#### Parameters

##### event

`NostrEvent`

#### Returns

[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

***

### price

> **price**: (`listing`, `options`) => [`MarketplaceAmount`](../type-aliases/MarketplaceAmount.md)

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

#### Parameters

##### listing

[`MarketplaceListingTemplate`](../type-aliases/MarketplaceListingTemplate.md)

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

### findByAnchor()

> **findByAnchor**(`anchor`, `options?`): `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

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

#### Parameters

##### query?

[`ListingSearchQuery`](../type-aliases/ListingSearchQuery.md)

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md)

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)[]\>
