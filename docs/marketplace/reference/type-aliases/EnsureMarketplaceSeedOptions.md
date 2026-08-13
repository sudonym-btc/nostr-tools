# Type Alias: EnsureMarketplaceSeedOptions

> **EnsureMarketplaceSeedOptions** = `object`

## Properties

### pool

> **pool**: `Pick`\<`AbstractSimplePool`, `"querySync"`\>

***

### pubkey

> **pubkey**: `string`

***

### relays

> **relays**: `string`[]

## Methods

### create()

> **create**(): \{ `event`: `Event`; `payload`: [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md); \} \| `Promise`\<\{ `event`: `Event`; `payload`: [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md); \}\>

#### Returns

\{ `event`: `Event`; `payload`: [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md); \} \| `Promise`\<\{ `event`: `Event`; `payload`: [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md); \}\>

***

### decrypt()

> **decrypt**(`event`): [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md) \| `Promise`\<[`MarketplaceSeedPayload`](MarketplaceSeedPayload.md)\>

#### Parameters

##### event

`NostrEvent`

#### Returns

[`MarketplaceSeedPayload`](MarketplaceSeedPayload.md) \| `Promise`\<[`MarketplaceSeedPayload`](MarketplaceSeedPayload.md)\>

***

### publish()?

> `optional` **publish**(`event`): `unknown`

#### Parameters

##### event

`NostrEvent`

#### Returns

`unknown`
