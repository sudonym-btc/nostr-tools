# Interface: MarketplaceShippingOptionApi

## Properties

### address

> **address**: (`option`) => `string`

#### Parameters

##### option

`NostrEvent` \| [`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

#### Returns

`string`

***

### filter

> **filter**: (`query`) => `Filter`

#### Parameters

##### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md) = `{}`

#### Returns

`Filter`

***

### filters

> **filters**: `object`

#### search

> **search**: (`query`) => `Filter`

##### Parameters

###### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md) = `{}`

##### Returns

`Filter`

***

### kind

> **kind**: `30406`

***

### parse

> **parse**: (`event`) => [`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

***

### template

> **template**: (`option`) => `EventTemplate`

#### Parameters

##### option

[`MarketplaceShippingOptionTemplate`](../type-aliases/MarketplaceShippingOptionTemplate.md)

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

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)[]\>

#### Parameters

##### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md)

##### options?

[`ShippingOptionSearchOptions`](../type-aliases/ShippingOptionSearchOptions.md)

#### Returns

`Promise`\<[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)[]\>
