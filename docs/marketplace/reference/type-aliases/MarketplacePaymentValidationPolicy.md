# Type Alias: MarketplacePaymentValidationPolicy

> **MarketplacePaymentValidationPolicy** = `MarketplaceDriverValidationPolicy`\<[`MarketplacePaymentValidationRequest`](MarketplacePaymentValidationRequest.md), [`MarketplacePaymentValidationResult`](MarketplacePaymentValidationResult.md)\> & `object`

Defined in: [nostr-tools/marketplace/payment-validation.ts:63](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/payment-validation.ts#L63)

## Type Declaration

### canValidate?

> `optional` **canValidate?**: (`request`) => `boolean` \| `Promise`\<`boolean`\>

#### Parameters

##### request

[`MarketplacePaymentValidationRequest`](MarketplacePaymentValidationRequest.md)

#### Returns

`boolean` \| `Promise`\<`boolean`\>

### driver?

> `optional` **driver?**: `string` \| `"*"`

### id?

> `optional` **id?**: `string`

### method?

> `optional` **method?**: `string`

### validatePayment

> **validatePayment**: (`request`) => `Promise`\<[`MarketplacePaymentValidationResult`](MarketplacePaymentValidationResult.md)\>

#### Parameters

##### request

[`MarketplacePaymentValidationRequest`](MarketplacePaymentValidationRequest.md)

#### Returns

`Promise`\<[`MarketplacePaymentValidationResult`](MarketplacePaymentValidationResult.md)\>
