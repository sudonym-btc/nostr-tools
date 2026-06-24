# Interface: MarketplaceArbitrationApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1281](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1281)

## Methods

### arbitrate()

> **arbitrate**(`request`): `AsyncIterable`\<[`MarketplacePaymentArbitrationRuntimeState`](../type-aliases/MarketplacePaymentArbitrationRuntimeState.md)\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1283](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1283)

#### Parameters

##### request

[`MarketplacePaymentArbitrationRequest`](../type-aliases/MarketplacePaymentArbitrationRequest.md)

#### Returns

`AsyncIterable`\<[`MarketplacePaymentArbitrationRuntimeState`](../type-aliases/MarketplacePaymentArbitrationRuntimeState.md)\>

***

### start()

> **start**(`options?`): [`MarketplaceArbitrationRuntime`](../type-aliases/MarketplaceArbitrationRuntime.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1282](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L1282)

#### Parameters

##### options?

[`MarketplaceArbitrationStartOptions`](../type-aliases/MarketplaceArbitrationStartOptions.md)

#### Returns

[`MarketplaceArbitrationRuntime`](../type-aliases/MarketplaceArbitrationRuntime.md)
