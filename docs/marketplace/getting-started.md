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
```

## Build and publish an event

Templates are plain Nostr event templates. Sign them with `finalizeEvent()` or
your application's signer.

```ts
const sellerSecretKey = generateSecretKey()

const listing = finalizeEvent(
  marketplace.listings.template({
    d: 'isuzu-trooper-1991',
    title: 'Isuzu Trooper',
    summary: 'A clean 4x4 SUV with camping gear and a fresh service.',
    description: 'Manual transmission, roof rack, recovery boards, and all-terrain tires.',
    prices: [{ amount: '8500', currency: 'USD' }],
    profiles: ['vehicle', '4x4', 'off-road', 'suv', 'isuzu'],
    images: [
      { url: 'https://example.com/images/isuzu-trooper-front.jpg', dimensions: '1600x1067' },
      { url: 'https://example.com/images/isuzu-trooper-interior.jpg', dimensions: '1600x1067' },
    ],
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
  getPublicKey: window.nostr.getPublicKey.bind(window.nostr),
  nip44Encrypt: window.nostr.nip44.encrypt.bind(window.nostr.nip44),
  nip44Decrypt: window.nostr.nip44.decrypt.bind(window.nostr.nip44),
  signEvent: window.nostr.signEvent.bind(window.nostr),
}

const market = marketplace.bind(pool, relays, {
  orderDrivers: [evmOrderDriver(), cashuOrderDriver(), fedimintOrderDriver()],
  auctionDrivers: [evmAuctionDriver(), cashuAuctionDriver(), fedimintAuctionDriver()],
})

const api = await market.session(signer)
const listings = await api.listings.search({ limit: 20 })
```

The NIP-07 methods are bound so calls made through `signer` keep the original
`window.nostr` and `window.nostr.nip44` receivers.

The driver factory functions are app-owned setup placeholders for whichever
payment drivers your app supports. When the bound pool has a `publish()` method,
the runtime publishes through the bound `relays` automatically. Pass an explicit
`publish` function to `bind()` or `session()` only when the app needs custom
retry, auth, logging, or relay-selection behavior.

## Place an order

The session API can create an order and drive the compatible payment flow from
the registered order drivers. If you do not pass a route, the runtime can choose
one from the listing and available drivers.

```ts
for await (const state of api.orders.create(
  listing,
  {
    quantity: 1,
    // Optional for rentals and reservations.
    start: '2026-07-02',
    end: '2026-07-05',
  },
)) {
  if (state.type === 'payment_required') {
    renderPaymentRequest(state.request)
  }

  if (state.type === 'payment_progress') {
    renderPaymentStatus(state.status)
  }

  if (state.type === 'completed') {
    renderOrderComplete(state.order, state.payment, state.proof)
  }
}
```

### Create a negotiation

Use `orders.negotiate()` when the buyer and seller should agree on order terms
before starting payment. The runtime signs the proposed order, wraps it as a
private structured message, and publishes the gift wraps to the seller and the
current session identity.

```ts
const negotiation = await api.orders.negotiate(listing, {
  quantity: 1,
  start: '2026-07-02',
  end: '2026-07-05',
  alt: 'Reservation request',
})

renderNegotiationOffer({
  tradeId: negotiation.tradeId,
  order: negotiation.order,
  message: negotiation.message,
  giftWraps: negotiation.giftWraps,
})
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
      amount: { value: '15000' },
    },
    { auction },
  )) {
    if (state.type === 'payment_required') renderPaymentRequest(state.request)
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
