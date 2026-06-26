# Interface: MarketplaceSessionSeedApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1330](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1330)

## Properties

### created

> **created**: `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1331](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1331)

***

### event?

> `optional` **event?**: `NostrEvent`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1332](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1332)

## Methods

### ensureCreated()

> **ensureCreated**(`options?`): `Promise`\<[`MarketplaceSessionSeedEnsureResult`](../type-aliases/MarketplaceSessionSeedEnsureResult.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1333](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1333)

#### Parameters

##### options?

[`MarketplaceSessionSeedEnsureOptions`](../type-aliases/MarketplaceSessionSeedEnsureOptions.md)

#### Returns

`Promise`\<[`MarketplaceSessionSeedEnsureResult`](../type-aliases/MarketplaceSessionSeedEnsureResult.md)\>

***

### owns()

> **owns**(`pubkey`, `path?`): `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1334](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1334)

#### Parameters

##### pubkey

`string`

##### path?

[`MarketplaceSessionSeedOwnershipPath`](../type-aliases/MarketplaceSessionSeedOwnershipPath.md)

#### Returns

`boolean`
