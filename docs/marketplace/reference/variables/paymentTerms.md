# Variable: paymentTerms

> `const` **paymentTerms**: `object`

Defined in: [nostr-tools/marketplace/payment-terms.ts:128](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/payment-terms.ts#L128)

## Type Declaration

### settlementOptions

> **settlementOptions**: (`terms`) => [`MarketplacePaymentTermSettlementOption`](../type-aliases/MarketplacePaymentTermSettlementOption.md)[] = `paymentTermSettlementOptions`

#### Parameters

##### terms

`MarketplaceDriverPaymentTerms`

#### Returns

[`MarketplacePaymentTermSettlementOption`](../type-aliases/MarketplacePaymentTermSettlementOption.md)[]

### splitOptions

> **splitOptions**: (`terms`) => [`MarketplacePaymentTermSplitOption`](../type-aliases/MarketplacePaymentTermSplitOption.md)[] = `paymentTermSplitOptions`

#### Parameters

##### terms

`MarketplaceDriverPaymentTerms`

#### Returns

[`MarketplacePaymentTermSplitOption`](../type-aliases/MarketplacePaymentTermSplitOption.md)[]
