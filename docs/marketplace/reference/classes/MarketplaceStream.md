# Class: MarketplaceStream\<TEvent, TSnapshot\>

## Type Parameters

### TEvent

`TEvent`

### TSnapshot

`TSnapshot` = `never`

## Constructors

### Constructor

> **new MarketplaceStream**\<`TEvent`, `TSnapshot`\>(`options?`): `MarketplaceStream`\<`TEvent`, `TSnapshot`\>

#### Parameters

##### options?

[`MarketplaceStreamOptions`](../type-aliases/MarketplaceStreamOptions.md)\<`TSnapshot`\> = `{}`

#### Returns

`MarketplaceStream`\<`TEvent`, `TSnapshot`\>

## Properties

### events

> `readonly` **events**: [`ReplayStream`](ReplayStream.md)\<`TEvent`\>

***

### snapshot

> `readonly` **snapshot**: [`ReplayStream`](ReplayStream.md)\<`TSnapshot`\>

***

### status

> `readonly` **status**: [`ReplayStream`](ReplayStream.md)\<`StreamState`\>

***

### stream

> `readonly` **stream**: [`ReplayStream`](ReplayStream.md)\<`TEvent`\>

## Accessors

### currentSnapshot

#### Get Signature

> **get** **currentSnapshot**(): `TSnapshot` \| `undefined`

##### Returns

`TSnapshot` \| `undefined`

***

### currentStatus

#### Get Signature

> **get** **currentStatus**(): `StreamState` \| `undefined`

##### Returns

`StreamState` \| `undefined`

## Methods

### close()

> **close**(`reason?`): `void`

#### Parameters

##### reason?

`string`

#### Returns

`void`

***

### emitEvent()

> **emitEvent**(`event`): `void`

#### Parameters

##### event

`TEvent`

#### Returns

`void`

***

### emitSnapshot()

> **emitSnapshot**(`snapshot`): `void`

#### Parameters

##### snapshot

`TSnapshot`

#### Returns

`void`

***

### emitStatus()

> **emitStatus**(`state`): `void`

#### Parameters

##### state

`StreamState`

#### Returns

`void`

***

### fail()

> **fail**(`error`, `options?`): [`StreamError`](StreamError.md)

#### Parameters

##### error

`Error`

##### options?

###### at?

`number`

#### Returns

[`StreamError`](StreamError.md)

***

### filter()

#### Call Signature

> **filter**\<`TNext`\>(`predicate`, `options?`): `MarketplaceStream`\<`TNext`, `TSnapshot`\>

##### Type Parameters

###### TNext

`TNext`

##### Parameters

###### predicate

(`event`) => `event is TNext`

###### options?

`Pick`\<[`MarketplaceStreamOptions`](../type-aliases/MarketplaceStreamOptions.md)\<`TSnapshot`\>, `"eventReplayLimit"`\>

##### Returns

`MarketplaceStream`\<`TNext`, `TSnapshot`\>

#### Call Signature

> **filter**(`predicate`, `options?`): `MarketplaceStream`\<`TEvent`, `TSnapshot`\>

##### Parameters

###### predicate

(`event`) => `boolean`

###### options?

`Pick`\<[`MarketplaceStreamOptions`](../type-aliases/MarketplaceStreamOptions.md)\<`TSnapshot`\>, `"eventReplayLimit"`\>

##### Returns

`MarketplaceStream`\<`TEvent`, `TSnapshot`\>

***

### markEose()

> **markEose**(`options?`): [`StreamEose`](StreamEose.md)

#### Parameters

##### options?

###### at?

`number`

###### eventCount?

`number`

#### Returns

[`StreamEose`](StreamEose.md)

***

### markLive()

> **markLive**(`options?`): [`StreamLive`](StreamLive.md)

#### Parameters

##### options?

###### at?

`number`

###### eventCount?

`number`

###### since?

`number`

#### Returns

[`StreamLive`](StreamLive.md)

***

### markQuerying()

> **markQuerying**(`options?`): [`StreamQuerying`](StreamQuerying.md)

#### Parameters

##### options?

###### at?

`number`

###### requestCount?

`number`

#### Returns

[`StreamQuerying`](StreamQuerying.md)

***

### until()

> **until**\<`TState`\>(`stateType`): `Promise`\<`TState`\>

#### Type Parameters

##### TState

`TState` *extends* `StreamState`

#### Parameters

##### stateType

(...`args`) => `TState`

#### Returns

`Promise`\<`TState`\>
