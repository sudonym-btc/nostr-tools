# Type Alias: MarketplaceSessionDriver

> **MarketplaceSessionDriver** = `object`

## Properties

### id

> `readonly` **id**: `string`

***

### kind

> `readonly` **kind**: [`MarketplaceSessionDriverKind`](MarketplaceSessionDriverKind.md)

***

### label

> `readonly` **label**: `string`

***

### recovery

> `readonly` **recovery**: [`MarketplaceValue`](MarketplaceValue.md)\<[`MarketplaceSessionDriverRecoveryState`](MarketplaceSessionDriverRecoveryState.md)\>

***

### recoveryStream

> `readonly` **recoveryStream**: [`MarketplaceStream`](../classes/MarketplaceStream.md)\<[`MarketplaceSessionDriverRecoveryEvent`](MarketplaceSessionDriverRecoveryEvent.md), [`MarketplaceSessionDriverRecoveryEvent`](MarketplaceSessionDriverRecoveryEvent.md)[]\>

***

### state

> `readonly` **state**: [`MarketplaceValue`](MarketplaceValue.md)\<[`MarketplaceSessionDriverState`](MarketplaceSessionDriverState.md)\>
