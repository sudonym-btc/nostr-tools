# Type Alias: MarketplaceStreamPredicate\<TEvent, TNext\>

> **MarketplaceStreamPredicate**\<`TEvent`, `TNext`\> = ((`event`) => `event is TNext`) \| ((`event`) => `boolean`)

Defined in: [nostr-tools/marketplace/stream.ts:140](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/stream.ts#L140)

## Type Parameters

### TEvent

`TEvent`

### TNext

`TNext` *extends* `TEvent` = `TEvent`
