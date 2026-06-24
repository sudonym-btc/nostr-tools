# Interface: MarketplaceClient

Defined in: [nostr-tools/marketplace/runtime-types.ts:1286](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1286)

## Properties

### arbitration

> **arbitration**: [`MarketplaceArbitrationApi`](MarketplaceArbitrationApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1300](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1300)

***

### arbitrationServices

> **arbitrationServices**: [`MarketplaceArbitrationServicesApi`](MarketplaceArbitrationServicesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1292](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1292)

***

### arbitrationServiceSelections

> **arbitrationServiceSelections**: [`MarketplaceArbitrationServiceSelectionsApi`](MarketplaceArbitrationServiceSelectionsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1293](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1293)

***

### auctions

> **auctions**: [`MarketplaceAuctionsApi`](MarketplaceAuctionsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1298](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1298)

***

### listings

> **listings**: [`MarketplaceListingsApi`](MarketplaceListingsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1288](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1288)

***

### locations

> **locations**: [`MarketplaceLocationsApi`](MarketplaceLocationsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1290](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1290)

***

### me

> **me**: [`MarketplaceMeApi`](MarketplaceMeApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1297](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1297)

***

### nextTradeIndex

> `readonly` **nextTradeIndex**: [`MarketplaceValue`](../type-aliases/MarketplaceValue.md)\<`number` \| `undefined`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1287](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1287)

***

### orders

> **orders**: [`MarketplaceOrdersApi`](MarketplaceOrdersApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1294](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1294)

***

### paymentMethod

> **paymentMethod**: [`MarketplacePaymentMethodApi`](MarketplacePaymentMethodApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1291](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1291)

***

### payments

> **payments**: [`MarketplacePaymentsApi`](MarketplacePaymentsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1299](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1299)

***

### reviews

> **reviews**: [`MarketplaceReviewsApi`](MarketplaceReviewsApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1295](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1295)

***

### shippingOption

> **shippingOption**: [`MarketplaceShippingOptionApi`](MarketplaceShippingOptionApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1289](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1289)

***

### structuredMessages

> **structuredMessages**: [`MarketplaceStructuredMessagesApi`](MarketplaceStructuredMessagesApi.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1296](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1296)

## Methods

### discoverHighWatermark()

> **discoverHighWatermark**(`options?`): `Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1301](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1301)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

***

### getNextAccountIndex()

> **getNextAccountIndex**(`options?`): `Promise`\<`number`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1302](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1302)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<`number`\>

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

***

### session()

> **session**(`signer`, `options?`): `Promise`\<[`MarketplaceSession`](MarketplaceSession.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1304](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1304)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1303](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1303)

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceStartResult`](../type-aliases/MarketplaceStartResult.md)\>
