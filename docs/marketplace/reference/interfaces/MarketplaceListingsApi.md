# Interface: MarketplaceListingsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:901](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L901)

## Properties

### anchor

> **anchor**: (`listing`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:902](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L902)

#### Parameters

##### listing

`NostrEvent` \| [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

#### Returns

`string`

***

### create

> **create**: (`listing`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:905](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L905)

#### Parameters

##### listing

[`MarketplaceListingTemplate`](../type-aliases/MarketplaceListingTemplate.md)

#### Returns

`EventTemplate`

***

### filters

> **filters**: `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:907](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L907)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:903](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L903)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

***

### price

> **price**: (`listing`, `options`) => [`MarketplaceAmount`](../type-aliases/MarketplaceAmount.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:908](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L908)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:906](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L906)

#### Parameters

##### listing

[`MarketplaceListingTemplate`](../type-aliases/MarketplaceListingTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:904](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L904)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### findByAnchor()

> **findByAnchor**(`anchor`, `options?`): `Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md) \| `null`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:915](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L915)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:914](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L914)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:909](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L909)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:916](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L916)

#### Parameters

##### query?

[`ListingSearchQuery`](../type-aliases/ListingSearchQuery.md)

##### options?

[`ListingSearchOptions`](../type-aliases/ListingSearchOptions.md)

#### Returns

`Promise`\<[`MarketplaceListing`](../type-aliases/MarketplaceListing.md)[]\>
