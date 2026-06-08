import { describe, expect, test } from 'bun:test'

import type { Event, EventTemplate } from './core.ts'
import {
  MarketplacePaymentMethod,
  EscrowService,
  EscrowServiceSelection,
  MarketplaceAuctionBid,
  MarketplaceAuctionComplete,
  MarketplaceOrder,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
  MarketplaceReview,
  MarketplaceSeed,
  StructuredMessage,
  isRegularKind,
} from './kinds.ts'
import * as marketplace from './marketplace/internal.ts'
import { finalizeEvent, generateSecretKey, getPublicKey } from './pure.ts'

const createdAt = 1712678400
const bytecodeHash = 'a'.repeat(64)
const sellerEvmAddress = '0x1111111111111111111111111111111111111111'
const arbiterAddress = '0x2222222222222222222222222222222222222222'
const contractAddress = '0x3333333333333333333333333333333333333333'
const btcAssetId = '33:0x0000000000000000000000000000000000000000'
const usdAssetId = '33:0xdAC17F958D2ee523a2206206994597C13D831ec7'

function sign(template: EventTemplate, secretKey = generateSecretKey()): Event {
  return finalizeEvent(template, secretKey)
}

function hasTag(event: EventTemplate | Event, expected: string[]): boolean {
  return event.tags.some(tag => JSON.stringify(tag) === JSON.stringify(expected))
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

function paymentMethodEvent(sellerSecretKey: Uint8Array, escrowPubkey: string): Event {
  return sign(
    marketplace.paymentMethod.template({
      trustedEscrowPubkeys: [escrowPubkey],
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

function escrowServiceEvent(escrowSecretKey: Uint8Array): Event {
  const escrowPubkey = getPublicKey(escrowSecretKey)
  return sign(
    marketplace.escrowServices.template({
      d: 'evm-rsk-regtest',
      pubkey: escrowPubkey,
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
    escrowSecretKey,
  )
}

describe('marketplace listings', () => {
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
    expect(parsed.securityDeposit).toEqual({ value: '25000', denomination: 'BTC', decimals: 8 })
    expect(parsed.minPaymentAmount).toEqual({ value: '10000', denomination: 'BTC', decimals: 8 })
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
})

describe('marketplace escrow records', () => {
  test('generates, validates, and parses payment methods', () => {
    const sellerSecretKey = generateSecretKey()
    const escrowPubkey = getPublicKey(generateSecretKey())
    const event = paymentMethodEvent(sellerSecretKey, escrowPubkey)
    const parsed = marketplace.paymentMethod.parse(event)

    expect(event.kind).toBe(MarketplacePaymentMethod)
    expect(marketplace.paymentMethod.validate(event)).toBe(true)
    expect(parsed.trustedEscrowPubkeys).toEqual([escrowPubkey])
    expect(parsed.supportedContractBytecodeHashes).toEqual([bytecodeHash])
    expect(parsed.evmAddress).toBe(sellerEvmAddress)
    expect(parsed.evmAddressProof).toBe('0xproof')
    expect(parsed.acceptedPaymentForms).toEqual([
      { denomination: 'BTC', assetId: btcAssetId, appId: 'marketplace' },
      { denomination: 'USD', assetId: usdAssetId, appId: 'marketplace' },
    ])
    expect(marketplace.paymentMethod.canonicalAssetId('33:0xDAC17F958D2EE523A2206206994597C13D831EC7')).toBe(
      usdAssetId.toLowerCase(),
    )
  })

  test('generates, validates, parses, and calculates escrow service fees', () => {
    const event = escrowServiceEvent(generateSecretKey())
    const parsed = marketplace.escrowServices.parse(event)

    expect(event.kind).toBe(EscrowService)
    expect(marketplace.escrowServices.validate(event)).toBe(true)
    expect(parsed.d).toBe('evm-rsk-regtest')
    expect(parsed.content.type).toBe('EVM')
    expect(parsed.content.params.chainId).toBe(33)
    expect(parsed.content.params.contractBytecodeHash).toBe(bytecodeHash)
    expect(marketplace.escrowServices.calculateFee(parsed.content.fee, 1000n)).toBe(15n)
    expect(marketplace.escrowServices.calculateFee(parsed.content.fee, 20000n)).toBe(100n)
    expect(
      marketplace.escrowServices.calculateFee(parsed.content.fee, 1000n, usdAssetId.split(':')[1].toLowerCase()),
    ).toBe(21n)
  })

  test('generates and parses escrow service selection child events', () => {
    const sellerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const service = escrowServiceEvent(escrowSecretKey)
    const method = paymentMethodEvent(sellerSecretKey, getPublicKey(escrowSecretKey))
    const selection = sign(
      marketplace.escrowServiceSelections.template({
        tradeId: 'trade-1',
        listingAnchor: `${30402}:${getPublicKey(sellerSecretKey)}:villa-bali`,
        service,
        paymentMethod: method,
        createdAt,
      }),
    )
    const parsed = marketplace.escrowServiceSelections.parse(selection)

    expect(selection.kind).toBe(EscrowServiceSelection)
    expect(marketplace.escrowServiceSelections.validate(selection)).toBe(true)
    expect(parsed.tradeId).toBe('trade-1')
    expect(parsed.content.service.id).toBe(service.id)
    expect(parsed.content.paymentMethod.id).toBe(method.id)
  })
})

describe('marketplace orders and messages', () => {
  test('generates, validates, and parses orders linked to EVM payment events', () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const buyerTempSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerTempPubkey = getPublicKey(buyerTempSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const method = paymentMethodEvent(sellerSecretKey, escrowPubkey)
    const service = escrowServiceEvent(escrowSecretKey)
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
    const payload = JSON.stringify(tradeKeyAuthorization)
    const participantProof = {
      role: 'buyer',
      participantPubkey: buyerTempPubkey,
      recipientPubkey: sellerPubkey,
      scheme: 'nip44',
      payloadHash: marketplace.orders.hashParticipantProofPayload(payload),
      payload: 'encrypted-payload',
    }
    const order = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        ...terms,
        commitAuthorization,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerTempPubkey, role: 'buyer' },
          { pubkey: escrowPubkey, role: 'escrow' },
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
        listingAnchor,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerTempPubkey, role: 'buyer' },
          { pubkey: escrowPubkey, role: 'escrow' },
        ],
        refs: { orders: [order.id] },
        proof: marketplace.paymentProofForEvm({
          listing,
          txHash: `0x${'b'.repeat(64)}`,
          escrowService: service,
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
    expect(parsed.content.amount).toEqual({ value: '50000', denomination: 'BTC', decimals: 8 })
    expect(parsedPayment.refs.orders).toEqual([order.id])
    expect(parsedPayment.content.proof.paymentProof?.method).toBe('evm')
    expect((parsedPayment.content.proof.escrow?.escrowService as Event).id).toBe(service.id)
    expect(parsed.participants.map(tag => tag.role)).toEqual(['seller', 'buyer', 'escrow'])
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

  test('groups orders by trade id and canonical buyer seller escrow participants', () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-group-1'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' },
      { pubkey: buyerPubkey, role: 'buyer' },
      { pubkey: escrowPubkey, role: 'escrow' },
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
        listingAnchor,
        participants,
        refs: { orders: [buyerOrder.id] },
        proof: {
          listing,
          paymentProof: { method: 'evm', params: { txHash: `0x${'c'.repeat(64)}` } },
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const buyerAck = sign(
      marketplace.orders.paymentAckTemplate({
        tradeId,
        listingAnchor,
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
        listingAnchor,
        participants,
        refs: { payments: [payment.id] },
        status: 'accepted',
        createdAt: createdAt + 3,
      }),
      sellerSecretKey,
    )
    const reversedParticipants = [...participants].reverse()
    const expectedParticipants = [buyerPubkey, escrowPubkey, sellerPubkey].sort((a, b) => a.localeCompare(b))
    const expectedGroupId = marketplace.orders.groups.id(tradeId, participants)

    expect(marketplace.orders.groups.participants(buyerOrder)).toEqual(expectedParticipants)
    expect(marketplace.orders.groups.idForOrder(buyerOrder)).toBe(expectedGroupId)
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
    expect(group.escrowPubkeys).toEqual([escrowPubkey])
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

    expect(pubkeys).toHaveLength(403)
    expect(pubkeys[0]).toBe(pubkey)
    expect(pubkeys).toContain(marketplace.seed.deriveTradeMaterial(seed, { index: 200, role: 'buyer' }).tradePubkey)
    expect(pubkeys).toContain(
      marketplace.seed.deriveTradeMaterial(seed, { index: 200, role: 'buyer', extra: 'auction-bid' }).tradePubkey,
    )
    expect(filters).toHaveLength(3)
    expect(filters[0].authors).toBeUndefined()
    expect(filters[0]['#p']).toHaveLength(200)
    expect(filters[1]['#p']).toHaveLength(200)
    expect(filters[2]['#p']).toHaveLength(3)
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
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: buyerSeed,
      identity: { pubkey: buyerPubkey },
    })
    const buckets = await api.orders.groups.mine()

    expect(buckets.buyer).toHaveLength(1)
    expect(buckets.buyer[0].tradeId).toBe(trade.tradeId)
    expect(filters.some(filter => filter['#p']?.includes(trade.tradePubkey))).toBe(true)
  })

  test('runtime my order groups find arbiter-authored orders promoted from auction bids', async () => {
    const buyerPubkey = 'b'.repeat(64)
    const buyerSeed = '8'.repeat(64)
    const sellerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${sellerPubkey}:villa-bali`
    const trade = marketplace.seed.deriveTradeMaterial(buyerSeed, { index: 2, role: 'buyer', extra: 'auction-bid' })
    const order = sign(
      marketplace.orders.template({
        tradeId: trade.tradeId,
        listingAnchor,
        participants: [
          { pubkey: trade.tradePubkey, role: 'buyer' },
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: escrowPubkey, role: 'escrow' },
        ],
        createdAt,
      }),
      escrowSecretKey,
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
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: buyerSeed,
      identity: { pubkey: buyerPubkey },
    })
    const buckets = await api.orders.groups.mine()

    expect(buckets.buyer).toHaveLength(1)
    expect(buckets.buyer[0].tradeId).toBe(trade.tradeId)
    expect(filters.some(filter => filter['#p']?.includes(trade.tradePubkey))).toBe(true)
  })

  test('only allows participant-authored lifecycle events inside an order group', () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const outsiderSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-group-2'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' },
      { pubkey: buyerPubkey, role: 'buyer' },
      { pubkey: escrowPubkey, role: 'escrow' },
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
        listingAnchor,
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
        listingAnchor,
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
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const buyerOrder = sign(
      marketplace.orders.template({
        tradeId: 'trade-group-3',
        listingAnchor,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: escrowPubkey, role: 'escrow' },
        ],
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'trade-group-3',
        listingAnchor,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: escrowPubkey, role: 'escrow' },
        ],
        refs: { orders: [buyerOrder.id] },
        proof: {
          listing,
          paymentProof: { method: 'evm', params: { txHash: `0x${'d'.repeat(64)}` } },
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
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const buyerTempPubkey = getPublicKey(buyerTempSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
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
    const plaintext = JSON.stringify(authorization)
    const participantProof = {
      role: 'buyer',
      participantPubkey: buyerTempPubkey,
      recipientPubkey: sellerPubkey,
      scheme: 'nip44',
      payloadHash: marketplace.orders.hashParticipantProofPayload(plaintext),
      payload: 'encrypted-proof',
    }
    const order = sign(
      marketplace.orders.template({
        tradeId,
        listingAnchor,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerTempPubkey, role: 'buyer' },
          { pubkey: escrowPubkey, role: 'escrow' },
        ],
        participantProofs: [participantProof],
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
          expect(ciphertext).toBe('encrypted-proof')
          return plaintext
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
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const order = sign(
      marketplace.orders.template({
        tradeId: 'trade-group-5',
        listingAnchor,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: escrowPubkey, role: 'escrow' },
        ],
        createdAt,
      }),
      buyerSecretKey,
    )
    const payment = sign(
      marketplace.orders.paymentTemplate({
        tradeId: 'trade-group-5',
        listingAnchor,
        participants: [
          { pubkey: sellerPubkey, role: 'seller' },
          { pubkey: buyerPubkey, role: 'buyer' },
          { pubkey: escrowPubkey, role: 'escrow' },
        ],
        refs: { orders: [order.id] },
        proof: {
          listing,
          paymentProof: { method: 'evm', params: { txHash: `0x${'f'.repeat(64)}` } },
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
              method: request.proof.method,
              status: 'valid',
              amountMatched: true,
              assetMatched: true,
              recipientMatched: true,
              escrowMatched: true,
              confirmations: 3,
            }
          },
        },
      ],
    })

    expect(missingPolicy.payment.status).toBe('unverifiable')
    expect(missingPolicy.group.confirmedCommitted).toBe(false)
    expect(validated.payment.status).toBe('valid')
    expect(validated.group.stage).toBe('commit')
    expect(validated.group.confirmedCommitted).toBe(true)
    expect(validated.payment.confirmations).toBe(3)
  })

  test('payment nacks block committed status until settlement exists', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: escrowPubkey, role: 'escrow' as const },
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
        listingAnchor,
        participants,
        refs: { orders: [order.id] },
        proof: {
          listing,
          paymentProof: { method: 'evm', params: { txHash: `0x${'f'.repeat(64)}` } },
        },
        createdAt: createdAt + 1,
      }),
      buyerSecretKey,
    )
    const nack = sign(
      marketplace.orders.paymentNackTemplate({
        tradeId: 'trade-group-nack',
        listingAnchor,
        participants,
        refs: { payments: [payment.id] },
        status: 'rejected',
        message: 'Payment proof is inadequate',
        createdAt: createdAt + 2,
      }),
      escrowSecretKey,
    )

    const [group] = marketplace.orders.groups.group([order, payment, nack], {
      isPaymentValid: () => true,
    })

    expect(group.paymentNack?.event.id).toBe(nack.id)
    expect(group.stage).toBe('negotiate')
    expect(group.confirmedCommitted).toBe(false)
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
    const api = await marketplace.session(pool, ['wss://relay.example'], signer, {
      publish: event => published.push(event),
    })
    const discovery = await api.discoverHighWatermark()

    expect(api.identity.pubkey).toBe(identityPubkey)
    expect(api.seed.created).toBe(true)
    expect(api.seed.event).toEqual(published[0])
    expect(discovery.seed).toMatch(/^[a-f0-9]{64}$/)
    expect(discovery.nextUnusedIndex).toBe(0)
  })
})

describe('marketplace reviews and runtime facade', () => {
  test('generates, validates, and parses reviews', () => {
    const listingAnchor = `${30402}:${'a'.repeat(64)}:villa-bali`
    const orderGroupId = 'b'.repeat(64)
    const review = sign(
      marketplace.reviews.template({
        orderGroupId,
        tradeId: 'trade-1',
        listingAnchor,
        rating: 0.8,
        orderAnchor: `${MarketplaceOrder}:${'b'.repeat(64)}:${orderGroupId}`,
        reviewProof: ['review_proof', 'buyer', 'c'.repeat(64), '{}'],
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
  })

  test('auto-selects an implemented payment policy for pay stream', async () => {
    const sellerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const listing = listingEvent(sellerSecretKey)
    const method = paymentMethodEvent(sellerSecretKey, getPublicKey(escrowSecretKey))
    const service = escrowServiceEvent(escrowSecretKey)
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
        if (filter.kinds?.includes(EscrowService)) return [unsupportedService, service]
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
      subject: 'order',
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
          proof: {
            method: 'evm',
            params: { tradeId: intent.tradeId },
          },
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
      orderPolicies: [policy],
    })

    const result: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, {
      tradeId: 'trade-1',
      listingAnchor,
      amount: { value: '50000', denomination: 'BTC', decimals: 8 },
      createdAt,
    }, {
      accountIndex: 3,
    })) {
      result.push(state)
    }

    expect(result.map(state => state.type)).toEqual(['order_published', 'payment_published', 'completed'])
    expect(result[0]?.data).toEqual({ tradeId: 'trade-1', amount: '50000' })
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
    expect(published[0].pubkey).toBe(marketplace.seed.deriveTradeMaterial('4'.repeat(64), {
      index: 3,
      role: 'buyer',
    }).tradePubkey)
    expect(receivedSeed).toBe('4'.repeat(64))
    expect(receivedBytecodeHash).toBe(`0x${bytecodeHash}`)
  })

  test('uses an explicitly selected payment route for pay stream', async () => {
    const sellerSecretKey = generateSecretKey()
    const firstEscrowSecretKey = generateSecretKey()
    const secondEscrowSecretKey = generateSecretKey()
    const firstEscrowPubkey = getPublicKey(firstEscrowSecretKey)
    const secondEscrowPubkey = getPublicKey(secondEscrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const method = sign(
      marketplace.paymentMethod.template({
        trustedEscrowPubkeys: [firstEscrowPubkey, secondEscrowPubkey],
        supportedContractBytecodeHashes: [bytecodeHash],
        acceptedPaymentForms: [{ denomination: 'BTC', assetId: btcAssetId, appId: 'marketplace' }],
        evmAddress: sellerEvmAddress,
        createdAt,
      }),
      sellerSecretKey,
    )
    const firstService = escrowServiceEvent(firstEscrowSecretKey)
    const secondService = escrowServiceEvent(secondEscrowSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[]; authors?: string[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(EscrowService)) {
          if (filter.authors?.includes(firstEscrowPubkey)) return [firstService]
          if (filter.authors?.includes(secondEscrowPubkey)) return [secondService]
          return [firstService, secondService]
        }
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedEscrowPubkey: string | undefined
    const published: Event[] = []
    const policy: marketplace.MarketplaceOrderPolicy = {
      method: 'evm',
      id: 'evm-multi-escrow',
      subject: 'order',
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
        receivedEscrowPubkey = intent.participants.escrow.pubkey
        yield {
          type: 'paid' as const,
          proof: { method: 'evm', params: { tradeId: intent.tradeId } },
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '5'.repeat(64),
      publish: event => published.push(event),
      orderPolicies: [policy],
    })
    const order = {
      tradeId: 'trade-selected-route',
      listingAnchor,
      amount: { value: '50000', denomination: 'BTC', decimals: 8 },
      createdAt,
    }
    const routes = await api.paymentRoutes.forListing(listing, order)
    const selectedRoute = routes.find(route => route.escrowService.event.pubkey === secondEscrowPubkey)

    expect(selectedRoute).toBeDefined()
    const states: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, order, {
      accountIndex: 4,
      route: selectedRoute,
    })) {
      states.push(state)
    }

    expect(states.map(state => state.type)).toEqual(['order_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
    expect(receivedEscrowPubkey).toBe(secondEscrowPubkey)
  })

  test('routes cashu payments through the same pay stream interface', async () => {
    const sellerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const policyHash = 'cashu-escrow-script-v1'
    const assetId = 'cashu:https://mint.example:sat'
    const method = sign(
      marketplace.paymentMethod.template({
        trustedEscrowPubkeys: [escrowPubkey],
        supportedContractBytecodeHashes: [policyHash],
        acceptedPaymentForms: [{ denomination: 'SAT', assetId, appId: 'cashu' }],
        createdAt,
      }),
      sellerSecretKey,
    )
    const service = sign(
      marketplace.escrowServices.template({
        d: 'cashu-script-escrow',
        pubkey: escrowPubkey,
        type: 'CASHU',
        maxDuration: 1209600,
        fee: { ppm: 0, base: '0', min: '0', max: '0' },
        params: {
          policyHash,
          mints: ['https://mint.example'],
        },
        createdAt,
      }),
      escrowSecretKey,
    )
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(EscrowService)) return [service]
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
      subject: 'order',
      family: 'escrow',
      policies: () => [{ method: 'cashu', id: 'cashu-script', hash: policyHash }],
      assets: () => [{ method: 'cashu', assetId, denomination: 'SAT', decimals: 0, appId: 'cashu' }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedIntent = intent
        yield {
          type: 'paid' as const,
          proof: {
            method: 'cashu',
            params: {
              tokenCommitment: 'proof-commitment',
              policyHash,
            },
          },
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '6'.repeat(64),
      publish: event => published.push(event),
      orderPolicies: [cashuPolicy],
    })

    const result: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, {
      tradeId: 'cashu-trade-1',
      listingAnchor,
      amount: { value: '1000', denomination: 'SAT', decimals: 0 },
      createdAt,
    }, {
      accountIndex: 8,
    })) {
      result.push(state)
    }

    expect(receivedIntent?.method).toBe('cashu')
    expect(receivedIntent?.asset.assetId).toBe(assetId)
    expect(receivedIntent?.policy.hash).toBe(policyHash)
    expect(result.map(state => state.type)).toEqual(['order_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
  })

  test('routes BTC marketplace amounts through SAT Cashu assets', async () => {
    const sellerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const policyHash = 'cashu-escrow-script-v1'
    const assetId = 'cashu:https://mint.example:sat'
    const method = sign(
      marketplace.paymentMethod.template({
        trustedEscrowPubkeys: [escrowPubkey],
        supportedContractBytecodeHashes: [policyHash],
        acceptedPaymentForms: [{ denomination: 'SAT', assetId, appId: 'cashu' }],
        createdAt,
      }),
      sellerSecretKey,
    )
    const service = sign(
      marketplace.escrowServices.template({
        d: 'cashu-script-escrow',
        pubkey: escrowPubkey,
        type: 'CASHU',
        maxDuration: 1209600,
        fee: { ppm: 0, base: '0', min: '0', max: '0' },
        params: {
          policyHash,
          mints: ['https://mint.example'],
        },
        createdAt,
      }),
      escrowSecretKey,
    )
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(EscrowService)) return [service]
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
      subject: 'order',
      family: 'escrow',
      policies: () => [{ method: 'cashu', id: 'cashu-script', hash: policyHash }],
      assets: () => [{ method: 'cashu', assetId, denomination: 'SAT', decimals: 0, appId: 'cashu' }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedIntent = intent
        yield {
          type: 'paid' as const,
          proof: {
            method: 'cashu',
            params: {
              tokenCommitment: 'proof-commitment',
              policyHash,
            },
          },
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '6'.repeat(64),
      publish: event => published.push(event),
      orderPolicies: [cashuPolicy],
    })

    const routes = await api.paymentRoutes.forListing(listing, {
      tradeId: 'cashu-btc-route-1',
      listingAnchor,
      amount: { value: '100000', denomination: 'BTC', decimals: 8 },
      createdAt,
    })
    expect(routes).toHaveLength(1)
    expect(routes[0].asset.denomination).toBe('SAT')

    const result: marketplace.MarketplacePaymentState[] = []
    for await (const state of api.pay(listing, {
      tradeId: 'cashu-btc-trade-1',
      listingAnchor,
      amount: { value: '100000', denomination: 'BTC', decimals: 8 },
      createdAt,
    }, {
      accountIndex: 8,
    })) {
      result.push(state)
    }

    expect(receivedIntent?.amount).toEqual({ value: '100000', denomination: 'SAT', decimals: 0 })
    expect(result.map(state => state.type)).toEqual(['order_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceOrder, MarketplacePayment])
    expect(marketplace.orders.parse(published[0]).content.amount).toEqual({
      value: '100000',
      denomination: 'BTC',
      decimals: 8,
    })
  })

  test('routes marketplace auction bids through bid policies', async () => {
    const sellerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-cashu-1',
        listingAnchor,
        arbiterPubkey: escrowPubkey,
        currency: 'USD',
        decimals: 2,
        createdAt,
      }),
      sellerSecretKey,
    )
    const policyHash = 'cashu-auction-script-v1'
    const assetId = 'cashu:https://mint.example:usd'
    const method = sign(
      marketplace.paymentMethod.template({
        trustedEscrowPubkeys: [escrowPubkey],
        supportedContractBytecodeHashes: [policyHash],
        acceptedPaymentForms: [{ denomination: 'USD', assetId, appId: 'cashu' }],
        createdAt,
      }),
      sellerSecretKey,
    )
    const service = sign(
      marketplace.escrowServices.template({
        d: 'cashu-script-auction',
        pubkey: escrowPubkey,
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
      escrowSecretKey,
    )
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        if (filter.kinds?.includes(MarketplacePaymentMethod)) return [method]
        if (filter.kinds?.includes(EscrowService)) return [service]
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
      subject: 'bid',
      family: 'auction',
      policies: () => [{ method: 'cashu', id: 'cashu-auction-script', type: 'cashu:p2pk-auction-v1', hash: policyHash }],
      assets: () => [{ method: 'cashu', assetId, denomination: 'USD', decimals: 2, appId: 'cashu' }],
      async *pay(intent: marketplace.MarketplacePaymentIntent) {
        receivedIntent = intent
        yield {
          type: 'paid' as const,
          proof: {
            method: 'cashu',
            params: {
              tokenCommitment: 'auction-proof-commitment',
              policyType: 'cashu:p2pk-auction-v1',
              policyHash,
            },
          },
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '7'.repeat(64),
      publish: event => published.push(event),
      bidPolicies: [cashuBidPolicy],
    })

    const orderRoutes = await api.paymentRoutes.forListing(listing, {
      tradeId: 'cashu-bid-1',
      listingAnchor,
      amount: { value: '2500', denomination: 'USD', decimals: 2 },
      createdAt,
    })
    expect(orderRoutes).toHaveLength(0)

    const result: marketplace.MarketplaceAuctionBidState[] = []
    for await (const state of api.auctions.bid(listing, {
      amount: { value: '2500', denomination: 'USD', decimals: 2 },
      createdAt,
    }, {
      accountIndex: 12,
      auction,
    })) {
      result.push(state)
    }

    expect(receivedIntent?.method).toBe('cashu')
    expect(receivedIntent?.subject).toBe('bid')
    expect(receivedIntent?.asset.assetId).toBe(assetId)
    expect(receivedIntent?.policy.hash).toBe(policyHash)
    expect(result.map(state => state.type)).toEqual(['bid_published', 'payment_published', 'completed'])
    expect(published.map(event => event.kind)).toEqual([MarketplaceAuctionBid, MarketplacePayment])
    const parsedBid = marketplace.auctions.parseBid(published[0])
    const parsedPayment = marketplace.orders.parsePayment(published[1])
    expect(parsedBid.auctionAnchor).toBe(marketplace.auctions.address(auction))
    expect(parsedBid.listingAnchor).toBe(listingAnchor)
    expect(parsedPayment.content.purpose).toBe('auction_bid')
    expect(parsedPayment.refs.auctionBids).toEqual([published[0].id])
    expect(receivedIntent?.settlementId).toBe(parsedBid.bidId)
  })

  test('groups auction bids with their payment lifecycle events', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-groups-1',
        listingAnchor,
        arbiterPubkey: escrowPubkey,
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
      { pubkey: escrowPubkey, role: 'escrow' as const },
    ]
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-groups-bid-1',
        bidId: 'auction-groups-bid-1',
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
        listingAnchor: auctionAnchor,
        anchorMarker: 'auction',
        participants,
        refs: { auctionBids: [bid.id] },
        purpose: 'auction_bid',
        extraTags: [['a', listingAnchor, '', 'listing']],
        proof: {
          listing,
          paymentProof: { method: 'evm', params: { txHash: `0x${'9'.repeat(64)}` } },
        },
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const ack = sign(
      marketplace.orders.paymentAckTemplate({
        tradeId: 'auction-groups-bid-1',
        orderGroupId: 'auction-groups-bid-1',
        listingAnchor: auctionAnchor,
        anchorMarker: 'auction',
        participants,
        refs: { payments: [payment.id] },
        status: 'accepted',
        createdAt: createdAt + 3,
      }),
      escrowSecretKey,
    )
    const settlement = sign(
      marketplace.orders.paymentSettlementTemplate({
        tradeId: 'auction-groups-bid-1',
        orderGroupId: 'auction-groups-bid-1',
        listingAnchor: auctionAnchor,
        anchorMarker: 'auction',
        participants,
        refs: { auctionBids: [bid.id], payments: [payment.id] },
        method: 'evm',
        action: 'auction_promote',
        data: { proof: { method: 'evm', params: { txHash: `0x${'8'.repeat(64)}` } } },
        createdAt: createdAt + 4,
      }),
      escrowSecretKey,
    )

    const groups = marketplace.auctionBidGroups.group([bid, payment, ack, settlement])
    expect(groups).toHaveLength(1)
    expect(groups[0].id).toBe('auction-groups-bid-1')
    expect(groups[0].auctionAnchor).toBe(auctionAnchor)
    expect(groups[0].payment?.event.id).toBe(payment.id)
    expect(groups[0].paymentAck?.event.id).toBe(ack.id)
    expect(groups[0].settlement?.event.id).toBe(settlement.id)
    expect(groups[0].stage).toBe('promoted')

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
  })

  test('settles an auction by promoting the highest valid bid and refunding the rest', async () => {
    const sellerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const lowBuyerSecretKey = generateSecretKey()
    const winningBuyerSecretKey = generateSecretKey()
    const invalidBuyerSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auctionId = 'auction-settle-1'
    const auction = sign(
      marketplace.auctions.template({
        d: auctionId,
        listingAnchor,
        arbiterPubkey: escrowPubkey,
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
    const policyId = 'evm-auction-settle'
    const published: Event[] = []

    function bidInput(input: { secretKey: Uint8Array; amount: string; valid: boolean; tx: string; offset: number }) {
      const buyerPubkey = getPublicKey(input.secretKey)
      const participants = [
        { pubkey: sellerPubkey, role: 'seller' as const },
        { pubkey: buyerPubkey, role: 'buyer' as const },
        { pubkey: escrowPubkey, role: 'escrow' as const },
      ]
      const participantProof = {
        role: 'buyer',
        participantPubkey: buyerPubkey,
        recipientPubkey: escrowPubkey,
        scheme: 'nip44',
        payloadHash: marketplace.orders.hashParticipantProofPayload(`proof-${buyerPubkey}`),
        payload: `proof-${buyerPubkey}`,
      }
      const tradeId = `${auctionId}:bid:${input.offset}`
      const bid = sign(
        marketplace.auctions.bidTemplate({
          tradeId,
          bidId: tradeId,
          auctionAnchor,
          listingAnchor,
          participants,
          participantProofs: [participantProof],
          amount: { value: input.amount, denomination: 'USD', decimals: 2 },
          targetOrder: { quantity: 1 },
          createdAt: createdAt + input.offset,
        }),
        input.secretKey,
      )
      const payment = sign(
        marketplace.orders.paymentTemplate({
          tradeId,
          orderGroupId: tradeId,
          listingAnchor: auctionAnchor,
          anchorMarker: 'auction',
          participants,
          refs: { auctionBids: [bid.id] },
          purpose: 'auction_bid',
          extraTags: [['a', listingAnchor, '', 'listing']],
          proof: {
            listing,
            paymentProof: {
              method: 'evm',
              params: {
                policyId,
                subject: 'bid',
                txHash: input.tx,
                valid: input.valid,
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
              },
            },
          },
          createdAt: createdAt + input.offset + 1,
        }),
        input.secretKey,
      )
      return { bid: marketplace.auctions.parseBid(bid), payment: marketplace.orders.parsePayment(payment) }
    }

    const lowBid = bidInput({
      secretKey: lowBuyerSecretKey,
      amount: '10000',
      valid: true,
      tx: `0x${'1'.repeat(64)}`,
      offset: 1,
    })
    const winningBid = bidInput({
      secretKey: winningBuyerSecretKey,
      amount: '25000',
      valid: true,
      tx: `0x${'2'.repeat(64)}`,
      offset: 3,
    })
    const preStartHighBid = bidInput({
      secretKey: generateSecretKey(),
      amount: '75000',
      valid: true,
      tx: `0x${'5'.repeat(64)}`,
      offset: -1,
    })
    const invalidHighBid = bidInput({
      secretKey: invalidBuyerSecretKey,
      amount: '50000',
      valid: false,
      tx: `0x${'3'.repeat(64)}`,
      offset: 5,
    })
    const bidPolicy: marketplace.MarketplaceBidPolicy = {
      method: 'evm',
      id: policyId,
      subject: 'bid',
      family: 'auction',
      policies: () => [{ method: 'evm', id: policyId }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
        const valid = request.proof.params.valid !== false
        return {
          method: request.method,
          status: valid ? 'valid' : 'invalid',
          amountMatched: valid,
          assetMatched: valid,
          recipientMatched: valid,
          escrowMatched: valid,
          proofEventId: request.proof.params.txHash as string,
          ...(valid ? {} : { error: 'bid lock was rejected' }),
        }
      },
      async refundPayment(intent) {
        return {
          proof: {
            method: 'evm',
            params: {
              ...intent.proof.params,
              action: 'auction_refund',
              refundPercent: intent.refundPercent,
              txHash: `0x${'f'.repeat(64)}`,
            },
          },
          data: { refundPercent: intent.refundPercent },
        }
      },
      async recyclePayment(intent) {
        return {
          proof: {
            method: 'evm',
            params: {
              ...intent.proof.params,
              action: 'auction_promote',
              policyType: 'evm:multi-escrow',
              subject: 'order',
              tradeId: intent.targetTradeId,
              settlementId: intent.targetOrderGroupId,
              unlockAt: intent.targetUnlockAt,
              txHash: `0x${'4'.repeat(64)}`,
              recycleArgs: intent.recycleArgs,
            },
          },
          data: {
            targetTradeId: intent.targetTradeId,
            targetOrderGroupId: intent.targetOrderGroupId,
          },
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
        seed: '9'.repeat(64),
        identity: { pubkey: escrowPubkey },
        signer: {
          async getPublicKey() {
            return escrowPubkey
          },
          async nip44Encrypt(_pubkey: string, plaintext: string) {
            return plaintext
          },
          async nip44Decrypt(_pubkey: string, ciphertext: string) {
            return ciphertext
          },
          async signEvent(template: EventTemplate) {
            return sign(template, escrowSecretKey)
          },
        },
        publish: event => published.push(event),
        bidPolicies: [bidPolicy],
      },
    )

    const states: marketplace.MarketplaceAuctionSettlementState[] = []
    for await (const state of api.auctions.settle({
      auctionId,
      auctionAnchor,
      listingAnchor,
      arbiterPubkey: escrowPubkey,
      currency: 'USD',
      decimals: 2,
      startAt: createdAt,
      endAt: createdAt + 3600,
      startingBid: '10000',
      bids: [lowBid, winningBid, preStartHighBid, invalidHighBid],
      targetTradeId: 'auction-settle-1-order',
      targetUnlockAt: createdAt + 3600,
    })) {
      states.push(state)
    }

    const completed = states.find(state => state.type === 'completed')
    expect(completed?.winner?.bid.bidId).toBe(winningBid.bid.bidId)
    expect(states.some(state =>
      state.type === 'bid_validated' &&
      state.bid.bid.bidId === preStartHighBid.bid.bidId &&
      state.bid.validation.error === 'Bid was created before the auction started',
    )).toBe(true)
    expect(published).toHaveLength(8)
    expect(published.some(event => event.kind === MarketplaceAuctionComplete)).toBe(true)

    const settlementEvents = published.filter(event => event.kind === MarketplacePaymentSettlement)
    const settlements = settlementEvents.map(event => marketplace.orders.parsePaymentSettlement(event))
    const promoted = settlements.filter(settlement => settlement.content.action === 'auction_promote')
    const refunded = settlements.filter(settlement => settlement.content.action === 'auction_refund')
    expect(promoted).toHaveLength(1)
    expect(refunded).toHaveLength(3)
    expect(promoted[0].orderGroupId).toBe(winningBid.bid.bidId)
    expect(promoted[0].content.data?.winnerBidId).toBe(winningBid.bid.bidId)
    expect(promoted[0].content.data?.targetTradeId).toBe('auction-settle-1-order')
    expect((promoted[0].content.data?.proof as { params?: Record<string, unknown> }).params?.action).toBe('auction_promote')
    expect(refunded.map(settlement => settlement.orderGroupId).sort()).toEqual([
      invalidHighBid.bid.bidId,
      lowBid.bid.bidId,
      preStartHighBid.bid.bidId,
    ].sort())
    expect(refunded.every(settlement =>
      (settlement.content.data?.proof as { params?: Record<string, unknown> }).params?.refundPercent === 100,
    )).toBe(true)

    const promotedOrderEvent = published.find(event => event.kind === MarketplaceOrder)
    const promotedPaymentEvent = published.find(event => event.kind === MarketplacePayment)
    const promotedAckEvent = published.find(event => event.kind === MarketplacePaymentAck)
    expect(promotedOrderEvent).toBeDefined()
    expect(promotedPaymentEvent).toBeDefined()
    expect(promotedAckEvent).toBeDefined()

    const promotedOrder = marketplace.orders.parse(promotedOrderEvent!)
    const winningBuyerPubkey = winningBid.bid.participants.find(participant => participant.role === 'buyer')?.pubkey
    if (!winningBuyerPubkey) throw new Error('Expected winning bid buyer pubkey')
    expect(promotedOrder.tradeId).toBe('auction-settle-1-order')
    expect(promotedOrder.content.recipient).toBe(winningBuyerPubkey)
    expect(promotedOrder.participantProofs).toHaveLength(1)
    expect(promotedOrder.participantProofs[0]?.participantPubkey).toBe(winningBuyerPubkey)

    const promotedPayment = marketplace.orders.parsePayment(promotedPaymentEvent!)
    expect(promotedPayment.tradeId).toBe('auction-settle-1-order')
    expect(promotedPayment.content.purpose).toBe('order_payment')
    expect(promotedPayment.content.proof.paymentProof?.params.subject).toBe('order')
    expect(promotedPayment.content.proof.paymentProof?.params.action).toBe('auction_promote')
    expect(promotedPayment.refs.orders).toEqual([promotedOrder.event.id])

    const promotedAck = marketplace.orders.parsePaymentAck(promotedAckEvent!)
    expect(promotedAck.tradeId).toBe('auction-settle-1-order')
    expect(promotedAck.content.status).toBe('accepted')
    expect(promotedAck.refs.payments).toEqual([promotedPayment.event.id])
  })

  test('escrow runtime validates seen payments and publishes an ack', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-escrow-start'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: escrowPubkey, role: 'escrow' as const },
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
        listingAnchor,
        participants,
        refs: { orders: [order.id] },
        proof: {
          listing,
          paymentProof: { method: 'evm', params: { txHash: `0x${'d'.repeat(64)}` } },
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
    const states: marketplace.MarketplaceEscrowStartEvent[] = []
    const policy: marketplace.MarketplaceOrderPolicy = {
      method: 'evm',
      id: 'evm-escrow',
      subject: 'order',
      family: 'escrow',
      policies: () => [{ method: 'evm', id: 'evm-escrow' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
        return {
          method: request.method,
          status: 'valid',
          proofEventId: payment.id,
          amountMatched: true,
          assetMatched: true,
          recipientMatched: true,
          escrowMatched: true,
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '7'.repeat(64),
      identity: { pubkey: escrowPubkey },
      signer: {
        async getPublicKey() {
          return escrowPubkey
        },
        async nip44Encrypt(_pubkey: string, plaintext: string) {
          return plaintext
        },
        async nip44Decrypt(_pubkey: string, ciphertext: string) {
          return ciphertext
        },
        async signEvent(template: EventTemplate) {
          return sign(template, escrowSecretKey)
        },
      },
      publish: event => published.push(event),
      orderPolicies: [policy],
    })

    api.escrow.start({
      onstate: state => {
        states.push(state)
      },
    })
    subscriptions[0].onevent(order)
    subscriptions[0].onevent(payment)
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(published).toHaveLength(1)
    expect(published[0].kind).toBe(MarketplacePaymentAck)
    expect(published[0].pubkey).toBe(escrowPubkey)
    expect(hasTag(published[0], ['e', payment.id, '', 'payment'])).toBe(true)
    expect(states.some(state => state.type === 'payment_validated')).toBe(true)
    expect(states.some(state => state.type === 'payment_ack_published')).toBe(true)
  })

  test('arbitration runtime validates auction bid payments and publishes an ack', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-runtime-ack',
        listingAnchor,
        arbiterPubkey: escrowPubkey,
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
      { pubkey: escrowPubkey, role: 'escrow' as const },
    ]
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-runtime-ack-bid',
        bidId: 'auction-runtime-ack-bid',
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
        listingAnchor: auctionAnchor,
        anchorMarker: 'auction',
        participants,
        refs: { auctionBids: [bid.id] },
        purpose: 'auction_bid',
        extraTags: [['a', listingAnchor, '', 'listing']],
        proof: {
          listing,
          paymentProof: {
            method: 'evm',
            params: {
              policyId: 'evm-auction-runtime',
              subject: 'bid',
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
            },
          },
        },
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const group = marketplace.auctionBidGroups.reduce([bid, payment])
    const published: Event[] = []
    const states: marketplace.MarketplaceEscrowStartEvent[] = []
    let validationRequest: marketplace.MarketplacePaymentValidationRequest | undefined
    const bidPolicy: marketplace.MarketplaceBidPolicy = {
      method: 'evm',
      id: 'evm-auction-runtime',
      subject: 'bid',
      family: 'auction',
      policies: () => [{ method: 'evm', id: 'evm-auction-runtime' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
        validationRequest = request
        return {
          method: request.method,
          status: 'valid',
          proofEventId: payment.id,
          amountMatched: true,
          assetMatched: true,
          recipientMatched: true,
          escrowMatched: true,
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
        identity: { pubkey: escrowPubkey },
        signer: {
          async getPublicKey() {
            return escrowPubkey
          },
          async nip44Encrypt(_pubkey: string, plaintext: string) {
            return plaintext
          },
          async nip44Decrypt(_pubkey: string, ciphertext: string) {
            return ciphertext
          },
          async signEvent(template: EventTemplate) {
            return sign(template, escrowSecretKey)
          },
        },
        publish: event => published.push(event),
        bidPolicies: [bidPolicy],
      },
    )

    const runtime = api.escrow.start({
      orders: false,
      auctions: false,
      now: createdAt + 120,
      onstate: state => {
        states.push(state)
      },
    })
    await runtime.processAuctionBidGroup(parsedAuction, group)

    expect(validationRequest?.expected.listingAnchor).toBe(auctionAnchor)
    expect(validationRequest?.expected.amount).toEqual({ value: '12000', denomination: 'USD', decimals: 2 })
    expect(validationRequest?.expected.participants?.escrow?.pubkey).toBe(escrowPubkey)
    expect(published).toHaveLength(1)
    expect(published[0].kind).toBe(MarketplacePaymentAck)
    const ack = marketplace.orders.parsePaymentAck(published[0])
    expect(ack.listingAnchor).toBe(auctionAnchor)
    expect(ack.refs.auctionBids).toEqual([bid.id])
    expect(ack.refs.payments).toEqual([payment.id])
    expect(states.some(state => state.type === 'auction_bid_payment_validated')).toBe(true)
    expect(states.some(state => state.type === 'auction_bid_payment_ack_published')).toBe(true)
  })

  test('arbitration runtime rejects auction bid payments without recycle covenant params', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auction = sign(
      marketplace.auctions.template({
        d: 'auction-runtime-nack',
        listingAnchor,
        arbiterPubkey: escrowPubkey,
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
      { pubkey: escrowPubkey, role: 'escrow' as const },
    ]
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-runtime-nack-bid',
        bidId: 'auction-runtime-nack-bid',
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
        listingAnchor: auctionAnchor,
        anchorMarker: 'auction',
        participants,
        refs: { auctionBids: [bid.id] },
        purpose: 'auction_bid',
        extraTags: [['a', listingAnchor, '', 'listing']],
        proof: {
          listing,
          paymentProof: {
            method: 'evm',
            params: {
              policyId: 'evm-auction-runtime',
              subject: 'bid',
              txHash: `0x${'c'.repeat(64)}`,
            },
          },
        },
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const group = marketplace.auctionBidGroups.reduce([bid, payment])
    const published: Event[] = []
    const states: marketplace.MarketplaceEscrowStartEvent[] = []
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
        identity: { pubkey: escrowPubkey },
        signer: {
          async getPublicKey() {
            return escrowPubkey
          },
          async nip44Encrypt(_pubkey: string, plaintext: string) {
            return plaintext
          },
          async nip44Decrypt(_pubkey: string, ciphertext: string) {
            return ciphertext
          },
          async signEvent(template: EventTemplate) {
            return sign(template, escrowSecretKey)
          },
        },
        publish: event => published.push(event),
        bidPolicies: [],
      },
    )

    const runtime = api.escrow.start({
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
    expect(nack.listingAnchor).toBe(auctionAnchor)
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
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const auctionId = 'auction-runtime-settle'
    const auction = sign(
      marketplace.auctions.template({
        d: auctionId,
        listingAnchor,
        arbiterPubkey: escrowPubkey,
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
      { pubkey: escrowPubkey, role: 'escrow' as const },
    ]
    const bid = sign(
      marketplace.auctions.bidTemplate({
        tradeId: 'auction-runtime-settle-bid',
        bidId: 'auction-runtime-settle-bid',
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
        listingAnchor: auctionAnchor,
        anchorMarker: 'auction',
        participants,
        refs: { auctionBids: [bid.id] },
        purpose: 'auction_bid',
        extraTags: [['a', listingAnchor, '', 'listing']],
        proof: {
          listing,
          paymentProof: {
            method: 'evm',
            params: {
              policyId: 'evm-auction-runtime-settle',
              subject: 'bid',
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
            },
          },
        },
        createdAt: createdAt + 2,
      }),
      buyerSecretKey,
    )
    const published: Event[] = []
    const states: marketplace.MarketplaceEscrowStartEvent[] = []
    const pool = {
      async querySync(_relays: string[], filter: { kinds?: number[] }): Promise<Event[]> {
        const kinds = filter.kinds ?? []
        if (kinds.includes(MarketplaceAuctionBid) && kinds.includes(MarketplacePayment)) return [bid, payment]
        if (kinds.includes(MarketplaceAuctionBid)) return [bid]
        if (kinds.includes(MarketplacePayment)) return [payment]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    const bidPolicy: marketplace.MarketplaceBidPolicy = {
      method: 'evm',
      id: 'evm-auction-runtime-settle',
      subject: 'bid',
      family: 'auction',
      policies: () => [{ method: 'evm', id: 'evm-auction-runtime-settle' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async validatePayment(request: marketplace.MarketplacePaymentValidationRequest) {
        return {
          method: request.method,
          status: 'valid',
          proofEventId: payment.id,
          amountMatched: true,
          assetMatched: true,
          recipientMatched: true,
          escrowMatched: true,
        }
      },
      async refundPayment() {
        throw new Error('single-bid runtime settlement should not refund')
      },
      async recyclePayment(intent) {
        return {
          proof: {
            method: 'evm',
            params: {
              ...intent.proof.params,
              action: 'auction_promote',
              subject: 'order',
              tradeId: intent.targetTradeId,
              settlementId: intent.targetOrderGroupId,
              txHash: `0x${'f'.repeat(64)}`,
              recycleArgs: intent.recycleArgs,
            },
          },
        }
      },
    }
    const api = marketplace.bind(pool, ['wss://relay.example'], {
      seed: '8'.repeat(64),
      identity: { pubkey: escrowPubkey },
      signer: {
        async getPublicKey() {
          return escrowPubkey
        },
        async nip44Encrypt(_pubkey: string, plaintext: string) {
          return plaintext
        },
        async nip44Decrypt(_pubkey: string, ciphertext: string) {
          return ciphertext
        },
        async signEvent(template: EventTemplate) {
          return sign(template, escrowSecretKey)
        },
      },
      publish: event => published.push(event),
      bidPolicies: [bidPolicy],
    })

    const runtime = api.escrow.start({
      orders: false,
      auctions: false,
      now: createdAt + 10,
      auctionSettlement: {
        targetTradeId: 'auction-runtime-settle-order',
        targetUnlockAt: createdAt + 3600,
      },
      onstate: state => {
        states.push(state)
      },
    })
    await runtime.processAuction(parsedAuction)
    for (let i = 0; i < 10 && !states.some(state => state.type === 'auction_settlement_completed'); i += 1) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    expect(states.some(state => state.type === 'auction_scheduled')).toBe(true)
    expect(states.some(state => state.type === 'auction_settlement_completed')).toBe(true)
    expect(published.some(event => event.kind === MarketplaceAuctionComplete)).toBe(true)
    expect(published.some(event => event.kind === MarketplacePaymentSettlement)).toBe(true)
    const promotedOrder = published.find(event => event.kind === MarketplaceOrder)
    const promotedPayment = published.find(event => event.kind === MarketplacePayment && event.pubkey === escrowPubkey)
    expect(promotedOrder).toBeDefined()
    expect(promotedPayment).toBeDefined()
    expect(marketplace.orders.parse(promotedOrder!).tradeId).toBe('auction-runtime-settle-order')
    expect(marketplace.orders.parsePayment(promotedPayment!).content.purpose).toBe('order_payment')
  })

  test('escrow arbitration routes to the matching policy and publishes a settlement', async () => {
    const sellerSecretKey = generateSecretKey()
    const buyerSecretKey = generateSecretKey()
    const escrowSecretKey = generateSecretKey()
    const sellerPubkey = getPublicKey(sellerSecretKey)
    const buyerPubkey = getPublicKey(buyerSecretKey)
    const escrowPubkey = getPublicKey(escrowSecretKey)
    const listing = listingEvent(sellerSecretKey)
    const listingAnchor = `${listing.kind}:${listing.pubkey}:villa-bali`
    const tradeId = 'trade-arbitrate'
    const participants = [
      { pubkey: sellerPubkey, role: 'seller' as const },
      { pubkey: buyerPubkey, role: 'buyer' as const },
      { pubkey: escrowPubkey, role: 'escrow' as const },
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
        listingAnchor,
        participants,
        refs: { orders: [order.id] },
        proof: {
          listing,
          paymentProof: { method: 'evm', params: { txHash: `0x${'e'.repeat(64)}` } },
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
      subject: 'order',
      family: 'escrow',
      policies: () => [{ method: 'evm', id: 'evm-escrow' }],
      assets: () => [],
      async *pay() {
        yield { type: 'completed' as const }
      },
      async *arbitrate(intent: marketplace.MarketplaceEscrowArbitrationIntent) {
        receivedAction = intent.action
        yield {
          type: 'settlement_ready' as const,
          proof: {
            method: 'evm',
            params: { txHash: `0x${'f'.repeat(64)}` },
          },
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
        identity: { pubkey: escrowPubkey },
        signer: {
          async getPublicKey() {
            return escrowPubkey
          },
          async nip44Encrypt(_pubkey: string, plaintext: string) {
            return plaintext
          },
          async nip44Decrypt(_pubkey: string, ciphertext: string) {
            return ciphertext
          },
          async signEvent(template: EventTemplate) {
            return sign(template, escrowSecretKey)
          },
        },
        publish: event => published.push(event),
        orderPolicies: [policy],
      },
    )

    const states: marketplace.MarketplaceEscrowArbitrationRuntimeState[] = []
    for await (const state of api.escrow.arbitrate({ group, action: 'split' })) {
      states.push(state)
    }

    expect(receivedAction).toBe('split')
    expect(published).toHaveLength(1)
    expect(published[0].kind).toBe(MarketplacePaymentSettlement)
    expect(published[0].pubkey).toBe(escrowPubkey)
    expect(hasTag(published[0], ['e', payment.id, '', 'payment'])).toBe(true)
    expect(states.some(state => state.type === 'settlement_published')).toBe(true)
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
      subject: 'order',
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
      subject: 'order',
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
      orderPolicies: [evmPolicy, cashuPolicy],
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
})
