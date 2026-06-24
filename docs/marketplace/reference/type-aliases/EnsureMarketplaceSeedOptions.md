# Type Alias: EnsureMarketplaceSeedOptions

> **EnsureMarketplaceSeedOptions** = `object`

Defined in: [nostr-tools/marketplace/seed.ts:50](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/seed.ts#L50)

## Properties

### pool

> **pool**: `Pick`\<`AbstractSimplePool`, `"querySync"`\>

Defined in: [nostr-tools/marketplace/seed.ts:51](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/seed.ts#L51)

***

### pubkey

> **pubkey**: `string`

Defined in: [nostr-tools/marketplace/seed.ts:53](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/seed.ts#L53)

***

### relays

> **relays**: `string`[]

Defined in: [nostr-tools/marketplace/seed.ts:52](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/seed.ts#L52)

## Methods

### create()

> **create**(): \{ `event`: `Event`; `payload`: [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md); \} \| `Promise`\<\{ `event`: `Event`; `payload`: [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md); \}\>

Defined in: [nostr-tools/marketplace/seed.ts:55](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/seed.ts#L55)

#### Returns

\{ `event`: `Event`; `payload`: [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md); \} \| `Promise`\<\{ `event`: `Event`; `payload`: [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md); \}\>

***

### decrypt()

> **decrypt**(`event`): [`MarketplaceSeedPayload`](MarketplaceSeedPayload.md) \| `Promise`\<[`MarketplaceSeedPayload`](MarketplaceSeedPayload.md)\>

Defined in: [nostr-tools/marketplace/seed.ts:54](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/seed.ts#L54)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`MarketplaceSeedPayload`](MarketplaceSeedPayload.md) \| `Promise`\<[`MarketplaceSeedPayload`](MarketplaceSeedPayload.md)\>

***

### publish()?

> `optional` **publish**(`event`): `unknown`

Defined in: [nostr-tools/marketplace/seed.ts:58](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/seed.ts#L58)

#### Parameters

##### event

`NostrEvent`

#### Returns

`unknown`
