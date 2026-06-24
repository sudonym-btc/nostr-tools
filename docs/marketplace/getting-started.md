# Getting started with nostr-tools/marketplace

The `nostr-tools/marketplace` export contains Nostr event builders, parsers,
query helpers, stream reducers, and runtime helpers for marketplace listings,
orders, payments, auctions, reviews, participant proofs, and arbitration
service records.

## Install

```sh
npm install nostr-tools
```

In the NMDK workspace, this package is usually consumed through the checked-out
submodule:

```ts
import { finalizeEvent, generateSecretKey } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'
import * as marketplace from 'nostr-tools/marketplace'
```

## Build and publish an event

Templates are plain Nostr event templates. Sign them with `finalizeEvent()` or
your application's signer.

```ts
const sellerSecretKey = generateSecretKey()

const listing = finalizeEvent(
  marketplace.listings.template({
    d: 'listing-1',
    title: 'Weekend cabin',
    summary: 'A small cabin with a lake view.',
    price: { amount: '12500', denomination: 'USD', decimals: 2 },
    images: [],
    relays: ['wss://relay.example'],
  }),
  sellerSecretKey,
)
```

## Bind a runtime client

Use `bind()` when you want the higher-level runtime API over a relay pool. The
runtime can publish through your app's signer and can be extended with payment
drivers such as `@sudonym-btc/marketplace-cashu` or
`@sudonym-btc/marketplace-evm`.

```ts
const pool = new SimplePool()

const api = marketplace.bind(pool, ['wss://relay.example'], {
  seed: marketplaceSeed,
  publish: event => pool.publish(['wss://relay.example'], event),
  orderDrivers,
  auctionDrivers,
})

const listings = await api.listings.search({ limit: 20 })
```

## Next steps

- Use `marketplace.listings`, `marketplace.orders`, and `marketplace.auctions`
  for low-level builders and parsers.
- Use `marketplace.bind()` for runtime workflows that need relays, publishing,
  payment drivers, and session recovery.
- Read the generated [API reference](reference/README.md) for exported types and
  helper namespaces.
