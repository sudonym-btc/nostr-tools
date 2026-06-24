# Type Alias: MarketplaceSessionDriverRecoveryEvent

> **MarketplaceSessionDriverRecoveryEvent** = \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"started"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `status`: `string`; `type`: `"progress"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"resumed"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `error`: `string`; `type`: `"failed"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"complete"`; \}

Defined in: [nostr-tools/marketplace/runtime-types.ts:694](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/runtime-types.ts#L694)
