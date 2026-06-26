# Type Alias: MarketplaceInboxSigner

> **MarketplaceInboxSigner** = `object`

Defined in: [nostr-tools/marketplace/inbox.ts:12](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/inbox.ts#L12)

## Properties

### getPublicKey?

> `optional` **getPublicKey?**: () => `string` \| `Promise`\<`string`\>

Defined in: [nostr-tools/marketplace/inbox.ts:13](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/inbox.ts#L13)

#### Returns

`string` \| `Promise`\<`string`\>

***

### nip44Decrypt

> **nip44Decrypt**: (`pubkey`, `ciphertext`) => `string` \| `Promise`\<`string`\>

Defined in: [nostr-tools/marketplace/inbox.ts:14](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/inbox.ts#L14)

#### Parameters

##### pubkey

`string`

##### ciphertext

`string`

#### Returns

`string` \| `Promise`\<`string`\>
