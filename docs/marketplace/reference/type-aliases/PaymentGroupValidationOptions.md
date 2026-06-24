# Type Alias: PaymentGroupValidationOptions

> **PaymentGroupValidationOptions** = `object`

Defined in: [nostr-tools/marketplace/payment-group.ts:127](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/payment-group.ts#L127)

## Properties

### arbiterPubkeys?

> `optional` **arbiterPubkeys?**: `Iterable`\<`string` \| `undefined`\>

Defined in: [nostr-tools/marketplace/payment-group.ts:129](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/payment-group.ts#L129)

***

### forceDriverValidation?

> `optional` **forceDriverValidation?**: (`group`) => `boolean`

Defined in: [nostr-tools/marketplace/payment-group.ts:132](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/payment-group.ts#L132)

#### Parameters

##### group

[`ParsedPaymentGroup`](ParsedPaymentGroup.md)

#### Returns

`boolean`

***

### isTrustedAck?

> `optional` **isTrustedAck?**: (`ack`, `group`) => `boolean`

Defined in: [nostr-tools/marketplace/payment-group.ts:130](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/payment-group.ts#L130)

#### Parameters

##### ack

[`ParsedPaymentAck`](ParsedPaymentAck.md)

##### group

[`ParsedPaymentGroup`](ParsedPaymentGroup.md)

#### Returns

`boolean`

***

### isTrustedNack?

> `optional` **isTrustedNack?**: (`nack`, `group`) => `boolean`

Defined in: [nostr-tools/marketplace/payment-group.ts:131](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/payment-group.ts#L131)

#### Parameters

##### nack

[`ParsedPaymentNack`](ParsedPaymentNack.md)

##### group

[`ParsedPaymentGroup`](ParsedPaymentGroup.md)

#### Returns

`boolean`

***

### sellerPubkeys?

> `optional` **sellerPubkeys?**: `Iterable`\<`string` \| `undefined`\>

Defined in: [nostr-tools/marketplace/payment-group.ts:128](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/payment-group.ts#L128)
