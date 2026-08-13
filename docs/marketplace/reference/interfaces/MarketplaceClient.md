# Interface: MarketplaceClient

## Properties

### arbitration

> **arbitration**: [`MarketplaceArbitrationApi`](MarketplaceArbitrationApi.md)

***

### arbitrationServices

> **arbitrationServices**: [`MarketplaceArbitrationServicesApi`](MarketplaceArbitrationServicesApi.md)

***

### arbitrationServiceSelections

> **arbitrationServiceSelections**: [`MarketplaceArbitrationServiceSelectionsApi`](MarketplaceArbitrationServiceSelectionsApi.md)

***

### auctions

> **auctions**: [`MarketplaceAuctionsApi`](MarketplaceAuctionsApi.md)

***

### listings

> **listings**: [`MarketplaceListingsApi`](MarketplaceListingsApi.md)

***

### locations

> **locations**: [`MarketplaceLocationsApi`](MarketplaceLocationsApi.md)

***

### me

> **me**: [`MarketplaceMeApi`](MarketplaceMeApi.md)

***

### nextTradeIndex

> `readonly` **nextTradeIndex**: [`MarketplaceValue`](../type-aliases/MarketplaceValue.md)\<`number` \| `undefined`\>

***

### orders

> **orders**: [`MarketplaceOrdersApi`](MarketplaceOrdersApi.md)

***

### paymentMethod

> **paymentMethod**: [`MarketplacePaymentMethodApi`](MarketplacePaymentMethodApi.md)

***

### payments

> **payments**: [`MarketplacePaymentsApi`](MarketplacePaymentsApi.md)

***

### reviews

> **reviews**: [`MarketplaceReviewsApi`](MarketplaceReviewsApi.md)

***

### shippingOption

> **shippingOption**: [`MarketplaceShippingOptionApi`](MarketplaceShippingOptionApi.md)

***

### structuredMessages

> **structuredMessages**: [`MarketplaceStructuredMessagesApi`](MarketplaceStructuredMessagesApi.md)

## Methods

### discoverHighWatermark()

> **discoverHighWatermark**(`options?`): `Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

***

### getNextAccountIndex()

> **getNextAccountIndex**(`options?`): `Promise`\<`number`\>

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<`number`\>

***

### pay()

> **pay**(`listing`, `order`, `options?`): `AsyncIterable`\<[`MarketplacePaymentState`](../type-aliases/MarketplacePaymentState.md)\>

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

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceStartResult`](../type-aliases/MarketplaceStartResult.md)\>
