# Interface: MarketplaceSession

Defined in: [nostr-tools/marketplace/runtime-types.ts:1334](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1334)

## Extends

- `Omit`\<[`MarketplaceClient`](MarketplaceClient.md), `"orders"` \| `"auctions"`\>

## Properties

### arbitration

> **arbitration**: [`MarketplaceArbitrationApi`](MarketplaceArbitrationApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1300](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1300)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`arbitration`](MarketplaceClient.md#arbitration)

***

### arbitrationServices

> **arbitrationServices**: [`MarketplaceArbitrationServicesApi`](MarketplaceArbitrationServicesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1292](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1292)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`arbitrationServices`](MarketplaceClient.md#arbitrationservices)

***

### arbitrationServiceSelections

> **arbitrationServiceSelections**: [`MarketplaceArbitrationServiceSelectionsApi`](MarketplaceArbitrationServiceSelectionsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1293](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1293)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`arbitrationServiceSelections`](MarketplaceClient.md#arbitrationserviceselections)

***

### auctions

> **auctions**: `MarketplaceSessionAuctionsApi`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1339](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1339)

***

### drivers

> **drivers**: [`MarketplaceSessionDriversApi`](../type-aliases/MarketplaceSessionDriversApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1342](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1342)

***

### identity

> **identity**: `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1335](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1335)

#### pubkey

> **pubkey**: `string`

***

### listings

> **listings**: [`MarketplaceListingsApi`](MarketplaceListingsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1288](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1288)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`listings`](MarketplaceClient.md#listings)

***

### locations

> **locations**: [`MarketplaceLocationsApi`](MarketplaceLocationsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1290](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1290)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`locations`](MarketplaceClient.md#locations)

***

### me

> **me**: [`MarketplaceMeApi`](MarketplaceMeApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1297](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1297)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`me`](MarketplaceClient.md#me)

***

### nextTradeIndex

> `readonly` **nextTradeIndex**: [`MarketplaceValue`](../type-aliases/MarketplaceValue.md)\<`number` \| `undefined`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1287](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1287)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`nextTradeIndex`](MarketplaceClient.md#nexttradeindex)

***

### orders

> **orders**: `MarketplaceSessionOrdersApi`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1338](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1338)

***

### paymentMethod

> **paymentMethod**: [`MarketplaceSessionPaymentMethodApi`](MarketplaceSessionPaymentMethodApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1341](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1341)

#### Overrides

[`MarketplaceClient`](MarketplaceClient.md).[`paymentMethod`](MarketplaceClient.md#paymentmethod)

***

### payments

> **payments**: [`MarketplacePaymentsApi`](MarketplacePaymentsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1299](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1299)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`payments`](MarketplaceClient.md#payments)

***

### reviews

> **reviews**: [`MarketplaceReviewsApi`](MarketplaceReviewsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1295](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1295)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`reviews`](MarketplaceClient.md#reviews)

***

### seed

> **seed**: [`MarketplaceSessionSeedApi`](MarketplaceSessionSeedApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1340](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1340)

***

### shippingOption

> **shippingOption**: [`MarketplaceShippingOptionApi`](MarketplaceShippingOptionApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1289](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1289)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`shippingOption`](MarketplaceClient.md#shippingoption)

***

### structuredMessages

> **structuredMessages**: [`MarketplaceStructuredMessagesApi`](MarketplaceStructuredMessagesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1296](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1296)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`structuredMessages`](MarketplaceClient.md#structuredmessages)

## Methods

### discoverHighWatermark()

> **discoverHighWatermark**(`options?`): `Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1301](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1301)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`discoverHighWatermark`](MarketplaceClient.md#discoverhighwatermark)

***

### getNextAccountIndex()

> **getNextAccountIndex**(`options?`): `Promise`\<`number`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1302](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1302)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<`number`\>

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`getNextAccountIndex`](MarketplaceClient.md#getnextaccountindex)

***

### pay()

> **pay**(`listing`, `order`, `options?`): `AsyncIterable`\<[`MarketplacePaymentState`](../type-aliases/MarketplacePaymentState.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1305](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1305)

#### Parameters

##### listing

`NostrEvent` \| [`MarketplaceListing`](../type-aliases/MarketplaceListing.md)

##### order

[`MarketplaceOrderCreateParams`](../type-aliases/MarketplaceOrderCreateParams.md)

##### options?

[`MarketplacePayOptions`](../type-aliases/MarketplacePayOptions.md)

#### Returns

`AsyncIterable`\<[`MarketplacePaymentState`](../type-aliases/MarketplacePaymentState.md)\>

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`pay`](MarketplaceClient.md#pay)

***

### session()

> **session**(`signer`, `options?`): `Promise`\<`MarketplaceSession`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1304](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1304)

#### Parameters

##### signer

[`MarketplaceSeedSigner`](../type-aliases/MarketplaceSeedSigner.md)

##### options?

[`MarketplaceSessionOptions`](../type-aliases/MarketplaceSessionOptions.md)

#### Returns

`Promise`\<`MarketplaceSession`\>

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`session`](MarketplaceClient.md#session)

***

### start()

> **start**(`options?`): `Promise`\<[`MarketplaceStartResult`](../type-aliases/MarketplaceStartResult.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1303](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1303)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceStartResult`](../type-aliases/MarketplaceStartResult.md)\>

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`start`](MarketplaceClient.md#start)
