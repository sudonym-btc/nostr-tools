# Interface: MarketplacePaymentsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1276](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1276)

## Properties

### group

> **group**: (`sources`, `options`) => [`MarketplacePaymentGroupStream`](../type-aliases/MarketplacePaymentGroupStream.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1277](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1277)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1278](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1278)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1279](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1279)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1280](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1280)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1281](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1281)

#### Parameters

##### payment

[`MarketplacePaymentValidationItem`](../type-aliases/MarketplacePaymentValidationItem.md)

#### Returns

`Promise`\<[`MarketplacePaymentValidationResult`](../type-aliases/MarketplacePaymentValidationResult.md)\>
