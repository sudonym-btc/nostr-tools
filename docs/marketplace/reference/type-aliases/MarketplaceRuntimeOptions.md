# Type Alias: MarketplaceRuntimeOptions

> **MarketplaceRuntimeOptions** = `object`

## Properties

### autoTrustArbiter?

> `optional` **autoTrustArbiter?**: `string` \| `string`[]

***

### bidPolicies?

> `optional` **bidPolicies?**: [`MarketplaceBidPolicy`](MarketplaceBidPolicy.md)[]

***

### driverRuntime?

> `optional` **driverRuntime?**: `MarketplaceDriverRuntimeReporter`

***

### identity?

> `optional` **identity?**: [`MarketplaceRuntimeIdentity`](MarketplaceRuntimeIdentity.md)

***

### locationProvider?

> `optional` **locationProvider?**: [`MarketplaceLocationProvider`](../interfaces/MarketplaceLocationProvider.md)

***

### logger?

> `optional` **logger?**: [`MarketplaceLogger`](MarketplaceLogger.md)

***

### onInvalidEvent?

> `optional` **onInvalidEvent?**: [`MarketplaceInvalidEventHandler`](MarketplaceInvalidEventHandler.md)

***

### orderPolicies?

> `optional` **orderPolicies?**: [`MarketplaceOrderPolicy`](MarketplaceOrderPolicy.md)[]

***

### paymentMethod?

> `optional` **paymentMethod?**: [`MarketplacePaymentMethodDefaults`](MarketplacePaymentMethodDefaults.md)

***

### pool

> **pool**: [`MarketplaceRuntimePool`](MarketplaceRuntimePool.md)

***

### publish?

> `optional` **publish?**: (`event`) => `unknown` \| `Promise`\<`unknown`\>

#### Parameters

##### event

`Event`

#### Returns

`unknown` \| `Promise`\<`unknown`\>

***

### relays

> **relays**: `string`[]

***

### seed?

> `optional` **seed?**: `string`

***

### settlementJournal?

> `optional` **settlementJournal?**: [`MarketplaceSettlementJournal`](MarketplaceSettlementJournal.md)

Required for auction settlement so financial effects and relay publication can resume safely.

***

### signer?

> `optional` **signer?**: [`MarketplaceSeedSigner`](MarketplaceSeedSigner.md)
