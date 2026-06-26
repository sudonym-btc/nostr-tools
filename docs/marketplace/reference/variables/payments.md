# Variable: payments

> `const` **payments**: `object`

Defined in: [nostr-tools/marketplace/payment-group.ts:598](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/payment-group.ts#L598)

## Type Declaration

### group

> **group**: (`sources`, `options`) => [`MarketplacePaymentGroupStream`](../type-aliases/MarketplacePaymentGroupStream.md) = `groupPaymentStreams`

#### Parameters

##### sources

[`PaymentGroupStreamSources`](../type-aliases/PaymentGroupStreamSources.md)

##### options?

[`PaymentGroupStreamOptions`](../type-aliases/PaymentGroupStreamOptions.md) = `{}`

#### Returns

[`MarketplacePaymentGroupStream`](../type-aliases/MarketplacePaymentGroupStream.md)

### reducer

> **reducer**: *typeof* `PaymentGroupReducer` = `PaymentGroupReducer`

### validateGroup

> **validateGroup**: (`group`, `options`) => [`PaymentValidation`](../type-aliases/PaymentValidation.md) = `validatePaymentGroup`

#### Parameters

##### group

[`PaymentGroup`](../type-aliases/PaymentGroup.md)

##### options?

[`PaymentGroupValidationOptions`](../type-aliases/PaymentGroupValidationOptions.md) = `{}`

#### Returns

[`PaymentValidation`](../type-aliases/PaymentValidation.md)

### validateGroups

> **validateGroups**: (`groups`, `options`) => [`MarketplacePaymentValidationStream`](../type-aliases/MarketplacePaymentValidationStream.md) = `validatePaymentGroupStream`

#### Parameters

##### groups

[`MarketplacePaymentGroupStream`](../type-aliases/MarketplacePaymentGroupStream.md)

##### options?

[`PaymentGroupValidationStreamOptions`](../type-aliases/PaymentGroupValidationStreamOptions.md) = `{}`

#### Returns

[`MarketplacePaymentValidationStream`](../type-aliases/MarketplacePaymentValidationStream.md)
