# Interface: MarketplaceMeInboxApi

## Properties

### filter

> **filter**: (`query`) => `Filter`

#### Parameters

##### query

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md) & `object`

#### Returns

`Filter`

## Methods

### list()

> **list**(`query?`, `options?`): `Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)[]\>

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

#### Parameters

##### query?

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md)

##### options?

[`MarketplaceInboxSubscribeOptions`](../type-aliases/MarketplaceInboxSubscribeOptions.md)

#### Returns

[`MarketplaceInboxStream`](../type-aliases/MarketplaceInboxStream.md)
