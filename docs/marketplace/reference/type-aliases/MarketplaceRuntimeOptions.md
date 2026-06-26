# Type Alias: MarketplaceRuntimeOptions

> **MarketplaceRuntimeOptions** = `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:773](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L773)

## Properties

### autoTrustArbiter?

> `optional` **autoTrustArbiter?**: `string` \| `string`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:783](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L783)

***

### bidPolicies?

> `optional` **bidPolicies?**: [`MarketplaceBidPolicy`](MarketplaceBidPolicy.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:781](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L781)

***

### driverRuntime?

> `optional` **driverRuntime?**: `MarketplaceDriverRuntimeReporter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:782](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L782)

***

### identity?

> `optional` **identity?**: [`MarketplaceRuntimeIdentity`](MarketplaceRuntimeIdentity.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:777](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L777)

***

### locationProvider?

> `optional` **locationProvider?**: [`MarketplaceLocationProvider`](../interfaces/MarketplaceLocationProvider.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:785](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L785)

***

### logger?

> `optional` **logger?**: [`MarketplaceLogger`](MarketplaceLogger.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:786](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L786)

***

### onInvalidEvent?

> `optional` **onInvalidEvent?**: [`MarketplaceInvalidEventHandler`](MarketplaceInvalidEventHandler.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:787](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L787)

***

### orderPolicies?

> `optional` **orderPolicies?**: [`MarketplaceOrderPolicy`](MarketplaceOrderPolicy.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:780](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L780)

***

### paymentMethod?

> `optional` **paymentMethod?**: [`MarketplacePaymentMethodDefaults`](MarketplacePaymentMethodDefaults.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:784](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L784)

***

### pool

> **pool**: [`MarketplaceRuntimePool`](MarketplaceRuntimePool.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:774](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L774)

***

### publish?

> `optional` **publish?**: (`event`) => `unknown` \| `Promise`\<`unknown`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:779](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L779)

#### Parameters

##### event

`Event`

#### Returns

`unknown` \| `Promise`\<`unknown`\>

***

### relays

> **relays**: `string`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:775](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L775)

***

### seed?

> `optional` **seed?**: `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:776](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L776)

***

### signer?

> `optional` **signer?**: [`MarketplaceSeedSigner`](MarketplaceSeedSigner.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:778](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L778)
