# Class: ReplayStream\<T\>

Defined in: [nostr-tools/marketplace/stream.ts:21](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L21)

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new ReplayStream**\<`T`\>(`options?`): `ReplayStream`\<`T`\>

Defined in: [nostr-tools/marketplace/stream.ts:26](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L26)

#### Parameters

##### options?

[`ReplayStreamOptions`](../type-aliases/ReplayStreamOptions.md) = `{}`

#### Returns

`ReplayStream`\<`T`\>

## Accessors

### latest

#### Get Signature

> **get** **latest**(): `T` \| `undefined`

Defined in: [nostr-tools/marketplace/stream.ts:35](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L35)

##### Returns

`T` \| `undefined`

***

### value

#### Get Signature

> **get** **value**(): `T` \| `undefined`

Defined in: [nostr-tools/marketplace/stream.ts:39](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L39)

##### Returns

`T` \| `undefined`

***

### values

#### Get Signature

> **get** **values**(): readonly `T`[]

Defined in: [nostr-tools/marketplace/stream.ts:31](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L31)

##### Returns

readonly `T`[]

## Methods

### clear()

> **clear**(): `void`

Defined in: [nostr-tools/marketplace/stream.ts:68](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L68)

#### Returns

`void`

***

### next()

> **next**(`value`): `void`

Defined in: [nostr-tools/marketplace/stream.ts:43](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L43)

#### Parameters

##### value

`T`

#### Returns

`void`

***

### subscribe()

> **subscribe**(`handler`, `options?`): [`ReplayStreamSubscription`](../type-aliases/ReplayStreamSubscription.md)

Defined in: [nostr-tools/marketplace/stream.ts:53](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L53)

#### Parameters

##### handler

[`ReplayStreamHandler`](../type-aliases/ReplayStreamHandler.md)\<`T`\>

##### options?

[`ReplayStreamSubscribeOptions`](../type-aliases/ReplayStreamSubscribeOptions.md) = `{}`

#### Returns

[`ReplayStreamSubscription`](../type-aliases/ReplayStreamSubscription.md)
