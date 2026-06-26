# Type Alias: MarketplaceSessionDriverRecoveryEvent

> **MarketplaceSessionDriverRecoveryEvent** = \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"started"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `status`: `string`; `type`: `"progress"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"resumed"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `error`: `string`; `type`: `"failed"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"complete"`; \}

Defined in: [nostr-tools/marketplace/runtime-types.ts:697](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L697)
