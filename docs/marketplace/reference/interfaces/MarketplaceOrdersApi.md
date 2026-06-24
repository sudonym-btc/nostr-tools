# Interface: MarketplaceOrdersApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:982](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L982)

## Properties

### commitHash

> **commitHash**: (`content`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:991](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L991)

#### Parameters

##### content

[`OrderContent`](../type-aliases/OrderContent.md)

#### Returns

`string`

***

### filters

> **filters**: (`query`) => `Filter`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:992](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L992)

#### Parameters

##### query?

[`OrderQuery`](../type-aliases/OrderQuery.md) = `{}`

#### Returns

`Filter`[]

***

### groups

> **groups**: [`MarketplaceOrderGroupsApi`](MarketplaceOrderGroupsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1000](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1000)

***

### parse

> **parse**: (`event`) => [`ParsedOrder`](../type-aliases/ParsedOrder.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:988](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L988)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedOrder`](../type-aliases/ParsedOrder.md)

***

### template

> **template**: (`order`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:990](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L990)

#### Parameters

##### order

[`OrderTemplate`](../type-aliases/OrderTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:989](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L989)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### create()

> **create**(`listing`, `order`, `options?`): `AsyncIterable`\<[`MarketplacePaymentState`](../type-aliases/MarketplacePaymentState.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:983](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L983)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1001](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1001)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:993](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L993)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:999](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L999)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:994](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L994)

#### Parameters

##### query

[`OrderQuery`](../type-aliases/OrderQuery.md)

##### handlers

[`OrderSubscribeHandlers`](../type-aliases/OrderSubscribeHandlers.md)

##### options?

[`OrderSubscribeOptions`](../type-aliases/OrderSubscribeOptions.md)

#### Returns

`SubCloser`
