# Getting started with nostr-tools/marketplace

The `nostr-tools/marketplace` export contains Nostr event builders, parsers,
query helpers, stream reducers, and runtime helpers for marketplace listings,
orders, payments, auctions, reviews, participant proofs, and arbitration
service records.

## Install

```sh
npm install nostr-tools @sudonym-btc/marketplace-evm @sudonym-btc/marketplace-cashu
```

In the NMDK workspace, this package is usually consumed through the checked-out
submodule:

```ts
import { finalizeEvent, generateSecretKey } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'
import * as marketplace from 'nostr-tools/marketplace'
import {
  createEvmAuctionPolicy,
  createEvmEscrowPolicy,
  MemoryOperationStore,
} from '@sudonym-btc/marketplace-evm'
import {
  createCashuAuctionPolicy,
  createCashuEscrowPolicy,
  MemoryCashuEscrowStore,
} from '@sudonym-btc/marketplace-cashu'
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
    prices: [{ amount: '12500', currency: 'USD' }],
    images: [],
  }),
  sellerSecretKey,
)
```

## Initialize a runtime session

Use `bind()` to connect the runtime API to a relay pool, then call
`session()` to get the seed-managed API. The session lookup finds and decrypts
the user's existing marketplace seed, or creates and publishes a new encrypted
seed record when one does not exist yet.

```ts
const relays = ['wss://relay.example']
const pool = new SimplePool()

const signer = {
  getPublicKey: () => window.nostr.getPublicKey(),
  nip44Encrypt: (pubkey, plaintext) =>
    window.nostr.nip44.encrypt(pubkey, plaintext),
  nip44Decrypt: (pubkey, ciphertext) =>
    window.nostr.nip44.decrypt(pubkey, ciphertext),
  signEvent: event => window.nostr.signEvent(event),
}

const evmOperationStore = new MemoryOperationStore()
const cashuEscrowStore = new MemoryCashuEscrowStore()

function evmOrderDriver() {
  return createEvmEscrowPolicy({
    appId: 'marketplace',
    chains,
    operationStore: evmOperationStore,
  })
}

function evmAuctionDriver() {
  return createEvmAuctionPolicy({
    appId: 'marketplace',
    chains,
    operationStore: evmOperationStore,
  })
}

function cashuOrderDriver() {
  return createCashuEscrowPolicy({
    appId: 'marketplace',
    storage: cashuEscrowStore,
    mints,
  })
}

function cashuAuctionDriver() {
  return createCashuAuctionPolicy({
    appId: 'marketplace',
    storage: cashuEscrowStore,
    mints,
  })
}

const market = marketplace.bind(pool, relays)

const api = await market.session(signer, {
  publish: event => Promise.allSettled(pool.publish(relays, event)),
  orderDrivers: [evmOrderDriver(), cashuOrderDriver()],
  auctionDrivers: [evmAuctionDriver(), cashuAuctionDriver()],
})

const listings = await api.listings.search({ limit: 20 })
```

`chains` and `mints` are app-owned driver configuration. See the EVM and Cashu
driver docs for the exact network, storage, and wallet settings those factories
accept.

## Place an order

The session API can create an order and drive the compatible payment flow from
the registered order drivers. If you do not pass a route, the runtime can choose
one from the listing and available drivers.

```ts
const [listing] = listings
if (!listing) throw new Error('No listings found')

const route = await api.orders.paymentRoute(listing)

for await (const state of api.orders.create(
  listing,
  {
    quantity: 1,
    start: '2026-07-02',
    end: '2026-07-05',
  },
  route ? { route } : undefined,
)) {
  if (state.type === 'payment_required') {
    renderPaymentRequest(state.request)
  }

  if (state.type === 'payment_progress') {
    renderPaymentStatus(state.status)
  }

  if (state.type === 'order_published') {
    renderOrderEvent(state.event)
  }

  if (state.type === 'payment_published') {
    renderPaymentEvent(state.event, state.proof)
  }

  if (state.type === 'completed') {
    renderOrderComplete(state.order, state.payment, state.proof)
  }
}
```

## Render auctions live

Use `auctions.watch()` for a screen that needs to re-render as the auction,
bids, payments, acknowledgements, and settlement events arrive from relays.

```ts
const listingAnchor = api.listings.anchor(listing)
const [auction] = await api.auctions.search({ listingAnchor, limit: 1 })

if (auction) {
  const auctionStream = api.auctions.watch({
    auctionAnchor: auction.auctionAnchor,
  })

  const subscription = auctionStream.snapshot.subscribe(snapshots => {
    const snapshot = snapshots[auction.auctionAnchor]
    if (!snapshot) return

    renderAuction({
      status: snapshot.status,
      bidCount: snapshot.bids.length,
      highestBid: snapshot.highestBid,
      winningBid: snapshot.winningBid,
    })
  })

  for await (const state of api.auctions.bid(
    listing,
    {
      amount: {
        value: '15000',
        currency: auction.currency,
        denomination: auction.currency,
        decimals: auction.decimals,
      },
    },
    { auction },
  )) {
    if (state.type === 'payment_required') renderPaymentRequest(state.request)
    if (state.type === 'bid_published') renderBidEvent(state.event)
    if (state.type === 'payment_published') renderPaymentEvent(state.event, state.proof)
    if (state.type === 'completed') renderBidComplete(state.bid, state.payment)
  }

  subscription.unsubscribe()
  auctionStream.close('view disposed')
}
```

## Fetch reviews

Reviews are indexed by the listing anchor and can also be filtered by order
group, trade id, author, or time window.

```ts
const listingAnchor = api.listings.anchor(listing)
const reviews = await api.reviews.search({ listingAnchor, limit: 20 })

for (const review of reviews) {
  renderReview({
    rating: review.rating,
    content: review.content,
    buyerPubkey: api.reviews.revealedBuyerPubkey(review),
    proof: api.reviews.resolveProof(review),
  })
}
```

## Next steps

- Use `marketplace.listings`, `marketplace.orders`, and `marketplace.auctions`
  for low-level builders and parsers.
- Use `marketplace.bind()` for runtime workflows that need relays, publishing,
  payment drivers, and session recovery.
- Read the generated [API reference](reference/README.md) for exported types and
  helper namespaces.
