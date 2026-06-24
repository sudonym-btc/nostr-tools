# Interface: MarketplaceSessionPaymentMethodApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:338](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L338)

## Properties

### canonicalAssetId

> **canonicalAssetId**: (`assetId`) => `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:344](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L344)

#### Parameters

##### assetId

`string`

#### Returns

`string`

***

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:342](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L342)

#### Parameters

##### query?

[`PaymentMethodFindQuery`](../type-aliases/PaymentMethodFindQuery.md) = `{}`

#### Returns

`Filter`

***

### parse

> **parse**: (`event`) => [`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:339](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L339)

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md)

***

### template

> **template**: (`method`) => `EventTemplate`

Defined in: [nostr-tools/marketplace/runtime-types.ts:341](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L341)

#### Parameters

##### method

[`PaymentMethodTemplate`](../type-aliases/PaymentMethodTemplate.md)

#### Returns

`EventTemplate`

***

### validate

> **validate**: (`event`) => `boolean`

Defined in: [nostr-tools/marketplace/runtime-types.ts:340](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L340)

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`

## Methods

### ensureUpToDate()

> **ensureUpToDate**(`options?`): `Promise`\<[`MarketplacePaymentMethodEnsureResult`](../type-aliases/MarketplacePaymentMethodEnsureResult.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:346](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L346)

#### Parameters

##### options?

[`MarketplacePaymentMethodEnsureOptions`](../type-aliases/MarketplacePaymentMethodEnsureOptions.md)

#### Returns

`Promise`\<[`MarketplacePaymentMethodEnsureResult`](../type-aliases/MarketplacePaymentMethodEnsureResult.md)\>

***

### find()

> **find**(): `Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:345](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L345)

#### Returns

`Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>

***

### findOne()

> **findOne**(`query?`): `Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:343](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L343)

#### Parameters

##### query?

[`PaymentMethodFindQuery`](../type-aliases/PaymentMethodFindQuery.md)

#### Returns

`Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>
