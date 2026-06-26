# Interface: MarketplaceSessionSeedApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1327](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1327)

## Properties

### created

> **created**: `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1328](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1328)

***

### event?

> `optional` **event?**: `NostrEvent`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1329](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1329)

## Methods

### ensureCreated()

> **ensureCreated**(`options?`): `Promise`\<[`MarketplaceSessionSeedEnsureResult`](../type-aliases/MarketplaceSessionSeedEnsureResult.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1330](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1330)

#### Parameters

##### options?

[`MarketplaceSessionSeedEnsureOptions`](../type-aliases/MarketplaceSessionSeedEnsureOptions.md)

#### Returns

`Promise`\<[`MarketplaceSessionSeedEnsureResult`](../type-aliases/MarketplaceSessionSeedEnsureResult.md)\>

***

### owns()

> **owns**(`pubkey`, `path?`): `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1331](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1331)

#### Parameters

##### pubkey

`string`

##### path?

[`MarketplaceSessionSeedOwnershipPath`](../type-aliases/MarketplaceSessionSeedOwnershipPath.md)

#### Returns

`boolean`
