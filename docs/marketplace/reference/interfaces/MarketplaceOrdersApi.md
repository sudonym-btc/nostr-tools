# Interface: MarketplaceOrdersApi

## Properties

### commitHash

> **commitHash**: (`content`) => `string`

#### Parameters

##### content

[`OrderContent`](../type-aliases/OrderContent.md)

#### Returns

`string`

***

### filters

> **filters**: (`query`) => `Filter`[]

#### Parameters

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md) = `{}`

#### Returns

`Filter`[]

***

### groups

> **groups**: [`MarketplaceOrderGroupsApi`](MarketplaceOrderGroupsApi.md)

***

### parse

> **parse**: (`event`) => [`ParsedOrder`](../type-aliases/ParsedOrder.md)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedOrder`](../type-aliases/ParsedOrder.md)

***

### template

> **template**: (`order`) => `EventTemplate`

#### Parameters

##### order

[`OrderTemplate`](../type-aliases/OrderTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### create()

> **create**(`listing`, `order`, `options?`): `AsyncIterable`\<[`MarketplacePaymentState`](../type-aliases/MarketplacePaymentState.md)\>

#### Parameters

##### listing

`NostrEvent` \| [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

##### order

[`MarketplaceOrderCreateParams`](../type-aliases/MarketplaceOrderCreateParams.md)

##### options?

[`MarketplacePayOptions`](../type-aliases/MarketplacePayOptions.md)

#### Returns

`AsyncIterable`\<[`MarketplacePaymentState`](../type-aliases/MarketplacePaymentState.md)\>

***

### negotiate()

> **negotiate**(`listing`, `order`): `Promise`\<`MarketplaceOrderNegotiationResult`\>

#### Parameters

##### listing

`NostrEvent` \| [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

##### order

`MarketplaceOrderNegotiationOptions`

#### Returns

`Promise`\<`MarketplaceOrderNegotiationResult`\>

***

### search()

> **search**(`query?`, `options?`): `Promise`\<[`ParsedOrder`](../type-aliases/ParsedOrder.md)[]\>

#### Parameters

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md)

##### options?

[`OrderSearchOptions`](../type-aliases/OrderSearchOptions.md)

#### Returns

`Promise`\<[`ParsedOrder`](../type-aliases/ParsedOrder.md)[]\>

***

### stream()

> **stream**(`query?`, `options?`): [`MarketplaceOrderStream`](../type-aliases/MarketplaceOrderStream.md)

#### Parameters

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md)

#### Returns

[`MarketplaceOrderStream`](../type-aliases/MarketplaceOrderStream.md)

***

### subscribe()

> **subscribe**(`query`, `handlers`, `options?`): `SubCloser`

#### Parameters

##### query

[`OrderQuery`](../type-aliases/OrderQuery.md)

##### handlers

[`OrderSubscribeHandlers`](../type-aliases/OrderSubscribeHandlers.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md)

#### Returns

`SubCloser`
