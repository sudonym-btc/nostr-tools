# Type Alias: MarketplaceAmount

> **MarketplaceAmount** = `object`

## Properties

### currency?

> `optional` **currency?**: `string`

Logical marketplace currency. Payment routes may settle this through
assets with different denominations/decimals, but marketplace events
should compare and display this currency, not the rail-specific asset.

***

### decimals

> **decimals**: `number`

***

### denomination

> **denomination**: `string`

***

### value

> **value**: `string`
