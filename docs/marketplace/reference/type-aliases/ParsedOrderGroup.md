# Type Alias: ParsedOrderGroup

> **ParsedOrderGroup** = `object`

## Properties

### arbiterOrder?

> `optional` **arbiterOrder?**: [`ParsedOrder`](ParsedOrder.md)

***

### arbiterPubkeys

> **arbiterPubkeys**: `string`[]

***

### buyerOrder?

> `optional` **buyerOrder?**: [`ParsedOrder`](ParsedOrder.md)

***

### buyerPaymentAck?

> `optional` **buyerPaymentAck?**: [`ParsedPaymentAck`](ParsedPaymentAck.md)

***

### cancellation?

> `optional` **cancellation?**: [`ParsedOrderCancel`](ParsedOrderCancel.md)

***

### cancellations

> **cancellations**: [`ParsedOrderCancel`](ParsedOrderCancel.md)[]

***

### confirmedCommitted

> **confirmedCommitted**: `boolean`

***

### events

> **events**: [`OrderGroupEvent`](OrderGroupEvent.md)[]

***

### id

> **id**: `string`

***

### ignoredEvents

> **ignoredEvents**: [`OrderGroupEvent`](OrderGroupEvent.md)[]

***

### ignoredOrders

> **ignoredOrders**: [`ParsedOrder`](ParsedOrder.md)[]

***

### latestByPubkey

> **latestByPubkey**: `Record`\<`string`, `OrderGroupParticipantOrder`\>

***

### listingAnchor

> **listingAnchor**: `string`

***

### listingOwnerPubkey

> **listingOwnerPubkey**: `string`

***

### orders

> **orders**: [`ParsedOrder`](ParsedOrder.md)[]

***

### participantPubkeys

> **participantPubkeys**: `string`[]

***

### participants

> **participants**: [`PTag`](PTag.md)[]

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

### paymentNack?

> `optional` **paymentNack?**: [`ParsedPaymentNack`](ParsedPaymentNack.md)

***

### paymentNacks

> **paymentNacks**: [`ParsedPaymentNack`](ParsedPaymentNack.md)[]

***

### payments

> **payments**: [`ParsedPayment`](ParsedPayment.md)[]

***

### sellerOrder?

> `optional` **sellerOrder?**: [`ParsedOrder`](ParsedOrder.md)

***

### sellerPaymentAck?

> `optional` **sellerPaymentAck?**: [`ParsedPaymentAck`](ParsedPaymentAck.md)

***

### sellerPubkey

> **sellerPubkey**: `string`

***

### settlement?

> `optional` **settlement?**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)

***

### settlements

> **settlements**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)[]

***

### stage

> **stage**: [`OrderStage`](OrderStage.md)

***

### tradeId

> **tradeId**: `string`

***

### validOrders

> **validOrders**: `OrderGroupParticipantOrder`[]
