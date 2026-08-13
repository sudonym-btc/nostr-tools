# Type Alias: MarketplaceSessionDriverRecoveryEvent

> **MarketplaceSessionDriverRecoveryEvent** = \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"started"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `status`: `string`; `type`: `"progress"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"resumed"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `error`: `string`; `type`: `"failed"`; \} \| \{ `at`: `number`; `data?`: `Record`\<`string`, `unknown`\>; `type`: `"complete"`; \}
