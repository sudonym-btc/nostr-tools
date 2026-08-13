# Type Alias: ParticipantProofEncryptSigner

> **ParticipantProofEncryptSigner** = `object`

## Properties

### getPublicKey?

> `optional` **getPublicKey?**: () => `Promise`\<`string`\> \| `string`

#### Returns

`Promise`\<`string`\> \| `string`

***

### nip44Encrypt

> **nip44Encrypt**: (`pubkey`, `plaintext`) => `Promise`\<`string`\> \| `string`

#### Parameters

##### pubkey

`string`

##### plaintext

`string`

#### Returns

`Promise`\<`string`\> \| `string`
