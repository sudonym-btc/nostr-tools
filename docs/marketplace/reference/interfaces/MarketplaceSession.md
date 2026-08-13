# Interface: MarketplaceSession

## Extends

- `Omit`\<[`MarketplaceClient`](MarketplaceClient.md), `"orders"` \| `"auctions"`\>

## Properties

### arbitration

> **arbitration**: [`MarketplaceArbitrationApi`](MarketplaceArbitrationApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`arbitration`](MarketplaceClient.md#arbitration)

***

### arbitrationServices

> **arbitrationServices**: [`MarketplaceArbitrationServicesApi`](MarketplaceArbitrationServicesApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`arbitrationServices`](MarketplaceClient.md#arbitrationservices)

***

### arbitrationServiceSelections

> **arbitrationServiceSelections**: [`MarketplaceArbitrationServiceSelectionsApi`](MarketplaceArbitrationServiceSelectionsApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`arbitrationServiceSelections`](MarketplaceClient.md#arbitrationserviceselections)

***

### auctions

> **auctions**: `MarketplaceSessionAuctionsApi`

***

### drivers

> **drivers**: [`MarketplaceSessionDriversApi`](../type-aliases/MarketplaceSessionDriversApi.md)

***

### identity

> **identity**: `object`

#### pubkey

> **pubkey**: `string`

***

### listings

> **listings**: [`MarketplaceListingsApi`](MarketplaceListingsApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`listings`](MarketplaceClient.md#listings)

***

### locations

> **locations**: [`MarketplaceLocationsApi`](MarketplaceLocationsApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`locations`](MarketplaceClient.md#locations)

***

### me

> **me**: [`MarketplaceMeApi`](MarketplaceMeApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`me`](MarketplaceClient.md#me)

***

### nextTradeIndex

> `readonly` **nextTradeIndex**: [`MarketplaceValue`](../type-aliases/MarketplaceValue.md)\<`number` \| `undefined`\>

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`nextTradeIndex`](MarketplaceClient.md#nexttradeindex)

***

### orders

> **orders**: `MarketplaceSessionOrdersApi`

***

### paymentMethod

> **paymentMethod**: [`MarketplaceSessionPaymentMethodApi`](MarketplaceSessionPaymentMethodApi.md)

#### Overrides

[`MarketplaceClient`](MarketplaceClient.md).[`paymentMethod`](MarketplaceClient.md#paymentmethod)

***

### payments

> **payments**: [`MarketplacePaymentsApi`](MarketplacePaymentsApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`payments`](MarketplaceClient.md#payments)

***

### reviews

> **reviews**: [`MarketplaceReviewsApi`](MarketplaceReviewsApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`reviews`](MarketplaceClient.md#reviews)

***

### seed

> **seed**: [`MarketplaceSessionSeedApi`](MarketplaceSessionSeedApi.md)

***

### shippingOption

> **shippingOption**: [`MarketplaceShippingOptionApi`](MarketplaceShippingOptionApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`shippingOption`](MarketplaceClient.md#shippingoption)

***

### structuredMessages

> **structuredMessages**: [`MarketplaceStructuredMessagesApi`](MarketplaceStructuredMessagesApi.md)

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`structuredMessages`](MarketplaceClient.md#structuredmessages)

## Methods

### discoverHighWatermark()

> **discoverHighWatermark**(`options?`): `Promise`\<[`MarketplaceHighWatermarkDiscovery`](../type-aliases/MarketplaceHighWatermarkDiscovery.md)\>

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

#### Parameters

##### options?

[`MarketplaceHighWatermarkOptions`](../type-aliases/MarketplaceHighWatermarkOptions.md)

#### Returns

`Promise`\<[`MarketplaceStartResult`](../type-aliases/MarketplaceStartResult.md)\>

#### Inherited from

[`MarketplaceClient`](MarketplaceClient.md).[`start`](MarketplaceClient.md#start)
