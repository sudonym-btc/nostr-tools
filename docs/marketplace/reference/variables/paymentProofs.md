# Variable: paymentProofs

> `const` **paymentProofs**: `object`

Defined in: [nostr-tools/marketplace/payment-proof.ts:502](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/payment-proof.ts#L502)

## Type Declaration

### build

> **build**: (`proof`, `options`) => `object` = `buildPaymentProofPayload`

#### Parameters

##### proof

[`PaymentProof`](../type-aliases/PaymentProof.md)

##### options

[`BuildPaymentProofPayloadOptions`](../type-aliases/BuildPaymentProofPayloadOptions.md)

#### Returns

`object`

##### paymentProofKeys

> **paymentProofKeys**: `ProofDisclosureKeyTag`[]

##### proof

> **proof**: [`PaymentProof`](../type-aliases/PaymentProof.md) \| [`SealedPaymentProof`](../type-aliases/SealedPaymentProof.md)

### id

> **id**: (`proof`) => `string` = `paymentProofId`

#### Parameters

##### proof

[`PaymentProof`](../type-aliases/PaymentProof.md)

#### Returns

`string`

### isSealed

> **isSealed**: (`value`) => `value is SealedPaymentProof` = `isSealedPaymentProof`

#### Parameters

##### value

`unknown`

#### Returns

`value is SealedPaymentProof`

### isSealedTerms

> **isSealedTerms**: (`value`) => `value is MarketplaceDriverSealedPaymentTerms` = `isSealedPaymentTerms`

#### Parameters

##### value

`unknown`

#### Returns

`value is MarketplaceDriverSealedPaymentTerms`

### keyTag

> **keyTag**: (`key`) => `string`[] = `paymentProofKeyTag`

#### Parameters

##### key

`ProofDisclosureKeyTag`

#### Returns

`string`[]

### paramsDecryptor

> **paramsDecryptor**: (`options`) => `MarketplaceDriverPaymentProofParamsDecryptor` = `paymentProofParamsDecryptor`

#### Parameters

##### options?

[`ResolvePaymentProofOptions`](../type-aliases/ResolvePaymentProofOptions.md) = `{}`

#### Returns

`MarketplaceDriverPaymentProofParamsDecryptor`

### paramsId

> **paramsId**: (`params`) => `string` = `paymentProofParamsId`

#### Parameters

##### params

`Record`\<`string`, `unknown`\>

#### Returns

`string`

### parse

> **parse**: (`json`) => [`PaymentProof`](../type-aliases/PaymentProof.md) \| `null` \| `undefined` = `parsePaymentProof`

#### Parameters

##### json

`unknown`

#### Returns

[`PaymentProof`](../type-aliases/PaymentProof.md) \| `null` \| `undefined`

### parseKeyTag

> **parseKeyTag**: (`tag`) => `ProofDisclosureKeyTag` \| `null` = `parsePaymentProofKeyTag`

#### Parameters

##### tag

`string`[]

#### Returns

`ProofDisclosureKeyTag` \| `null`

### parseSealed

> **parseSealed**: (`value`) => [`SealedPaymentProof`](../type-aliases/SealedPaymentProof.md) \| `undefined` = `parseSealedPaymentProof`

#### Parameters

##### value

`unknown`

#### Returns

[`SealedPaymentProof`](../type-aliases/SealedPaymentProof.md) \| `undefined`

### parseSealedTerms

> **parseSealedTerms**: (`value`) => `MarketplaceDriverSealedPaymentTerms` \| `undefined` = `parseSealedPaymentTerms`

#### Parameters

##### value

`unknown`

#### Returns

`MarketplaceDriverSealedPaymentTerms` \| `undefined`

### resolve

> **resolve**: (`container`, `options`) => `Promise`\<[`PaymentProofResolution`](../type-aliases/PaymentProofResolution.md)\> = `resolvePaymentProof`

#### Parameters

##### container

[`PaymentProofContainer`](../type-aliases/PaymentProofContainer.md)

##### options?

[`ResolvePaymentProofOptions`](../type-aliases/ResolvePaymentProofOptions.md) = `{}`

#### Returns

`Promise`\<[`PaymentProofResolution`](../type-aliases/PaymentProofResolution.md)\>

### resolveEvidence

> **resolveEvidence**: (`proof`, `options`) => `Promise`\<\{ `error?`: `string`; `proof?`: MarketplaceDriverPaymentProof & \{ terms: MarketplaceDriverPaymentTerms; \}; `proofId?`: `string`; `status`: `"invalid"` \| `"not_for_us"` \| `"resolved"`; \}\> = `resolvePaymentProofEvidence`

#### Parameters

##### proof

`MarketplaceDriverPaymentProof`

##### options?

[`ResolvePaymentProofOptions`](../type-aliases/ResolvePaymentProofOptions.md) = `{}`

#### Returns

`Promise`\<\{ `error?`: `string`; `proof?`: MarketplaceDriverPaymentProof & \{ terms: MarketplaceDriverPaymentTerms; \}; `proofId?`: `string`; `status`: `"invalid"` \| `"not_for_us"` \| `"resolved"`; \}\>

### resolveParams

> **resolveParams**: (`proof`, `options`) => `Promise`\<[`PaymentProofParamsResolution`](../type-aliases/PaymentProofParamsResolution.md)\> = `resolvePaymentProofParams`

#### Parameters

##### proof

`MarketplaceDriverPaymentProof`

##### options?

[`ResolvePaymentProofOptions`](../type-aliases/ResolvePaymentProofOptions.md) = `{}`

#### Returns

`Promise`\<[`PaymentProofParamsResolution`](../type-aliases/PaymentProofParamsResolution.md)\>

### resolveTerms

> **resolveTerms**: (`proof`, `options`) => `Promise`\<`PaymentTermsResolution`\> = `resolvePaymentTerms`

#### Parameters

##### proof

`MarketplaceDriverPaymentProof`

##### options?

[`ResolvePaymentProofOptions`](../type-aliases/ResolvePaymentProofOptions.md) = `{}`

#### Returns

`Promise`\<`PaymentTermsResolution`\>

### seal

> **seal**: (`proof`, `disclosureKey?`) => `object` = `sealPaymentProof`

#### Parameters

##### proof

[`PaymentProof`](../type-aliases/PaymentProof.md)

##### disclosureKey?

`Uint8Array`\<`ArrayBufferLike`\>

#### Returns

`object`

##### disclosureKey

> **disclosureKey**: `Uint8Array`

##### proof

> **proof**: [`SealedPaymentProof`](../type-aliases/SealedPaymentProof.md)

### sealParams

> **sealParams**: (`params`, `disclosureKey?`) => `object` = `sealPaymentProofParams`

#### Parameters

##### params

`Record`\<`string`, `unknown`\>

##### disclosureKey?

`Uint8Array`\<`ArrayBufferLike`\>

#### Returns

`object`

##### disclosureKey

> **disclosureKey**: `Uint8Array`

##### params

> **params**: `MarketplaceDriverEncryptedPaymentProofParams`

### sealTerms

> **sealTerms**: (`terms`, `disclosureKey?`) => `object` = `sealPaymentTerms`

#### Parameters

##### terms

`MarketplaceDriverPaymentTerms`

##### disclosureKey?

`Uint8Array`\<`ArrayBufferLike`\>

#### Returns

`object`

##### disclosureKey

> **disclosureKey**: `Uint8Array`

##### terms

> **terms**: `MarketplaceDriverSealedPaymentTerms`

### termsId

> **termsId**: (`terms`) => `string` = `paymentTermsId`

#### Parameters

##### terms

`MarketplaceDriverPaymentTerms`

#### Returns

`string`
