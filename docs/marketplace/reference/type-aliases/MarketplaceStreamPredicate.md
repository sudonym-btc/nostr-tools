# Type Alias: MarketplaceStreamPredicate\<TEvent, TNext\>

> **MarketplaceStreamPredicate**\<`TEvent`, `TNext`\> = ((`event`) => `event is TNext`) \| ((`event`) => `boolean`)

Defined in: [nostr-tools/marketplace/stream.ts:140](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/stream.ts#L140)

## Type Parameters

### TEvent

`TEvent`

### TNext

`TNext` *extends* `TEvent` = `TEvent`
