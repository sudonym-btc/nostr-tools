# Variable: paymentTerms

> `const` **paymentTerms**: `object`

Defined in: [nostr-tools/marketplace/payment-terms.ts:128](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/payment-terms.ts#L128)

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
