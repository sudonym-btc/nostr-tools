# Type Alias: ReduceOrderGroupOptions

> **ReduceOrderGroupOptions** = `object`

## Properties

### isBuyerPaymentProofValid?

> `optional` **isBuyerPaymentProofValid?**: (`order`, `context`) => `boolean`

#### Parameters

##### order

[`ParsedOrder`](ParsedOrder.md)

##### context

[`OrderGroupRoleContext`](OrderGroupRoleContext.md)

#### Returns

`boolean`

***

### isPaymentValid?

> `optional` **isPaymentValid?**: (`payment`, `context`) => `boolean`

#### Parameters

##### payment

[`ParsedPayment`](ParsedPayment.md)

##### context

[`OrderGroupRoleContext`](OrderGroupRoleContext.md)

#### Returns

`boolean`

***

### resolveRole?

> `optional` **resolveRole?**: [`OrderGroupRoleResolver`](OrderGroupRoleResolver.md)
