# Type Alias: OrderGroupSubscribeHandlers

> **OrderGroupSubscribeHandlers** = `object`

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

> `optional` **onevent?**: (`event`) => `void`

#### Parameters

##### event

[`OrderGroupEvent`](OrderGroupEvent.md)

#### Returns

`void`

***

### ongroup?

> `optional` **ongroup?**: (`group`) => `void`

#### Parameters

##### group

[`ParsedOrderGroup`](ParsedOrderGroup.md)

#### Returns

`void`

***

### ongroups?

> `optional` **ongroups?**: (`groups`) => `void`

#### Parameters

##### groups

[`ParsedOrderGroup`](ParsedOrderGroup.md)[]

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
