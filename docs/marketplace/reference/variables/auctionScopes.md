# Variable: auctionScopes

> `const` **auctionScopes**: `object`

Defined in: [nostr-tools/marketplace/auction-scope.ts:417](https://github.com/sudonym-btc/nostr-tools/blob/5d947a5bc614e38846da1b1c885aa2d2c529e269/marketplace/auction-scope.ts#L417)

## Type Declaration

### create

> **create**: (`pool`, `relays`, `query`) => [`MarketplaceAuctionScope`](../type-aliases/MarketplaceAuctionScope.md) = `createAuctionScope`

#### Parameters

##### pool

`AuctionScopePool`

##### relays

`string`[]

##### query

[`MarketplaceAuctionScopeQuery`](../type-aliases/MarketplaceAuctionScopeQuery.md)

#### Returns

[`MarketplaceAuctionScope`](../type-aliases/MarketplaceAuctionScope.md)

### eventKinds

> **eventKinds**: `number`[] = `auctionScopeEventKinds`

### filters

> **filters**: (`query`) => `Filter`[] = `auctionScopeFilters`

#### Parameters

##### query

[`MarketplaceAuctionScopeQuery`](../type-aliases/MarketplaceAuctionScopeQuery.md)

#### Returns

`Filter`[]

### isAuction

> **isAuction**: (`event`) => `event is ParsedMarketplaceAuction` = `isAuctionScopeAuction`

#### Parameters

##### event

[`MarketplaceAuctionScopeEvent`](../type-aliases/MarketplaceAuctionScopeEvent.md)

#### Returns

`event is ParsedMarketplaceAuction`

### isBid

> **isBid**: (`event`) => `event is ParsedMarketplaceAuctionBid` = `isAuctionScopeBid`

#### Parameters

##### event

[`MarketplaceAuctionScopeEvent`](../type-aliases/MarketplaceAuctionScopeEvent.md)

#### Returns

`event is ParsedMarketplaceAuctionBid`

### isComplete

> **isComplete**: (`event`) => `event is ParsedMarketplaceAuctionComplete` = `isAuctionScopeComplete`

#### Parameters

##### event

[`MarketplaceAuctionScopeEvent`](../type-aliases/MarketplaceAuctionScopeEvent.md)

#### Returns

`event is ParsedMarketplaceAuctionComplete`

### isPayment

> **isPayment**: (`event`) => `event is ParsedPayment` = `isAuctionScopePayment`

#### Parameters

##### event

[`MarketplaceAuctionScopeEvent`](../type-aliases/MarketplaceAuctionScopeEvent.md)

#### Returns

`event is ParsedPayment`

### isPaymentAck

> **isPaymentAck**: (`event`) => `event is ParsedPaymentAck` = `isAuctionScopePaymentAck`

#### Parameters

##### event

[`MarketplaceAuctionScopeEvent`](../type-aliases/MarketplaceAuctionScopeEvent.md)

#### Returns

`event is ParsedPaymentAck`

### isPaymentNack

> **isPaymentNack**: (`event`) => `event is ParsedPaymentNack` = `isAuctionScopePaymentNack`

#### Parameters

##### event

[`MarketplaceAuctionScopeEvent`](../type-aliases/MarketplaceAuctionScopeEvent.md)

#### Returns

`event is ParsedPaymentNack`

### isPaymentSettlement

> **isPaymentSettlement**: (`event`) => `event is ParsedPaymentSettlement` = `isAuctionScopePaymentSettlement`

#### Parameters

##### event

[`MarketplaceAuctionScopeEvent`](../type-aliases/MarketplaceAuctionScopeEvent.md)

#### Returns

`event is ParsedPaymentSettlement`

### query

> **query**: (`pool`, `relays`, `query`, `options`) => `Promise`\<[`MarketplaceAuctionScopesSnapshot`](../type-aliases/MarketplaceAuctionScopesSnapshot.md)\> = `queryAuctionScope`

#### Parameters

##### pool

`AuctionScopePool`

##### relays

`string`[]

##### query

[`MarketplaceAuctionScopeQuery`](../type-aliases/MarketplaceAuctionScopeQuery.md)

##### options?

[`MarketplaceAuctionScopeOptions`](../type-aliases/MarketplaceAuctionScopeOptions.md) = `{}`

#### Returns

`Promise`\<[`MarketplaceAuctionScopesSnapshot`](../type-aliases/MarketplaceAuctionScopesSnapshot.md)\>

### stream

> **stream**: (`pool`, `relays`, `query`, `options`) => [`MarketplaceAuctionScopeStream`](../type-aliases/MarketplaceAuctionScopeStream.md) = `streamAuctionScope`

#### Parameters

##### pool

`AuctionScopePool`

##### relays

`string`[]

##### query

[`MarketplaceAuctionScopeQuery`](../type-aliases/MarketplaceAuctionScopeQuery.md)

##### options?

[`MarketplaceAuctionScopeOptions`](../type-aliases/MarketplaceAuctionScopeOptions.md) = `{}`

#### Returns

[`MarketplaceAuctionScopeStream`](../type-aliases/MarketplaceAuctionScopeStream.md)
