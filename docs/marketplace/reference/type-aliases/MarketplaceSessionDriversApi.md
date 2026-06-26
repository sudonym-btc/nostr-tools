# Type Alias: MarketplaceSessionDriversApi

> **MarketplaceSessionDriversApi** = `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:713](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L713)

## Properties

### all

> `readonly` **all**: [`MarketplaceSessionDriver`](MarketplaceSessionDriver.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:714](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L714)

***

### auctions

> `readonly` **auctions**: [`MarketplaceSessionDriver`](MarketplaceSessionDriver.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:716](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L716)

***

### orders

> `readonly` **orders**: [`MarketplaceSessionDriver`](MarketplaceSessionDriver.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:715](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L715)

## Methods

### byId()

> **byId**(`id`): [`MarketplaceSessionDriver`](MarketplaceSessionDriver.md) \| `undefined`

Defined in: [nostr-tools/marketplace/runtime-types.ts:717](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L717)

#### Parameters

##### id

`string`

#### Returns

[`MarketplaceSessionDriver`](MarketplaceSessionDriver.md) \| `undefined`

***

### each()

> **each**(`callback`): `void`

Defined in: [nostr-tools/marketplace/runtime-types.ts:718](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L718)

#### Parameters

##### callback

(`driver`) => `void`

#### Returns

`void`
