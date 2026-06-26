# Interface: MarketplaceMeInboxApi

Defined in: [nostr-tools/marketplace/runtime-types.ts:1102](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1102)

## Properties

### filter

> **filter**: (`query`) => `Filter`

Defined in: [nostr-tools/marketplace/runtime-types.ts:1103](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1103)

#### Parameters

##### query

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md) & `object`

#### Returns

`Filter`

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)[]\>

Defined in: [nostr-tools/marketplace/runtime-types.ts:1104](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1104)

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

Defined in: [nostr-tools/marketplace/runtime-types.ts:1108](https://github.com/sudonym-btc/nostr-tools/blob/52d76bf15b8149e63ac6be6e6cf36bf7dca572e9/marketplace/runtime-types.ts#L1108)

#### Parameters

##### query?

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md)

##### options?

[`MarketplaceInboxSubscribeOptions`](../type-aliases/MarketplaceInboxSubscribeOptions.md)

#### Returns

[`MarketplaceInboxStream`](../type-aliases/MarketplaceInboxStream.md)
