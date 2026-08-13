# Type Alias: MarketplacePaymentValidationPolicy

> **MarketplacePaymentValidationPolicy** = `MarketplaceDriverValidationPolicy`\<[`MarketplacePaymentValidationRequest`](MarketplacePaymentValidationRequest.md), [`MarketplacePaymentValidationResult`](MarketplacePaymentValidationResult.md)\> & `object`

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
