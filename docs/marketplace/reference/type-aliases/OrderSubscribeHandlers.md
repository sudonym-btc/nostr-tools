# Type Alias: OrderSubscribeHandlers

> **OrderSubscribeHandlers** = `object`

## Properties

### onclose?

> `optional` **onclose?**: (`reasons`) => `void`

#### Parameters

##### reasons

`string`[]

#### Returns

`void`

***

### oneose?

> `optional` **oneose?**: () => `void`

#### Returns

`void`

***

### onevent?

> `optional` **onevent?**: (`order`) => `void`

#### Parameters

##### order

[`ParsedOrder`](ParsedOrder.md)

#### Returns

`void`

***

### oninvalid?

> `optional` **oninvalid?**: (`event`, `error`) => `void`

#### Parameters

##### event

`Event`

##### error

`Error`

#### Returns

`void`
