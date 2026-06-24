# Variable: paymentMethod

> `const` **paymentMethod**: `object`

Defined in: [nostr-tools/marketplace/paymentmethod.ts:216](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/paymentmethod.ts#L216)

## Type Declaration

### canonicalAssetId

> **canonicalAssetId**: (`assetId`) => `string`

#### Parameters

##### assetId

`string`

#### Returns

`string`

### cashuPubkeyTag

> **cashuPubkeyTag**: (`pubkey`) => `string`[]

#### Parameters

##### pubkey

`string`

#### Returns

`string`[]

### evmAddressOwnershipMessage

> **evmAddressOwnershipMessage**: (`opts`) => `string`

#### Parameters

##### opts

###### evmAddress

`string`

###### nostrPubkey

`string`

#### Returns

`string`

### evmAddressTag

> **evmAddressTag**: (`address`, `eip191Proof?`) => `string`[]

#### Parameters

##### address

`string`

##### eip191Proof?

`string`

#### Returns

`string`[]

### filter

> **filter**: (`query`) => `Filter` = `paymentMethodFilter`

#### Parameters

##### query?

[`PaymentMethodFindQuery`](../type-aliases/PaymentMethodFindQuery.md) = `{}`

#### Returns

`Filter`

### findOne

> **findOne**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\> = `findPaymentMethod`

#### Parameters

##### pool

`Pick`\<`AbstractSimplePool`, `"querySync"`\>

##### relays

`string`[]

##### query?

[`PaymentMethodFindQuery`](../type-aliases/PaymentMethodFindQuery.md) = `{}`

##### options?

[`PaymentMethodFindOptions`](../type-aliases/PaymentMethodFindOptions.md) = `{}`

#### Returns

`Promise`\<[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) \| `null`\>

### parse

> **parse**: (`event`) => [`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md) = `parsePaymentMethodEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

[`ParsedPaymentMethod`](../type-aliases/ParsedPaymentMethod.md)

### template

> **template**: (`method`) => `EventTemplate` = `generatePaymentMethodEventTemplate`

#### Parameters

##### method

[`PaymentMethodTemplate`](../type-aliases/PaymentMethodTemplate.md)

#### Returns

`EventTemplate`

### validate

> **validate**: (`event`) => `boolean` = `validatePaymentMethodEvent`

#### Parameters

##### event

`NostrEvent`

#### Returns

`boolean`
