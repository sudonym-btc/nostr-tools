# Type Alias: MarketplaceSessionOptions

> **MarketplaceSessionOptions** = `Omit`\<[`MarketplaceRuntimeOptions`](MarketplaceRuntimeOptions.md), `"pool"` \| `"relays"` \| `"identity"` \| `"seed"` \| `"signer"` \| `"publish"` \| `"orderPolicies"` \| `"bidPolicies"`\> & [`MarketplaceDriverOptions`](MarketplaceDriverOptions.md) & `object`

Defined in: [nostr-tools/marketplace/runtime-types.ts:891](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L891)

## Type Declaration

### createdAt?

> `optional` **createdAt?**: `number`

### ensurePaymentMethod?

> `optional` **ensurePaymentMethod?**: `boolean`

### paymentMethod?

> `optional` **paymentMethod?**: [`MarketplacePaymentMethodDefaults`](MarketplacePaymentMethodDefaults.md)

### pubkey?

> `optional` **pubkey?**: `string`

### seed?

> `optional` **seed?**: `string`

### publish()?

> `optional` **publish**(`event`): `unknown`

#### Parameters

##### event

`NostrEvent`

#### Returns

`unknown`
