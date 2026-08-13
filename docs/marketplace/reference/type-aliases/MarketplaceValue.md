# Type Alias: MarketplaceValue\<T\>

> **MarketplaceValue**\<`T`\> = `object`

## Type Parameters

### T

`T`

## Properties

### latest

> `readonly` **latest**: `T` \| `undefined`

***

### value

> `readonly` **value**: `T` \| `undefined`

## Methods

### subscribe()

> **subscribe**(`handler`, `options?`): [`ReplayStreamSubscription`](ReplayStreamSubscription.md)

#### Parameters

##### handler

[`ReplayStreamHandler`](ReplayStreamHandler.md)\<`T`\>

##### options?

[`ReplayStreamSubscribeOptions`](ReplayStreamSubscribeOptions.md)

#### Returns

[`ReplayStreamSubscription`](ReplayStreamSubscription.md)
