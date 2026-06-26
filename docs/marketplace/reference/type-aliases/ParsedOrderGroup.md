# Type Alias: ParsedOrderGroup

> **ParsedOrderGroup** = `object`

Defined in: [nostr-tools/marketplace/order-group-types.ts:153](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L153)

## Properties

### arbiterOrder?

> `optional` **arbiterOrder?**: [`ParsedOrder`](ParsedOrder.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:174](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L174)

***

### arbiterPubkeys

> **arbiterPubkeys**: `string`[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:159](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L159)

***

### buyerOrder?

> `optional` **buyerOrder?**: [`ParsedOrder`](ParsedOrder.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:173](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L173)

***

### buyerPaymentAck?

> `optional` **buyerPaymentAck?**: [`ParsedPaymentAck`](ParsedPaymentAck.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:178](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L178)

***

### cancellation?

> `optional` **cancellation?**: [`ParsedOrderCancel`](ParsedOrderCancel.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:182](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L182)

***

### cancellations

> **cancellations**: [`ParsedOrderCancel`](ParsedOrderCancel.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:167](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L167)

***

### confirmedCommitted

> **confirmedCommitted**: `boolean`

Defined in: [nostr-tools/marketplace/order-group-types.ts:184](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L184)

***

### events

> **events**: [`OrderGroupEvent`](OrderGroupEvent.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:168](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L168)

***

### id

> **id**: `string`

Defined in: [nostr-tools/marketplace/order-group-types.ts:154](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L154)

***

### ignoredEvents

> **ignoredEvents**: [`OrderGroupEvent`](OrderGroupEvent.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:170](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L170)

***

### ignoredOrders

> **ignoredOrders**: [`ParsedOrder`](ParsedOrder.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:171](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L171)

***

### latestByPubkey

> **latestByPubkey**: `Record`\<`string`, `OrderGroupParticipantOrder`\>

Defined in: [nostr-tools/marketplace/order-group-types.ts:172](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L172)

***

### listingAnchor

> **listingAnchor**: `string`

Defined in: [nostr-tools/marketplace/order-group-types.ts:156](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L156)

***

### listingOwnerPubkey

> **listingOwnerPubkey**: `string`

Defined in: [nostr-tools/marketplace/order-group-types.ts:158](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L158)

***

### orders

> **orders**: [`ParsedOrder`](ParsedOrder.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:162](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L162)

***

### participantPubkeys

> **participantPubkeys**: `string`[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:161](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L161)

***

### participants

> **participants**: [`PTag`](PTag.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:160](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L160)

***

### payment?

> `optional` **payment?**: [`ParsedPayment`](ParsedPayment.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:176](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L176)

***

### paymentAck?

> `optional` **paymentAck?**: [`ParsedPaymentAck`](ParsedPaymentAck.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:177](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L177)

***

### paymentAcks

> **paymentAcks**: [`ParsedPaymentAck`](ParsedPaymentAck.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:164](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L164)

***

### paymentNack?

> `optional` **paymentNack?**: [`ParsedPaymentNack`](ParsedPaymentNack.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:180](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L180)

***

### paymentNacks

> **paymentNacks**: [`ParsedPaymentNack`](ParsedPaymentNack.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:165](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L165)

***

### payments

> **payments**: [`ParsedPayment`](ParsedPayment.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:163](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L163)

***

### sellerOrder?

> `optional` **sellerOrder?**: [`ParsedOrder`](ParsedOrder.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:175](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L175)

***

### sellerPaymentAck?

> `optional` **sellerPaymentAck?**: [`ParsedPaymentAck`](ParsedPaymentAck.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:179](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L179)

***

### sellerPubkey

> **sellerPubkey**: `string`

Defined in: [nostr-tools/marketplace/order-group-types.ts:157](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L157)

***

### settlement?

> `optional` **settlement?**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:181](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L181)

***

### settlements

> **settlements**: [`ParsedPaymentSettlement`](ParsedPaymentSettlement.md)[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:166](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L166)

***

### stage

> **stage**: [`OrderStage`](OrderStage.md)

Defined in: [nostr-tools/marketplace/order-group-types.ts:183](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L183)

***

### tradeId

> **tradeId**: `string`

Defined in: [nostr-tools/marketplace/order-group-types.ts:155](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L155)

***

### validOrders

> **validOrders**: `OrderGroupParticipantOrder`[]

Defined in: [nostr-tools/marketplace/order-group-types.ts:169](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-group-types.ts#L169)
