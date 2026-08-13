# Variable: shippingOption

> `const` **shippingOption**: `object`

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
