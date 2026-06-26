# Type Alias: MarketplacePaymentArbitrationState

> **MarketplacePaymentArbitrationState** = \{ `data?`: `Record`\<`string`, `unknown`\>; `status`: `string`; `type`: `"progress"`; \} \| \{ `data?`: `Record`\<`string`, `unknown`\>; `inputs?`: `Record`\<`string`, `unknown`\>[]; `outputs?`: [`PaymentSettlementOutput`](PaymentSettlementOutput.md)[]; `proof`: [`PaymentProofEvidence`](PaymentProofEvidence.md); `type`: `"settlement_ready"`; \} \| \{ `data?`: `Record`\<`string`, `unknown`\>; `inputs?`: `Record`\<`string`, `unknown`\>[]; `outputs?`: [`PaymentSettlementOutput`](PaymentSettlementOutput.md)[]; `proof?`: [`PaymentProofEvidence`](PaymentProofEvidence.md) \| `null`; `type`: `"completed"`; \}

Defined in: [nostr-tools/marketplace/runtime-types.ts:418](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L418)
