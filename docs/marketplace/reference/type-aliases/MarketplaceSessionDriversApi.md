# Type Alias: MarketplaceSessionDriversApi

> **MarketplaceSessionDriversApi** = `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:710](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L710)

## Properties

### all

> `readonly` **all**: [`MarketplaceSessionDriver`](MarketplaceSessionDriver.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:711](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L711)

***

### auctions

> `readonly` **auctions**: [`MarketplaceSessionDriver`](MarketplaceSessionDriver.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:713](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L713)

***

### orders

> `readonly` **orders**: [`MarketplaceSessionDriver`](MarketplaceSessionDriver.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:712](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L712)

## Methods

### byId()

> **byId**(`id`): [`MarketplaceSessionDriver`](MarketplaceSessionDriver.md) \| `undefined`

Defined in: [nostr-tools/marketplace/runtime-types.ts:714](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L714)

#### Parameters

##### id

`string`

#### Returns

[`MarketplaceSessionDriver`](MarketplaceSessionDriver.md) \| `undefined`

***

### each()

> **each**(`callback`): `void`

Defined in: [nostr-tools/marketplace/runtime-types.ts:715](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L715)

#### Parameters

##### callback

(`driver`) => `void`

#### Returns

`void`
