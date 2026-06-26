# Variable: inbox

> `const` **inbox**: `object`

Defined in: [nostr-tools/marketplace/inbox.ts:169](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/inbox.ts#L169)

## Type Declaration

### fetch

> **fetch**: (`pool`, `relays`, `signer`, `query`, `options`) => `Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)[]\> = `fetchMarketplaceInbox`

#### Parameters

##### pool

`InboxFetchPool`

##### relays

`string`[]

##### signer

[`MarketplaceInboxSigner`](../type-aliases/MarketplaceInboxSigner.md)

##### query?

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md) = `{}`

##### options?

[`MarketplaceInboxFetchOptions`](../type-aliases/MarketplaceInboxFetchOptions.md) = `{}`

#### Returns

`Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)[]\>

### filter

> **filter**: (`query`) => `Filter` = `marketplaceInboxFilter`

#### Parameters

##### query

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md) & `object`

#### Returns

`Filter`

### query

> **query**: (`stream`) => `Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)[]\> = `queryMarketplaceInboxStream`

#### Parameters

##### stream

[`MarketplaceInboxStream`](../type-aliases/MarketplaceInboxStream.md)

#### Returns

`Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)[]\>

### stream

> **stream**: (`pool`, `relays`, `signer`, `query`, `options`) => [`MarketplaceInboxStream`](../type-aliases/MarketplaceInboxStream.md) = `streamMarketplaceInbox`

#### Parameters

##### pool

`InboxSubscribePool`

##### relays

`string`[]

##### signer

[`MarketplaceInboxSigner`](../type-aliases/MarketplaceInboxSigner.md)

##### query

[`MarketplaceInboxQuery`](../type-aliases/MarketplaceInboxQuery.md) & `object`

##### options?

[`MarketplaceInboxSubscribeOptions`](../type-aliases/MarketplaceInboxSubscribeOptions.md) = `{}`

#### Returns

[`MarketplaceInboxStream`](../type-aliases/MarketplaceInboxStream.md)

### unwrap

> **unwrap**: (`wrap`, `signer`) => `Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)\> = `unwrapMarketplaceInboxItem`

#### Parameters

##### wrap

`NostrEvent`

##### signer

[`MarketplaceInboxSigner`](../type-aliases/MarketplaceInboxSigner.md)

#### Returns

`Promise`\<[`MarketplaceInboxItem`](../type-aliases/MarketplaceInboxItem.md)\>
