# Type Alias: MarketplaceValue\<T\>

> **MarketplaceValue**\<`T`\> = `object`

Defined in: [nostr-tools/marketplace/stream.ts:11](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L11)

## Type Parameters

### T

`T`

## Properties

### latest

> `readonly` **latest**: `T` \| `undefined`

Defined in: [nostr-tools/marketplace/stream.ts:13](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L13)

***

### value

> `readonly` **value**: `T` \| `undefined`

Defined in: [nostr-tools/marketplace/stream.ts:12](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L12)

## Methods

### subscribe()

> **subscribe**(`handler`, `options?`): [`ReplayStreamSubscription`](ReplayStreamSubscription.md)

Defined in: [nostr-tools/marketplace/stream.ts:14](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L14)

#### Parameters

##### handler

[`ReplayStreamHandler`](ReplayStreamHandler.md)\<`T`\>

##### options?

[`ReplayStreamSubscribeOptions`](ReplayStreamSubscribeOptions.md)

#### Returns

[`ReplayStreamSubscription`](ReplayStreamSubscription.md)
