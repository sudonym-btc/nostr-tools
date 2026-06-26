# Interface: MarketplaceShippingOptionApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:922](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L922)

## Properties

### address

> **address**: (`option`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:926](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L926)

#### Parameters

##### option

`NostrEvent` \| [`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

#### Returns

`string`

***

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:928](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L928)

#### Parameters

##### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md) = `{}`

#### Returns

`Filter`

***

### filters

> **filters**: `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:929](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L929)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:923](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L923)

***

### parse

> **parse**: (`event`) => [`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:924](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L924)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)

***

### template

> **template**: (`option`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:927](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L927)

#### Parameters

##### option

[`MarketplaceShippingOptionTemplate`](../type-aliases/MarketplaceShippingOptionTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:925](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L925)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:930](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L930)

#### Parameters

##### query?

[`ShippingOptionSearchQuery`](../type-aliases/ShippingOptionSearchQuery.md)

##### options?

[`ShippingOptionSearchOptions`](../type-aliases/ShippingOptionSearchOptions.md)

#### Returns

`Promise`\<[`ParsedMarketplaceShippingOption`](../type-aliases/ParsedMarketplaceShippingOption.md)[]\>
