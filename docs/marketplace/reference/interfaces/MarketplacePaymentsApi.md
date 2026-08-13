# Interface: MarketplacePaymentsApi

## Properties

### group

> **group**: (`sources`, `options`) => [`MarketplacePaymentGroupStream`](../type-aliases/MarketplacePaymentGroupStream.md)

#### Parameters

##### sources

[`PaymentGroupStreamSources`](../type-aliases/PaymentGroupStreamSources.md)

##### options?

[`PaymentGroupStreamOptions`](../type-aliases/PaymentGroupStreamOptions.md) = `{}`

#### Returns

[`MarketplacePaymentGroupStream`](../type-aliases/MarketplacePaymentGroupStream.md)

***

### terms

> **terms**: `object`

#### settlementOptions

> **settlementOptions**: (`terms`) => [`MarketplacePaymentTermSettlementOption`](../type-aliases/MarketplacePaymentTermSettlementOption.md)[] = `paymentTermSettlementOptions`

##### Parameters

###### terms

`MarketplaceDriverPaymentTerms`

##### Returns

[`MarketplacePaymentTermSettlementOption`](../type-aliases/MarketplacePaymentTermSettlementOption.md)[]

#### splitOptions

> **splitOptions**: (`terms`) => [`MarketplacePaymentTermSplitOption`](../type-aliases/MarketplacePaymentTermSplitOption.md)[] = `paymentTermSplitOptions`

##### Parameters

###### terms

`MarketplaceDriverPaymentTerms`

##### Returns

[`MarketplacePaymentTermSplitOption`](../type-aliases/MarketplacePaymentTermSplitOption.md)[]

***

### validateGroup

> **validateGroup**: (`group`, `options`) => [`PaymentValidation`](../type-aliases/PaymentValidation.md)

#### Parameters

##### group

[`PaymentGroup`](../type-aliases/PaymentGroup.md)

##### options?

[`PaymentGroupValidationOptions`](../type-aliases/PaymentGroupValidationOptions.md) = `{}`

#### Returns

[`PaymentValidation`](../type-aliases/PaymentValidation.md)

***

### validateGroups

> **validateGroups**: (`groups`, `options`) => [`MarketplacePaymentValidationStream`](../type-aliases/MarketplacePaymentValidationStream.md)

#### Parameters

##### groups

[`MarketplacePaymentGroupStream`](../type-aliases/MarketplacePaymentGroupStream.md)

##### options?

[`PaymentGroupValidationStreamOptions`](../type-aliases/PaymentGroupValidationStreamOptions.md) = `{}`

#### Returns

[`MarketplacePaymentValidationStream`](../type-aliases/MarketplacePaymentValidationStream.md)

## Methods

### validate()

> **validate**(`payment`): `Promise`\<[`MarketplacePaymentValidationResult`](../type-aliases/MarketplacePaymentValidationResult.md)\>

#### Parameters

##### payment

[`MarketplacePaymentValidationItem`](../type-aliases/MarketplacePaymentValidationItem.md)

#### Returns

`Promise`\<[`MarketplacePaymentValidationResult`](../type-aliases/MarketplacePaymentValidationResult.md)\>
