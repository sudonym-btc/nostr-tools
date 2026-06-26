# Type Alias: MarketplacePaymentArbitrationState

> **MarketplacePaymentArbitrationState** = \{ `data?`: `Record`\<`string`, `unknown`\>; `status`: `string`; `type`: `"progress"`; \} \| \{ `data?`: `Record`\<`string`, `unknown`\>; `inputs?`: `Record`\<`string`, `unknown`\>[]; `outputs?`: [`PaymentSettlementOutput`](PaymentSettlementOutput.md)[]; `proof`: [`PaymentProofEvidence`](PaymentProofEvidence.md); `type`: `"settlement_ready"`; \} \| \{ `data?`: `Record`\<`string`, `unknown`\>; `inputs?`: `Record`\<`string`, `unknown`\>[]; `outputs?`: [`PaymentSettlementOutput`](PaymentSettlementOutput.md)[]; `proof?`: [`PaymentProofEvidence`](PaymentProofEvidence.md) \| `null`; `type`: `"completed"`; \}

Defined in: [nostr-tools/marketplace/runtime-types.ts:418](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L418)
