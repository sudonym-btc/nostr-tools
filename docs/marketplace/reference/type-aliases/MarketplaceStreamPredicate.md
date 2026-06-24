# Type Alias: MarketplaceStreamPredicate\<TEvent, TNext\>

> **MarketplaceStreamPredicate**\<`TEvent`, `TNext`\> = ((`event`) => `event is TNext`) \| ((`event`) => `boolean`)

Defined in: [nostr-tools/marketplace/stream.ts:140](https://github.com/sudonym-btc/nostr-tools/blob/9cbf8271208bdb810a6cd927b99a00c24625fa89/marketplace/stream.ts#L140)

## Type Parameters

### TEvent

`TEvent`

### TNext

`TNext` *extends* `TEvent` = `TEvent`
