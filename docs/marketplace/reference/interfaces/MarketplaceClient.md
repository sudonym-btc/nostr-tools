# Interface: MarketplaceClient

Defined in: [nostr-tools/marketplace/runtime-types.ts:1289](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1289)

## Properties

### arbitration

> **arbitration**: [`MarketplaceArbitrationApi`](MarketplaceArbitrationApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1303](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1303)

***

### arbitrationServices

> **arbitrationServices**: [`MarketplaceArbitrationServicesApi`](MarketplaceArbitrationServicesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1295](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1295)

***

### arbitrationServiceSelections

> **arbitrationServiceSelections**: [`MarketplaceArbitrationServiceSelectionsApi`](MarketplaceArbitrationServiceSelectionsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1296](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1296)

***

### auctions

> **auctions**: [`MarketplaceAuctionsApi`](MarketplaceAuctionsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1301](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1301)

***

### listings

> **listings**: [`MarketplaceListingsApi`](MarketplaceListingsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1291](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1291)

***

### locations

> **locations**: [`MarketplaceLocationsApi`](MarketplaceLocationsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1293](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1293)

***

### me

> **me**: [`MarketplaceMeApi`](MarketplaceMeApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1300](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1300)

***

### nextTradeIndex

> `readonly` **nextTradeIndex**: [`MarketplaceValue`](../type-aliases/MarketplaceValue.md)\<`number` \| `undefined`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1290](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1290)

***

### orders

> **orders**: [`MarketplaceOrdersApi`](MarketplaceOrdersApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1297](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1297)

***

### paymentMethod

> **paymentMethod**: [`MarketplacePaymentMethodApi`](MarketplacePaymentMethodApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1294](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1294)

***

### payments

> **payments**: [`MarketplacePaymentsApi`](MarketplacePaymentsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1302](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1302)

***

### reviews

> **reviews**: [`MarketplaceReviewsApi`](MarketplaceReviewsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1298](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1298)

***

### shippingOption

> **shippingOption**: [`MarketplaceShippingOptionApi`](MarketplaceShippingOptionApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1292](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1292)

***

### structuredMessages

> **structuredMessages**: [`MarketplaceStructuredMessagesApi`](MarketplaceStructuredMessagesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1299](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1299)

## Methods

### discoverHighWatermark()

> **discoverHighWatermark**(`options?`): `Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1304](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1304)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

***

### getNextAccountIndex()

> **getNextAccountIndex**(`options?`): `Promise`\<`number`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1305](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1305)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<`number`\>

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

***

### session()

> **session**(`signer`, `options?`): `Promise`\<[`MarketplaceSession`](MarketplaceSession.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1307](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1307)

#### Parameters

##### signer

[`MarketplaceSeedSigner`](../type-aliases/MarketplaceSeedSigner.md)

##### options?

[`MarketplaceSessionOptions`](../type-aliases/MarketplaceSessionOptions.md)

#### Returns

`Promise`\<[`MarketplaceSession`](MarketplaceSession.md)\>

***

### start()

> **start**(`options?`): `Promise`\<[`MarketplaceStartResult`](../type-aliases/MarketplaceStartResult.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1306](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1306)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceStartResult`](../type-aliases/MarketplaceStartResult.md)\>
