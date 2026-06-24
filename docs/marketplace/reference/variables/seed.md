# Variable: seed

> `const` **seed**: `object`

Defined in: [nostr-tools/marketplace/seed.ts:275](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/seed.ts#L275)

## Type Declaration

### createEvent

> **createEvent**: (`opts`) => `NostrEvent` = `createMarketplaceSeedEvent`

#### Parameters

##### opts

[`CreateMarketplaceSeedEventOptions`](../type-aliases/CreateMarketplaceSeedEventOptions.md)

#### Returns

`NostrEvent`

### decryptEvent

> **decryptEvent**: (`opts`) => [`MarketplaceSeedPayload`](../type-aliases/MarketplaceSeedPayload.md) = `decryptMarketplaceSeedEvent`

#### Parameters

##### opts

[`DecryptMarketplaceSeedEventOptions`](../type-aliases/DecryptMarketplaceSeedEventOptions.md)

#### Returns

[`MarketplaceSeedPayload`](../type-aliases/MarketplaceSeedPayload.md)

### deriveTradeId

> **deriveTradeId**: (`seed`, `context`) => `string` = `deriveMarketplaceTradeId`

#### Parameters

##### seed

`string`

##### context?

[`MarketplaceSeedDerivationContext`](../type-aliases/MarketplaceSeedDerivationContext.md) = `{}`

#### Returns

`string`

### deriveTradeMaterial

> **deriveTradeMaterial**: (`seed`, `context`) => [`MarketplaceTradeMaterial`](../type-aliases/MarketplaceTradeMaterial.md) = `deriveMarketplaceTradeMaterial`

#### Parameters

##### seed

`string`

##### context?

[`MarketplaceSeedDerivationContext`](../type-aliases/MarketplaceSeedDerivationContext.md) = `{}`

#### Returns

[`MarketplaceTradeMaterial`](../type-aliases/MarketplaceTradeMaterial.md)

### deriveTradeSecretKey

> **deriveTradeSecretKey**: (`seed`, `context`) => `Uint8Array` = `deriveMarketplaceTradeSecretKey`

#### Parameters

##### seed

`string`

##### context?

[`MarketplaceSeedDerivationContext`](../type-aliases/MarketplaceSeedDerivationContext.md) = `{}`

#### Returns

`Uint8Array`

### encodePayload

> **encodePayload**: (`seed`) => `string` = `encodeMarketplaceSeedPayload`

#### Parameters

##### seed

`string` \| [`MarketplaceSeedPayload`](../type-aliases/MarketplaceSeedPayload.md)

#### Returns

`string`

### ensure

> **ensure**: (`opts`) => `Promise`\<[`MarketplaceSeedResolution`](../type-aliases/MarketplaceSeedResolution.md)\> = `ensureMarketplaceSeed`

#### Parameters

##### opts

[`EnsureMarketplaceSeedOptions`](../type-aliases/EnsureMarketplaceSeedOptions.md)

#### Returns

`Promise`\<[`MarketplaceSeedResolution`](../type-aliases/MarketplaceSeedResolution.md)\>

### fetchEvent

> **fetchEvent**: (`pool`, `relays`, `pubkey`) => `Promise`\<`NostrEvent` \| `null`\> = `fetchMarketplaceSeedEvent`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### pubkey

`string`

#### Returns

`Promise`\<`NostrEvent` \| `null`\>

### filter

> **filter**: (`pubkey`) => `Filter` = `marketplaceSeedFilter`

#### Parameters

##### pubkey

`string`

#### Returns

`Filter`

### fromBytes

> **fromBytes**: (`seed`) => `string` = `marketplaceSeedFromBytes`

#### Parameters

##### seed

`Uint8Array`

#### Returns

`string`

### generate

> **generate**: () => `string` = `generateMarketplaceSeed`

#### Returns

`string`

### getOrCreate

> **getOrCreate**: (`opts`) => `Promise`\<[`MarketplaceSeedResolution`](../type-aliases/MarketplaceSeedResolution.md)\> = `getOrCreateMarketplaceSeed`

#### Parameters

##### opts

[`GetOrCreateMarketplaceSeedOptions`](../type-aliases/GetOrCreateMarketplaceSeedOptions.md) \| [`GetOrCreateMarketplaceSeedWithSignerOptions`](../type-aliases/GetOrCreateMarketplaceSeedWithSignerOptions.md)

#### Returns

`Promise`\<[`MarketplaceSeedResolution`](../type-aliases/MarketplaceSeedResolution.md)\>

### normalize

> **normalize**: (`seed`) => `string` = `normalizeMarketplaceSeed`

#### Parameters

##### seed

`string`

#### Returns

`string`

### parsePayload

> **parsePayload**: (`content`) => [`MarketplaceSeedPayload`](../type-aliases/MarketplaceSeedPayload.md) = `parseMarketplaceSeedPayload`

#### Parameters

##### content

`string`

#### Returns

[`MarketplaceSeedPayload`](../type-aliases/MarketplaceSeedPayload.md)

### payload

> **payload**: (`seed`) => [`MarketplaceSeedPayload`](../type-aliases/MarketplaceSeedPayload.md) = `marketplaceSeedPayload`

#### Parameters

##### seed

`string`

#### Returns

[`MarketplaceSeedPayload`](../type-aliases/MarketplaceSeedPayload.md)

### template

> **template**: (`seed`) => `EventTemplate` = `generateMarketplaceSeedEventTemplate`

#### Parameters

##### seed

[`MarketplaceSeedTemplate`](../type-aliases/MarketplaceSeedTemplate.md)

#### Returns

`EventTemplate`

### toBytes

> **toBytes**: (`seed`) => `Uint8Array` = `marketplaceSeedToBytes`

#### Parameters

##### seed

`string`

#### Returns

`Uint8Array`

### validate

> **validate**: (`event`) => `boolean` = `validateMarketplaceSeedEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
