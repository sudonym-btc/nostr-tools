# Type Alias: PaymentGroupValidationOptions

> **PaymentGroupValidationOptions** = `object`

## Properties

### arbiterPubkeys?

> `optional` **arbiterPubkeys?**: `Iterable`\<`string` \| `undefined`\>

***

### forceDriverValidation?

> `optional` **forceDriverValidation?**: (`group`) => `boolean`

#### Parameters

##### group

[`ParsedPaymentGroup`](ParsedPaymentGroup.md)

#### Returns

`boolean`

***

### isTrustedAck?

> `optional` **isTrustedAck?**: (`ack`, `group`) => `boolean`

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
