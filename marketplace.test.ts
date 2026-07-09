import { describe, expect, test } from 'bun:test'

import type { Event, EventTemplate } from './core.ts'
import {
  MarketplacePaymentMethod,
  ArbitrationService,
  ArbitrationServiceSelection,
  GiftWrap,
  MarketplaceAuction,
  MarketplaceAuctionBid,
  MarketplaceAuctionComplete,
  MarketplaceOrder,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
  MarketplaceReview,
  MarketplaceSeed,
  MarketplaceShippingOption,
  StructuredMessage,
  isRegularKind,
} from './kinds.ts'
import * as marketplace from './marketplace/internal.ts'
import { decrypt as decryptNip44, encrypt as encryptNip44, getConversationKey } from './nip44.ts'
import { finalizeEvent, generateSecretKey, getPublicKey } from './pure.ts'

const createdAt = 1712678400
const bytecodeHash = 'a'.repeat(64)
const sellerEvmAddress = '0x1111111111111111111111111111111111111111'
const arbiterAddress = '0x2222222222222222222222222222222222222222'
const contractAddress = '0x3333333333333333333333333333333333333333'
const btcAssetId = '33:0x0000000000000000000000000000000000000000'
const usdAssetId = '33:0xdAC17F958D2ee523a2206206994597C13D831ec7'
const cashuMintUrl = 'https://mint.example'
const cashuAssetId = `cashu:sat:${cashuMintUrl}`
const cashuPolicyHash = `0x${'c'.repeat(64)}`

function sign(template: EventTemplate, secretKey = generateSecretKey()): Event {
  return finalizeEvent(template, secretKey)
}

function testSessionSigner(secretKey = generateSecretKey()) {
  const pubkey = getPublicKey(secretKey)
  return {
    pubkey,
    signer: {
      async getPublicKey() {
        return pubkey
      },
      async nip44Decrypt() {
        throw new Error('not used')
      },
      async nip44Encrypt(_pubkey: string, plaintext: string) {
        return plaintext
      },
      async signEvent(template: EventTemplate) {
        return sign(template, secretKey)
      },
    },
  }
}

async function waitFor(predicate: () => boolean, label = 'condition'): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (predicate()) return
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  throw new Error(`Timed out waiting for ${label}`)
}

function hasTag(event: EventTemplate | Event, expected: string[]): boolean {
  return event.tags.some(tag => JSON.stringify(tag) === JSON.stringify(expected))
}

function mockPaymentTerms(overrides: Record<string, unknown> = {}) {
  const amount = {
    value: String(overrides.value ?? '50000'),
    currency: String(overrides.currency ?? 'BTC'),
    denomination: String(overrides.denomination ?? 'BTC'),
    decimals: typeof overrides.decimals === 'number' ? overrides.decimals : 8,
  }
  return {
    version: 1 as const,
    asset: amount,
    parties: [
      { role: 'buyer', id: String(overrides.buyer ?? 'buyer') },
      { role: 'seller', id: String(overrides.seller ?? 'seller') },
      { role: 'arbiter', id: String(overrides.arbiter ?? 'arbiter') },
    ],
    lock: {
      id: String(overrides.tradeId ?? 'mock-trade'),
      policyId: String(overrides.policyId ?? 'mock-policy'),
      kind: String(overrides.kind ?? 'mock'),
      amount,
      controls: [
        { role: 'buyer', id: String(overrides.buyer ?? 'buyer') },
        { role: 'seller', id: String(overrides.seller ?? 'seller') },
        { role: 'arbiter', id: String(overrides.arbiter ?? 'arbiter') },
      ],
      paths: [],
    },
  }
}

function mockPaymentProof(driver: string, params: Record<string, unknown> = {}, terms = mockPaymentTerms()) {
  return { driver, terms, params }
}

function listingEvent(secretKey = generateSecretKey()): Event {
  return sign(
    marketplace.accommodationListings.template({
      d: 'villa-bali',
      title: 'Ocean View Villa',
      summary: 'Two bedroom beachfront villa with pool',
      description: 'A beautiful beachfront villa with direct beach access.',
      createdAt,
      publishedAt: createdAt,
      location: 'Bali, Indonesia',
      status: 'active',
      prices: [{ amount: '0.00050000', currency: 'BTC', frequency: 'day' }],
      quantity: 2,
      active: true,
      autoAccept: true,
      negotiable: false,
      minDuration: 'P2D',
      securityDeposit: { value: '25000', denomination: 'BTC', decimals: 8 },
      minPaymentAmount: { value: '10000', denomination: 'BTC', decimals: 8 },
      maxDisputePeriod: 1209600,
      cancellationPolicies: [
        { refundFraction: 1, secondsBeforeStart: 172800, secondsAfterOrder: 3600 },
        { refundFraction: 0.5, secondsBeforeStart: 86400 },
      ],
      images: [{ url: 'https://example.com/villa.jpg', dimensions: '1200x800' }],
      accommodation: {
        type: 'villa',
        checkIn: '15:00',
        checkOut: '11:00',
        h3: ['8c2ab34567fffff', '8b2ab34567fffff'],
        specs: {
          wireless_internet: true,
          pool: true,
          beachfront: true,
          beds: 4,
          bedrooms: 2,
          bathrooms: 2,
          max_guests: 6,
        },
      },
    }),
    secretKey,
  )
}

function paymentMethodEvent(sellerSecretKey: Uint8Array, arbiterPubkey: string): Event {
  return sign(
    marketplace.paymentMethod.template({
      trustedArbiterPubkeys: [arbiterPubkey],
      supportedContractBytecodeHashes: [bytecodeHash],
      acceptedPaymentForms: [
        { denomination: 'BTC', assetId: btcAssetId, appId: 'marketplace' },
        { denomination: 'USD', assetId: usdAssetId, appId: 'marketplace' },
      ],
      evmAddress: sellerEvmAddress,
      evmAddressProof: '0xproof',
      createdAt,
    }),
    sellerSecretKey,
  )
}

function arbitrationServiceEvent(arbiterSecretKey: Uint8Array): Event {
  const arbiterPubkey = getPublicKey(arbiterSecretKey)
  return sign(
    marketplace.arbitrationServices.template({
      d: 'evm-rsk-regtest',
      pubkey: arbiterPubkey,
      type: 'EVM',
      maxDuration: 1209600,
      fee: {
        ppm: 10000,
        base: '5',
        min: '10',
        max: '100',
        assetOverrides: {
          [usdAssetId.split(':')[1].toLowerCase()]: {
            ppm: 20000,
            base: '1',
            min: '0',
            max: '0',
          },
        },
      },
      params: {
        arbiterAddress,
        contractAddress,
        contractBytecodeHash: bytecodeHash,
        chainId: 33,
      },
      createdAt,
    }),
    arbiterSecretKey,
  )
}

function cashuPaymentMethodEvent(sellerSecretKey: Uint8Array, arbiterPubkey: string): Event {
  return sign(
    marketplace.paymentMethod.template({
      trustedArbiterPubkeys: [arbiterPubkey],
      acceptedPaymentForms: [
        { denomination: 'SAT', assetId: cashuAssetId, appId: 'marketplace' },
      ],
      cashuPubkey: '03'.padEnd(66, '1'),
      createdAt,
    }),
    sellerSecretKey,
  )
}

function cashuArbitrationServiceEvent(arbiterSecretKey: Uint8Array): Event {
  const arbiterPubkey = getPublicKey(arbiterSecretKey)
  return sign(
    marketplace.arbitrationServices.template({
      d: 'cashu-sat',
      pubkey: arbiterPubkey,
      type: 'CASHU',
      maxDuration: 1209600,
      fee: {
        ppm: 0,
        base: '0',
        min: '0',
        max: '0',
      },
      params: {
        policyHash: cashuPolicyHash,
        mintUrl: cashuMintUrl,
        unit: 'sat',
        cashuPubkey: '03'.padEnd(66, '2'),
      },
      createdAt,
    }),
    arbiterSecretKey,
  )
}

describe('marketplace listings', () => {
  test('exposes provider-backed location helpers', async () => {
    const pool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
      subscribeMap(
        requests: Array<{ filter: Record<string, any> }>,
        handlers: { onevent: (event: Event) => void; oneose?: () => void },
      ) {
        filters.push(...requests.map(request => request.filter))
        handlers.onevent(order)
        handlers.oneose?.()
        return { close() {} }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      locationProvider: {
        async hierarchyForAddress(address: string) {
          expect(address).toBe('1 Market St, San Francisco')
          return [['g', '872830828ffffff']]
        },
        async coverArea(area: string) {
          expect(area).toBe('Germany')
          return [['g', '841f9d3ffffffff']]
        },
      },
    })

    expect(marketplace.locations.gTags(['abc', 'abc', 'def'])).toEqual([['g', 'abc'], ['g', 'def']])
    expect(await api.locations.hierarchyForAddress('1 Market St, San Francisco')).toEqual([['g', '872830828ffffff']])
    expect(await api.locations.coverArea('Germany')).toEqual([['g', '841f9d3ffffffff']])
  })

  test('fails clearly when location provider is not configured', async () => {
    const pool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
      subscribeMap(
        requests: Array<{ filter: Record<string, any> }>,
        handlers: { onevent: (event: Event) => void; oneose?: () => void },
      ) {
        filters.push(...requests.map(request => request.filter))
        handlers.onevent(order)
        handlers.oneose?.()
        return { close() {} }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'])

    await expect(api.locations.hierarchyForAddress('1 Market St')).rejects.toThrow(
      'Marketplace location provider is not configured',
    )
    await expect(api.locations.coverArea('Germany')).rejects.toThrow(
      'Marketplace location provider is not configured',
    )
  })

  test('generates, validates, and parses an accommodation listing', () => {
    const event = listingEvent()
    const genericParsed = marketplace.listings.parse(event)
    const parsed = marketplace.accommodationListings.parse(event)

    expect(marketplace.listings.validate(event)).toBe(true)
    expect(marketplace.accommodationListings.validate(event)).toBe(true)
    expect('accommodation' in genericParsed).toBe(false)
    expect(parsed.d).toBe('villa-bali')
    expect(parsed.title).toBe('Ocean View Villa')
    expect(parsed.active).toBe(true)
    expect(parsed.autoAccept).toBe(true)
    expect(parsed.negotiable).toBe(false)
    expect(parsed.rentOrBuy).toBe('rent')
    expect(parsed.quantity).toBe(2)
    expect(parsed.securityDeposit).toEqual({ value: '25000', currency: 'BTC', denomination: 'BTC', decimals: 8 })
    expect(parsed.minPaymentAmount).toEqual({ value: '10000', currency: 'BTC', denomination: 'BTC', decimals: 8 })
    expect(parsed.maxDisputePeriod).toBe(1209600)
    expect(parsed.cancellationPolicies).toHaveLength(2)
    expect(parsed.accommodation?.type).toBe('villa')
    expect(parsed.accommodation?.h3).toEqual(['8c2ab34567fffff', '8b2ab34567fffff'])
    expect(parsed.accommodation?.specs.pool).toBe(true)
    expect(parsed.accommodation?.specs.max_guests).toBe(6)
    expect(hasTag(event, ['I', 'true'])).toBe(true)
    expect(hasTag(event, ['M', 'rent'])).toBe(true)
    expect(hasTag(event, ['N', 'false'])).toBe(true)
    expect(hasTag(event, ['T', 'villa'])).toBe(true)
    expect(hasTag(event, ['s', 'pool'])).toBe(true)
    expect(hasTag(event, ['c', '6'])).toBe(true)
    expect(hasTag(event, ['S', 'beachfront+pool'])).toBe(true)
  })

  test('rejects listings without core marketplace fields', () => {
    const event = listingEvent()
    expect(marketplace.listings.validate({ ...event, tags: event.tags.filter(tag => tag[0] !== 'price') })).toBe(false)
    expect(marketplace.listings.validate({ ...event, tags: event.tags.filter(tag => tag[0] !== 'd') })).toBe(false)
    expect(marketplace.listings.validate({ ...event, tags: event.tags.filter(tag => tag[0] !== 'title') })).toBe(false)
  })

  test('builds relay filters from promoted marketplace tags', () => {
    const filter = marketplace.accommodationListings.filters.search({
      query: 'beachfront',
      accommodationTypes: ['villa'],
      features: ['pool'],
      autoAccept: true,
      negotiable: false,
      rentOrBuy: 'rent',
      minGuests: 6,
      beds: 4,
      bedrooms: 2,
      bathrooms: 2,
    })

    expect(filter.kinds).toEqual([30402])
    expect(filter.search).toBe('beachfront')
    expect(filter['#t']).toEqual(['accommodation'])
    expect(filter['#T']).toEqual(['villa'])
    expect(filter['#s']).toEqual(['pool'])
    expect(filter['#I']).toEqual(['true'])
    expect(filter['#N']).toEqual(['false'])
    expect(filter['#M']).toEqual(['rent'])
    expect(filter['#c']).toEqual(['6'])
    expect(filter['#b']).toEqual(['4'])
    expect(filter['#B']).toEqual(['2'])
    expect(filter['#R']).toEqual(['2'])
  })

  test('finds one listing by pubkey with the existing search query fields', async () => {
    const sellerSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const listing = listingEvent(sellerSecretKey)
    let observedFilter: Record<string, any> | undefined
    const pool = {
      async querySync(_relays: string[], filter: Record<string, any>): Promise<Event[]> {
        observedFilter = filter
        return [listing]
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'])

    const found = await api.listings.findOne(sellerPubkey, {
      kinds: [listing.kind],
      tagFilters: { d: ['villa-bali'] },
    })

    expect(found?.event.id).toBe(listing.id)
    expect(observedFilter?.authors).toEqual([sellerPubkey])
    expect(observedFilter?.kinds).toEqual([listing.kind])
    expect(observedFilter?.['#d']).toEqual(['villa-bali'])
    expect(observedFilter?.limit).toBe(1)
  })

  test('calculates listing prices with optional date range frequency', () => {
    const listing = marketplace.listings.parse(listingEvent())
    const defaultAmount = marketplace.listings.price(listing)
    const amount = marketplace.listings.price(listing, {
      start: '2026-06-01',
      end: '2026-06-04',
    })
    const overrideAmount = marketplace.listings.price(listing, {
      price: { amount: '12.50', currency: 'USD', frequency: 'P1D' },
      start: '2026-06-01T12:00:00Z',
      end: '2026-06-03T12:00:00Z',
    })

    expect(defaultAmount).toEqual({
      value: '50000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
    expect(amount).toEqual({
      value: '150000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
    expect(overrideAmount).toEqual({
      value: '2500',
      currency: 'USD',
      denomination: 'USD',
      decimals: 2,
    })
  })
})

describe('marketplace shipping options', () => {
  test('generates, validates, parses, and addresses shipping option events', () => {
    const sellerSecretKey = generateSecretKey()
    const event = sign(
      marketplace.shippingOption.template({
        d: 'standard-us',
        title: 'Standard Shipping',
        description: 'Tracked ground shipping within the United States.',
        price: { amount: '5.99', currency: 'USD' },
        countries: ['US', 'CA'],
        regions: ['US-FL', 'US-GA'],
        service: 'standard',
        carrier: 'USPS',
        duration: { min: '3', max: '7', unit: 'D' },
        weightMax: { value: '30', unit: 'kg' },
        dimMax: { dimensions: '120x60x60', unit: 'cm' },
        priceWeight: { amount: '0.75', currency: 'USD', unit: 'kg' },
        priceDistance: { amount: '0.05', unit: 'km' },
        createdAt,
      }),
      sellerSecretKey,
    )
    const parsed = marketplace.shippingOption.parse(event)

    expect(marketplace.shippingOption.kind).toBe(MarketplaceShippingOption)
    expect(event.kind).toBe(MarketplaceShippingOption)
    expect(marketplace.shippingOption.validate(event)).toBe(true)
    expect(marketplace.shippingOption.address(event)).toBe(`${MarketplaceShippingOption}:${event.pubkey}:standard-us`)
    expect(parsed.d).toBe('standard-us')
    expect(parsed.title).toBe('Standard Shipping')
    expect(parsed.description).toBe('Tracked ground shipping within the United States.')
    expect(parsed.price).toEqual({ amount: '5.99', currency: 'USD' })
    expect(parsed.countries).toEqual(['US', 'CA'])
    expect(parsed.regions).toEqual(['US-FL', 'US-GA'])
    expect(parsed.service).toBe('standard')
    expect(parsed.carrier).toBe('USPS')
    expect(parsed.duration).toEqual({ min: '3', max: '7', unit: 'D' })
    expect(parsed.weightMax).toEqual({ value: '30', unit: 'kg' })
    expect(parsed.dimMax).toEqual({ dimensions: '120x60x60', unit: 'cm' })
    expect(parsed.priceWeight).toEqual({ amount: '0.75', currency: 'USD', unit: 'kg' })
    expect(parsed.priceDistance).toEqual({ amount: '0.05', unit: 'km' })
    expect(hasTag(event, ['country', 'US', 'CA'])).toBe(true)
    expect(hasTag(event, ['region', 'US-FL', 'US-GA'])).toBe(true)
    expect(hasTag(event, ['price-weight', '0.75', 'USD', 'kg'])).toBe(true)
  })

  test('rejects shipping options without required GammaMarkets fields', () => {
    const event = sign(
      marketplace.shippingOption.template({
        d: 'standard-us',
        title: 'Standard Shipping',
        price: { amount: '5.99', currency: 'USD' },
        countries: ['US'],
        service: 'standard',
        createdAt,
      }),
    )

    for (const required of ['d', 'title', 'price', 'country', 'service']) {
      expect(marketplace.shippingOption.validate({ ...event, tags: event.tags.filter(tag => tag[0] !== required) })).toBe(false)
    }
    expect(() =>
      marketplace.shippingOption.template({
        d: 'bad-empty-countries',
        title: 'Bad shipping',
        price: { amount: '5.99', currency: 'USD' },
        countries: [],
        service: 'standard',
      }),
    ).toThrow('Shipping option requires at least one country')
  })

  test('builds shipping option relay filters', () => {
    const filter = marketplace.shippingOption.filters.search({
      authors: ['a'.repeat(64), 'a'.repeat(64)],
      ds: ['standard-us'],
      countries: ['US'],
      regions: ['US-FL'],
      services: ['standard'],
      carriers: ['USPS'],
      since: createdAt,
      until: createdAt + 100,
      limit: 10,
    })

    expect(filter.kinds).toEqual([30406])
    expect(filter.authors).toEqual(['a'.repeat(64)])
    expect(filter['#d']).toEqual(['standard-us'])
    expect(filter['#country']).toEqual(['US'])
    expect(filter['#region']).toEqual(['US-FL'])
    expect(filter['#service']).toEqual(['standard'])
    expect(filter['#carrier']).toEqual(['USPS'])
    expect(filter.since).toBe(createdAt)
    expect(filter.until).toBe(createdAt + 100)
    expect(filter.limit).toBe(10)
  })
})

describe('marketplace arbitration records', () => {
  test('generates, validates, and parses payment methods', () => {
    const sellerSecretKey = generateSecretKey()
    const arbiterPubkey = getPublicKey(generateSecretKey())
    const event = paymentMethodEvent(sellerSecretKey, arbiterPubkey)
    const parsed = marketplace.paymentMethod.parse(event)

    expect(event.kind).toBe(MarketplacePaymentMethod)
    expect(marketplace.paymentMethod.validate(event)).toBe(true)
    expect(parsed.trustedArbiterPubkeys).toEqual([arbiterPubkey])
    expect(parsed.supportedContractBytecodeHashes).toEqual([bytecodeHash])
    expect(parsed.evmAddress).toBe(sellerEvmAddress)
    expect(parsed.evmAddressProof).toBe('0xproof')
    expect(parsed.acceptedPaymentForms).toEqual([
      { currency: 'BTC', denomination: 'BTC', assetId: btcAssetId, appId: 'marketplace' },
      { currency: 'USD', denomination: 'USD', assetId: usdAssetId, appId: 'marketplace' },
    ])
    expect(marketplace.paymentMethod.canonicalAssetId('33:0xDAC17F958D2EE523A2206206994597C13D831EC7')).toBe(
      usdAssetId.toLowerCase(),
    )
  })

  test('generates, validates, parses, and calculates arbitration service fees', () => {
    const event = arbitrationServiceEvent(generateSecretKey())
    const parsed = marketplace.arbitrationServices.parse(event)

    expect(event.kind).toBe(ArbitrationService)
    expect(marketplace.arbitrationServices.validate(event)).toBe(true)
    expect(parsed.d).toBe('evm-rsk-regtest')
    expect(parsed.content.type).toBe('EVM')
    expect(parsed.content.params.chainId).toBe(33)
    expect(parsed.content.params.contractBytecodeHash).toBe(bytecodeHash)
    expect(marketplace.arbitrationServices.calculateFee(parsed.content.fee, 1000n)).toBe(15n)
    expect(marketplace.arbitrationServices.calculateFee(parsed.content.fee, 20000n)).toBe(100n)
    expect(
      marketplace.arbitrationServices.calculateFee(parsed.content.fee, 1000n, usdAssetId.split(':')[1].toLowerCase()),
    ).toBe(21n)
  })

  test('generates and parses arbitration service selection child events', () => {
    const sellerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const service = arbitrationServiceEvent(arbiterSecretKey)
    const method = paymentMethodEvent(sellerSecretKey, getPublicKey(arbiterSecretKey))
    const selection = sign(
      marketplace.arbitrationServiceSelections.template({
        tradeId: 'trade-1',
        listingAnchor: `${30402}:${getPublicKey(sellerSecretKey)}:villa-bali`,
        service,
        paymentMethod: method,
        createdAt,
      }),
    )
    const parsed = marketplace.arbitrationServiceSelections.parse(selection)

    expect(selection.kind).toBe(ArbitrationServiceSelection)
    expect(marketplace.arbitrationServiceSelections.validate(selection)).toBe(true)
    expect(parsed.tradeId).toBe('trade-1')
    expect(parsed.content.service.id).toBe(service.id)
    expect(parsed.content.paymentMethod.id).toBe(method.id)
  })

  test('generates auction bids with trade id in d tag only', () => {
    const buyerSecretKey = generateSecretKey()
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-bid-trade-1',
        auctionAnchor: `${MarketplaceAuction}:${'a'.repeat(64)}:auction-1`,
        listingAnchor: `${30402}:${'b'.repeat(64)}:villa-bali`,
        amount: { value: '2500', denomination: 'USD', decimals: 2 },
        participants: [{ pubkey: buyerPubkey, role: 'buyer' }],
        createdAt,
      }),
      buyerSecretKey,
    )
    const parsed = marketplace.auctions.parseBid(bid)

    expect(parsed.tradeId).toBe('auction-bid-trade-1')
    expect(hasTag(bid, ['d', 'auction-bid-trade-1'])).toBe(true)
    expect(bid.tags.some(tag => tag[0] === 'trade')).toBe(false)
    expect(
      marketplace.auctions.validateBid({
        ...bid,
        tags: [...bid.tags, ['trade', 'auction-bid-trade-1']],
      }),
    ).toBe(false)
    expect(() =>
      marketplace.auctions.parseBid({
        ...bid,
        tags: [...bid.tags, ['trade', 'auction-bid-trade-1']],
      }),
    ).toThrow('Auction bid trade tag is not supported')
  })

  test('derives and parses auction bid chain ids', () => {
    const buyerSecretKey = generateSecretKey()
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const auctionAnchor = `${MarketplaceAuction}:${'a'.repeat(64)}:auction-chain`
    const listingAnchor = `${30402}:${'b'.repeat(64)}:villa-bali`
    const bidChainId = marketplace.auctions.bidChainId('7'.repeat(64), auctionAnchor)
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-bid-chain-trade-1',
        auctionAnchor,
        listingAnchor,
        bidChainId,
        amount: { value: '2500', denomination: 'USD', decimals: 2 },
        participants: [{ pubkey: buyerPubkey, role: 'buyer' }],
        createdAt,
      }),
      buyerSecretKey,
    )
    const parsed = marketplace.auctions.parseBid(bid)

    expect(bidChainId).toMatch(/^[a-f0-9]{64}$/)
    expect(parsed.bidChainId).toBe(bidChainId)
    expect(hasTag(bid, ['bid_chain', bidChainId])).toBe(true)
    expect(marketplace.auctions.validateBid({
      ...bid,
      tags: bid.tags.map(tag => tag[0] === 'bid_chain' ? ['bid_chain', 'invalid'] : tag),
    })).toBe(false)
  })
})

describe('marketplace orders and messages', () => {
  test('generates, validates, and parses orders linked to EVM payment events', () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const buyerTempSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerTempPubkey = getPublicKey(buyerTempSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const method = paymentMethodEvent(sellerSecretKey, arbiterPubkey)
    const service = arbitrationServiceEvent(arbiterSecretKey)
    const tradeId = 'trade-1'
    const terms = {
      start: '2026-06-01T00:00:00.000Z',
      end: '2026-06-05T00:00:00.000Z',
      quantity: 1,
      amount: { value: '50000', denomination: 'BTC', decimals: 8 },
      recipient: sellerPubkey,
    }
    const commitHash = marketplace.orders.commitHash(terms)
    const commitAuthorization = sign(
      marketplace.orders.commitAuthorizationTemplate({
        listingAnchor,
        tradeId,
        commitHash,
        createdAt,
      }),
      sellerSecretKey,
    )
    const tradeKeyAuthorization = sign(
      marketplace.orders.tradeKeyAuthorizationTemplate({
        listingAnchor,
        tradeId,
        version: 1,
        role: 'buyer',
        participantPubkey: buyerTempPubkey,
        createdAt,
      }),
      buyerSecretKey,
    )
    const participantProof = marketplace.participantProofs.publicProof(tradeKeyAuthorization)
    const order = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        ...terms,
        commitAuthorization,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerTempPubkey, role: 'buyer' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        participantProofs: [participantProof],
        createdAt,
        publishedAt: createdAt,
      }),
      buyerTempSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerTempPubkey, role: 'buyer' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        refs: { orders: [order.id] },
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        proof: marketplace.paymentProofForEvm({
          driver: 'evm',
          terms: mockPaymentTerms({ tradeId }),
          txHash: `0x${'b'.repeat(64)}`,
          arbitrationService: service,
          paymentMethod: method,
        }),
        createdAt,
      }),
      buyerTempSecretKey,
    )
    const parsed = marketplace.orders.parse(order)
    const parsedPayment = marketplace.orders.parsePayment(payment)

    expect(order.kind).toBe(MarketplaceOrder)
    expect(payment.kind).toBe(MarketplacePayment)
    expect(marketplace.orders.validate(order)).toBe(true)
    expect(marketplace.orders.commitHash(terms)).toBe(commitHash)
    expect(parsed.tradeId).toBe(tradeId)
    expect(parsed.listingAnchor).toBe(listingAnchor)
    expect(parsed.content.amount).toEqual({ value: '50000', currency: 'BTC', denomination: 'BTC', decimals: 8 })
    expect(parsedPayment.anchors.listing).toBe(listingAnchor)
    expect(parsedPayment.refs.orders).toEqual([order.id])
    expect(parsedPayment.content.amount).toEqual({ value: '50000', currency: 'BTC', denomination: 'BTC', decimals: 8 })
    expect(parsedPayment.content.proof.paymentProof?.driver).toBe('evm')
    expect((parsedPayment.content.proof.arbitration?.arbitrationService as Event).id).toBe(service.id)
    expect(parsed.participants.map(tag => tag.role)).toEqual(['seller', 'buyer', 'arbiter'])
    expect(parsed.participantProofs[0]).toEqual(participantProof)
  })

  test('generates and parses structured private message rumors', () => {
    const child = sign(
      marketplace.orders.template({
        tradeId: 'trade-1',
        listingAnchor: `${30402}:${'a'.repeat(64)}:villa-bali`,
        createdAt,
      }),
    )
    const rumor = sign(
      marketplace.structuredMessages.template({
        childEvent: child,
        conversation: 'trade-1',
        recipients: [{ pubkey: 'b'.repeat(64), role: 'seller' }],
        alt: 'Marketplace order message',
        createdAt,
      }),
    )
    const parsed = marketplace.structuredMessages.parse(rumor)

    expect(rumor.kind).toBe(StructuredMessage)
    expect(marketplace.structuredMessages.validate(rumor)).toBe(true)
    expect(parsed.childEvent.id).toBe(child.id)
    expect(parsed.conversation).toBe('trade-1')
    expect(parsed.recipients[0].role).toBe('seller')
    expect(parsed.alt).toEqual(['Marketplace order message'])
  })

  test('groups orders by trade id and canonical buyer seller arbiter participants', () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-group-1'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' },
      { pubkey: buyerPubkey, role: 'buyer' },
      { pubkey: arbiterPubkey, role: 'arbiter' },
    ]
    const buyerOrder = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        quantity: 1,
        participants,
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [buyerOrder.id] },
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm', { txHash: `0x${'c'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const buyerAck = sign(
      marketplace.orders.paymentAckTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { payments: [payment.id] },
        status: 'accepted',
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const sellerAck = sign(
      marketplace.orders.paymentAckTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { payments: [payment.id] },
        status: 'accepted',
        createdAt: createdAt + 3,
      }),
      sellerSecretKey,
    )
    const reversedParticipants = [...participants].reverse()
    const expectedParticipants = [buyerPubkey, arbiterPubkey, sellerPubkey].sort((a, b) => a.localeCompare(b))
    const expectedGroupId = marketplace.orders.groups.id(tradeId, participants)
    const auction = sign(
      marketplace.auctions.template({
        d: 'participant-group-auction',
        listingAnchor,
        arbiterPubkey,
        currency: 'BTC',
        decimals: 8,
        createdAt,
      }),
      sellerSecretKey,
    )
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId,
        auctionAnchor: marketplace.auctions.address(auction),
        listingAnchor,
        participants: reversedParticipants,
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        createdAt,
      }),
      buyerSecretKey,
    )
    const parsedBid = marketplace.auctions.parseBid(bid)

    expect(marketplace.orders.groups.participants(buyerOrder)).toEqual(expectedParticipants)
    expect(marketplace.orders.groups.participants(parsedBid)).toEqual(expectedParticipants)
    expect(marketplace.orders.groups.idForOrder(buyerOrder)).toBe(expectedGroupId)
    expect(marketplace.orders.groups.idForEvent(parsedBid)).toBe(expectedGroupId)
    expect(marketplace.orders.groups.idForEvent(bid)).toBe(expectedGroupId)
    expect(marketplace.participants.groupId(tradeId, participants)).toBe(expectedGroupId)
    expect(
      marketplace.orders.groups.idForOrder(
        sign(
          marketplace.orders.template({
            tradeId,
            listingAnchor,
            participants: reversedParticipants,
            createdAt,
          }),
          buyerSecretKey,
        ),
      ),
    ).toBe(expectedGroupId)

    const group = marketplace.orders.groups.reduce([buyerOrder, payment, buyerAck, sellerAck])
    expect(group.id).toBe(expectedGroupId)
    expect(group.tradeId).toBe(tradeId)
    expect(group.sellerPubkey).toBe(sellerPubkey)
    expect(group.arbiterPubkeys).toEqual([arbiterPubkey])
    expect(group.stage).toBe('commit')
    expect(group.confirmedCommitted).toBe(true)
    expect(group.buyerOrder?.event.id).toBe(buyerOrder.id)
    expect(group.payment?.event.id).toBe(payment.id)
    expect(group.buyerPaymentAck?.event.id).toBe(buyerAck.id)
    expect(group.sellerPaymentAck?.event.id).toBe(sellerAck.id)
    expect(marketplace.orders.groups.allowed(payment, group)).toBe(true)
  })

  test('builds my-order filters from real and seed-derived temp pubkeys', () => {
    const pubkey = 'b'.repeat(64)
    const seed = '7'.repeat(64)
    const identity = { pubkey, seed, tempKeyWindow: 201, roles: ['buyer' as const] }
    const pubkeys = marketplace.orders.identityPubkeys(identity)
    const filters = marketplace.orders.filters({ identity, limit: 50 })

    expect(pubkeys).toHaveLength(202)
    expect(pubkeys[0]).toBe(pubkey)
    expect(pubkeys).toContain(marketplace.seed.deriveTradeMaterial(seed, { index: 200, role: 'buyer' }).tradePubkey)
    expect(filters).toHaveLength(2)
    expect(filters[0].authors).toBeUndefined()
    expect(filters[0]['#p']).toHaveLength(200)
    expect(filters[1]['#p']).toHaveLength(2)
  })

  test('runtime my order groups use the runtime seed and identity', async () => {
    const buyerPubkey = 'b'.repeat(64)
    const buyerSeed = '8'.repeat(64)
    const sellerSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${sellerPubkey}:villa-bali`
    const trade = marketplace.seed.deriveTradeMaterial(buyerSeed, { index: 2, role: 'buyer' })
    const order = sign(
      marketplace.orders.template({
        tradeId: trade.tradeId,
        listingAnchor,
        participants: [
          { pubkey: trade.tradePubkey, role: 'buyer' },
          { pubkey: sellerPubkey, role: 'seller' },
        ],
        createdAt,
      }),
      trade.tradeSecretKey,
    )
    const filters: Array<Record<string, any>> = []
    const pool = {
      async querySync(_relays: string[], filter: Record<string, any>): Promise<Event[]> {
        filters.push(filter)
        return filter.authors?.includes(trade.tradePubkey) || filter['#p']?.includes(trade.tradePubkey) ? [order] : []
      },
      async get(): Promise<Event | null> {
        return null
      },
      subscribeMap(
        requests: Array<{ filter: Record<string, any> }>,
        handlers: { onevent: (event: Event) => void; oneose?: () => void },
      ) {
        filters.push(...requests.map(request => request.filter))
        handlers.onevent(order)
        handlers.oneose?.()
        return { close() {} }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: buyerSeed,
      identity: { pubkey: buyerPubkey },
    })
    const orders = await api.me.orders.list()
    const orderSnapshots: marketplace.MarketplaceMeOrdersSnapshot[] = []
    const orderStream = api.me.orders.watch()
    orderStream.snapshot.subscribe(snapshot => orderSnapshots.push(snapshot))

    expect(orders.placed).toHaveLength(1)
    expect(orders.placed[0].tradeId).toBe(trade.tradeId)
    expect(orderStream.currentStatus).toBeInstanceOf(marketplace.StreamLive)
    expect(orderSnapshots.at(-1)?.placed).toHaveLength(1)
    expect(orderSnapshots.at(-1)?.placed[0].tradeId).toBe(trade.tradeId)
    expect(filters.some(filter => filter['#p']?.includes(trade.tradePubkey))).toBe(true)
  })

  test('runtime my order groups find arbiter-authored orders promoted from auction bids', async () => {
    const buyerPubkey = 'b'.repeat(64)
    const buyerSeed = '8'.repeat(64)
    const sellerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${sellerPubkey}:villa-bali`
    const trade = marketplace.seed.deriveTradeMaterial(buyerSeed, { index: 2, role: 'buyer' })
    const order = sign(
      marketplace.orders.template({
        tradeId: trade.tradeId,
        listingAnchor,
        participants: [
          { pubkey: trade.tradePubkey, role: 'buyer' },
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        createdAt,
      }),
      arbiterSecretKey,
    )
    const filters: Array<Record<string, any>> = []
    const pool = {
      async querySync(_relays: string[], filter: Record<string, any>): Promise<Event[]> {
        filters.push(filter)
        return filter.authors?.includes(trade.tradePubkey) || filter['#p']?.includes(trade.tradePubkey) ? [order] : []
      },
      async get(): Promise<Event | null> {
        return null
      },
      subscribeMap(
        requests: Array<{ filter: Record<string, any> }>,
        handlers: { onevent: (event: Event) => void; oneose?: () => void },
      ) {
        filters.push(...requests.map(request => request.filter))
        handlers.onevent(order)
        handlers.oneose?.()
        return { close() {} }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: buyerSeed,
      identity: { pubkey: buyerPubkey },
    })
    const orders = await api.me.orders.list()

    expect(orders.placed).toHaveLength(1)
    expect(orders.placed[0].tradeId).toBe(trade.tradeId)
    expect(filters.some(filter => filter['#p']?.includes(trade.tradePubkey))).toBe(true)
  })

  test('only allows participant-authored lifecycle events inside an order group', () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const outsiderSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-group-2'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' },
      { pubkey: buyerPubkey, role: 'buyer' },
      { pubkey: arbiterPubkey, role: 'arbiter' },
    ]
    const firstBuyerOrder = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        participants,
        createdAt,
      }),
      buyerSecretKey,
    )
    const latestBuyerOrder = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        participants,
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const outsiderCancel = sign(
      marketplace.orders.cancelTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [latestBuyerOrder.id] },
        reason: 'outsider cannot cancel',
        createdAt: createdAt + 3,
      }),
      outsiderSecretKey,
    )
    const outsiderOrder = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        participants,
        createdAt: createdAt + 4,
      }),
      outsiderSecretKey,
    )

    expect(marketplace.orders.validate(outsiderOrder)).toBe(false)

    const group = marketplace.orders.groups.reduce([
      firstBuyerOrder,
      latestBuyerOrder,
      outsiderCancel,
    ])
    expect(group.stage).toBe('negotiate')
    expect(group.confirmedCommitted).toBe(false)
    expect(group.buyerOrder?.event.id).toBe(latestBuyerOrder.id)
    expect(group.cancellation).toBeUndefined()
    expect(group.ignoredEvents.map(event => event.event.id)).toContain(outsiderCancel.id)

    const validCancel = sign(
      marketplace.orders.cancelTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [latestBuyerOrder.id] },
        reason: 'buyer cancelled',
        createdAt: createdAt + 5,
      }),
      buyerSecretKey,
    )
    const cancelledGroup = marketplace.orders.groups.reduce([
      firstBuyerOrder,
      latestBuyerOrder,
      outsiderCancel,
      validCancel,
    ])
    expect(cancelledGroup.stage).toBe('cancel')
    expect(cancelledGroup.cancellation?.event.id).toBe(validCancel.id)
  })

  test('marks buyer commits confirmed only when the payment proof validator accepts them', () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const buyerOrder = sign(
      marketplace.orders.template({
        tradeId: 'trade-group-3',
        listingAnchor,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'trade-group-3',
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        refs: { orders: [buyerOrder.id] },
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm', { txHash: `0x${'d'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )

    const unverifiedGroup = marketplace.orders.groups.reduce([buyerOrder, payment])
    const verifiedGroup = marketplace.orders.groups.reduce([buyerOrder, payment], { isPaymentValid: () => true })
    expect(unverifiedGroup.stage).toBe('negotiate')
    expect(unverifiedGroup.confirmedCommitted).toBe(false)
    expect(verifiedGroup.stage).toBe('commit')
    expect(verifiedGroup.confirmedCommitted).toBe(true)
  })

  test('resolves real participants from NIP-44 participant proofs', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const buyerTempSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const buyerTempPubkey = getPublicKey(buyerTempSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-group-4'
    const authorization = sign(
      marketplace.orders.tradeKeyAuthorizationTemplate({
        listingAnchor,
        tradeId,
        version: 1,
        role: 'buyer',
        participantPubkey: buyerTempPubkey,
        createdAt,
      }),
      buyerSecretKey,
    )
    const sealed = marketplace.participantProofs.sealedProof(authorization, new Uint8Array(32).fill(7))
    const participantProofKey = marketplace.participantProofs.keyWrap({
      proofId: sealed.proof.proofId,
      recipientPubkey: sellerPubkey,
      senderSecretKey: buyerTempSecretKey,
      disclosureKey: sealed.disclosureKey,
    })
    const order = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerTempPubkey, role: 'buyer' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        participantProofs: [sealed.proof],
        participantProofKeys: [participantProofKey],
        createdAt,
      }),
      buyerTempSecretKey,
    )
    const group = marketplace.orders.groups.reduce([order])
    const resolved = await marketplace.orders.groups.resolveParticipants(group, {
      signerPubkey: sellerPubkey,
      signer: {
        async getPublicKey() {
          return sellerPubkey
        },
        async nip44Decrypt(pubkey: string, ciphertext: string) {
          expect(pubkey).toBe(buyerTempPubkey)
          expect(ciphertext).toBe(participantProofKey.payload)
          return decryptNip44(ciphertext, getConversationKey(sellerSecretKey, pubkey))
        },
      },
    })

    const buyer = resolved.participants.find(participant => participant.role === 'buyer')
    expect(resolved.status).toBe('complete')
    expect(buyer?.tradePubkey).toBe(buyerTempPubkey)
    expect(buyer?.realPubkey).toBe(buyerPubkey)
    expect(buyer?.proofStatus).toBe('resolved')
    expect(buyer?.authorizationEventId).toBe(authorization.id)
  })

  test('validates order group payments with the matching payment policy', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const order = sign(
      marketplace.orders.template({
        tradeId: 'trade-group-5',
        listingAnchor,
        listing,
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'trade-group-5',
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        refs: { orders: [order.id] },
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm', { txHash: `0x${'f'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const group = marketplace.orders.groups.reduce([order, payment])
    const missingPolicy = await marketplace.orders.groups.validatePayments(group)
    const validated = await marketplace.orders.groups.validatePayments(group, {
      policies: [
        {
          method: 'evm',
          canValidate: (request: marketplace.MarketplacePaymentValidationRequest) =>
            request.proof.params.txHash === `0x${'f'.repeat(64)}`,
          async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
            return {
              driver: request.proof.driver,
              status: 'valid',
              amount: request.expected.amount,
              terms: {
                settlementId: request.expected.settlementId,
                paymentAmount: request.expected.amount,
                securityBondAmount: { value: '25000', denomination: 'BTC', decimals: 8 },
                unlockAt: createdAt + 3600,
              },
              amountMatched: true,
              assetMatched: true,
              recipientMatched: true,
              arbiterMatched: true,
              confirmations: 3,
            }
          },
        },
      ],
    })

    expect(missingPolicy.payment.status).toBe('unverifiable')
    expect(missingPolicy.group.confirmedCommitted).toBe(false)
    expect(validated.payment.status).toBe('valid')
    expect(validated.order?.status).toBe('valid')
    expect(validated.group.stage).toBe('commit')
    expect(validated.group.confirmedCommitted).toBe(true)
    expect(validated.payment.confirmations).toBe(3)
  })

  test('reports invalid embedded listing order terms without rejecting valid payments', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const order = sign(
      marketplace.orders.template({
        tradeId: 'trade-group-order-validation',
        listingAnchor,
        listing,
        amount: { value: '40000', denomination: 'BTC', decimals: 8 },
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'trade-group-order-validation',
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: arbiterPubkey, role: 'arbiter' },
        ],
        refs: { orders: [order.id] },
        amount: { value: '40000', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm', { txHash: `0x${'e'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const group = marketplace.orders.groups.reduce([order, payment])
    const validated = await marketplace.orders.groups.validatePayments(group, {
      policies: [
        {
          method: 'evm',
          async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
            return {
              driver: request.proof.driver,
              status: 'valid',
              amount: request.expected.amount,
              terms: {
                settlementId: request.expected.settlementId,
                paymentAmount: request.expected.amount,
                securityBondAmount: { value: '25000', denomination: 'BTC', decimals: 8 },
                unlockAt: createdAt + 3600,
              },
              amountMatched: true,
            }
          },
        },
      ],
    })

    expect(validated.payment.status).toBe('valid')
    expect(validated.order?.status).toBe('invalid')
    expect(validated.order?.errors).toContain('Order amount does not match embedded listing price')
    expect(validated.group.confirmedCommitted).toBe(true)
    expect(validated.group.stage).toBe('commit')
  })

  test('payment nacks block committed status until settlement exists', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const order = sign(
      marketplace.orders.template({
        tradeId: 'trade-group-nack',
        listingAnchor,
        participants,
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'trade-group-nack',
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [order.id] },
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm', { txHash: `0x${'f'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const nack = sign(
      marketplace.orders.paymentNackTemplate({
        tradeId: 'trade-group-nack',
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { payments: [payment.id] },
        status: 'rejected',
        message: 'Payment proof is inadequate',
        createdAt: createdAt + 2,
      }),
      arbiterSecretKey,
    )

    const [group] = marketplace.orders.groups.group([order, payment, nack], {
      isPaymentValid: () => true,
    })

    expect(group.paymentNack?.event.id).toBe(nack.id)
    expect(group.stage).toBe('negotiate')
    expect(group.confirmedCommitted).toBe(false)
  })

  test('later arbiter payment ack supersedes an earlier nack for the current payment', () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const order = sign(
      marketplace.orders.template({
        tradeId: 'trade-group-nack-then-ack',
        listingAnchor,
        participants,
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'trade-group-nack-then-ack',
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [order.id] },
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm', { txHash: `0x${'f'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const nack = sign(
      marketplace.orders.paymentNackTemplate({
        tradeId: 'trade-group-nack-then-ack',
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { payments: [payment.id] },
        status: 'rejected',
        message: 'Payment amount does not match payment event amount',
        createdAt: createdAt + 2,
      }),
      arbiterSecretKey,
    )
    const ack = sign(
      marketplace.orders.paymentAckTemplate({
        tradeId: 'trade-group-nack-then-ack',
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { payments: [payment.id] },
        status: 'accepted',
        createdAt: createdAt + 3,
      }),
      arbiterSecretKey,
    )

    const group = marketplace.orders.groups.reduce([order, payment, nack, ack])

    expect(group.paymentNacks.map(item => item.event.id)).toEqual([nack.id])
    expect(group.paymentAcks.map(item => item.event.id)).toEqual([ack.id])
    expect(group.paymentNack).toBeUndefined()
    expect(group.paymentAck?.event.id).toBe(ack.id)
    expect(group.stage).toBe('commit')
    expect(group.confirmedCommitted).toBe(true)
  })
})

describe('marketplace seeds', () => {
  test('creates, decrypts, fetches, and derives deterministic trade material from a seed event', async () => {
    const identitySecretKey = generateSecretKey()
    const identityPubkey = getPublicKey(identitySecretKey)
    const seed = '1'.repeat(64)
    const event = marketplace.seed.createEvent({
      identitySecretKey,
      identityPubkey,
      seed,
      createdAt,
      nonce: new Uint8Array(32).fill(7),
    })
    const parsed = marketplace.seed.decryptEvent({ event, identitySecretKey, identityPubkey })
    const firstTrade = marketplace.seed.deriveTradeMaterial(seed, { index: 0, role: 'buyer' })
    const firstTradeAgain = marketplace.seed.deriveTradeMaterial(seed, { index: 0, role: 'buyer' })
    const secondTrade = marketplace.seed.deriveTradeMaterial(seed, { index: 1, role: 'buyer' })
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[]; authors?: string[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplaceSeed) && filter.authors?.includes(identityPubkey)) return [event]
        return []
      },
    }

    expect(event.kind).toBe(MarketplaceSeed)
    expect(isRegularKind(event.kind)).toBe(true)
    expect(marketplace.seed.validate(event)).toBe(true)
    expect(parsed).toEqual({ v: 1, seed })
    expect(await marketplace.seed.fetchEvent(pool, ['wss://relay.example'], identityPubkey)).toEqual(event)
    expect(marketplace.seed.filter(identityPubkey)).toEqual({
      kinds: [MarketplaceSeed],
      authors: [identityPubkey],
      limit: 1,
    })
    expect(firstTrade.tradeId).toBe(firstTradeAgain.tradeId)
    expect(firstTrade.tradePubkey).toBe(firstTradeAgain.tradePubkey)
    expect(marketplace.seed.deriveTradeId(seed, { index: 0, role: 'seller' })).toBe(firstTrade.tradeId)
    expect(firstTrade.tradeId).not.toBe(secondTrade.tradeId)
    expect(firstTrade.tradePubkey).not.toBe(secondTrade.tradePubkey)
  })

  test('getOrCreate fetches an existing seed or creates and publishes one on first startup', async () => {
    const identitySecretKey = generateSecretKey()
    const identityPubkey = getPublicKey(identitySecretKey)
    const existingEvent = marketplace.seed.createEvent({
      identitySecretKey,
      identityPubkey,
      seed: '2'.repeat(64),
      createdAt,
      nonce: new Uint8Array(32).fill(8),
    })
    const existingPool = {
      async querySync(): Promise<Event[]> {
        return [existingEvent]
      },
    }
    const emptyPool = {
      async querySync(): Promise<Event[]> {
        return []
      },
    }
    const published: Event[] = []

    const existing = await marketplace.seed.getOrCreate({
      pool: existingPool,
      relays: ['wss://relay.example'],
      identitySecretKey,
      publish: event => published.push(event),
    })
    const created = await marketplace.seed.getOrCreate({
      pool: emptyPool,
      relays: ['wss://relay.example'],
      identitySecretKey,
      createdAt,
      publish: event => published.push(event),
    })

    expect(existing.created).toBe(false)
    expect(existing.seed).toBe('2'.repeat(64))
    expect(created.created).toBe(true)
    expect(created.event.kind).toBe(MarketplaceSeed)
    expect(created.event.pubkey).toBe(identityPubkey)
    expect(published).toEqual([created.event])
  })

  test('getOrCreate supports signer-backed seed recovery without an identity secret key', async () => {
    const identitySecretKey = generateSecretKey()
    const identityPubkey = getPublicKey(identitySecretKey)
    const existingSeed = '3'.repeat(64)
    const existingEvent = sign({
      kind: MarketplaceSeed,
      created_at: createdAt,
      content: 'encrypted-existing-seed',
      tags: [],
    }, identitySecretKey)
    const existingPool = {
      async querySync(): Promise<Event[]> {
        return [existingEvent]
      },
    }
    const emptyPool = {
      async querySync(): Promise<Event[]> {
        return []
      },
    }
    const published: Event[] = []
    const signer = {
      async getPublicKey() {
        return identityPubkey
      },
      async nip44Decrypt(pubkey: string, ciphertext: string) {
        expect(pubkey).toBe(identityPubkey)
        expect(ciphertext).toBe(existingEvent.content)
        return marketplace.seed.encodePayload(existingSeed)
      },
      async nip44Encrypt(pubkey: string, plaintext: string) {
        expect(pubkey).toBe(identityPubkey)
        expect(marketplace.seed.parsePayload(plaintext).seed).toMatch(/^[a-f0-9]{64}$/)
        return 'encrypted-created-seed'
      },
      async signEvent(template: EventTemplate) {
        return sign(template, identitySecretKey)
      },
    }

    const existing = await marketplace.seed.getOrCreate({
      pool: existingPool,
      relays: ['wss://relay.example'],
      signer,
      publish: event => published.push(event),
    })
    const created = await marketplace.seed.getOrCreate({
      pool: emptyPool,
      relays: ['wss://relay.example'],
      signer,
      createdAt,
      publish: event => published.push(event),
    })

    expect(existing.created).toBe(false)
    expect(existing.seed).toBe(existingSeed)
    expect(created.created).toBe(true)
    expect(created.event.content).toBe('encrypted-created-seed')
    expect(created.event.pubkey).toBe(identityPubkey)
    expect(published).toEqual([created.event])
  })

  test('fetchEvent chooses the newest valid seed result', async () => {
    const identitySecretKey = generateSecretKey()
    const identityPubkey = getPublicKey(identitySecretKey)
    const olderValidEvent = marketplace.seed.createEvent({
      identitySecretKey,
      identityPubkey,
      seed: '3'.repeat(64),
      createdAt,
      nonce: new Uint8Array(32).fill(9),
    })
    const newerValidEvent = marketplace.seed.createEvent({
      identitySecretKey,
      identityPubkey,
      seed: '4'.repeat(64),
      createdAt: createdAt + 1,
      nonce: new Uint8Array(32).fill(10),
    })
    const invalidFirst = sign({
      kind: MarketplaceSeed,
      created_at: createdAt + 2,
      content: '',
      tags: [],
    })
    const pool = {
      async querySync(): Promise<Event[]> {
        return [invalidFirst, olderValidEvent, newerValidEvent]
      },
    }

    expect(await marketplace.seed.fetchEvent(pool, ['wss://relay.example'], identityPubkey)).toEqual(newerValidEvent)
  })

  test('session creates the marketplace seed and stores it on the session', async () => {
    const identitySecretKey = generateSecretKey()
    const identityPubkey = getPublicKey(identitySecretKey)
    const pool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    const published: Event[] = []
    const signer = {
      async getPublicKey() {
        return identityPubkey
      },
      async nip44Decrypt() {
        throw new Error('No seed should be decrypted when no seed event exists')
      },
      async nip44Encrypt(_pubkey: string, plaintext: string) {
        return `encrypted:${plaintext}`
      },
      async signEvent(template: EventTemplate) {
        return sign(template, identitySecretKey)
      },
    }
    const api = await marketplace.bind(pool, ['wss://relay.example']).session(signer, {
      publish: event => published.push(event),
    })
    const discovery = await api.discoverHighWatermark()

    expect(api.identity.pubkey).toBe(identityPubkey)
    expect(api.seed.created).toBe(true)
    expect(api.seed.event).toEqual(published[0])
    expect(discovery.seed).toMatch(/^[a-f0-9]{64}$/)
    expect(discovery.nextUnusedIndex).toBe(0)

    const buyerPubkey = marketplace.deriveMarketplaceTradeMaterial(discovery.seed, {
      index: 0,
      role: 'buyer',
    }).tradePubkey
    expect(api.seed.owns(buyerPubkey, { through: 0 })).toBe(true)
    expect(api.seed.owns(getPublicKey(generateSecretKey()), { through: 0 })).toBe(false)
  })

  test('session uses the bound pool publisher when no publish hook is provided', async () => {
    const identitySecretKey = generateSecretKey()
    const identityPubkey = getPublicKey(identitySecretKey)
    const published: Array<{ relays: string[]; event: Event }> = []
    const pool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
      publish(relays: string[], event: Event): Promise<string>[] {
        published.push({ relays, event })
        return [Promise.resolve('ok')]
      },
    }
    const signer = {
      async getPublicKey() {
        return identityPubkey
      },
      async nip44Decrypt() {
        throw new Error('No seed should be decrypted when no seed event exists')
      },
      async nip44Encrypt(_pubkey: string, plaintext: string) {
        return `encrypted:${plaintext}`
      },
      async signEvent(template: EventTemplate) {
        return sign(template, identitySecretKey)
      },
    }

    const api = await marketplace.bind(pool, ['wss://relay.example']).session(signer)

    expect(api.seed.created).toBe(true)
    expect(published).toHaveLength(1)
    expect(published[0]).toEqual({
      relays: ['wss://relay.example'],
      event: api.seed.event,
    })
  })
})

describe('marketplace reviews and runtime facade', () => {
	  test('generates, validates, and parses reviews', () => {
    const listingAnchor = `${30402}:${'a'.repeat(64)}:villa-bali`
    const orderGroupId = 'b'.repeat(64)
    const buyerSecretKey = generateSecretKey()
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const buyerTempPubkey = 'c'.repeat(64)
    const authorization = sign(
      marketplace.orders.tradeKeyAuthorizationTemplate({
        version: 1,
        role: 'buyer',
        participantPubkey: buyerTempPubkey,
        listingAnchor,
        tradeId: 'trade-1',
        orderGroupId,
        createdAt,
      }),
      buyerSecretKey,
    )
    const review = sign(
      marketplace.reviews.template({
        orderGroupId,
        tradeId: 'trade-1',
        listingAnchor,
        rating: 0.8,
        orderAnchor: `${MarketplaceOrder}:${'b'.repeat(64)}:${orderGroupId}`,
        participantProofs: [marketplace.participantProofs.publicProof(authorization)],
        content: 'Clear terms and smooth payment.',
        createdAt,
      }),
    )
    const parsed = marketplace.reviews.parse(review)

    expect(review.kind).toBe(MarketplaceReview)
    expect(marketplace.reviews.validate(review)).toBe(true)
    expect(parsed.orderGroupId).toBe(orderGroupId)
    expect(parsed.tradeId).toBe('trade-1')
    expect(parsed.listingAnchor).toBe(listingAnchor)
    expect(parsed.rating).toBe(0.8)
    expect(parsed.content).toBe('Clear terms and smooth payment.')
    expect(marketplace.reviews.resolveProof(parsed)).toMatchObject({
      status: 'resolved',
      role: 'buyer',
      participantPubkey: buyerTempPubkey,
      realPubkey: buyerPubkey,
      authorizationEventId: authorization.id,
    })
	    expect(marketplace.reviews.revealedBuyerPubkey(parsed)).toBe(buyerPubkey)
	  })

	  test('publishes negotiation offers through the session orders API', async () => {
	    const sellerSecretKey = generateSecretKey()
	    const buyerSecretKey = generateSecretKey()
	    const buyerPubkey = getPublicKey(buyerSecretKey)
	    const listing = listingEvent(sellerSecretKey)
	    const published: Event[] = []
	    const pool = {
	      async querySync(): Promise<Event[]> {
	        return []
	      },
	      async get(): Promise<Event | null> {
	        return null
	      },
	    }
	    const api = marketplace.bind(pool, ['wss://relay.example'], {
	      seed: '8'.repeat(64),
	      identity: { pubkey: buyerPubkey },
	      publish: event => published.push(event),
	      signer: {
	        async getPublicKey() {
	          return buyerPubkey
	        },
	        async nip44Encrypt(pubkey: string, plaintext: string) {
	          return encryptNip44(plaintext, getConversationKey(buyerSecretKey, pubkey))
	        },
	        async nip44Decrypt() {
	          throw new Error('not used')
	        },
	        async signEvent(template: EventTemplate) {
	          return sign(template, buyerSecretKey)
	        },
	      },
	    })

	    const result = await api.orders.negotiate(listing, {
	      amount: { value: '10000', denomination: 'BTC', decimals: 8 },
	      start: '2026-07-01',
	      end: '2026-07-02',
	      now: createdAt,
	    })

	    expect(result.accountIndex).toBe(0)
	    expect(result.tradeId).toBe(marketplace.seed.deriveTradeId('8'.repeat(64), { index: 0 }))
	    expect(result.order.kind).toBe(MarketplaceOrder)
	    expect(result.message.kind).toBe(StructuredMessage)
	    expect(result.giftWraps).toHaveLength(2)
	    expect(published).toEqual(result.giftWraps)
	    expect(published.map(event => event.kind)).toEqual([GiftWrap, GiftWrap])
	    expect(new Set(published.map(event => event.tags.find(tag => tag[0] === 'p')?.[1]))).toEqual(new Set([
	      buyerPubkey,
	      listing.pubkey,
	    ]))
	  })

	  test('discovers negotiation trade ids from sent inbox messages', async () => {
	    const sellerSecretKey = generateSecretKey()
	    const buyerSecretKey = generateSecretKey()
	    const buyerPubkey = getPublicKey(buyerSecretKey)
	    const listing = listingEvent(sellerSecretKey)
	    const published: Event[] = []
	    const pool = {
	      async querySync(_relays: string[], filter: Record<string, unknown>): Promise<Event[]> {
	        return published.filter(event => {
	          const kinds = filter.kinds as number[] | undefined
	          if (kinds && !kinds.includes(event.kind)) return false
	          const pTags = filter['#p'] as string[] | undefined
	          if (pTags && !event.tags.some(tag => tag[0] === 'p' && pTags.includes(tag[1]))) return false
	          const authors = filter.authors as string[] | undefined
	          if (authors && !authors.includes(event.pubkey)) return false
	          return true
	        })
	      },
	      async get(): Promise<Event | null> {
	        return null
	      },
	    }
	    const signer = {
	      async getPublicKey() {
	        return buyerPubkey
	      },
	      async nip44Encrypt(pubkey: string, plaintext: string) {
	        return encryptNip44(plaintext, getConversationKey(buyerSecretKey, pubkey))
	      },
	      async nip44Decrypt(pubkey: string, ciphertext: string) {
	        return decryptNip44(ciphertext, getConversationKey(buyerSecretKey, pubkey))
	      },
	      async signEvent(template: EventTemplate) {
	        return sign(template, buyerSecretKey)
	      },
	    }
	    const runtimeOptions = {
	      seed: '8'.repeat(64),
	      identity: { pubkey: buyerPubkey },
	      publish: (event: Event) => published.push(event),
	      signer,
	    }

	    const firstApi = marketplace.bind(pool, ['wss://relay.example'], runtimeOptions)
	    const first = await firstApi.orders.negotiate(listing, {
	      amount: { value: '10000', denomination: 'BTC', decimals: 8 },
	      now: createdAt,
	    })
	    const secondApi = marketplace.bind(pool, ['wss://relay.example'], runtimeOptions)
	    const second = await secondApi.orders.negotiate(listing, {
	      amount: { value: '11000', denomination: 'BTC', decimals: 8 },
	      now: createdAt + 1,
	    })

	    expect(first.accountIndex).toBe(0)
	    expect(second.accountIndex).toBe(1)
	    expect(first.tradeId).toBe(marketplace.seed.deriveTradeId('8'.repeat(64), { index: 0 }))
	    expect(second.tradeId).toBe(marketplace.seed.deriveTradeId('8'.repeat(64), { index: 1 }))
	  })

  test('auto-selects an implemented payment policy for pay stream', async () => {
    const sellerSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerSecretKey = generateSecretKey()
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterSecretKey = generateSecretKey()
    const listing = listingEvent(sellerSecretKey)
    const method = paymentMethodEvent(sellerSecretKey, getPublicKey(arbiterSecretKey))
    const service = arbitrationServiceEvent(arbiterSecretKey)
    const unsupportedService = {
      ...service,
      content: JSON.stringify({
        ...JSON.parse(service.content),
        params: {
          ...JSON.parse(service.content).params,
          contractBytecodeHash: 'b'.repeat(64),
        },
      }),
    }
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(ArbitrationService)) return [unsupportedService, service]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedSeed: string | undefined
    let receivedBytecodeHash: string | undefined
    const published: Event[] = []
    const policy: marketplace.MarketplaceOrderPolicy = {
      method: 'evm',
      id: 'evm-multi-escrow',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{
        method: 'evm',
        id: 'evm-multi-escrow',
        type: 'evm:multi-escrow',
        hash: `0x${bytecodeHash}`,
        chainId: 33,
        contractAddress,
      }],
      assets: () => [{
        method: 'evm',
        assetId: btcAssetId,
        denomination: 'BTC',
        decimals: 8,
        appId: 'another-client',
        chainId: 33,
        assetAddress: btcAssetId.split(':')[1],
      }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedSeed = intent.seed
        receivedBytecodeHash = intent.contract.bytecodeHash
        yield {
          type: 'paid' as const,
          proof: mockPaymentProof('evm', { tradeId: intent.tradeId, txHash: `0x${'5'.repeat(64)}` }),
          data: {
            tradeId: intent.tradeId,
            amount: intent.amount.value,
          },
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '4'.repeat(64),
      publish: event => published.push(event),
      orderDrivers: [policy],
      signer: {
        async getPublicKey() {
          return buyerPubkey
        },
        async nip44Decrypt() {
          throw new Error('not used')
        },
        async signEvent(template: EventTemplate) {
          return sign(template, buyerSecretKey)
        },
      },
    })

    const result: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, {
      tradeId: 'trade-1',
      listingAnchor,
      amount: { value: '50000', denomination: 'BTC', decimals: 8 },
      createdAt,
    }, {
      identityProofPrivacy: 'public',
      paymentProofPrivacy: 'sealed',
      paymentAmountPrivacy: 'sealed',
    })) {
      result.push(state)
    }

    expect(result.map(state => state.type)).toEqual(['payment_progress', 'order_published', 'payment_published', 'completed'])
    expect(result[0]?.data).toEqual({ tradeId: 'trade-1', amount: '50000', stage: 'proof_publishing' })
    expect(result[1]?.data).toEqual({ tradeId: 'trade-1', amount: '50000' })
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
    expect(published[0].pubkey).toBe(marketplace.seed.deriveTradeMaterial('4'.repeat(64), {
      index: 0,
      role: 'buyer',
    }).tradePubkey)
    const parsedOrder = marketplace.orders.parse(published[0])
    expect(parsedOrder.participantProofs).toHaveLength(1)
    expect(parsedOrder.participantProofKeys).toHaveLength(0)
    expect(marketplace.participantProofs.resolvePublic(parsedOrder.participantProofs[0], {
      listingAnchor,
      tradeId: parsedOrder.tradeId,
      role: 'buyer',
      participantPubkey: parsedOrder.event.pubkey,
    })).toMatchObject({
      status: 'resolved',
      realPubkey: buyerPubkey,
      participantPubkey: parsedOrder.event.pubkey,
    })
    const parsedPayment = marketplace.orders.parsePayment(published[1])
    expect(parsedPayment.content.amount).toBeUndefined()
    expect(parsedPayment.content.sealedAmount?.mode).toBe('sealed:v1')
    expect(parsedPayment.paymentAmountKeys.map(key => key.recipientPubkey).sort()).toEqual([
      sellerPubkey,
      getPublicKey(arbiterSecretKey),
      parsedPayment.event.pubkey,
    ].sort())
    expect(parsedPayment.content.proof).toBeUndefined()
    expect(parsedPayment.content.sealedProof?.mode).toBe('sealed:v1')
    expect(parsedPayment.paymentProofKeys.map(key => key.recipientPubkey).sort()).toEqual([
      sellerPubkey,
      getPublicKey(arbiterSecretKey),
      parsedPayment.event.pubkey,
    ].sort())
    const resolvedPaymentProof = await marketplace.paymentProofs.resolve(parsedPayment, {
      signerPubkey: sellerPubkey,
      signer: {
        async getPublicKey() {
          return sellerPubkey
        },
        async nip44Decrypt(pubkey: string, ciphertext: string) {
          return decryptNip44(ciphertext, getConversationKey(sellerSecretKey, pubkey))
        },
      },
    })
    const resolvedPaymentAmount = await marketplace.paymentAmounts.resolve(parsedPayment, {
      signerPubkey: sellerPubkey,
      signer: {
        async getPublicKey() {
          return sellerPubkey
        },
        async nip44Decrypt(pubkey: string, ciphertext: string) {
          return decryptNip44(ciphertext, getConversationKey(sellerSecretKey, pubkey))
        },
      },
    })
    expect(resolvedPaymentAmount.status).toBe('resolved')
    expect(resolvedPaymentAmount.amount).toEqual({ value: '50000', currency: 'BTC', denomination: 'BTC', decimals: 8 })
    expect(resolvedPaymentProof.status).toBe('resolved')
    expect(resolvedPaymentProof.proof?.paymentProof?.params.tradeId).toBe('trade-1')
    expect(receivedSeed).toBe('4'.repeat(64))
    expect(receivedBytecodeHash).toBe(`0x${bytecodeHash}`)
  })

  test('can seal only payment proof params and resolve them with proof keys', async () => {
    const senderSecretKey = generateSecretKey()
    const recipientSecretKey = generateSecretKey()
    const recipientPubkey = getPublicKey(recipientSecretKey)
    const proof: marketplace.PaymentProof = {
      paymentProof: {
        driver: 'evm:multi-escrow',
        terms: mockPaymentTerms({ tradeId: 'trade-1' }),
        params: {
          txHash: `0x${'5'.repeat(64)}`,
          tradeId: 'trade-1',
          paymentAmount: '50000',
          denomination: 'BTC',
          decimals: 8,
        },
      },
    }

    const payload = marketplace.paymentProofs.build(proof, {
      mode: 'params',
      senderSecretKey,
      recipientPubkeys: [recipientPubkey],
    })

    expect('paymentProof' in payload.proof).toBe(true)
    const publicProof = payload.proof as marketplace.PaymentProof
    expect(publicProof.paymentProof?.driver).toBe('evm:multi-escrow')
    const encryptedParams = publicProof.paymentProof?.params as Record<string, unknown>
    expect(encryptedParams.encrypted).toBe(true)
    expect(String(encryptedParams.payload)).not.toContain('trade-1')
    expect(payload.paymentProofKeys.map(key => key.recipientPubkey)).toEqual([recipientPubkey])

    const resolved = await marketplace.paymentProofs.resolveParams(publicProof.paymentProof!, {
      keys: payload.paymentProofKeys,
      signerPubkey: recipientPubkey,
      signer: {
        async getPublicKey() {
          return recipientPubkey
        },
        async nip44Decrypt(pubkey: string, ciphertext: string) {
          return decryptNip44(ciphertext, getConversationKey(recipientSecretKey, pubkey))
        },
      },
    })

    expect(resolved.status).toBe('resolved')
    expect(resolved.params?.tradeId).toBe('trade-1')
    expect(resolved.params?.paymentAmount).toBe('50000')
  })

  test('can seal only payment proof terms and resolve them with proof keys', async () => {
    const senderSecretKey = generateSecretKey()
    const recipientSecretKey = generateSecretKey()
    const recipientPubkey = getPublicKey(recipientSecretKey)
    const proof: marketplace.PaymentProof = {
      paymentProof: mockPaymentProof('evm:multi-escrow', {
        txHash: `0x${'5'.repeat(64)}`,
        tradeId: 'trade-terms-1',
      }, mockPaymentTerms({ tradeId: 'trade-terms-1', value: '70000' })),
    }

    const payload = marketplace.paymentProofs.build(proof, {
      mode: 'public',
      termsMode: 'sealed',
      senderSecretKey,
      recipientPubkeys: [recipientPubkey],
    })

    expect('paymentProof' in payload.proof).toBe(true)
    const publicProof = payload.proof as marketplace.PaymentProof
    expect(publicProof.paymentProof?.terms).toBeUndefined()
    expect(publicProof.paymentProof?.sealedTerms?.mode).toBe('sealed:v1')
    expect(publicProof.paymentProof?.params.tradeId).toBe('trade-terms-1')

    const resolved = await marketplace.paymentProofs.resolveEvidence(publicProof.paymentProof!, {
      keys: payload.paymentProofKeys,
      signerPubkey: recipientPubkey,
      signer: {
        async getPublicKey() {
          return recipientPubkey
        },
        async nip44Decrypt(pubkey: string, ciphertext: string) {
          return decryptNip44(ciphertext, getConversationKey(recipientSecretKey, pubkey))
        },
      },
    })

    expect(resolved.status).toBe('resolved')
    expect(resolved.proof?.terms.asset.value).toBe('70000')
    expect(resolved.proof?.params.tradeId).toBe('trade-terms-1')
  })

  test('publishes BTC amounts for SAT-denominated payment routes', async () => {
    const sellerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const method = cashuPaymentMethodEvent(sellerSecretKey, getPublicKey(arbiterSecretKey))
    const service = cashuArbitrationServiceEvent(arbiterSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    expect(method.tags).toContainEqual(['o', 'BTC', cashuAssetId, 'marketplace'])
    expect(method.tags.some(tag => tag[0] === 'o' && tag[1] === 'SAT')).toBe(false)
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(ArbitrationService)) return [service]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedAmount: marketplace.MarketplaceAmount | undefined
    const published: Event[] = []
    const policy: marketplace.MarketplaceOrderPolicy = {
      method: 'cashu',
      id: 'cashu:p2pk-escrow-v1',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{
        method: 'cashu',
        id: 'cashu:p2pk-escrow-v1',
        type: 'cashu:p2pk-escrow-v1',
        hash: cashuPolicyHash,
        data: { mintUrl: cashuMintUrl, unit: 'sat' },
      }],
      assets: () => [{
        method: 'cashu',
        assetId: cashuAssetId,
        denomination: 'SAT',
        decimals: 0,
        appId: 'marketplace',
        data: { mintUrl: cashuMintUrl, unit: 'sat' },
      }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedAmount = intent.amount
        yield {
          type: 'paid' as const,
          proof: mockPaymentProof('cashu', {
            policyType: 'cashu:p2pk-escrow-v1',
            mint: cashuMintUrl,
            unit: 'sat',
            amount: intent.amount.value,
            denomination: intent.amount.denomination,
            decimals: intent.amount.decimals,
          }),
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '8'.repeat(64),
      publish: event => published.push(event),
      orderDrivers: [policy],
      signer: {
        async getPublicKey() {
          return buyerPubkey
        },
        async nip44Decrypt() {
          throw new Error('not used')
        },
        async signEvent(template: EventTemplate) {
          return sign(template, buyerSecretKey)
        },
      },
    })

    const result: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, {
      tradeId: 'cashu-trade-1',
      listingAnchor,
      amount: { value: '600000', denomination: 'BTC', decimals: 8 },
      createdAt,
    }, {
      identityProofPrivacy: 'public',
    })) {
      result.push(state)
    }

    expect(result.map(state => state.type)).toEqual(['payment_progress', 'order_published', 'payment_published', 'completed'])
    expect(receivedAmount).toEqual({ value: '600000', currency: 'BTC', denomination: 'SAT', decimals: 0 })
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
    const parsedOrder = marketplace.orders.parse(published[0])
    const parsedPayment = marketplace.orders.parsePayment(published[1])
    expect(parsedOrder.content.amount).toEqual({ value: '600000', currency: 'BTC', denomination: 'BTC', decimals: 8 })
    expect(parsedPayment.content.amount).toEqual({ value: '600000', currency: 'BTC', denomination: 'BTC', decimals: 8 })
  })

  test('uses an explicitly selected payment route for pay stream', async () => {
    const sellerSecretKey = generateSecretKey()
    const firstArbiterSecretKey = generateSecretKey()
    const secondArbiterSecretKey = generateSecretKey()
    const firstArbiterPubkey = getPublicKey(firstArbiterSecretKey)
    const secondArbiterPubkey = getPublicKey(secondArbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const method = sign(
      marketplace.paymentMethod.template({
        trustedArbiterPubkeys: [firstArbiterPubkey, secondArbiterPubkey],
        supportedContractBytecodeHashes: [bytecodeHash],
        acceptedPaymentForms: [{ denomination: 'BTC', assetId: btcAssetId, appId: 'marketplace' }],
        evmAddress: sellerEvmAddress,
        createdAt,
      }),
      sellerSecretKey,
    )
    const firstService = arbitrationServiceEvent(firstArbiterSecretKey)
    const secondService = arbitrationServiceEvent(secondArbiterSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[]; authors?: string[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(ArbitrationService)) {
          if (filter.authors?.includes(firstArbiterPubkey)) return [firstService]
          if (filter.authors?.includes(secondArbiterPubkey)) return [secondService]
          return [firstService, secondService]
        }
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedArbiterPubkey: string | undefined
    const published: Event[] = []
    const policy: marketplace.MarketplaceOrderPolicy = {
      method: 'evm',
      id: 'evm-multi-escrow',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{
        method: 'evm',
        id: 'evm-multi-escrow',
        type: 'evm:multi-escrow',
        hash: `0x${bytecodeHash}`,
        chainId: 33,
        contractAddress,
      }],
      assets: () => [{
        method: 'evm',
        assetId: btcAssetId,
        denomination: 'BTC',
        decimals: 8,
        appId: 'marketplace',
        chainId: 33,
        assetAddress: btcAssetId.split(':')[1],
      }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedArbiterPubkey = intent.participants.arbiter.pubkey
        yield {
          type: 'paid' as const,
          proof: mockPaymentProof('evm-multi-escrow', { tradeId: intent.tradeId }),
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '5'.repeat(64),
      publish: event => published.push(event),
      orderDrivers: [policy],
    })
    const order = {
      tradeId: 'trade-selected-route',
      listingAnchor,
      amount: { value: '50000', denomination: 'BTC', decimals: 8 },
      createdAt,
    }
    const session = await api.session(testSessionSigner().signer, { ensurePaymentMethod: false })
    const routes = await session.orders.paymentRoutes(listing, {
      amount: order.amount,
    })
    const selectedRoute = routes.find(route => route.arbitrationService.event.pubkey === secondArbiterPubkey)

    expect(selectedRoute).toBeDefined()
    published.length = 0
    const states: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, order, {
      route: selectedRoute,
    })) {
      states.push(state)
    }

    expect(states.map(state => state.type)).toEqual(['payment_progress', 'order_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
    expect(receivedArbiterPubkey).toBe(secondArbiterPubkey)
  })

  test('routes cashu payments through the same pay stream interface', async () => {
    const sellerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const policyHash = 'cashu-escrow-script-v1'
    const assetId = 'cashu:https://mint.example:sat'
    const method = sign(
      marketplace.paymentMethod.template({
        trustedArbiterPubkeys: [arbiterPubkey],
        supportedContractBytecodeHashes: [policyHash],
        acceptedPaymentForms: [{ denomination: 'SAT', assetId, appId: 'cashu' }],
        createdAt,
      }),
      sellerSecretKey,
    )
    const service = sign(
      marketplace.arbitrationServices.template({
        d: 'cashu-script-escrow',
        pubkey: arbiterPubkey,
        type: 'CASHU',
        maxDuration: 1209600,
        fee: { ppm: 0, base: '0', min: '0', max: '0' },
        params: {
          policyHash,
          mints: ['https://mint.example'],
        },
        createdAt,
      }),
      arbiterSecretKey,
    )
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(ArbitrationService)) return [service]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedIntent: marketplace.MarketplacePaymentIntent | undefined
    const published: Event[] = []
    const cashuPolicy: marketplace.MarketplaceOrderPolicy = {
      method: 'cashu',
      id: 'cashu-script',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{ method: 'cashu', id: 'cashu-script', hash: policyHash }],
      assets: () => [{ method: 'cashu', assetId, denomination: 'SAT', decimals: 0, appId: 'cashu' }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedIntent = intent
        yield {
          type: 'paid' as const,
          proof: mockPaymentProof('cashu', {
              tokenCommitment: 'proof-commitment',
              policyHash,
          }),
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '6'.repeat(64),
      publish: event => published.push(event),
      orderDrivers: [cashuPolicy],
    })

    const result: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, {
      tradeId: 'cashu-trade-1',
      listingAnchor,
      amount: { value: '1000', denomination: 'SAT', decimals: 0 },
      createdAt,
    })) {
      result.push(state)
    }

    expect(receivedIntent?.method).toBe('cashu')
    expect(receivedIntent?.asset.assetId).toBe(assetId)
    expect(receivedIntent?.policy.hash).toBe(policyHash)
    expect(result.map(state => state.type)).toEqual(['payment_progress', 'order_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
    expect(marketplace.orders.parse(published[0]).content.amount).toEqual({
      value: '1000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
    expect(marketplace.orders.parsePayment(published[1]).content.amount).toEqual({
      value: '1000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
  })

  test('routes BTC marketplace amounts through SAT Cashu assets', async () => {
    const sellerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const policyHash = 'cashu-escrow-script-v1'
    const assetId = 'cashu:https://mint.example:sat'
    const method = sign(
      marketplace.paymentMethod.template({
        trustedArbiterPubkeys: [arbiterPubkey],
        supportedContractBytecodeHashes: [policyHash],
        acceptedPaymentForms: [{ denomination: 'SAT', assetId, appId: 'cashu' }],
        createdAt,
      }),
      sellerSecretKey,
    )
    const service = sign(
      marketplace.arbitrationServices.template({
        d: 'cashu-script-escrow',
        pubkey: arbiterPubkey,
        type: 'CASHU',
        maxDuration: 1209600,
        fee: { ppm: 0, base: '0', min: '0', max: '0' },
        params: {
          policyHash,
          mints: ['https://mint.example'],
        },
        createdAt,
      }),
      arbiterSecretKey,
    )
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(ArbitrationService)) return [service]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedIntent: marketplace.MarketplacePaymentIntent | undefined
    const published: Event[] = []
    const cashuPolicy: marketplace.MarketplaceOrderPolicy = {
      method: 'cashu',
      id: 'cashu-script',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{ method: 'cashu', id: 'cashu-script', hash: policyHash }],
      assets: () => [{ method: 'cashu', assetId, denomination: 'SAT', decimals: 0, appId: 'cashu' }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedIntent = intent
        yield {
          type: 'paid' as const,
          proof: mockPaymentProof('cashu', {
              tokenCommitment: 'proof-commitment',
              policyHash,
          }),
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '6'.repeat(64),
      publish: event => published.push(event),
      orderDrivers: [cashuPolicy],
    })

    const session = await api.session(testSessionSigner().signer, { ensurePaymentMethod: false })
    const routes = await session.orders.paymentRoutes(listing, {
      amount: { value: '100000', denomination: 'BTC', decimals: 8 },
    })
    expect(routes).toHaveLength(1)
    expect(routes[0].asset.denomination).toBe('SAT')
    published.length = 0

    const result: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, {
      tradeId: 'cashu-btc-trade-1',
      listingAnchor,
      amount: { value: '100000', denomination: 'BTC', decimals: 8 },
      createdAt,
    })) {
      result.push(state)
    }

    expect(receivedIntent?.amount).toEqual({ value: '100000', currency: 'BTC', denomination: 'SAT', decimals: 0 })
    expect(result.map(state => state.type)).toEqual(['payment_progress', 'order_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
    expect(marketplace.orders.parse(published[0]).content.amount).toEqual({
      value: '100000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
    expect(marketplace.orders.parsePayment(published[1]).content.amount).toEqual({
      value: '100000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
  })

  test('routes SAT marketplace amounts through BTC Cashu assets', async () => {
    const sellerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const policyHash = 'cashu-escrow-script-v1'
    const assetId = 'cashu:https://mint.example:sat'
    const method = sign(
      marketplace.paymentMethod.template({
        trustedArbiterPubkeys: [arbiterPubkey],
        supportedContractBytecodeHashes: [policyHash],
        acceptedPaymentForms: [{ denomination: 'SAT', assetId, appId: 'cashu' }],
        createdAt,
      }),
      sellerSecretKey,
    )
    const service = sign(
      marketplace.arbitrationServices.template({
        d: 'cashu-script-escrow',
        pubkey: arbiterPubkey,
        type: 'CASHU',
        maxDuration: 1209600,
        fee: { ppm: 0, base: '0', min: '0', max: '0' },
        params: {
          policyHash,
          mints: ['https://mint.example'],
        },
        createdAt,
      }),
      arbiterSecretKey,
    )
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(ArbitrationService)) return [service]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedIntent: marketplace.MarketplacePaymentIntent | undefined
    const published: Event[] = []
    const cashuPolicy: marketplace.MarketplaceOrderPolicy = {
      method: 'cashu',
      id: 'cashu-script',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{ method: 'cashu', id: 'cashu-script', hash: policyHash }],
      assets: () => [{ method: 'cashu', assetId, denomination: 'BTC', decimals: 8, appId: 'cashu' }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedIntent = intent
        yield {
          type: 'paid' as const,
          proof: mockPaymentProof('cashu', {
              tokenCommitment: 'proof-commitment',
              policyHash,
          }),
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '6'.repeat(64),
      publish: event => published.push(event),
      orderDrivers: [cashuPolicy],
    })

    const session = await api.session(testSessionSigner().signer, { ensurePaymentMethod: false })
    const routes = await session.orders.paymentRoutes(listing, {
      amount: { value: '10000', denomination: 'SAT', decimals: 0 },
    })
    expect(routes).toHaveLength(1)
    expect(routes[0].asset.denomination).toBe('BTC')
    published.length = 0

    const result: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, {
      tradeId: 'cashu-sat-trade-1',
      listingAnchor,
      amount: { value: '10000', denomination: 'SAT', decimals: 0 },
      createdAt,
    })) {
      result.push(state)
    }

    expect(receivedIntent?.amount).toEqual({ value: '10000', currency: 'BTC', denomination: 'BTC', decimals: 8 })
    expect(result.map(state => state.type)).toEqual(['payment_progress', 'order_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
    expect(marketplace.orders.parse(published[0]).content.amount).toEqual({
      value: '10000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
    expect(marketplace.orders.parsePayment(published[1]).content.amount).toEqual({
      value: '10000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
  })

  test('routes marketplace auction bids through bid policies', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auctionEndAt = createdAt + 3600
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-cashu-1',
        listingAnchor,
        arbiterPubkey: arbiterPubkey,
        currency: 'USD',
        decimals: 2,
        endAt: auctionEndAt,
        createdAt,
      }),
      sellerSecretKey,
    )
    const policyHash = 'cashu-auction-script-v1'
    const assetId = 'cashu:https://mint.example:usd'
    const method = sign(
      marketplace.paymentMethod.template({
        trustedArbiterPubkeys: [arbiterPubkey],
        supportedContractBytecodeHashes: [policyHash],
        acceptedPaymentForms: [{ denomination: 'USD', assetId, appId: 'cashu' }],
        createdAt,
      }),
      sellerSecretKey,
    )
    const service = sign(
      marketplace.arbitrationServices.template({
        d: 'cashu-script-auction',
        pubkey: arbiterPubkey,
        type: 'CASHU',
        maxDuration: 1209600,
        fee: { ppm: 0, base: '0', min: '0', max: '0' },
        params: {
          policyType: 'cashu:p2pk-auction-v1',
          policyHash,
          mints: ['https://mint.example'],
        },
        createdAt,
      }),
      arbiterSecretKey,
    )
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(ArbitrationService)) return [service]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedIntent: marketplace.MarketplacePaymentIntent | undefined
    const published: Event[] = []
    const cashuBidPolicy: marketplace.MarketplaceBidPolicy = {
      method: 'cashu',
      id: 'cashu-auction-script',
      purpose: 'bid',
      family: 'auction',
      policies: () => [{ method: 'cashu', id: 'cashu-auction-script', type: 'cashu:p2pk-auction-v1', hash: policyHash }],
      assets: () => [{ method: 'cashu', assetId, denomination: 'USD', decimals: 2, appId: 'cashu' }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedIntent = intent
        yield {
          type: 'paid' as const,
          proof: mockPaymentProof('cashu-auction-script', {
              tokenCommitment: 'auction-proof-commitment',
              policyType: 'cashu:p2pk-auction-v1',
              policyHash,
          }),
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '7'.repeat(64),
      publish: event => published.push(event),
      auctionDrivers: [cashuBidPolicy],
      signer: {
        async getPublicKey() {
          return buyerPubkey
        },
        async nip44Decrypt() {
          throw new Error('not used')
        },
        async signEvent(template: EventTemplate) {
          return sign(template, buyerSecretKey)
        },
      },
    })

    const session = await api.session(testSessionSigner(buyerSecretKey).signer, { ensurePaymentMethod: false })
    const orderRoutes = await session.orders.paymentRoutes(listing, {
      amount: { value: '2500', denomination: 'USD', decimals: 2 },
    })
    expect(orderRoutes).toHaveLength(0)
    published.length = 0

    const result: marketplace.MarketplaceAuctionBidState[] = []
    for await (const state of api.auctions.bid(listing, {
      amount: { value: '2500' },
      createdAt,
    }, {
      auction,
      identityProofPrivacy: 'public',
      paymentProofPrivacy: 'sealed',
    })) {
      result.push(state)
    }

    expect(receivedIntent?.method).toBe('cashu')
    expect(receivedIntent?.purpose).toBe('bid')
    expect(receivedIntent?.unlockAt).toBe(auctionEndAt)
    expect(receivedIntent?.asset.assetId).toBe(assetId)
    expect(receivedIntent?.policy.hash).toBe(policyHash)
    expect(result.map(state => state.type)).toEqual(['payment_progress', 'bid_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceAuctionBid, MarketplacePayment])
    const parsedBid = marketplace.auctions.parseBid(published[0])
    const parsedPayment = marketplace.orders.parsePayment(published[1])
    const expectedBidChainId = marketplace.auctions.bidChainId('7'.repeat(64), marketplace.auctions.address(auction))
    expect(parsedBid.auctionAnchor).toBe(marketplace.auctions.address(auction))
    expect(parsedBid.listingAnchor).toBe(listingAnchor)
    expect(parsedBid.bidChainId).toBe(expectedBidChainId)
    expect(parsedBid.amount).toEqual({ value: '2500', currency: 'USD', denomination: 'USD', decimals: 2 })
    expect(hasTag(published[0], ['bid_chain', expectedBidChainId])).toBe(true)
    expect(parsedBid.participantProofs).toHaveLength(1)
    expect(parsedBid.participantProofKeys).toHaveLength(0)
    expect(marketplace.participantProofs.resolvePublic(parsedBid.participantProofs[0], {
      listingAnchor,
      tradeId: parsedBid.tradeId,
      role: 'buyer',
      participantPubkey: parsedBid.event.pubkey,
    })).toMatchObject({
      status: 'resolved',
      realPubkey: buyerPubkey,
      participantPubkey: parsedBid.event.pubkey,
    })
    expect(published[0].tags.find(tag => tag[0] === 'd')?.[1]).toBe(parsedBid.tradeId)
    expect(published[0].tags.some(tag => tag[0] === 'trade')).toBe(false)
    expect(parsedPayment.refs.auctionBids).toEqual([published[0].id])
    expect(parsedPayment.content.proof).toBeUndefined()
    expect(parsedPayment.content.sealedProof?.mode).toBe('sealed:v1')
    expect(parsedPayment.paymentProofKeys.map(key => key.recipientPubkey).sort()).toEqual([
      sellerPubkey,
      arbiterPubkey,
      parsedPayment.event.pubkey,
    ].sort())
    const resolvedPaymentProof = await marketplace.paymentProofs.resolve(parsedPayment, {
      signerPubkey: sellerPubkey,
      signer: {
        async getPublicKey() {
          return sellerPubkey
        },
        async nip44Decrypt(pubkey: string, ciphertext: string) {
          return decryptNip44(ciphertext, getConversationKey(sellerSecretKey, pubkey))
        },
      },
    })
    expect(resolvedPaymentProof.status).toBe('resolved')
    expect(resolvedPaymentProof.proof?.paymentProof?.driver).toBe('cashu-auction-script')
    expect(resolvedPaymentProof.proof?.paymentProof?.params.policyType).toBe('cashu:p2pk-auction-v1')
    expect(receivedIntent?.settlementId).toBe(parsedBid.tradeId)
  })

  test('routes BTC auction bids through SAT Cashu assets', async () => {
    const sellerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-cashu-btc-1',
        listingAnchor,
        arbiterPubkey,
        currency: 'BTC',
        decimals: 8,
        createdAt,
      }),
      sellerSecretKey,
    )
    const policyHash = 'cashu-auction-script-v1'
    const assetId = 'cashu:https://mint.example:sat'
    const method = sign(
      marketplace.paymentMethod.template({
        trustedArbiterPubkeys: [arbiterPubkey],
        supportedContractBytecodeHashes: [policyHash],
        acceptedPaymentForms: [{ denomination: 'SAT', assetId, appId: 'cashu' }],
        createdAt,
      }),
      sellerSecretKey,
    )
    const service = sign(
      marketplace.arbitrationServices.template({
        d: 'cashu-script-auction',
        pubkey: arbiterPubkey,
        type: 'CASHU',
        maxDuration: 1209600,
        fee: { ppm: 0, base: '0', min: '0', max: '0' },
        params: {
          policyType: 'cashu:p2pk-auction-v1',
          policyHash,
          mints: ['https://mint.example'],
        },
        createdAt,
      }),
      arbiterSecretKey,
    )
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(ArbitrationService)) return [service]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedIntent: marketplace.MarketplacePaymentIntent | undefined
    const published: Event[] = []
    const cashuBidPolicy: marketplace.MarketplaceBidPolicy = {
      method: 'cashu',
      id: 'cashu-auction-script',
      purpose: 'bid',
      family: 'auction',
      policies: () => [{ method: 'cashu', id: 'cashu-auction-script', type: 'cashu:p2pk-auction-v1', hash: policyHash }],
      assets: () => [{ method: 'cashu', assetId, denomination: 'SAT', decimals: 0, appId: 'cashu' }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedIntent = intent
        yield {
          type: 'paid' as const,
          proof: mockPaymentProof('cashu', {
              tokenCommitment: 'auction-proof-commitment',
              policyType: 'cashu:p2pk-auction-v1',
              policyHash,
          }),
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '7'.repeat(64),
      publish: event => published.push(event),
      auctionDrivers: [cashuBidPolicy],
    })

    const session = await api.session(testSessionSigner().signer, { ensurePaymentMethod: false })
    const routes = await session.auctions.paymentRoutes(listing, auction, {
      amount: { value: '10000', denomination: 'BTC', decimals: 8 },
    })
    expect(routes).toHaveLength(1)
    expect(routes[0].asset.denomination).toBe('SAT')
    published.length = 0

    const result: marketplace.MarketplaceAuctionBidState[] = []
    for await (const state of api.auctions.bid(listing, {
      amount: { value: '10000', denomination: 'BTC', decimals: 8 },
      createdAt,
    }, {
      auction,
    })) {
      result.push(state)
    }

    expect(receivedIntent?.amount).toEqual({ value: '10000', currency: 'BTC', denomination: 'SAT', decimals: 0 })
    expect(result.map(state => state.type)).toEqual(['payment_progress', 'bid_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceAuctionBid, MarketplacePayment])
    expect(marketplace.auctions.parseBid(published[0]).amount).toEqual({
      value: '10000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
    expect(marketplace.orders.parsePayment(published[1]).content.amount).toEqual({
      value: '10000',
      currency: 'BTC',
      denomination: 'BTC',
      decimals: 8,
    })
  })

  test('groups auction bids with their payment lifecycle events', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-groups-1',
        listingAnchor,
        arbiterPubkey: arbiterPubkey,
        currency: 'USD',
        decimals: 2,
        createdAt,
      }),
      sellerSecretKey,
    )
    const auctionAnchor = marketplace.auctions.address(auction)
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-groups-bid-1',
        auctionAnchor,
        listingAnchor,
        amount: { value: '12500', denomination: 'USD', decimals: 2 },
        participants,
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'auction-groups-bid-1',
        orderGroupId: 'auction-groups-bid-1',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: { auctionBids: [bid.id] },
        amount: { value: '12500', denomination: 'USD', decimals: 2 },
        proof: {
          paymentProof: mockPaymentProof('evm', { txHash: `0x${'9'.repeat(64)}` }),
        },
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const staleNack = sign(
      marketplace.orders.paymentNackTemplate({
        tradeId: 'auction-groups-bid-1',
        orderGroupId: 'auction-groups-bid-1',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: { payments: [payment.id] },
        status: 'rejected',
        createdAt: createdAt + 2,
      }),
      arbiterSecretKey,
    )
    const ack = sign(
      marketplace.orders.paymentAckTemplate({
        tradeId: 'auction-groups-bid-1',
        orderGroupId: 'auction-groups-bid-1',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: { payments: [payment.id] },
        status: 'accepted',
        createdAt: createdAt + 3,
      }),
      arbiterSecretKey,
    )
    const settlement = sign(
      marketplace.orders.paymentSettlementTemplate({
        tradeId: 'auction-groups-bid-1',
        orderGroupId: 'auction-groups-bid-1',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: { auctionBids: [bid.id], payments: [payment.id] },
        method: 'evm',
        action: 'auction_promote',
        data: { proof: mockPaymentProof('evm', { txHash: `0x${'8'.repeat(64)}` }) },
        createdAt: createdAt + 4,
      }),
      arbiterSecretKey,
    )
    const nack = sign(
      marketplace.orders.paymentNackTemplate({
        tradeId: 'auction-groups-unmatched-nack',
        orderGroupId: 'auction-groups-unmatched-nack',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: {},
        status: 'rejected',
        createdAt: createdAt + 5,
      }),
      arbiterSecretKey,
    )
    const complete = sign(
      marketplace.auctions.completeTemplate({
        auctionAnchor,
        listingAnchor,
        status: 'closed',
        winningBidId: bid.id,
        winningPaymentId: payment.id,
        promotedSettlementId: settlement.id,
        createdAt: createdAt + 6,
      }),
      arbiterSecretKey,
    )

    const retriedGroup = marketplace.auctionBidGroups.group([bid, payment, staleNack, ack])[0]
    expect(retriedGroup.paymentNacks.map(item => item.event.id)).toEqual([staleNack.id])
    expect(retriedGroup.paymentNack).toBeUndefined()
    expect(retriedGroup.paymentAck?.event.id).toBe(ack.id)
    expect(retriedGroup.stage).toBe('accepted')

    const groups = marketplace.auctionBidGroups.group([bid, payment, staleNack, ack, settlement])
    expect(groups).toHaveLength(1)
    expect(groups[0].id).toBe('auction-groups-bid-1')
    expect(groups[0].auctionAnchor).toBe(auctionAnchor)
    expect(groups[0].payment?.event.id).toBe(payment.id)
    expect(groups[0].paymentAck?.event.id).toBe(ack.id)
    expect(groups[0].settlement?.event.id).toBe(settlement.id)
    expect(groups[0].stage).toBe('promoted')
    expect(marketplace.auctionBidGroups.roles(groups, { pubkey: buyerPubkey }).buyer).toHaveLength(1)
    expect(marketplace.auctionBidGroups.roles(groups, { pubkey: sellerPubkey }).seller).toHaveLength(1)
    expect(marketplace.auctionBidGroups.roles(groups, { pubkey: arbiterPubkey }).arbiter).toHaveLength(1)

    const fetched = await marketplace.auctionBidGroups.fetch({
      async querySync(_relays: string[], filter: { kinds?: number[]; '#a'?: string[] }): Promise<Event[]> {
        expect(filter.kinds).toEqual(marketplace.auctionBidGroups.eventKinds)
        expect(filter['#a']).toEqual([auctionAnchor])
        return [bid, payment, ack, settlement]
      },
    }, ['wss://relay.example'], { auctionAnchor })
    expect(fetched[0].stage).toBe('promoted')

    const subscriptions: Array<{ onevent: (event: Event) => void }> = []
    const seenGroups: marketplace.ParsedAuctionBidGroup[][] = []
    marketplace.auctionBidGroups.subscribe({
      subscribeMap(_requests: unknown[], handlers: { onevent: (event: Event) => void }) {
        subscriptions.push(handlers)
        return { close() {} }
      },
    }, ['wss://relay.example'], { auctionAnchor }, {
      ongroups(nextGroups) {
        seenGroups.push(nextGroups)
      },
    })
    subscriptions[0].onevent(bid)
    subscriptions[0].onevent(payment)
    subscriptions[0].onevent(ack)
    expect(seenGroups.at(-1)?.[0].stage).toBe('accepted')

    const invalidAuction = {
      ...auction,
      id: `invalid-${auction.id}`,
      tags: auction.tags.filter(tag => !(tag[0] === 'a' && tag[3] === 'auction')),
    }
    const requests: Array<{ url: string; filter: { kinds?: number[]; '#a'?: string[]; '#d'?: string[]; authors?: string[] } }> = []
    const streamEvents: Record<string, number> = {}
    const streamEose = new Set<string>()
    const scopePool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        return filter.kinds?.includes(MarketplaceAuction) ? [invalidAuction, auction] : []
      },
      async get(): Promise<Event | null> {
        return null
      },
      subscribeMap(
        nextRequests: Array<{ url: string; filter: { kinds?: number[]; '#a'?: string[]; '#d'?: string[]; authors?: string[] } }>,
        handlers: { onevent: (event: Event) => void; oneose?: () => void },
      ) {
        requests.push(...nextRequests)
        for (const event of [invalidAuction, auction, bid, payment, ack, nack, settlement, complete]) handlers.onevent(event)
        handlers.oneose?.()
        return { close() {} }
      },
    }
    const api = marketplace.bind(scopePool, ['wss://relay.example'])
    const invalidEvents: marketplace.MarketplaceInvalidEvent[] = []
    const searchedAuctions = await marketplace.bind(scopePool, ['wss://relay.example'], {
      onInvalidEvent: invalid => invalidEvents.push(invalid),
    }).auctions.search()
    expect(searchedAuctions.map(item => item.auctionAnchor)).toEqual([auctionAnchor])
    expect(invalidEvents.map(item => item.error.message)).toEqual(['Invalid auction self anchor'])

    const stream = api.auctions.watch({ auctionAnchor })
    const typedStreams = {
      bids: stream.filter(marketplace.auctionScopes.isBid),
      completes: stream.filter(marketplace.auctionScopes.isComplete),
      payments: stream.filter(marketplace.auctionScopes.isPayment),
      paymentAcks: stream.filter(marketplace.auctionScopes.isPaymentAck),
      paymentNacks: stream.filter(marketplace.auctionScopes.isPaymentNack),
      paymentSettlements: stream.filter(marketplace.auctionScopes.isPaymentSettlement),
    }
    for (const [name, typedStream] of Object.entries(typedStreams)) {
      typedStream.events.subscribe(() => {
        streamEvents[name] = (streamEvents[name] ?? 0) + 1
      })
      typedStream.status.subscribe(status => {
        if (status instanceof marketplace.StreamLive) streamEose.add(name)
      })
    }
    stream.snapshot.subscribe(() => {})
    stream.status.subscribe(status => {
      if (status instanceof marketplace.StreamLive) streamEose.add('snapshot')
    })

    expect(requests).toHaveLength(1)
    expect(requests[0].filter.kinds).toEqual(marketplace.auctionScopes.eventKinds)
    expect(requests[0].filter['#a']).toEqual([auctionAnchor])
    expect(streamEvents).toEqual({
      bids: 1,
      completes: 1,
      payments: 1,
      paymentAcks: 1,
      paymentNacks: 1,
      paymentSettlements: 1,
    })
    expect([...streamEose].sort()).toEqual([
      'bids',
      'completes',
      'paymentAcks',
      'paymentNacks',
      'paymentSettlements',
      'payments',
      'snapshot',
    ].sort())

    const snapshots = await api.auctions.get({ auctionAnchor })
    const snapshot = snapshots[auctionAnchor]
    if (!snapshot) throw new Error('Auction scope snapshot not found')
    expect(snapshot.auction?.auctionAnchor).toBe(auctionAnchor)
    expect(snapshot.bidGroups).toHaveLength(1)
    expect(snapshot.bidChains).toHaveLength(1)
    expect(snapshot.payments.map(item => item.event.id)).toEqual([payment.id])
    expect(snapshot.paymentAcks.map(item => item.event.id)).toEqual([ack.id])
    expect(snapshot.paymentNacks.map(item => item.event.id)).toEqual([nack.id])
    expect(snapshot.paymentSettlements.map(item => item.event.id)).toEqual([settlement.id])
    expect(snapshot.complete?.event.id).toBe(complete.id)

    const listingSnapshots = await api.auctions.get({ listingAnchor })
    expect(requests.at(-1)?.filter.kinds).toEqual(marketplace.auctionScopes.eventKinds)
    expect(requests.at(-1)?.filter['#a']).toEqual([listingAnchor])
    expect(listingSnapshots[auctionAnchor]?.auction?.auctionAnchor).toBe(auctionAnchor)
  })

  test('auction scope ignores terminal completion events created before auction end', async () => {
    const sellerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-premature-complete',
        listingAnchor,
        arbiterPubkey,
        currency: 'USD',
        decimals: 2,
        startAt: createdAt,
        endAt: createdAt + 3600,
        createdAt,
      }),
      sellerSecretKey,
    )
    const auctionAnchor = marketplace.auctions.address(auction)
    const prematureComplete = sign(
      marketplace.auctions.completeTemplate({
        auctionAnchor,
        listingAnchor,
        status: 'reserve_not_met',
        createdAt: createdAt + 60,
      }),
      arbiterSecretKey,
    )
    const scopePool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
      subscribeMap(
        _requests: unknown[],
        handlers: { onevent: (event: Event) => void; oneose?: () => void },
      ) {
        for (const event of [auction, prematureComplete]) handlers.onevent(event)
        handlers.oneose?.()
        return { close() {} }
      },
    }
    const snapshots = await marketplace.bind(scopePool, ['wss://relay.example'])
      .auctions.get({ auctionAnchor })
    const snapshot = snapshots[auctionAnchor]
    if (!snapshot) throw new Error('Auction scope snapshot not found')

    expect(snapshot.auction?.auctionAnchor).toBe(auctionAnchor)
    expect(snapshot.completes.map(item => item.event.id)).toEqual([prematureComplete.id])
    expect(snapshot.complete).toBeUndefined()
    expect(snapshot.status).toBe('ended')
  })

  test('builds auction bid chains from linked bid legs', () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-chain-1',
        listingAnchor,
        arbiterPubkey,
        currency: 'USD',
        decimals: 2,
        createdAt,
      }),
      sellerSecretKey,
    )
    const auctionAnchor = marketplace.auctions.address(auction)
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const firstBid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-chain-bid-1',
        auctionAnchor,
        listingAnchor,
        amount: { value: '10000', denomination: 'USD', decimals: 2 },
        participants,
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const secondBid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-chain-bid-2',
        auctionAnchor,
        listingAnchor,
        amount: { value: '2500', denomination: 'USD', decimals: 2 },
        participants,
        extraTags: [
          ['prev_bid', firstBid.id],
          ['e', firstBid.id, '', 'prev_bid'],
        ],
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const firstPayment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'auction-chain-bid-1',
        orderGroupId: 'auction-chain-bid-1',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: { auctionBids: [firstBid.id] },
        amount: { value: '10000', denomination: 'USD', decimals: 2 },
        proof: {
          paymentProof: mockPaymentProof('evm', { txHash: `0x${'6'.repeat(64)}` }),
        },
        createdAt: createdAt + 3,
      }),
      buyerSecretKey,
    )
    const secondPayment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'auction-chain-bid-2',
        orderGroupId: 'auction-chain-bid-2',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: { auctionBids: [secondBid.id] },
        amount: { value: '2500', denomination: 'USD', decimals: 2 },
        proof: {
          paymentProof: mockPaymentProof('evm', { txHash: `0x${'7'.repeat(64)}` }),
        },
        createdAt: createdAt + 4,
      }),
      buyerSecretKey,
    )

    const groups = marketplace.auctionBidGroups.group([firstBid, secondBid, firstPayment, secondPayment])
    const chains = marketplace.auctionBidGroups.chains(groups)

    expect(chains).toHaveLength(1)
    expect(chains[0].id).toBe(secondBid.id)
    expect(chains[0].head.bid.event.id).toBe(secondBid.id)
    expect(chains[0].bidEventIds).toEqual([firstBid.id, secondBid.id])
    expect(chains[0].paymentEventIds).toEqual([firstPayment.id, secondPayment.id])
    expect(chains[0].amount).toEqual({ value: '12500', currency: 'USD', denomination: 'USD', decimals: 2 })
    expect(chains[0].complete).toBe(true)
  })

  test('settles an auction by promoting a mixed EVM and Cashu winning bid chain and arbitrating the promoted payments', async () => {
    const sellerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const lowBuyerSecretKey = generateSecretKey()
    const winningBuyerSecretKey = generateSecretKey()
    const invalidBuyerSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auctionId = 'auction-settle-1'
    const auction = sign(
      marketplace.auctions.template({
        d: auctionId,
        listingAnchor,
        arbiterPubkey: arbiterPubkey,
        currency: 'USD',
        decimals: 2,
        startAt: createdAt,
        endAt: createdAt + 3600,
        startingBid: '10000',
        createdAt,
      }),
      sellerSecretKey,
    )
    const auctionAnchor = marketplace.auctions.address(auction)
    const evmPolicyId = 'evm-auction-settle'
    const cashuPolicyId = 'cashu-auction-settle'
    const published: Event[] = []
    const arbitrationIntents: marketplace.MarketplacePaymentSettlementIntent[] = []

    function bidInput(input: {
      secretKey: Uint8Array
      amount: string
      valid: boolean
      accepted: boolean
      tx: string
      offset: number
      policyId?: string
      policyType?: string
      bidChainId?: string
      previousBidId?: string
      decisionMessage?: string
    }) {
      const inputPolicyId = input.policyId ?? evmPolicyId
      const inputPolicyType = input.policyType ?? 'evm:multi-escrow-recycle-v1'
      const buyerPubkey = getPublicKey(input.secretKey)
      const participants = [
        { pubkey: sellerPubkey, role: 'seller' as const },
        { pubkey: buyerPubkey, role: 'buyer' as const },
        { pubkey: arbiterPubkey, role: 'arbiter' as const },
      ]
      const tradeId = `${auctionId}:bid:${input.offset}`
      const authorization = sign(
        marketplace.participantProofs.tradeKeyAuthorizationTemplate({
          listingAnchor,
          tradeId,
          version: 1,
          role: 'buyer',
          participantPubkey: buyerPubkey,
          createdAt: createdAt + input.offset,
        }),
        input.secretKey,
      )
      const participantProof = marketplace.participantProofs.publicProof(authorization)
      const bid = sign(
        marketplace.auctions.bidTemplate({
          tradeId,
          auctionAnchor,
          listingAnchor,
          participants,
          participantProofs: [participantProof],
          ...(input.bidChainId ? { bidChainId: input.bidChainId } : {}),
          amount: { value: input.amount, denomination: 'USD', decimals: 2 },
          targetOrder: { quantity: 1 },
          ...(input.previousBidId ? {
            extraTags: [
              ['prev_bid', input.previousBidId],
              ['e', input.previousBidId, '', 'prev_bid'],
            ],
          } : {}),
          createdAt: createdAt + input.offset,
        }),
        input.secretKey,
      )
      const payment = sign(
        marketplace.orders.paymentTemplate({
          tradeId,
          orderGroupId: tradeId,
          anchors: [
            { value: auctionAnchor, marker: 'auction' },
            { value: listingAnchor, marker: 'listing' },
          ],
          participants,
          refs: { auctionBids: [bid.id] },
          amount: { value: input.amount, denomination: 'USD', decimals: 2 },
          proof: {
            paymentProof: mockPaymentProof(inputPolicyId, {
              policyId: inputPolicyId,
              txHash: input.tx,
              valid: input.valid,
              recycleArgs: {
                version: 1,
                type: inputPolicyType,
                target: {
                  order: {
                    listingAnchor,
                    quantity: 1,
                  },
                },
              },
            }),
          },
          createdAt: createdAt + input.offset + 1,
        }),
        input.secretKey,
      )
      const decisionTemplate = {
        tradeId,
        orderGroupId: tradeId,
        anchors: [
          { value: auctionAnchor, marker: 'auction' as const },
          { value: listingAnchor, marker: 'listing' as const },
        ],
        participants,
        refs: { auctionBids: [bid.id], payments: [payment.id] },
        status: input.accepted ? 'accepted' as const : 'rejected' as const,
        ...(input.decisionMessage ? { message: input.decisionMessage } : {}),
        createdAt: createdAt + input.offset + 2,
      }
      const decision = sign(
        input.accepted
          ? marketplace.orders.paymentAckTemplate(decisionTemplate)
          : marketplace.orders.paymentNackTemplate(decisionTemplate),
        arbiterSecretKey,
      )
      return {
        bid: marketplace.auctions.parseBid(bid),
        payment: marketplace.orders.parsePayment(payment),
        decision,
      }
    }

    const lowBid = bidInput({
      secretKey: lowBuyerSecretKey,
      amount: '20000',
      valid: true,
      accepted: true,
      tx: `0x${'1'.repeat(64)}`,
      offset: 1,
    })
    const winningBidChainId = 'a'.repeat(64)
    const winningFirstBid = bidInput({
      secretKey: winningBuyerSecretKey,
      amount: '15000',
      valid: true,
      accepted: true,
      tx: `0x${'2'.repeat(64)}`,
      offset: 3,
      policyId: evmPolicyId,
      policyType: 'evm:multi-escrow-recycle-v1',
      bidChainId: winningBidChainId,
    })
    const winningBid = bidInput({
      secretKey: winningBuyerSecretKey,
      amount: '10000',
      valid: true,
      accepted: true,
      tx: `0x${'6'.repeat(64)}`,
      offset: 4,
      policyId: cashuPolicyId,
      policyType: 'cashu:p2pk-auction-recycle-v1',
      bidChainId: winningBidChainId,
      previousBidId: winningFirstBid.bid.event.id,
    })
    const preStartHighBid = bidInput({
      secretKey: generateSecretKey(),
      amount: '75000',
      valid: true,
      accepted: false,
      tx: `0x${'5'.repeat(64)}`,
      offset: -1,
      decisionMessage: 'Bid was created before the auction started',
    })
    const invalidHighBid = bidInput({
      secretKey: invalidBuyerSecretKey,
      amount: '50000',
      valid: false,
      accepted: false,
      tx: `0x${'3'.repeat(64)}`,
      offset: 5,
      decisionMessage: 'bid lock was rejected',
    })
    function bidPolicy(policyId: string, method: 'evm' | 'cashu', promotedPolicyType: string): marketplace.MarketplaceBidPolicy {
      return {
        method,
        id: policyId,
        purpose: 'bid',
        family: 'auction',
        policies: () => [{ method, id: policyId }],
        assets: () => [],
        async *pay() {
          yield { type: 'completed' as const }
        },
        async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
          const valid = request.proof.params.valid !== false
          return {
            driver: request.driver,
            status: valid ? 'valid' : 'invalid',
            ...(request.expected.amount ? { amount: request.expected.amount } : {}),
            amountMatched: valid,
            assetMatched: valid,
            recipientMatched: valid,
            arbiterMatched: valid,
            proofEventId: request.proof.params.txHash as string,
            ...(valid ? {} : { error: 'bid lock was rejected' }),
          }
        },
        async refundPayment(intent) {
          return {
            proof: mockPaymentProof(policyId, {
                ...intent.proof.params,
                action: 'auction_refund',
                refundPercent: intent.refundPercent,
                txHash: `0x${'f'.repeat(64)}`,
              }),
            data: { refundPercent: intent.refundPercent },
          }
        },
        async recyclePayment(intent) {
          return {
            proof: mockPaymentProof(policyId, {
                ...intent.proof.params,
                action: 'auction_promote',
                policyType: promotedPolicyType,
                tradeId: intent.targetTradeId,
                settlementId: intent.targetOrderGroupId,
                unlockAt: intent.targetUnlockAt,
                txHash: `0x${'4'.repeat(64)}`,
                recycleArgs: intent.recycleArgs,
              }),
            data: {
              targetTradeId: intent.targetTradeId,
              targetOrderGroupId: intent.targetOrderGroupId,
              promotedBy: policyId,
            },
          }
        },
      }
    }
    function orderPolicy(policyId: string, method: 'evm' | 'cashu'): marketplace.MarketplaceOrderPolicy {
      return {
        method,
        id: policyId,
        purpose: 'order',
        family: 'escrow',
        policies: () => [{ method, id: policyId }],
        assets: () => [],
        async *pay() {
          yield { type: 'completed' as const }
        },
        async *settlePayment(intent: marketplace.MarketplacePaymentSettlementIntent) {
          arbitrationIntents.push(intent)
          yield {
            type: 'settlement_ready' as const,
            proof: mockPaymentProof(policyId, {
              ...intent.proof.params,
              action: 'order_arbitrate',
              txHash: `0x${'7'.repeat(64)}`,
            }),
            outputs: intent.outputs,
          }
        },
      }
    }
    const evmBidPolicy = bidPolicy(evmPolicyId, 'evm', 'evm:multi-escrow')
    const cashuBidPolicy = bidPolicy(cashuPolicyId, 'cashu', 'cashu:p2pk-escrow-v1')
    const evmOrderPolicy = orderPolicy(evmPolicyId, 'evm')
    const cashuOrderPolicy = orderPolicy(cashuPolicyId, 'cashu')
    const api = marketplace.bind(
      {
        async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
          const events = [
            lowBid,
            winningFirstBid,
            winningBid,
            preStartHighBid,
            invalidHighBid,
          ].flatMap(input => [input.bid.event, input.payment.event, input.decision])
          const kinds = filter.kinds ?? []
          return events.filter(event => kinds.length === 0 || kinds.includes(event.kind))
        },
        async get(): Promise<Event | null> {
          return null
        },
      },
      ['wss://relay.example'],
      {
        seed: '9'.repeat(64),
        identity: { pubkey: arbiterPubkey },
        signer: {
          async getPublicKey() {
            return arbiterPubkey
          },
          async nip44Encrypt(_pubkey: string, plaintext: string) {
            return plaintext
          },
          async nip44Decrypt(_pubkey: string, ciphertext: string) {
            return ciphertext
          },
          async signEvent(template: EventTemplate) {
            return sign(template, arbiterSecretKey)
          },
        },
        publish: event => published.push(event),
        orderDrivers: [evmOrderPolicy, cashuOrderPolicy],
        auctionDrivers: [evmBidPolicy, cashuBidPolicy],
      },
    )

    const states: marketplace.MarketplaceAuctionSettlementState[] = []
    for await (const state of api.auctions.settle({
      auctionId,
      auctionAnchor,
      listingAnchor,
      arbiterPubkey: arbiterPubkey,
      currency: 'USD',
      decimals: 2,
      startAt: createdAt,
      endAt: createdAt + 3600,
      startingBid: '10000',
      targetUnlockAt: createdAt + 3600,
      targetOrder: { tradeId: 'auction-settle-1-order', quantity: 1 },
    })) {
      states.push(state)
    }

    const completed = states.find(state => state.type === 'completed')
    expect(completed?.winner?.bid.tradeId).toBe(winningBid.bid.tradeId)
    expect(states.some(state =>
      state.type === 'bid_validated' &&
      state.bid.bid.tradeId === preStartHighBid.bid.tradeId &&
      state.bid.validation.error === 'Bid was created before the auction started',
    )).toBe(true)
    expect(published).toHaveLength(11)
    expect(published.some(event => event.kind === MarketplaceAuctionComplete)).toBe(true)

    const settlementEvents = published.filter(event => event.kind === MarketplacePaymentSettlement)
    const settlements = settlementEvents.map(event => marketplace.orders.parsePaymentSettlement(event))
    const promoted = settlements.filter(settlement => settlement.content.action === 'auction_promote')
    const refunded = settlements.filter(settlement => settlement.content.action === 'auction_refund')
    expect(promoted).toHaveLength(2)
    expect(refunded).toHaveLength(3)
    expect(promoted.map(settlement => settlement.orderGroupId).sort()).toEqual([
      winningBid.bid.tradeId,
      winningFirstBid.bid.tradeId,
    ].sort())
    expect(promoted.every(settlement => settlement.content.data?.winnerTradeId === winningBid.bid.tradeId)).toBe(true)
    expect(promoted.every(settlement => settlement.content.data?.targetTradeId === winningBidChainId)).toBe(true)
    expect(promoted.map(settlement => settlement.content.method).sort()).toEqual([cashuPolicyId, evmPolicyId].sort())
    expect(promoted.map(settlement =>
      (settlement.content.data?.proof as { driver?: string }).driver,
    ).sort()).toEqual([cashuPolicyId, evmPolicyId].sort())
    expect(promoted.every(settlement =>
      (settlement.content.data?.proof as { params?: Record<string, unknown> }).params?.action === 'auction_promote',
    )).toBe(true)
    expect(refunded.map(settlement => settlement.orderGroupId).sort()).toEqual([
      invalidHighBid.bid.tradeId,
      lowBid.bid.tradeId,
      preStartHighBid.bid.tradeId,
    ].sort())
    expect(refunded.every(settlement =>
      (settlement.content.data?.proof as { params?: Record<string, unknown> }).params?.refundPercent === 100,
    )).toBe(true)

    const promotedOrderEvent = published.find(event => event.kind === MarketplaceOrder)
    const promotedPaymentEvents = published.filter(event => event.kind === MarketplacePayment)
    const promotedAckEvents = published.filter(event => event.kind === MarketplacePaymentAck)
    expect(promotedOrderEvent).toBeDefined()
    expect(promotedPaymentEvents).toHaveLength(2)
    expect(promotedAckEvents).toHaveLength(2)

    const promotedOrder = marketplace.orders.parse(promotedOrderEvent!)
    const winningBuyerPubkey = winningBid.bid.participants.find(participant => participant.role === 'buyer')?.pubkey
    if (!winningBuyerPubkey) throw new Error('Expected winning bid buyer pubkey')
    expect(promotedOrder.tradeId).toBe(winningBidChainId)
    expect(promotedOrder.content.amount).toEqual({ value: '25000', currency: 'USD', denomination: 'USD', decimals: 2 })
    expect(promotedOrder.content.recipient).toBe(winningBuyerPubkey)
    expect(promotedOrder.participantProofs).toHaveLength(1)
    expect(promotedOrder.participantProofs[0]?.participantPubkey).toBe(winningBuyerPubkey)

    const promotedPayments = promotedPaymentEvents.map(event => marketplace.orders.parsePayment(event))
    expect(promotedPayments.every(payment => payment.tradeId === winningBidChainId)).toBe(true)
    expect(promotedPayments.map(payment => payment.content.proof.paymentProof?.driver).sort())
      .toEqual([cashuPolicyId, evmPolicyId].sort())
    expect(promotedPayments.every(payment => payment.content.proof.paymentProof?.params.action === 'auction_promote')).toBe(true)
    expect(promotedPayments.every(payment => payment.refs.orders[0] === promotedOrder.event.id)).toBe(true)
    expect(promotedPayments.every(payment => payment.event.tags.some(tag =>
      tag[0] === 'a' && tag[1] === auctionAnchor && tag[3] === 'auction'
    ))).toBe(true)

    const promotedAcks = promotedAckEvents.map(event => marketplace.orders.parsePaymentAck(event))
    expect(promotedAcks.every(ack => ack.tradeId === winningBidChainId)).toBe(true)
    expect(promotedAcks.every(ack => ack.content.status === 'accepted')).toBe(true)
    expect(promotedAcks.map(ack => ack.refs.payments[0]).sort())
      .toEqual(promotedPayments.map(payment => payment.event.id).sort())
    expect(promotedAcks.every(ack => ack.event.tags.some(tag =>
      tag[0] === 'a' && tag[1] === auctionAnchor && tag[3] === 'auction'
    ))).toBe(true)

    const publishedBeforeArbitration = published.length
    const promotedGroup = marketplace.orders.groups.reduce([
      promotedOrderEvent!,
      ...promotedPaymentEvents,
      ...promotedAckEvents,
    ])
    const arbitrationStates: marketplace.MarketplacePaymentArbitrationRuntimeState[] = []
    for await (const state of api.arbitration.arbitrate({
      group: promotedGroup,
      payments: promotedPayments,
      action: 'split',
      outputs: [
        { role: 'seller', pubkey: sellerPubkey, amount: '12500' },
        { role: 'buyer', pubkey: winningBuyerPubkey, amount: '12500' },
      ],
    })) {
      arbitrationStates.push(state)
    }

    expect(arbitrationStates.filter(state => state.type === 'settlement_published')).toHaveLength(2)
    expect(arbitrationIntents.map(intent => ({
      driver: intent.proof.driver,
      paymentId: intent.paymentId,
      amount: intent.amount.value,
      outputs: intent.outputs?.map(output => `${output.role}:${output.amount}`),
    }))).toEqual([
      {
        driver: evmPolicyId,
        paymentId: promotedPayments[0].event.id,
        amount: '15000',
        outputs: ['seller:7500', 'buyer:7500'],
      },
      {
        driver: cashuPolicyId,
        paymentId: promotedPayments[1].event.id,
        amount: '10000',
        outputs: ['seller:5000', 'buyer:5000'],
      },
    ])
    const arbitrationSettlementEvents = published
      .slice(publishedBeforeArbitration)
      .filter(event => event.kind === MarketplacePaymentSettlement)
    expect(arbitrationSettlementEvents).toHaveLength(2)
    const arbitrationSettlements = arbitrationSettlementEvents.map(event => marketplace.orders.parsePaymentSettlement(event))
    expect(arbitrationSettlements.every(settlement => settlement.tradeId === winningBidChainId)).toBe(true)
    expect(arbitrationSettlements.every(settlement => settlement.content.action === 'split')).toBe(true)
    expect(arbitrationSettlements.map(settlement => settlement.refs.payments[0]).sort())
      .toEqual(promotedPayments.map(payment => payment.event.id).sort())
    expect(arbitrationSettlements.map(settlement =>
      settlement.content.outputs?.map(output => `${output.role}:${output.amount}`),
    )).toEqual([
      ['seller:7500', 'buyer:7500'],
      ['seller:5000', 'buyer:5000'],
    ])
  })

  test('arbitration runtime validates seen payments and publishes an ack', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-arbitration-start'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const order = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        listing,
        participants,
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        createdAt,
      }),
      buyerSecretKey,
    )
    const paymentAmountPayload = marketplace.paymentAmounts.build(
      { value: '50000', denomination: 'BTC', decimals: 8 },
      {
        mode: 'sealed',
        senderSecretKey: buyerSecretKey,
        recipientPubkeys: [buyerPubkey, sellerPubkey, arbiterPubkey],
      },
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [order.id] },
        ...paymentAmountPayload,
        proof: {
          paymentProof: mockPaymentProof('evm-escrow', { txHash: `0x${'d'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const subscriptions: Array<{ onevent: (event: Event) => void }> = []
    const pool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
      subscribeMap(_requests: unknown[], handlers: { onevent: (event: Event) => void }) {
        subscriptions.push(handlers)
        return { close() {} }
      },
    }
    const published: Event[] = []
    const states: marketplace.MarketplaceArbitrationStartEvent[] = []
    const policy: marketplace.MarketplaceOrderPolicy = {
      method: 'evm',
      id: 'evm-escrow',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{ method: 'evm', id: 'evm-escrow' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
        return {
          driver: request.driver,
          status: 'valid',
          proofEventId: payment.id,
          amount: request.expected.amount,
          terms: {
            settlementId: request.expected.settlementId,
            paymentAmount: request.expected.amount,
            securityBondAmount: { value: '25000', denomination: 'BTC', decimals: 8 },
            unlockAt: createdAt + 3600,
          },
          amountMatched: true,
          assetMatched: true,
          recipientMatched: true,
          arbiterMatched: true,
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '7'.repeat(64),
      identity: { pubkey: arbiterPubkey },
      signer: {
        async getPublicKey() {
          return arbiterPubkey
        },
        async nip44Encrypt(_pubkey: string, plaintext: string) {
          return plaintext
        },
        async nip44Decrypt(pubkey: string, ciphertext: string) {
          return decryptNip44(ciphertext, getConversationKey(arbiterSecretKey, pubkey))
        },
        async signEvent(template: EventTemplate) {
          return sign(template, arbiterSecretKey)
        },
      },
      publish: event => published.push(event),
      orderDrivers: [policy],
    })

    api.arbitration.start({
      onstate: state => {
        states.push(state)
      },
    })
    subscriptions[0].onevent(order)
    subscriptions[0].onevent(payment)
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(published).toHaveLength(1)
    expect(published[0].kind).toBe(MarketplacePaymentAck)
    expect(published[0].pubkey).toBe(arbiterPubkey)
    expect(hasTag(published[0], ['e', payment.id, '', 'payment'])).toBe(true)
    expect(states.some(state => state.type === 'payment_validated')).toBe(true)
    expect(states.some(state => state.type === 'payment_ack_published')).toBe(true)
  })

  test('arbitration runtime suppresses duplicate ack when replayed ack arrives during validation', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-arbitration-replayed-ack'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const order = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        listing,
        participants,
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [order.id] },
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm-escrow', { txHash: `0x${'d'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const replayedAck = sign(
      marketplace.orders.paymentAckTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { payments: [payment.id] },
        status: 'accepted',
        createdAt: createdAt + 2,
      }),
      arbiterSecretKey,
    )
    const subscriptions: Array<{ onevent: (event: Event) => void }> = []
    const pool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
      subscribeMap(_requests: unknown[], handlers: { onevent: (event: Event) => void }) {
        subscriptions.push(handlers)
        return { close() {} }
      },
    }
    const published: Event[] = []
    const states: marketplace.MarketplaceArbitrationStartEvent[] = []
    const pendingValidations: Array<{
      request: marketplace.MarketplacePaymentValidationRequest
      resolve: (result: marketplace.MarketplacePaymentValidationResult) => void
    }> = []
    const policy: marketplace.MarketplaceOrderPolicy = {
      method: 'evm',
      id: 'evm-escrow',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{ method: 'evm', id: 'evm-escrow' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
        return await new Promise<marketplace.MarketplacePaymentValidationResult>(resolve => {
          pendingValidations.push({ request, resolve })
        })
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '7'.repeat(64),
      identity: { pubkey: arbiterPubkey },
      signer: {
        async getPublicKey() {
          return arbiterPubkey
        },
        async nip44Encrypt(_pubkey: string, plaintext: string) {
          return plaintext
        },
        async nip44Decrypt(_pubkey: string, ciphertext: string) {
          return ciphertext
        },
        async signEvent(template: EventTemplate) {
          return sign(template, arbiterSecretKey)
        },
      },
      publish: event => published.push(event),
      orderDrivers: [policy],
    })

    api.arbitration.start({
      onstate: state => {
        states.push(state)
      },
    })
    subscriptions[0].onevent(order)
    subscriptions[0].onevent(payment)
    await new Promise(resolve => setTimeout(resolve, 0))
    subscriptions[0].onevent(replayedAck)
    await new Promise(resolve => setTimeout(resolve, 0))

    for (const pending of [...pendingValidations]) {
      pending.resolve({
        driver: pending.request.driver,
        status: 'valid',
        proofEventId: payment.id,
        amount: pending.request.expected.amount,
        terms: {
          settlementId: pending.request.expected.settlementId,
          paymentAmount: pending.request.expected.amount,
          securityBondAmount: { value: '25000', denomination: 'BTC', decimals: 8 },
          unlockAt: createdAt + 3600,
        },
        amountMatched: true,
        assetMatched: true,
        recipientMatched: true,
        arbiterMatched: true,
      })
    }
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(published).toHaveLength(0)
    expect(states.some(state => state.type === 'ignored' && state.reason === 'payment already acked by arbiter')).toBe(true)
  })

  test('arbitration runtime validates auction bid payments and publishes an ack', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-runtime-ack',
        listingAnchor,
        arbiterPubkey: arbiterPubkey,
        currency: 'USD',
        decimals: 2,
        startAt: createdAt - 60,
        endAt: createdAt + 3600,
        createdAt,
      }),
      sellerSecretKey,
    )
    const parsedAuction = marketplace.auctions.parse(auction)
    const auctionAnchor = marketplace.auctions.address(auction)
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-runtime-ack-bid',
        auctionAnchor,
        listingAnchor,
        participants,
        amount: { value: '12000', denomination: 'USD', decimals: 2 },
        targetOrder: { quantity: 1 },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'auction-runtime-ack-bid',
        orderGroupId: 'auction-runtime-ack-bid',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: { auctionBids: [bid.id] },
        amount: { value: '12000', denomination: 'USD', decimals: 2 },
        proof: {
          paymentProof: mockPaymentProof('evm-auction-runtime', {
              policyId: 'evm-auction-runtime',
              txHash: `0x${'a'.repeat(64)}`,
              recycleArgs: {
                version: 1,
                type: 'evm:multi-escrow-recycle-v1',
                target: {
                  order: {
                    listingAnchor,
                    quantity: 1,
                  },
                },
              },
            }),
        },
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const group = marketplace.auctionBidGroups.reduce([bid, payment])
    const published: Event[] = []
    const states: marketplace.MarketplaceArbitrationStartEvent[] = []
    let validationRequest: marketplace.MarketplacePaymentValidationRequest | undefined
    const bidPolicy: marketplace.MarketplaceBidPolicy = {
      method: 'evm',
      id: 'evm-auction-runtime',
      purpose: 'bid',
      family: 'auction',
      policies: () => [{ method: 'evm', id: 'evm-auction-runtime' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
        validationRequest = request
        return {
          driver: request.driver,
          status: 'valid',
          proofEventId: payment.id,
          amount: request.expected.amount,
          amountMatched: true,
          assetMatched: true,
          recipientMatched: true,
          arbiterMatched: true,
        }
      },
    }
    const api = marketplace.bind(
      {
        async querySync(): Promise<Event[]> {
          return []
        },
        async get(): Promise<Event | null> {
          return null
        },
      },
      ['wss://relay.example'],
      {
        seed: '8'.repeat(64),
        identity: { pubkey: arbiterPubkey },
        signer: {
          async getPublicKey() {
            return arbiterPubkey
          },
          async nip44Encrypt(_pubkey: string, plaintext: string) {
            return plaintext
          },
          async nip44Decrypt(_pubkey: string, ciphertext: string) {
            return ciphertext
          },
          async signEvent(template: EventTemplate) {
            return sign(template, arbiterSecretKey)
          },
        },
        publish: event => published.push(event),
        auctionDrivers: [bidPolicy],
      },
    )

    const runtime = api.arbitration.start({
      orders: false,
      auctions: false,
      now: createdAt + 120,
      onstate: state => {
        states.push(state)
      },
    })
    await runtime.processAuctionBidGroup(parsedAuction, group)

    expect(validationRequest?.expected.listingAnchor).toBe(auctionAnchor)
    expect(validationRequest?.expected.amount).toEqual({ value: '12000', currency: 'USD', denomination: 'USD', decimals: 2 })
    expect(validationRequest?.expected.participants?.arbiter?.pubkey).toBe(arbiterPubkey)
    expect(published).toHaveLength(1)
    expect(published[0].kind).toBe(MarketplacePaymentAck)
    const ack = marketplace.orders.parsePaymentAck(published[0])
    expect(ack.anchors.auction).toBe(auctionAnchor)
    expect(ack.anchors.listing).toBe(listingAnchor)
    expect(ack.refs.auctionBids).toEqual([bid.id])
    expect(ack.refs.payments).toEqual([payment.id])
    expect(states.some(state => state.type === 'auction_bid_payment_validated')).toBe(true)
    expect(states.some(state => state.type === 'auction_bid_payment_ack_published')).toBe(true)
  })

  test('arbitration runtime rejects auction bid payments without recycle covenant params', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-runtime-nack',
        listingAnchor,
        arbiterPubkey: arbiterPubkey,
        currency: 'USD',
        decimals: 2,
        startAt: createdAt - 60,
        endAt: createdAt + 3600,
        createdAt,
      }),
      sellerSecretKey,
    )
    const parsedAuction = marketplace.auctions.parse(auction)
    const auctionAnchor = marketplace.auctions.address(auction)
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-runtime-nack-bid',
        auctionAnchor,
        listingAnchor,
        participants,
        amount: { value: '15000', denomination: 'USD', decimals: 2 },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'auction-runtime-nack-bid',
        orderGroupId: 'auction-runtime-nack-bid',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: { auctionBids: [bid.id] },
        amount: { value: '15000', denomination: 'USD', decimals: 2 },
        proof: {
          paymentProof: mockPaymentProof('evm-auction-runtime', {
              policyId: 'evm-auction-runtime',
              txHash: `0x${'c'.repeat(64)}`,
            }),
        },
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const group = marketplace.auctionBidGroups.reduce([bid, payment])
    const published: Event[] = []
    const states: marketplace.MarketplaceArbitrationStartEvent[] = []
    const api = marketplace.bind(
      {
        async querySync(): Promise<Event[]> {
          return []
        },
        async get(): Promise<Event | null> {
          return null
        },
      },
      ['wss://relay.example'],
      {
        seed: '8'.repeat(64),
        identity: { pubkey: arbiterPubkey },
        signer: {
          async getPublicKey() {
            return arbiterPubkey
          },
          async nip44Encrypt(_pubkey: string, plaintext: string) {
            return plaintext
          },
          async nip44Decrypt(_pubkey: string, ciphertext: string) {
            return ciphertext
          },
          async signEvent(template: EventTemplate) {
            return sign(template, arbiterSecretKey)
          },
        },
        publish: event => published.push(event),
        auctionDrivers: [],
      },
    )

    const runtime = api.arbitration.start({
      orders: false,
      auctions: false,
      now: createdAt + 120,
      onstate: state => {
        states.push(state)
      },
    })
    await runtime.processAuctionBidGroup(parsedAuction, group)

    expect(published).toHaveLength(1)
    expect(published[0].kind).toBe(MarketplacePaymentNack)
    const nack = marketplace.orders.parsePaymentNack(published[0])
    expect(nack.anchors.auction).toBe(auctionAnchor)
    expect(nack.anchors.listing).toBe(listingAnchor)
    expect(nack.content.message).toContain('missing recycle covenant')
    expect(nack.refs.auctionBids).toEqual([bid.id])
    expect(nack.refs.payments).toEqual([payment.id])
    const validated = states.find(state => state.type === 'auction_bid_payment_validated')
    expect(validated?.type).toBe('auction_bid_payment_validated')
    if (validated?.type === 'auction_bid_payment_validated') {
      expect(validated.validation.status).toBe('invalid')
    }
  })

  test('arbitration runtime settles ended auctions assigned to the arbiter', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auctionId = 'auction-runtime-settle'
    const auction = sign(
      marketplace.auctions.template({
        d: auctionId,
        listingAnchor,
        arbiterPubkey: arbiterPubkey,
        currency: 'USD',
        decimals: 2,
        startAt: createdAt - 120,
        endAt: createdAt + 5,
        createdAt,
      }),
      sellerSecretKey,
    )
    const parsedAuction = marketplace.auctions.parse(auction)
    const auctionAnchor = marketplace.auctions.address(auction)
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-runtime-settle-bid',
        auctionAnchor,
        listingAnchor,
        participants,
        amount: { value: '18000', denomination: 'USD', decimals: 2 },
        targetOrder: { quantity: 1 },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'auction-runtime-settle-bid',
        orderGroupId: 'auction-runtime-settle-bid',
        anchors: [
          { value: auctionAnchor, marker: 'auction' },
          { value: listingAnchor, marker: 'listing' },
        ],
        participants,
        refs: { auctionBids: [bid.id] },
        amount: { value: '18000', denomination: 'USD', decimals: 2 },
        proof: {
          paymentProof: mockPaymentProof('evm-auction-runtime-settle', {
              policyId: 'evm-auction-runtime-settle',
              txHash: `0x${'d'.repeat(64)}`,
              recycleArgs: {
                version: 1,
                type: 'evm:multi-escrow-recycle-v1',
                target: {
                  order: {
                    listingAnchor,
                    quantity: 1,
                  },
                },
              },
            }),
        },
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const published: Event[] = []
    const states: marketplace.MarketplaceArbitrationStartEvent[] = []
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        const kinds = filter.kinds ?? []
        return [bid, payment, ...published].filter(event => kinds.length === 0 || kinds.includes(event.kind))
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    const bidPolicy: marketplace.MarketplaceBidPolicy = {
      method: 'evm',
      id: 'evm-auction-runtime-settle',
      purpose: 'bid',
      family: 'auction',
      policies: () => [{ method: 'evm', id: 'evm-auction-runtime-settle' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
        return {
          driver: request.driver,
          status: 'valid',
          proofEventId: payment.id,
          amount: request.expected.amount,
          amountMatched: true,
          assetMatched: true,
          recipientMatched: true,
          arbiterMatched: true,
        }
      },
      async refundPayment() {
        throw new Error('single-bid runtime settlement should not refund')
      },
      async recyclePayment(intent) {
        return {
          proof: mockPaymentProof('evm-auction-runtime-settle', {
              ...intent.proof.params,
              action: 'auction_promote',
              tradeId: intent.targetTradeId,
              settlementId: intent.targetOrderGroupId,
              txHash: `0x${'f'.repeat(64)}`,
              recycleArgs: intent.recycleArgs,
            }),
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '8'.repeat(64),
      identity: { pubkey: arbiterPubkey },
      signer: {
        async getPublicKey() {
          return arbiterPubkey
        },
        async nip44Encrypt(_pubkey: string, plaintext: string) {
          return plaintext
        },
        async nip44Decrypt(_pubkey: string, ciphertext: string) {
          return ciphertext
        },
        async signEvent(template: EventTemplate) {
          return sign(template, arbiterSecretKey)
        },
      },
      publish: event => published.push(event),
      auctionDrivers: [bidPolicy],
    })

    const runtime = api.arbitration.start({
      orders: false,
      auctions: false,
      now: createdAt + 10,
      auctionSettlement: {
        targetUnlockAt: createdAt + 3600,
        targetOrder: { tradeId: 'auction-runtime-settle-order', quantity: 1 },
      },
      onstate: state => {
        states.push(state)
      },
    })
    await runtime.processAuction(parsedAuction)
    for (let i = 0; i < 10 && !states.some(state => state.type === 'auction_settlement_completed'); i += 1) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    expect(states.some(state => state.type === 'auction_settlement_started')).toBe(true)
    expect(states.some(state => state.type === 'auction_settlement_completed')).toBe(true)
    expect(published.some(event => event.kind === MarketplaceAuctionComplete)).toBe(true)
    expect(published.some(event => event.kind === MarketplacePaymentSettlement)).toBe(true)
    const promotedOrder = published.find(event => event.kind === MarketplaceOrder)
    const promotedPayment = published.find(event => event.kind === MarketplacePayment && event.pubkey === arbiterPubkey)
    expect(promotedOrder).toBeDefined()
    expect(promotedPayment).toBeDefined()
    expect(marketplace.orders.parse(promotedOrder!).tradeId).toBe('auction-runtime-settle-bid')
    expect(marketplace.orders.parsePayment(promotedPayment!).content.proof.paymentProof?.driver)
      .toBe('evm-auction-runtime-settle')
  })

  test('payment arbitration routes to the matching policy and publishes a settlement', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-arbitrate'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const order = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        participants,
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [order.id] },
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm-escrow', { txHash: `0x${'e'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const group = marketplace.orders.groups.reduce([order, payment])
    const published: Event[] = []
    let receivedAction: string | undefined
    const policy: marketplace.MarketplaceOrderPolicy = {
      method: 'evm',
      id: 'evm-escrow',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{ method: 'evm', id: 'evm-escrow' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async *arbitrate(intent: marketplace.MarketplacePaymentArbitrationIntent) {
        receivedAction = intent.action
        yield {
          type: 'settlement_ready' as const,
          proof: mockPaymentProof('evm-escrow', { txHash: `0x${'f'.repeat(64)}` }),
          data: { settled: true },
        }
      },
    }
    const api = marketplace.bind(
      {
        async querySync(): Promise<Event[]> {
          return []
        },
        async get(): Promise<Event | null> {
          return null
        },
      },
      ['wss://relay.example'],
      {
        seed: '8'.repeat(64),
        identity: { pubkey: arbiterPubkey },
        signer: {
          async getPublicKey() {
            return arbiterPubkey
          },
          async nip44Encrypt(_pubkey: string, plaintext: string) {
            return plaintext
          },
          async nip44Decrypt(_pubkey: string, ciphertext: string) {
            return ciphertext
          },
          async signEvent(template: EventTemplate) {
            return sign(template, arbiterSecretKey)
          },
        },
        publish: event => published.push(event),
        orderDrivers: [policy],
      },
    )

    const states: marketplace.MarketplacePaymentArbitrationRuntimeState[] = []
    for await (const state of api.arbitration.arbitrate({ group, action: 'split' })) {
      states.push(state)
    }

    expect(receivedAction).toBe('split')
    expect(published).toHaveLength(1)
    expect(published[0].kind).toBe(MarketplacePaymentSettlement)
    expect(published[0].pubkey).toBe(arbiterPubkey)
    expect(hasTag(published[0], ['e', payment.id, '', 'payment'])).toBe(true)
    expect(states.some(state => state.type === 'settlement_published')).toBe(true)
  })

  test('payment arbitration allocates a group split across multiple payments', async () => {
    const buyerSecretKey = generateSecretKey()
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const sellerSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const arbiterSecretKey = generateSecretKey()
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'multi-arbitration-trade'
    const participants = [
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const orderGroupId = marketplace.orders.groups.id(tradeId, participants)
    const order = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        amount: { value: '100', denomination: 'BTC', decimals: 8 },
        participants,
        createdAt,
      }),
      buyerSecretKey,
    )
    const firstPayment = sign(
      marketplace.orders.paymentTemplate({
        tradeId,
        orderGroupId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [order.id] },
        amount: { value: '40', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm-escrow', { txHash: `0x${'a'.repeat(64)}` }),
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const secondPayment = sign(
      marketplace.orders.paymentTemplate({
        tradeId,
        orderGroupId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { orders: [order.id] },
        amount: { value: '60', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm-escrow', { txHash: `0x${'b'.repeat(64)}` }),
        },
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const group = marketplace.orders.groups.reduce([order, firstPayment, secondPayment])
    const published: Event[] = []
    const intents: marketplace.MarketplacePaymentSettlementIntent[] = []
    const policy: marketplace.MarketplaceOrderPolicy = {
      method: 'evm',
      id: 'evm-escrow',
      purpose: 'order',
      family: 'escrow',
      policies: () => [{ method: 'evm', id: 'evm-escrow' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async *settlePayment(intent: marketplace.MarketplacePaymentSettlementIntent) {
        intents.push(intent)
        yield {
          type: 'settlement_ready' as const,
          proof: mockPaymentProof('evm-escrow', { txHash: `0x${'f'.repeat(64)}` }),
        }
      },
    }
    const api = marketplace.bind(
      {
        async querySync(): Promise<Event[]> {
          return []
        },
        async get(): Promise<Event | null> {
          return null
        },
      },
      ['wss://relay.example'],
      {
        seed: '8'.repeat(64),
        identity: { pubkey: arbiterPubkey },
        signer: {
          async getPublicKey() {
            return arbiterPubkey
          },
          async nip44Encrypt(_pubkey: string, plaintext: string) {
            return plaintext
          },
          async nip44Decrypt(_pubkey: string, ciphertext: string) {
            return ciphertext
          },
          async signEvent(template: EventTemplate) {
            return sign(template, arbiterSecretKey)
          },
        },
        publish: event => published.push(event),
        orderDrivers: [policy],
      },
    )

    for await (const _state of api.arbitration.arbitrate({
      group,
      payments: [marketplace.orders.parsePayment(firstPayment), marketplace.orders.parsePayment(secondPayment)],
      action: 'split',
      outputs: [
        { role: 'seller', amount: '75' },
        { role: 'buyer', amount: '25' },
      ],
    })) {}

    expect(intents.map(intent => intent.outputs?.map(output => output.amount))).toEqual([
      ['30', '10'],
      ['45', '15'],
    ])
    expect(published).toHaveLength(2)
    expect(published.every(event => event.kind === MarketplacePaymentSettlement)).toBe(true)
    expect(hasTag(published[0], ['e', firstPayment.id, '', 'payment'])).toBe(true)
    expect(hasTag(published[1], ['e', secondPayment.id, '', 'payment'])).toBe(true)
  })

  test('payment terms expose nested split options', () => {
    const amount = { value: '100', denomination: 'BTC', decimals: 8 }
    const terms = mockPaymentTerms({ value: '100', policyId: 'cashu:p2pk' })
    terms.lock.paths = [{
      id: 'promote',
      result: {
        type: 'lock',
        lock: {
          id: 'promoted-lock',
          policyId: 'cashu:p2pk',
          kind: 'threshold',
          amount,
          controls: [],
          conditions: { arbitration: { type: 'chunked', chunks: 2 } },
          paths: [
            {
              id: 'split-0-of-2',
              result: { type: 'terminal', outputs: [{ role: 'buyer', amount: { ...amount, value: '100' } }] },
            },
            {
              id: 'split-1-of-2',
              result: {
                type: 'terminal',
                outputs: [
                  { role: 'seller', amount: { ...amount, value: '50' } },
                  { role: 'buyer', amount: { ...amount, value: '50' } },
                ],
              },
            },
            {
              id: 'split-2-of-2',
              result: { type: 'terminal', outputs: [{ role: 'seller', amount: { ...amount, value: '100' } }] },
            },
          ],
        },
      },
    }]

    const options = marketplace.paymentTerms.splitOptions(terms)

    expect(options.map(option => option.pathId)).toEqual(['split-0-of-2', 'split-1-of-2', 'split-2-of-2'])
    expect(options[1]?.outputs.map(output => `${output.role}:${output.amount}`)).toEqual(['seller:50', 'buyer:50'])
  })

  test('discovers a converged marketplace high-water mark across payment policies', async () => {
    const calls: Array<{ policy: string; highWaterMark: number; seed: string }> = []
    const pool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    const evmPolicy: marketplace.MarketplaceOrderPolicy = {
      id: 'evm-main',
      method: 'evm',
      purpose: 'order',
      family: 'escrow',
      policies: () => [],
      assets: () => [],
      async discoverHighWatermark(ctx: marketplace.MarketplacePolicyWatermarkContext) {
        calls.push({ policy: 'evm', highWaterMark: ctx.highWaterMark, seed: ctx.seed })
        return {
          policy: 'evm',
          maxUsedIndex: ctx.highWaterMark < 4 ? 4 : 4,
          scannedThrough: ctx.highWaterMark + ctx.unusedWindow,
        }
      },
      async *pay() {
        yield { type: 'completed' as const }
      },
    }
    const cashuPolicy: marketplace.MarketplaceOrderPolicy = {
      id: 'cashu-script',
      method: 'cashu',
      purpose: 'order',
      family: 'escrow',
      policies: () => [],
      assets: () => [],
      async discoverHighWatermark(ctx: marketplace.MarketplacePolicyWatermarkContext) {
        calls.push({ policy: 'cashu', highWaterMark: ctx.highWaterMark, seed: ctx.seed })
        return {
          policy: 'cashu',
          maxUsedIndex: ctx.highWaterMark < 7 ? 7 : 7,
          scannedThrough: ctx.highWaterMark + ctx.unusedWindow,
        }
      },
      async *pay() {
        yield { type: 'completed' as const }
      },
    }

    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '5'.repeat(64),
      orderDrivers: [evmPolicy, cashuPolicy],
    })
    const discovery = await api.discoverHighWatermark({ unusedWindow: 3 })

    expect(discovery.converged).toBe(true)
    expect(discovery.maxUsedIndex).toBe(7)
    expect(discovery.nextUnusedIndex).toBe(8)
    expect(discovery.passes.length).toBe(2)
    expect(calls.map(call => `${call.policy}:${call.highWaterMark}`)).toEqual([
      'evm:-1',
      'cashu:-1',
      'evm:7',
      'cashu:7',
    ])
    expect(calls.every(call => call.seed === '5'.repeat(64))).toBe(true)
  })

  test('starts marketplace runtime with default window and exposes next trade index value', async () => {
    const pool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '7'.repeat(64),
    })
    const observed: Array<number | undefined> = []
    const subscription = api.nextTradeIndex.subscribe(index => observed.push(index))

    expect(api.nextTradeIndex.value).toBeUndefined()
    const started = await api.start()

    expect(started.discovery.unusedWindow).toBe(25)
    expect(started.discovery.nextUnusedIndex).toBe(0)
    expect(api.nextTradeIndex.value).toBe(0)
    expect(await api.getNextAccountIndex()).toBe(0)
    expect(api.nextTradeIndex.value).toBe(1)
    expect(observed).toEqual([0, 1])
    subscription.unsubscribe()
  })

  test('session exposes driver-owned startup and recovery state', async () => {
    const { signer } = testSessionSigner()
    const pool = {
      async querySync(): Promise<Event[]> {
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    const policy: marketplace.MarketplaceOrderPolicy = {
      id: 'cashu:test-driver',
      label: 'Cashu test driver',
      method: 'cashu',
      purpose: 'order',
      family: 'escrow',
      policies: () => [],
      assets: () => [],
      async startup() {
        return {
          policy: 'cashu:test-driver',
          data: {
            activeOperations: 2,
          },
        }
      },
      async *resumeSwapOperations() {
        yield {
          type: 'progress' as const,
          status: 'checking swaps',
        }
        yield {
          type: 'resumed' as const,
          data: {
            activeOperations: 2,
            resumed: 1,
            settled: 1,
            failed: [{ operationId: 'swap-failed', error: 'swap failed' }],
          },
        }
      },
      async *pay() {
        yield { type: 'completed' as const }
      },
    }
    const api = await marketplace.bind(pool, ['wss://relay.example']).session(signer, {
      seed: '8'.repeat(64),
      ensurePaymentMethod: false,
      orderDrivers: [policy],
    })

    const seen: string[] = []
    api.drivers.each(driver => seen.push(driver.id))

    expect(api.drivers.all).toHaveLength(1)
    expect(api.drivers.orders).toHaveLength(1)
    expect(api.drivers.auctions).toHaveLength(0)
    expect(api.drivers.byId('cashu:test-driver')).toBe(api.drivers.all[0])
    expect(seen).toEqual(['cashu:test-driver'])
    expect(api.drivers.all[0].label).toBe('Cashu test driver')
    expect(api.drivers.all[0].state.value?.status).toBe('idle')

    await api.start()

    const driver = api.drivers.all[0]
    expect(driver.state.value?.status).toBe('ready')
    expect(driver.recovery.value).toMatchObject({
      active: 2,
      resumed: 1,
      settled: 1,
      failed: 1,
      failures: [{ operationId: 'swap-failed', error: 'swap failed' }],
    })
    expect(driver.recoveryStream.snapshot.value?.map(event => event.type)).toEqual([
      'started',
      'progress',
      'resumed',
      'complete',
    ])
  })

  test('watches my payments directly and retriggers sweep after settlement refetches payment', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const arbiterSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const arbiterPubkey = getPublicKey(arbiterSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'payment-sweep-watch'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: arbiterPubkey, role: 'arbiter' as const },
    ]
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        amount: { value: '50000', denomination: 'BTC', decimals: 8 },
        proof: {
          paymentProof: mockPaymentProof('evm-sweep', { policyId: 'evm-sweep', accountIndex: 12 }),
        },
        createdAt,
      }),
      buyerSecretKey,
    )
    const settlement = sign(
      marketplace.orders.paymentSettlementTemplate({
        tradeId,
        anchors: [{ value: listingAnchor, marker: 'listing' }],
        participants,
        refs: { payments: [payment.id] },
        method: 'evm',
        action: 'split',
        createdAt: createdAt + 1,
      }),
      arbiterSecretKey,
    )
    expect(marketplace.orders.parsePaymentSettlement(settlement).refs.payments).toEqual([payment.id])
    expect(settlement.kind).toBe(MarketplacePaymentSettlement)
    expect(settlement.id).not.toBe(payment.id)

    const handlers: Array<{ onevent: (event: Event) => void; oneose?: () => void }> = []
    const queryFilters: Array<{ kinds?: number[]; ids?: string[] }> = []
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[]; ids?: string[] }): Promise<Event[]> {
        queryFilters.push(filter)
        if (filter.kinds?.includes(MarketplacePayment) && filter.ids?.includes(payment.id)) return [payment]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
      subscribeMap(
        requests: Array<{ filter: { kinds?: number[]; authors?: string[]; '#p'?: string[] } }>,
        nextHandlers: { onevent: (event: Event) => void; oneose?: () => void },
      ) {
        expect(requests.some(request =>
          request.filter.kinds?.includes(MarketplacePayment) &&
          request.filter.kinds?.includes(MarketplacePaymentSettlement) &&
          request.filter['#p']?.includes(buyerPubkey)
        )).toBe(true)
        handlers.push(nextHandlers)
        return { close() {} }
      },
    }
    const sweepInputs: marketplace.MarketplacePaymentSweepInput[] = []
    const policy: marketplace.MarketplaceOrderPolicy = {
      id: 'evm-sweep',
      method: 'evm',
      purpose: 'order',
      family: 'escrow',
      policies: () => [],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async *sweepPayment(input: marketplace.MarketplacePaymentSweepInput) {
        sweepInputs.push(input)
        yield { type: 'swept' as const, proof: input.proof }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      identity: { pubkey: buyerPubkey },
      orderDrivers: [policy],
    })
    const stream = api.me.payments.watch()
    const snapshots: marketplace.MarketplaceMePaymentsSnapshot[] = []
    const streamErrors: string[] = []
    stream.snapshot.subscribe(snapshot => snapshots.push(snapshot))
    stream.status.subscribe(status => {
      if (status instanceof marketplace.StreamError) streamErrors.push(status.error.message)
    })

    handlers[0].onevent(payment)
    await waitFor(() => sweepInputs.length === 1)
    const parsedPayment = marketplace.orders.parsePayment(payment)
    expect(sweepInputs[0]).toMatchObject({
      paymentId: payment.id,
      tradeId,
      orderGroupId: parsedPayment.orderGroupId,
      listingAnchor,
      reason: 'payment',
    })
    expect(snapshots.at(-1)?.swept.map(record => record.paymentId)).toEqual([payment.id])
    expect(snapshots.at(-1)?.swept[0].anchors).toEqual(parsedPayment.anchors)

    handlers[0].onevent(settlement)
    await waitFor(() => queryFilters.length > 0 || streamErrors.length > 0, 'settlement refetch')
    expect(streamErrors).toEqual([])
    await waitFor(() => sweepInputs.length === 2)
    expect(queryFilters.some(filter =>
      filter.kinds?.includes(MarketplacePayment) &&
      filter.ids?.includes(payment.id)
    )).toBe(true)
    expect(sweepInputs[1]).toMatchObject({
      paymentId: payment.id,
      reason: 'settlement',
    })
    expect(snapshots.at(-1)?.swept[0].settlements.map(item => item.event.id)).toEqual([settlement.id])
    expect(snapshots.at(-1)?.swept[0].anchors).toEqual(parsedPayment.anchors)
  })

  test('seeds high-water mark discovery from existing Nostr orders and bids', async () => {
    const seed = '6'.repeat(64)
    const orderTrade = marketplace.deriveMarketplaceTradeMaterial(seed, { index: 2, role: 'buyer' })
    const bidTrade = marketplace.deriveMarketplaceTradeMaterial(seed, { index: 5, role: 'buyer' })
    const listingAnchor = `${30402}:${'a'.repeat(64)}:villa-bali`
    const order = sign(
      marketplace.orders.template({
        tradeId: orderTrade.tradeId,
        listingAnchor,
        participants: [{ pubkey: orderTrade.tradePubkey, role: 'buyer' }],
        amount: { value: '1000', denomination: 'BTC', decimals: 8 },
        createdAt,
      }),
      orderTrade.tradeSecretKey,
    )
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: bidTrade.tradeId,
        auctionAnchor: `${MarketplaceAuction}:${'b'.repeat(64)}:auction-1`,
        listingAnchor,
        amount: { value: '2000', denomination: 'BTC', decimals: 8 },
        participants: [{ pubkey: bidTrade.tradePubkey, role: 'buyer' }],
        createdAt,
      }),
      bidTrade.tradeSecretKey,
    )
    const calls: number[] = []
    const queriedKinds: number[][] = []
    const events = [order, bid]
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[]; authors?: string[]; '#p'?: string[] }): Promise<Event[]> {
        queriedKinds.push(filter.kinds ?? [])
        return events.filter(event => {
          if (filter.kinds && !filter.kinds.includes(event.kind)) return false
          if (filter.authors && filter.authors.includes(event.pubkey)) return true
          if (filter['#p'] && event.tags.some(tag => tag[0] === 'p' && filter['#p']!.includes(tag[1]))) return true
          return false
        })
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    const policy: marketplace.MarketplaceOrderPolicy = {
      id: 'noop-policy',
      method: 'evm',
      purpose: 'order',
      family: 'escrow',
      policies: () => [],
      assets: () => [],
      async discoverHighWatermark(ctx: marketplace.MarketplacePolicyWatermarkContext) {
        calls.push(ctx.highWaterMark)
        return {
          policy: 'noop-policy',
          maxUsedIndex: ctx.highWaterMark,
          scannedThrough: ctx.highWaterMark + ctx.unusedWindow,
        }
      },
      async *pay() {
        yield { type: 'completed' as const }
      },
    }

    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed,
      orderDrivers: [policy],
    })
    const discovery = await api.discoverHighWatermark({ unusedWindow: 3 })

    expect(discovery.maxUsedIndex).toBe(5)
    expect(discovery.nextUnusedIndex).toBe(6)
    expect(calls).toEqual([5])
    expect(queriedKinds.some(kinds => kinds.includes(MarketplaceOrder))).toBe(true)
    expect(queriedKinds.some(kinds => kinds.includes(MarketplaceAuctionBid))).toBe(true)
  })
})
