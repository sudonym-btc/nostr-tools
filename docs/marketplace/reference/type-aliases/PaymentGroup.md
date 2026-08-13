# Type Alias: PaymentGroup

> **PaymentGroup** = `object`

## Properties

### anchors?

> `optional` **anchors?**: [`PaymentLifecycleAnchors`](PaymentLifecycleAnchors.md)

***

### complete

> **complete**: `boolean`

***

### events

> **events**: [`PaymentGroupEvent`](PaymentGroupEvent.md)[]

***

### id

> **id**: `string`

***

### listingAnchor?

> `optional` **listingAnchor?**: `string`

***

### orderGroupId?

> `optional` **orderGroupId?**: `string`

***

### payment?

> `optional` **payment?**: [`ParsedPayment`](ParsedPayment.md)

***

### paymentAck?

> `optional` **paymentAck?**: [`ParsedPaymentAck`](ParsedPaymentAck.md)

***

### paymentAcks

> **paymentAcks**: [`ParsedPaymentAck`](ParsedPaymentAck.md)[]

***

### paymentIds

> **paymentIds**: `string`[]

***

### paymentNack?

> `optional` **paymentNack?**: [`ParsedPaymentNack`](ParsedPaymentNack.md)

***

### paymentNacks

> **paymentNacks**: [`ParsedPaymentNack`](ParsedPaymentNack.md)[]

***

### payments

> **payments**: [`ParsedPayment`](ParsedPayment.md)[]

***

### settlement?

> `optional` **settlement?**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)

***

### settlements

> **settlements**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)[]

***

### stage

> **stage**: [`PaymentGroupStage`](PaymentGroupStage.md)

***

### tradeId?

> `optional` **tradeId?**: `string`

***

### updatedAt

> **updatedAt**: `number`
