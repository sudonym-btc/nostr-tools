# Interface: MarketplaceMeInboxApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1099](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1099)

## Properties

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1100](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1100)

#### Parameters

##### query

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md) & `object`

#### Returns

`Filter`

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1101](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1101)

#### Parameters

##### query?

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md)

##### options?

[`MarketplaceInboxFetchOptions`](../type-aliases/MarketplaceInboxFetchOptions.md)

#### Returns

`Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)[]\>

***

### watch()

> **watch**(`query?`, `options?`): [`MarketplaceInboxStream`](../type-aliases/MarketplaceInboxStream.md)

Defined in: [nostr-tools/marketplace/runtime-types.ts:1105](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/runtime-types.ts#L1105)

#### Parameters

##### query?

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md)

##### options?

[`MarketplaceInboxSubscribeOptions`](../type-aliases/MarketplaceInboxSubscribeOptions.md)

#### Returns

[`MarketplaceInboxStream`](../type-aliases/MarketplaceInboxStream.md)
