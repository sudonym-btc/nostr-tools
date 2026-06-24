# Type Alias: MarketplacePaymentMethodEnsureResult

> **MarketplacePaymentMethodEnsureResult** = \{ `reason`: `"no_listings"` \| `"no_trusted_arbiters"` \| `"no_policy_contributions"`; `status`: `"skipped"`; \} \| \{ `event`: `Event`; `status`: `"unchanged"`; \} \| \{ `event`: `Event`; `status`: `"created"`; \} \| \{ `event`: `Event`; `previousEvent`: `Event`; `status`: `"updated"`; \}

Defined in: [nostr-tools/marketplace/runtime-types.ts:332](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L332)
