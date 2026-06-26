# Interface: MarketplaceLocationsApi

Defined in: [nostr-tools/marketplace/location.ts:16](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/location.ts#L16)

## Extends

- [`MarketplaceLocationProvider`](MarketplaceLocationProvider.md)

## Methods

### coverArea()

> **coverArea**(`area`): `Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

Defined in: [marketplace-location-interface-ts/dist/index.d.ts:23](https://github.com/sudonym-btc/marketplace-location-interface-ts/blob/03212e0fc7665e5f6103a8652885545dbfb3a326/dist/index.d.ts#L23)

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

Defined in: [nostr-tools/marketplace/location.ts:17](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/location.ts#L17)

#### Parameters

##### cells

`Iterable`\<`string`\>

#### Returns

[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]

***

### hierarchyForAddress()

> **hierarchyForAddress**(`address`): `Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

Defined in: [marketplace-location-interface-ts/dist/index.d.ts:22](https://github.com/sudonym-btc/marketplace-location-interface-ts/blob/03212e0fc7665e5f6103a8652885545dbfb3a326/dist/index.d.ts#L22)

#### Parameters

##### address

`string`

#### Returns

`Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

#### Inherited from

[`MarketplaceLocationProvider`](MarketplaceLocationProvider.md).[`hierarchyForAddress`](MarketplaceLocationProvider.md#hierarchyforaddress)
