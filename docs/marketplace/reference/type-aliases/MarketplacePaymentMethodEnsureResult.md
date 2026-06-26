# Type Alias: MarketplacePaymentMethodEnsureResult

> **MarketplacePaymentMethodEnsureResult** = \{ `reason`: `"no_listings"` \| `"no_trusted_arbiters"` \| `"no_policy_contributions"`; `status`: `"skipped"`; \} \| \{ `event`: `Event`; `status`: `"unchanged"`; \} \| \{ `event`: `Event`; `status`: `"created"`; \} \| \{ `event`: `Event`; `previousEvent`: `Event`; `status`: `"updated"`; \}

Defined in: [nostr-tools/marketplace/runtime-types.ts:332](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L332)
