# Interface: MarketplacePaymentsApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1273](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1273)

## Properties

### group

> **group**: (`sources`, `options`) => [`MarketplacePaymentGroupStream`](../type-aliases/MarketplacePaymentGroupStream.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1274](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1274)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1275](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1275)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1276](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1276)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1277](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1277)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1278](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1278)

#### Parameters

##### payment

[`MarketplacePaymentValidationItem`](../type-aliases/MarketplacePaymentValidationItem.md)

#### Returns

`Promise`\<[`MarketplacePaymentValidationResult`](../type-aliases/MarketplacePaymentValidationResult.md)\>
