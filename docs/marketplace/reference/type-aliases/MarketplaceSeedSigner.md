# Type Alias: MarketplaceSeedSigner

> **MarketplaceSeedSigner** = `object`

## Properties

### getPublicKey?

> `optional` **getPublicKey?**: () => `string` \| `Promise`\<`string`\>

#### Returns

`string` \| `Promise`\<`string`\>

***

### nip44Decrypt

> **nip44Decrypt**: (`pubkey`, `ciphertext`) => `string` \| `Promise`\<`string`\>

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

#### Parameters

##### event

`EventTemplate`

#### Returns

`Event` \| `VerifiedEvent` \| `Promise`\<`Event` \| `VerifiedEvent`\>
