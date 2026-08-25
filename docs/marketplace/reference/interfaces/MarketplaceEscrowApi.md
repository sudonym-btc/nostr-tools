# Interface: MarketplaceEscrowApi

## Properties

### records

> **records**: [`MarketplaceEscrowRecordsApi`](MarketplaceEscrowRecordsApi.md)

## Methods

### execute()

> **execute**(`record`, `action`, `options?`): `AsyncIterable`\<[`MarketplacePaymentArbitrationRuntimeState`](../type-aliases/MarketplacePaymentArbitrationRuntimeState.md)\>

#### Parameters

##### record

[`MarketplaceEscrowRecord`](../type-aliases/MarketplaceEscrowRecord.md)

##### action

[`MarketplaceEscrowAction`](../type-aliases/MarketplaceEscrowAction.md)

##### options?

[`MarketplaceEscrowExecuteOptions`](../type-aliases/MarketplaceEscrowExecuteOptions.md)

#### Returns

`AsyncIterable`\<[`MarketplacePaymentArbitrationRuntimeState`](../type-aliases/MarketplacePaymentArbitrationRuntimeState.md)\>
