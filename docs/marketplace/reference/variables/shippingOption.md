# Variable: shippingOption

> `const` **shippingOption**: `object`

Defined in: [nostr-tools/marketplace/shipping-option.ts:274](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/shipping-option.ts#L274)

## Type Declaration

### address

> **address**: (`option`) => `string` = `shippingOptionAddress`

#### Parameters

##### option

`NostrEvent` \| [`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

#### Returns

`string`

### filter

> **filter**: (`query`) => `Filter` = `shippingOptionSearchFilter`

#### Parameters

##### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md) = `{}`

#### Returns

`Filter`

### filters

> **filters**: `object`

#### filters.search

> **search**: (`query`) => `Filter` = `shippingOptionSearchFilter`

##### Parameters

###### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md) = `{}`

##### Returns

`Filter`

### kind

> **kind**: `number` = `MarketplaceShippingOption`

### parse

> **parse**: (`event`) => [`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md) = `parseShippingOptionEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

### search

> **search**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)[]\> = `searchShippingOptions`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md) = `{}`

##### options?

[`ShippingOptionSearchOptions`](../type-aliases/ShippingOptionSearchOptions.md) = `{}`

#### Returns

`Promise`\<[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)[]\>

### template

> **template**: (`option`) => `EventTemplate` = `generateShippingOptionEventTemplate`

#### Parameters

##### option

[`MarketplaceShippingOptionTemplate`](../type-aliases/MarketplaceShippingOptionTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validateShippingOptionEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
