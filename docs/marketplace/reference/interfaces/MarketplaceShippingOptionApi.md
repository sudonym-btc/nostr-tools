# Interface: MarketplaceShippingOptionApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:919](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L919)

## Properties

### address

> **address**: (`option`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:923](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L923)

#### Parameters

##### option

`NostrEvent` \| [`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

#### Returns

`string`

***

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:925](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L925)

#### Parameters

##### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md) = `{}`

#### Returns

`Filter`

***

### filters

> **filters**: `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:926](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L926)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:920](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L920)

***

### parse

> **parse**: (`event`) => [`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:921](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L921)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

***

### template

> **template**: (`option`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:924](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L924)

#### Parameters

##### option

[`MarketplaceShippingOptionTemplate`](../type-aliases/MarketplaceShippingOptionTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:922](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L922)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:927](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L927)

#### Parameters

##### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md)

##### options?

[`ShippingOptionSearchOptions`](../type-aliases/ShippingOptionSearchOptions.md)

#### Returns

`Promise`\<[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)[]\>
