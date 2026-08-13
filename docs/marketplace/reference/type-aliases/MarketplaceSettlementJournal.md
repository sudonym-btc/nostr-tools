# Type Alias: MarketplaceSettlementJournal

> **MarketplaceSettlementJournal** = `object`

Caller-provided durable storage; an in-memory implementation is not safe.

## Methods

### get()

> **get**(`id`): [`MarketplaceSettlementJournalRecord`](MarketplaceSettlementJournalRecord.md) \| `Promise`\<[`MarketplaceSettlementJournalRecord`](MarketplaceSettlementJournalRecord.md) \| `null`\> \| `null`

#### Parameters

##### id

`string`

#### Returns

[`MarketplaceSettlementJournalRecord`](MarketplaceSettlementJournalRecord.md) \| `Promise`\<[`MarketplaceSettlementJournalRecord`](MarketplaceSettlementJournalRecord.md) \| `null`\> \| `null`

***

### put()

> **put**(`record`): `void` \| `Promise`\<`void`\>

#### Parameters

##### record

[`MarketplaceSettlementJournalRecord`](MarketplaceSettlementJournalRecord.md)

#### Returns

`void` \| `Promise`\<`void`\>
