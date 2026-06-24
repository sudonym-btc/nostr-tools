# Variable: paymentAmounts

> `const` **paymentAmounts**: `object`

Defined in: [nostr-tools/marketplace/payment-amount.ts:195](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/payment-amount.ts#L195)

## Type Declaration

### build

> **build**: (`amount`, `options`) => `PaymentAmountFields` & `object` = `buildPaymentAmountPayload`

#### Parameters

##### amount

[`MarketplaceAmount`](../type-aliases/MarketplaceAmount.md)

##### options

[`BuildPaymentAmountPayloadOptions`](../type-aliases/BuildPaymentAmountPayloadOptions.md)

#### Returns

`PaymentAmountFields` & `object`

### id

> **id**: (`amount`) => `string` = `paymentAmountId`

#### Parameters

##### amount

[`MarketplaceAmount`](../type-aliases/MarketplaceAmount.md)

#### Returns

`string`

### isSealed

> **isSealed**: (`value`) => `value is SealedPaymentAmount` = `isSealedPaymentAmount`

#### Parameters

##### value

`unknown`

#### Returns

`value is SealedPaymentAmount`

### keyTag

> **keyTag**: (`key`) => `string`[] = `paymentAmountKeyTag`

#### Parameters

##### key

`ProofDisclosureKeyTag`

#### Returns

`string`[]

### parseKeyTag

> **parseKeyTag**: (`tag`) => `ProofDisclosureKeyTag` \| `null` = `parsePaymentAmountKeyTag`

#### Parameters

##### tag

`string`[]

#### Returns

`ProofDisclosureKeyTag` \| `null`

### parseSealed

> **parseSealed**: (`value`) => [`SealedPaymentAmount`](../type-aliases/SealedPaymentAmount.md) \| `undefined` = `parseSealedPaymentAmount`

#### Parameters

##### value

`unknown`

#### Returns

[`SealedPaymentAmount`](../type-aliases/SealedPaymentAmount.md) \| `undefined`

### resolve

> **resolve**: (`container`, `options`) => `Promise`\<[`PaymentAmountResolution`](../type-aliases/PaymentAmountResolution.md)\> = `resolvePaymentAmount`

#### Parameters

##### container

[`PaymentAmountContainer`](../type-aliases/PaymentAmountContainer.md)

##### options?

[`ResolvePaymentAmountOptions`](../type-aliases/ResolvePaymentAmountOptions.md) = `{}`

#### Returns

`Promise`\<[`PaymentAmountResolution`](../type-aliases/PaymentAmountResolution.md)\>

### seal

> **seal**: (`amount`, `disclosureKey?`) => `object` = `sealPaymentAmount`

#### Parameters

##### amount

[`MarketplaceAmount`](../type-aliases/MarketplaceAmount.md)

##### disclosureKey?

`Uint8Array`\<`ArrayBufferLike`\>

#### Returns

`object`

##### amount

> **amount**: [`SealedPaymentAmount`](../type-aliases/SealedPaymentAmount.md)

##### disclosureKey

> **disclosureKey**: `Uint8Array`
