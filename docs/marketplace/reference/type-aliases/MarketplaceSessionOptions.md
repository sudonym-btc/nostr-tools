# Type Alias: MarketplaceSessionOptions

> **MarketplaceSessionOptions** = `Omit`\<[`MarketplaceRuntimeOptions`](MarketplaceRuntimeOptions.md), `"pool"` \| `"relays"` \| `"identity"` \| `"seed"` \| `"signer"` \| `"publish"` \| `"orderPolicies"` \| `"bidPolicies"`\> & [`MarketplaceDriverOptions`](MarketplaceDriverOptions.md) & `object`

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
