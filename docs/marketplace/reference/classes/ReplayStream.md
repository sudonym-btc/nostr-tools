# Class: ReplayStream\<T\>

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new ReplayStream**\<`T`\>(`options?`): `ReplayStream`\<`T`\>

#### Parameters

##### options?

[`ReplayStreamOptions`](../type-aliases/ReplayStreamOptions.md) = `{}`

#### Returns

`ReplayStream`\<`T`\>

## Accessors

### latest

#### Get Signature

> **get** **latest**(): `T` \| `undefined`

##### Returns

`T` \| `undefined`

***

### value

#### Get Signature

> **get** **value**(): `T` \| `undefined`

##### Returns

`T` \| `undefined`

***

### values

#### Get Signature

> **get** **values**(): readonly `T`[]

##### Returns

readonly `T`[]

## Methods

### clear()

> **clear**(): `void`

#### Returns

`void`

***

### next()

> **next**(`value`): `void`

#### Parameters

##### value

`T`

#### Returns

`void`

***

### subscribe()

> **subscribe**(`handler`, `options?`): [`ReplayStreamSubscription`](../type-aliases/ReplayStreamSubscription.md)

#### Parameters

##### handler

[`ReplayStreamHandler`](../type-aliases/ReplayStreamHandler.md)\<`T`\>

##### options?

[`ReplayStreamSubscribeOptions`](../type-aliases/ReplayStreamSubscribeOptions.md) = `{}`

#### Returns

[`ReplayStreamSubscription`](../type-aliases/ReplayStreamSubscription.md)
