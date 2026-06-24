# Type Alias: Nip44DecryptSigner

> **Nip44DecryptSigner** = `object`

Defined in: [nostr-tools/marketplace/order-group-types.ts:41](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/order-group-types.ts#L41)

## Properties

### getPublicKey?

> `optional` **getPublicKey?**: () => `Promise`\<`string`\> \| `string`

Defined in: [nostr-tools/marketplace/order-group-types.ts:42](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/order-group-types.ts#L42)

#### Returns

`Promise`\<`string`\> \| `string`

***

### nip44Decrypt

> **nip44Decrypt**: (`pubkey`, `ciphertext`) => `Promise`\<`string`\> \| `string`

Defined in: [nostr-tools/marketplace/order-group-types.ts:43](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/order-group-types.ts#L43)

#### Parameters

##### pubkey

`string`

##### ciphertext

`string`

#### Returns

`Promise`\<`string`\> \| `string`
