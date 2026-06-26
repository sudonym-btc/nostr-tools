# Type Alias: ReduceOrderGroupOptions

> **ReduceOrderGroupOptions** = `object`

Defined in: [nostr-tools/marketplace/order-group-types.ts:35](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L35)

## Properties

### isBuyerPaymentProofValid?

> `optional` **isBuyerPaymentProofValid?**: (`order`, `context`) => `boolean`

Defined in: [nostr-tools/marketplace/order-group-types.ts:37](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L37)

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

Defined in: [nostr-tools/marketplace/order-group-types.ts:38](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L38)

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

Defined in: [nostr-tools/marketplace/order-group-types.ts:36](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L36)
