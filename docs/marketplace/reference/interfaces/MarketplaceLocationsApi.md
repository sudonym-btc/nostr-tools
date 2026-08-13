# Interface: MarketplaceLocationsApi

## Extends

- [`MarketplaceLocationProvider`](MarketplaceLocationProvider.md)

## Methods

### coverArea()

> **coverArea**(`area`): `Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

#### Parameters

##### area

`string`

#### Returns

`Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

#### Inherited from

[`MarketplaceLocationProvider`](MarketplaceLocationProvider.md).[`coverArea`](MarketplaceLocationProvider.md#coverarea)

***

### gTags()

> **gTags**(`cells`): [`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]

#### Parameters

##### cells

`Iterable`\<`string`\>

#### Returns

[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]

***

### hierarchyForAddress()

> **hierarchyForAddress**(`address`): `Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

#### Parameters

##### address

`string`

#### Returns

`Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

#### Inherited from

[`MarketplaceLocationProvider`](MarketplaceLocationProvider.md).[`hierarchyForAddress`](MarketplaceLocationProvider.md#hierarchyforaddress)
