# Interface: MarketplaceSessionSeedApi

## Properties

### created

> **created**: `boolean`

***

### event?

> `optional` **event?**: `NostrEvent`

## Methods

### ensureCreated()

> **ensureCreated**(`options?`): `Promise`\<[`MarketplaceSessionSeedEnsureResult`](../type-aliases/MarketplaceSessionSeedEnsureResult.md)\>

#### Parameters

##### options?

[`MarketplaceSessionSeedEnsureOptions`](../type-aliases/MarketplaceSessionSeedEnsureOptions.md)

#### Returns

`Promise`\<[`MarketplaceSessionSeedEnsureResult`](../type-aliases/MarketplaceSessionSeedEnsureResult.md)\>

***

### owns()

> **owns**(`pubkey`, `path?`): `boolean`

#### Parameters

##### pubkey

`string`

##### path?

[`MarketplaceSessionSeedOwnershipPath`](../type-aliases/MarketplaceSessionSeedOwnershipPath.md)

#### Returns

`boolean`
