# Type Alias: OrderSubscribeHandlers

> **OrderSubscribeHandlers** = `object`

Defined in: [nostr-tools/marketplace/order-query.ts:38](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-query.ts#L38)

## Properties

### onclose?

> `optional` **onclose?**: (`reasons`) => `void`

Defined in: [nostr-tools/marketplace/order-query.ts:42](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-query.ts#L42)

#### Parameters

##### reasons

`string`[]

#### Returns

`void`

***

### oneose?

> `optional` **oneose?**: () => `void`

Defined in: [nostr-tools/marketplace/order-query.ts:41](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-query.ts#L41)

#### Returns

`void`

***

### onevent?

> `optional` **onevent?**: (`order`) => `void`

Defined in: [nostr-tools/marketplace/order-query.ts:39](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-query.ts#L39)

#### Parameters

##### order

[`ParsedOrder`](ParsedOrder.md)

#### Returns

`void`

***

### oninvalid?

> `optional` **oninvalid?**: (`event`, `error`) => `void`

Defined in: [nostr-tools/marketplace/order-query.ts:40](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/order-query.ts#L40)

#### Parameters

##### event

`Event`

##### error

`Error`

#### Returns

`void`
