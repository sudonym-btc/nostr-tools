# Interface: MarketplaceSession

Defined in: [nostr-tools/marketplace/runtime-types.ts:1337](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1337)

## Extends

- `Omit`\<[`MarketplaceClient`](MarketplaceClient.md), `"orders"` \| `"auctions"`\>

## Properties

### arbitration

> **arbitration**: [`MarketplaceArbitrationApi`](MarketplaceArbitrationApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1303](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1303)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`arbitration`](MarketplaceClient.md#arbitration)

***

### arbitrationServices

> **arbitrationServices**: [`MarketplaceArbitrationServicesApi`](MarketplaceArbitrationServicesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1295](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1295)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`arbitrationServices`](MarketplaceClient.md#arbitrationservices)

***

### arbitrationServiceSelections

> **arbitrationServiceSelections**: [`MarketplaceArbitrationServiceSelectionsApi`](MarketplaceArbitrationServiceSelectionsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1296](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1296)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`arbitrationServiceSelections`](MarketplaceClient.md#arbitrationserviceselections)

***

### auctions

> **auctions**: `MarketplaceSessionAuctionsApi`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1342](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1342)

***

### drivers

> **drivers**: [`MarketplaceSessionDriversApi`](../type-aliases/MarketplaceSessionDriversApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1345](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1345)

***

### identity

> **identity**: `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1338](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1338)

#### pubkey

> **pubkey**: `string`

***

### listings

> **listings**: [`MarketplaceListingsApi`](MarketplaceListingsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1291](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1291)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`listings`](MarketplaceClient.md#listings)

***

### locations

> **locations**: [`MarketplaceLocationsApi`](MarketplaceLocationsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1293](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1293)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`locations`](MarketplaceClient.md#locations)

***

### me

> **me**: [`MarketplaceMeApi`](MarketplaceMeApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1300](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1300)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`me`](MarketplaceClient.md#me)

***

### nextTradeIndex

> `readonly` **nextTradeIndex**: [`MarketplaceValue`](../type-aliases/MarketplaceValue.md)\<`number` \| `undefined`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1290](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1290)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`nextTradeIndex`](MarketplaceClient.md#nexttradeindex)

***

### orders

> **orders**: `MarketplaceSessionOrdersApi`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1341](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1341)

***

### paymentMethod

> **paymentMethod**: [`MarketplaceSessionPaymentMethodApi`](MarketplaceSessionPaymentMethodApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1344](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1344)

#### Overrides

[`MarketplaceClient`](MarketplaceClient.md).[`paymentMethod`](MarketplaceClient.md#paymentmethod)

***

### payments

> **payments**: [`MarketplacePaymentsApi`](MarketplacePaymentsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1302](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1302)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`payments`](MarketplaceClient.md#payments)

***

### reviews

> **reviews**: [`MarketplaceReviewsApi`](MarketplaceReviewsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1298](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1298)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`reviews`](MarketplaceClient.md#reviews)

***

### seed

> **seed**: [`MarketplaceSessionSeedApi`](MarketplaceSessionSeedApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1343](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1343)

***

### shippingOption

> **shippingOption**: [`MarketplaceShippingOptionApi`](MarketplaceShippingOptionApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1292](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1292)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`shippingOption`](MarketplaceClient.md#shippingoption)

***

### structuredMessages

> **structuredMessages**: [`MarketplaceStructuredMessagesApi`](MarketplaceStructuredMessagesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1299](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1299)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`structuredMessages`](MarketplaceClient.md#structuredmessages)

## Methods

### discoverHighWatermark()

> **discoverHighWatermark**(`options?`): `Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1304](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1304)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1305](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1305)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1308](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1308)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1307](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1307)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1306](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1306)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceStartResult`](../type-aliases/MarketplaceStartResult.md)\>

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`start`](MarketplaceClient.md#start)
