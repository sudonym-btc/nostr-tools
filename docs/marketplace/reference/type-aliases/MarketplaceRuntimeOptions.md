# Type Alias: MarketplaceRuntimeOptions

> **MarketplaceRuntimeOptions** = `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:776](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L776)

## Properties

### autoTrustArbiter?

> `optional` **autoTrustArbiter?**: `string` \| `string`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:786](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L786)

***

### bidPolicies?

> `optional` **bidPolicies?**: [`MarketplaceBidPolicy`](MarketplaceBidPolicy.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:784](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L784)

***

### driverRuntime?

> `optional` **driverRuntime?**: `MarketplaceDriverRuntimeReporter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:785](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L785)

***

### identity?

> `optional` **identity?**: [`MarketplaceRuntimeIdentity`](MarketplaceRuntimeIdentity.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:780](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L780)

***

### locationProvider?

> `optional` **locationProvider?**: [`MarketplaceLocationProvider`](../interfaces/MarketplaceLocationProvider.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:788](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L788)

***

### logger?

> `optional` **logger?**: [`MarketplaceLogger`](MarketplaceLogger.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:789](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L789)

***

### onInvalidEvent?

> `optional` **onInvalidEvent?**: [`MarketplaceInvalidEventHandler`](MarketplaceInvalidEventHandler.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:790](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L790)

***

### orderPolicies?

> `optional` **orderPolicies?**: [`MarketplaceOrderPolicy`](MarketplaceOrderPolicy.md)[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:783](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L783)

***

### paymentMethod?

> `optional` **paymentMethod?**: [`MarketplacePaymentMethodDefaults`](MarketplacePaymentMethodDefaults.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:787](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L787)

***

### pool

> **pool**: [`MarketplaceRuntimePool`](MarketplaceRuntimePool.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:777](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L777)

***

### publish?

> `optional` **publish?**: (`event`) => `unknown` \| `Promise`\<`unknown`\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:782](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L782)

#### Parameters

##### event

`Event`

#### Returns

`unknown` \| `Promise`\<`unknown`\>

***

### relays

> **relays**: `string`[]

Defined in: [nostr-tools/marketplace/runtime-types.ts:778](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L778)

***

### seed?

> `optional` **seed?**: `string`

Defined in: [nostr-tools/marketplace/runtime-types.ts:779](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L779)

***

### signer?

> `optional` **signer?**: [`MarketplaceSeedSigner`](MarketplaceSeedSigner.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:781](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L781)
