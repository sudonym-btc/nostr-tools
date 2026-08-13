# Type Alias: MarketplaceSettlementJournalAction

> **MarketplaceSettlementJournalAction** = `object`

## Properties

### action

> **action**: `"auction_refund"` \| `"auction_promote"`

***

### bidEventId

> **bidEventId**: `string`

***

### operationId

> **operationId**: `string`

***

### paymentEventId

> **paymentEventId**: `string`

***

### receipt?

> `optional` **receipt?**: `MarketplaceDriverFinancialActionReceipt`

Public, non-secret reconciliation receipt. Never persist the proof.

***

### resultCommitment?

> `optional` **resultCommitment?**: `string`

SHA-256 of the canonical in-memory result, used to verify recovery.

***

### status

> **status**: `"pending"` \| `"completed"`
