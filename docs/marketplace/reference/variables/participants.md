# Variable: participants

> `const` **participants**: `object`

## Type Declaration

### entries

> **entries**: (`participants`) => [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[] = `marketplaceParticipantEntries`

#### Parameters

##### participants

`Iterable`\<[`MarketplaceParticipantTag`](../type-aliases/MarketplaceParticipantTag.md) \| [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)\>

#### Returns

[`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)[]

### groupId

> **groupId**: (`tradeId`, `participants`) => `string` = `participantGroupIdForParticipants`

#### Parameters

##### tradeId

`string`

##### participants

`Iterable`\<[`MarketplaceParticipantTag`](../type-aliases/MarketplaceParticipantTag.md) \| [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)\>

#### Returns

`string`

### groupIdForRecord

> **groupIdForRecord**: (`record`) => `string` = `participantGroupIdForRecord`

#### Parameters

##### record

[`MarketplaceParticipantRecord`](../type-aliases/MarketplaceParticipantRecord.md)

#### Returns

`string`

### isGroupRole

> **isGroupRole**: (`role`) => `role is MarketplaceParticipantGroupRole` = `isMarketplaceParticipantGroupRole`

#### Parameters

##### role

`string` \| `undefined`

#### Returns

`role is MarketplaceParticipantGroupRole`

### parseTag

> **parseTag**: (`tag`) => [`MarketplaceParticipantTag`](../type-aliases/MarketplaceParticipantTag.md) \| `null` = `parseParticipantTag`

#### Parameters

##### tag

`string`[]

#### Returns

[`MarketplaceParticipantTag`](../type-aliases/MarketplaceParticipantTag.md) \| `null`

### pubkeys

> **pubkeys**: (`participants`) => `string`[] = `marketplaceParticipantPubkeys`

#### Parameters

##### participants

`Iterable`\<[`MarketplaceParticipantTag`](../type-aliases/MarketplaceParticipantTag.md) \| [`MarketplaceParticipantEntry`](../type-aliases/MarketplaceParticipantEntry.md)\>

#### Returns

`string`[]

### tag

> **tag**: (`participant`) => `string`[] = `participantTag`

#### Parameters

##### participant

[`MarketplaceParticipantTag`](../type-aliases/MarketplaceParticipantTag.md)

#### Returns

`string`[]
