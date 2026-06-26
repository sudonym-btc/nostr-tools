# Type Alias: MarketplaceSeedSigner

> **MarketplaceSeedSigner** = `object`

Defined in: [nostr-tools/marketplace/seed.ts:69](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/seed.ts#L69)

## Properties

### getPublicKey?

> `optional` **getPublicKey?**: () => `string` \| `Promise`\<`string`\>

Defined in: [nostr-tools/marketplace/seed.ts:70](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/seed.ts#L70)

#### Returns

`string` \| `Promise`\<`string`\>

***

### nip44Decrypt

> **nip44Decrypt**: (`pubkey`, `ciphertext`) => `string` \| `Promise`\<`string`\>

Defined in: [nostr-tools/marketplace/seed.ts:72](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/seed.ts#L72)

#### Parameters

##### pubkey

`string`

##### ciphertext

`string`

#### Returns

`string` \| `Promise`\<`string`\>

***

### nip44Encrypt

> **nip44Encrypt**: (`pubkey`, `plaintext`) => `string` \| `Promise`\<`string`\>

Defined in: [nostr-tools/marketplace/seed.ts:71](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/seed.ts#L71)

#### Parameters

##### pubkey

`string`

##### plaintext

`string`

#### Returns

`string` \| `Promise`\<`string`\>

***

### signEvent

> **signEvent**: (`event`) => `Event` \| `VerifiedEvent` \| `Promise`\<`Event` \| `VerifiedEvent`\>

Defined in: [nostr-tools/marketplace/seed.ts:73](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/seed.ts#L73)

#### Parameters

##### event

`EventTemplate`

#### Returns

`Event` \| `VerifiedEvent` \| `Promise`\<`Event` \| `VerifiedEvent`\>
