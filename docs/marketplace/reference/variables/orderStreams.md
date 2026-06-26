# Variable: orderStreams

> `const` **orderStreams**: `object`

Defined in: [nostr-tools/marketplace/order-stream.ts:215](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/order-stream.ts#L215)

## Type Declaration

### groups

> **groups**: (`pool`, `relays`, `query`, `options`) => [`MarketplaceOrderGroupStream`](../type-aliases/MarketplaceOrderGroupStream.md) = `streamOrderGroups`

#### Parameters

##### pool

`OrderGroupSubscribePool`

##### relays

`string`[]

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md) = `{}`

##### options?

`OrderGroupSubscribeOptions` = `{}`

#### Returns

[`MarketplaceOrderGroupStream`](../type-aliases/MarketplaceOrderGroupStream.md)

### mine

> **mine**: (`pool`, `relays`, `query`, `options`) => [`MarketplaceMyOrderGroupStream`](../type-aliases/MarketplaceMyOrderGroupStream.md) = `streamMyOrderGroups`

#### Parameters

##### pool

`OrderGroupSubscribePool`

##### relays

`string`[]

##### query

[`OrderGroupIdentityQuery`](../type-aliases/OrderGroupIdentityQuery.md)

##### options?

`OrderGroupSubscribeOptions` = `{}`

#### Returns

[`MarketplaceMyOrderGroupStream`](../type-aliases/MarketplaceMyOrderGroupStream.md)

### mineOrders

> **mineOrders**: (`pool`, `relays`, `query`, `options`) => [`MarketplaceOrderStream`](../type-aliases/MarketplaceOrderStream.md) = `streamMyOrders`

#### Parameters

##### pool

`OrderStreamPool`

##### relays

`string`[]

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md) = `{}`

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) = `{}`

#### Returns

[`MarketplaceOrderStream`](../type-aliases/MarketplaceOrderStream.md)

### orders

> **orders**: (`pool`, `relays`, `query`, `options`) => [`MarketplaceOrderStream`](../type-aliases/MarketplaceOrderStream.md) = `streamOrders`

#### Parameters

##### pool

`OrderStreamPool`

##### relays

`string`[]

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md) = `{}`

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md) = `{}`

#### Returns

[`MarketplaceOrderStream`](../type-aliases/MarketplaceOrderStream.md)

### queryGroups

> **queryGroups**: (`stream`) => `Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\> = `queryOrderGroupStream`

#### Parameters

##### stream

[`MarketplaceOrderGroupStream`](../type-aliases/MarketplaceOrderGroupStream.md)

#### Returns

`Promise`\<[`ParsedOrderGroup`](../type-aliases/ParsedOrderGroup.md)[]\>

### queryMine

> **queryMine**: (`stream`) => `Promise`\<[`OrderGroupRoles`](../type-aliases/OrderGroupRoles.md)\> = `queryMyOrderGroupStream`

#### Parameters

##### stream

[`MarketplaceMyOrderGroupStream`](../type-aliases/MarketplaceMyOrderGroupStream.md)

#### Returns

`Promise`\<[`OrderGroupRoles`](../type-aliases/OrderGroupRoles.md)\>

### queryOrders

> **queryOrders**: (`stream`) => `Promise`\<[`ParsedOrder`](../type-aliases/ParsedOrder.md)[]\> = `queryOrderStream`

#### Parameters

##### stream

[`MarketplaceOrderStream`](../type-aliases/MarketplaceOrderStream.md)

#### Returns

`Promise`\<[`ParsedOrder`](../type-aliases/ParsedOrder.md)[]\>
