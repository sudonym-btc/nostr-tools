# Type Alias: MarketplaceSessionDriverRecoveryEvent

> **MarketplaceSessionDriverRecoveryEvent** = \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"started"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `status`: `string`; `type`: `"progress"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"resumed"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `error`: `string`; `type`: `"failed"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"complete"`; \}

Defined in: [nostr-tools/marketplace/runtime-types.ts:694](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L694)
