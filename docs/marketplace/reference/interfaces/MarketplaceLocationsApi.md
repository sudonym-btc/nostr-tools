# Interface: MarketplaceLocationsApi

Defined in: [nostr-tools/marketplace/location.ts:16](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/location.ts#L16)

## Extends

- [`MarketplaceLocationProvider`](MarketplaceLocationProvider.md)

## Methods

### coverArea()

> **coverArea**(`area`): `Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

Defined in: [marketplace-location-interface-ts/dist/index.d.ts:23](https://github.com/sudonym-btc/marketplace-location-interface-ts/blob/7ba16fbb299f86967d1636387915a696af17abde/dist/index.d.ts#L23)

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

Defined in: [nostr-tools/marketplace/location.ts:17](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/location.ts#L17)

#### Parameters

##### cells

`Iterable`\<`string`\>

#### Returns

[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]

***

### hierarchyForAddress()

> **hierarchyForAddress**(`address`): `Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

Defined in: [marketplace-location-interface-ts/dist/index.d.ts:22](https://github.com/sudonym-btc/marketplace-location-interface-ts/blob/7ba16fbb299f86967d1636387915a696af17abde/dist/index.d.ts#L22)

#### Parameters

##### address

`string`

#### Returns

`Promise`\<[`MarketplaceLocationGTag`](../type-aliases/MarketplaceLocationGTag.md)[]\>

#### Inherited from

[`MarketplaceLocationProvider`](MarketplaceLocationProvider.md).[`hierarchyForAddress`](MarketplaceLocationProvider.md#hierarchyforaddress)
