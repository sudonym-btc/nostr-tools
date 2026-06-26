# Type Alias: ParticipantProofDecryptSigner

> **ParticipantProofDecryptSigner** = `object`

Defined in: [nostr-tools/marketplace/participant-proof.ts:71](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/participant-proof.ts#L71)

## Properties

### getPublicKey?

> `optional` **getPublicKey?**: () => `Promise`\<`string`\> \| `string`

Defined in: [nostr-tools/marketplace/participant-proof.ts:72](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/participant-proof.ts#L72)

#### Returns

`Promise`\<`string`\> \| `string`

***

### nip44Decrypt

> **nip44Decrypt**: (`pubkey`, `ciphertext`) => `Promise`\<`string`\> \| `string`

Defined in: [nostr-tools/marketplace/participant-proof.ts:73](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/participant-proof.ts#L73)

#### Parameters

##### pubkey

`string`

##### ciphertext

`string`

#### Returns

`Promise`\<`string`\> \| `string`
