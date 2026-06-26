# Variable: participantProofs

> `const` **participantProofs**: `object`

Defined in: [nostr-tools/marketplace/participant-proof.ts:366](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/participant-proof.ts#L366)

## Type Declaration

### disclosureKeyWrap

> **disclosureKeyWrap**: (`opts`) => `ProofDisclosureKeyTag` = `proofDisclosureKeyWrap`

#### Parameters

##### opts

###### disclosureKey

`Uint8Array`

###### proofId

`string`

###### recipientPubkey

`string`

###### senderSecretKey

`Uint8Array`

#### Returns

`ProofDisclosureKeyTag`

### hashPayload

> **hashPayload**: (`payload`) => `string` = `hashParticipantProofPayload`

#### Parameters

##### payload

`string`

#### Returns

`string`

### keyTag

> **keyTag**: (`key`) => `string`[] = `participantProofKeyTag`

#### Parameters

##### key

`ProofDisclosureKeyTag`

#### Returns

`string`[]

### keyWrap

> **keyWrap**: (`opts`) => `ProofDisclosureKeyTag` = `participantProofKeyWrap`

#### Parameters

##### opts

###### disclosureKey

`Uint8Array`

###### proofId

`string`

###### recipientPubkey

`string`

###### senderSecretKey

`Uint8Array`

#### Returns

`ProofDisclosureKeyTag`

### openPayload

> **openPayload**: (`payload`, `disclosureKey`) => `string` = `openSealedProofPayload`

#### Parameters

##### payload

`string`

##### disclosureKey

`Uint8Array`

#### Returns

`string`

### parseKeyTag

> **parseKeyTag**: (`tag`) => `ProofDisclosureKeyTag` \| `null` = `parseParticipantProofKeyTag`

#### Parameters

##### tag

`string`[]

#### Returns

`ProofDisclosureKeyTag` \| `null`

### parseProofTag

> **parseProofTag**: (`tag`) => [`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md) \| `null` = `parseParticipantProofTag`

#### Parameters

##### tag

`string`[]

#### Returns

[`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md) \| `null`

### proofTag

> **proofTag**: (`proof`) => `string`[] = `participantProofTag`

#### Parameters

##### proof

[`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md)

#### Returns

`string`[]

### publicProof

> **publicProof**: (`authorization`) => [`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md) = `publicParticipantProof`

#### Parameters

##### authorization

`string` \| `NostrEvent`

#### Returns

[`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md)

### resolve

> **resolve**: (`proof`, `context`, `options`) => `Promise`\<[`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)\> = `resolveParticipantProof`

#### Parameters

##### proof

[`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md)

##### context

[`ParticipantProofContext`](../type-aliases/ParticipantProofContext.md)

##### options?

[`ResolveParticipantProofOptions`](../type-aliases/ResolveParticipantProofOptions.md) = `{}`

#### Returns

`Promise`\<[`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)\>

### resolvePublic

> **resolvePublic**: (`proof`, `context`) => [`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md) = `resolvePublicParticipantProof`

#### Parameters

##### proof

[`ParticipantProofTag`](../type-aliases/ParticipantProofTag.md)

##### context

[`ParticipantProofContext`](../type-aliases/ParticipantProofContext.md)

#### Returns

[`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)

### sealedProof

> **sealedProof**: (`authorization`, `disclosureKey`) => [`SealedParticipantProof`](../type-aliases/SealedParticipantProof.md) = `sealedParticipantProof`

#### Parameters

##### authorization

`string` \| `NostrEvent`

##### disclosureKey?

`Uint8Array` = `...`

#### Returns

[`SealedParticipantProof`](../type-aliases/SealedParticipantProof.md)

### sealPayload

> **sealPayload**: (`payload`, `disclosureKey`) => `SealedProofPayload` = `sealProofPayload`

#### Parameters

##### payload

`string`

##### disclosureKey?

`Uint8Array` = `...`

#### Returns

`SealedProofPayload`

### tradeKeyAuthorizationTemplate

> **tradeKeyAuthorizationTemplate**: (`auth`) => `EventTemplate` = `generateTradeKeyAuthorizationEventTemplate`

#### Parameters

##### auth

[`TradeKeyAuthorizationTemplate`](../type-aliases/TradeKeyAuthorizationTemplate.md)

#### Returns

`EventTemplate`

### unwrapDisclosureKey

> **unwrapDisclosureKey**: (`proofId`, `options`) => `Promise`\<`Uint8Array`\<`ArrayBufferLike`\> \| `undefined`\> = `unwrapProofDisclosureKey`

#### Parameters

##### proofId

`string`

##### options

[`ResolveParticipantProofOptions`](../type-aliases/ResolveParticipantProofOptions.md)

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\> \| `undefined`\>

### validateAuthorization

> **validateAuthorization**: (`authorization`, `context`) => [`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md) = `validateTradeKeyAuthorization`

#### Parameters

##### authorization

`NostrEvent`

##### context

[`ParticipantProofContext`](../type-aliases/ParticipantProofContext.md)

#### Returns

[`ParticipantProofResolution`](../type-aliases/ParticipantProofResolution.md)
