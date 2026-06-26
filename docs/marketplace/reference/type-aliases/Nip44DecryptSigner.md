# Type Alias: Nip44DecryptSigner

> **Nip44DecryptSigner** = `object`

Defined in: [nostr-tools/marketplace/order-group-types.ts:41](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L41)

## Properties

### getPublicKey?

> `optional` **getPublicKey?**: () => `Promise`\<`string`\> \| `string`

Defined in: [nostr-tools/marketplace/order-group-types.ts:42](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L42)

#### Returns

`Promise`\<`string`\> \| `string`

***

### nip44Decrypt

> **nip44Decrypt**: (`pubkey`, `ciphertext`) => `Promise`\<`string`\> \| `string`

Defined in: [nostr-tools/marketplace/order-group-types.ts:43](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L43)

#### Parameters

##### pubkey

`string`

##### ciphertext

`string`

#### Returns

`Promise`\<`string`\> \| `string`
