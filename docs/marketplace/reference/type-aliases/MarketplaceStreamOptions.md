# Type Alias: MarketplaceStreamOptions\<TSnapshot\>

> **MarketplaceStreamOptions**\<`TSnapshot`\> = `object`

Defined in: [nostr-tools/marketplace/stream.ts:130](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/stream.ts#L130)

## Type Parameters

### TSnapshot

`TSnapshot`

## Properties

### emitClosedOnClose?

> `optional` **emitClosedOnClose?**: `boolean`

Defined in: [nostr-tools/marketplace/stream.ts:136](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/stream.ts#L136)

***

### eventReplayLimit?

> `optional` **eventReplayLimit?**: `number`

Defined in: [nostr-tools/marketplace/stream.ts:133](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/stream.ts#L133)

***

### initialStatus?

> `optional` **initialStatus?**: `StreamState` \| `false`

Defined in: [nostr-tools/marketplace/stream.ts:137](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/stream.ts#L137)

***

### onClose?

> `optional` **onClose?**: (`reason?`) => `void`

Defined in: [nostr-tools/marketplace/stream.ts:135](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/stream.ts#L135)

#### Parameters

##### reason?

`string`

#### Returns

`void`

***

### snapshot?

> `optional` **snapshot?**: [`ReplayStream`](../classes/ReplayStream.md)\<`TSnapshot`\>

Defined in: [nostr-tools/marketplace/stream.ts:132](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/stream.ts#L132)

***

### snapshotReplayLimit?

> `optional` **snapshotReplayLimit?**: `number`

Defined in: [nostr-tools/marketplace/stream.ts:134](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/stream.ts#L134)

***

### status?

> `optional` **status?**: [`ReplayStream`](../classes/ReplayStream.md)\<`StreamState`\>

Defined in: [nostr-tools/marketplace/stream.ts:131](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/stream.ts#L131)
