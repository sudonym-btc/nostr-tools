# Type Alias: MarketplaceStreamOptions\<TSnapshot\>

> **MarketplaceStreamOptions**\<`TSnapshot`\> = `object`

## Type Parameters

### TSnapshot

`TSnapshot`

## Properties

### emitClosedOnClose?

> `optional` **emitClosedOnClose?**: `boolean`

***

### eventReplayLimit?

> `optional` **eventReplayLimit?**: `number`

***

### initialStatus?

> `optional` **initialStatus?**: `StreamState` \| `false`

***

### onClose?

> `optional` **onClose?**: (`reason?`) => `void`

#### Parameters

##### reason?

`string`

#### Returns

`void`

***

### snapshot?

> `optional` **snapshot?**: [`ReplayStream`](../classes/ReplayStream.md)\<`TSnapshot`\>

***

### snapshotReplayLimit?

> `optional` **snapshotReplayLimit?**: `number`

***

### status?

> `optional` **status?**: [`ReplayStream`](../classes/ReplayStream.md)\<`StreamState`\>
