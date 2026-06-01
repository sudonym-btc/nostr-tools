import { describe, expect, test } from 'bun:test'

import type { Event, EventTemplate } from './core.ts'
import {
  EscrowMethod,
  EscrowService,
  EscrowServiceSelection,
  MarketplaceOrder,
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentSettlement,
  MarketplaceReview,
  MarketplaceSeed,
  StructuredMessage,
  isRegularKind,
} from './kinds.ts'
import * as marketplace from './marketplace.ts'
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

function escrowMethodEvent(sellerSecretKey: Uint8Array, escrowPubkey: string): Event {
  return sign(
    marketplace.escrowMethods.template({
      trustedEscrowPubkeys: [escrowPubkey],
      supportedContractBytecodeHashes: [bytecodeHash],
      acceptedPaymentForms: [
        { denomination: 'BTC', assetId: btcAssetId, appId: 'hostr' },
        { denomination: 'USD', assetId: usdAssetId, appId: 'hostr' },
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
  test('generates, validates, and parses escrow methods', () => {
    const sellerSecretKey = generateSecretKey()
    const escrowPubkey = getPublicKey(generateSecretKey())
    const event = escrowMethodEvent(sellerSecretKey, escrowPubkey)
    const parsed = marketplace.escrowMethods.parse(event)

    expect(event.kind).toBe(EscrowMethod)
    expect(marketplace.escrowMethods.validate(event)).toBe(true)
    expect(parsed.trustedEscrowPubkeys).toEqual([escrowPubkey])
    expect(parsed.supportedContractBytecodeHashes).toEqual([bytecodeHash])
    expect(parsed.evmAddress).toBe(sellerEvmAddress)
    expect(parsed.evmAddressProof).toBe('0xproof')
    expect(parsed.acceptedPaymentForms).toEqual([
      { denomination: 'BTC', assetId: btcAssetId, appId: 'hostr' },
      { denomination: 'USD', assetId: usdAssetId, appId: 'hostr' },
    ])
    expect(marketplace.escrowMethods.canonicalAssetId('33:0xDAC17F958D2EE523A2206206994597C13D831EC7')).toBe(
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
    const method = escrowMethodEvent(sellerSecretKey, getPublicKey(escrowSecretKey))
    const selection = sign(
      marketplace.escrowServiceSelections.template({
        tradeId: 'trade-1',
        listingAnchor: `${30402}:${getPublicKey(sellerSecretKey)}:villa-bali`,
        service,
        sellerMethods: method,
        createdAt,
      }),
    )
    const parsed = marketplace.escrowServiceSelections.parse(selection)

    expect(selection.kind).toBe(EscrowServiceSelection)
    expect(marketplace.escrowServiceSelections.validate(selection)).toBe(true)
    expect(parsed.tradeId).toBe('trade-1')
    expect(parsed.content.service.id).toBe(service.id)
    expect(parsed.content.sellerMethods.id).toBe(method.id)
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
    const method = escrowMethodEvent(sellerSecretKey, escrowPubkey)
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
          sellerEscrowMethod: method,
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

    expect(pubkeys).toHaveLength(202)
    expect(pubkeys[0]).toBe(pubkey)
    expect(pubkeys).toContain(marketplace.seed.deriveTradeMaterial(seed, { index: 200, role: 'buyer' }).tradePubkey)
    expect(filters).toHaveLength(4)
    expect(filters[0].authors).toHaveLength(200)
    expect(filters[1].authors).toHaveLength(2)
    expect(filters[2]['#p']).toHaveLength(200)
    expect(filters[3]['#p']).toHaveLength(2)
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
    const api = marketplace.createMarketplace({
      pool,
      relays: ['wss://relay.example'],
      seed: buyerSeed,
      identity: { pubkey: buyerPubkey },
    })
    const buckets = await api.orders.groups.mine()

    expect(buckets.buyer).toHaveLength(1)
    expect(buckets.buyer[0].tradeId).toBe(trade.tradeId)
    expect(filters.some(filter => filter.authors?.includes(trade.tradePubkey))).toBe(true)
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

  test('fetchEvent only considers the first seed result', async () => {
    const identitySecretKey = generateSecretKey()
    const identityPubkey = getPublicKey(identitySecretKey)
    const validEvent = marketplace.seed.createEvent({
      identitySecretKey,
      identityPubkey,
      seed: '3'.repeat(64),
      createdAt,
      nonce: new Uint8Array(32).fill(9),
    })
    const invalidFirst = sign({
      kind: MarketplaceSeed,
      created_at: createdAt,
      content: '',
      tags: [],
    })
    const pool = {
      async querySync(): Promise<Event[]> {
        return [invalidFirst, validEvent]
      },
    }

    expect(await marketplace.seed.fetchEvent(pool, ['wss://relay.example'], identityPubkey)).toBeNull()
  })

  test('init creates the marketplace seed and stores it on the runtime', async () => {
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
    const api = await marketplace.init({
      pool,
      relays: ['wss://relay.example'],
      identity: {
        signer: {
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
        },
      },
      publish: event => published.push(event),
    })
    const discovery = await api.discoverHighWatermark()

    expect(api.identity.pubkey).toBe(identityPubkey)
    expect(api.seed).toMatch(/^[a-f0-9]{64}$/)
    expect(api.seedCreated).toBe(true)
    expect(api.seedEvent).toEqual(published[0])
    expect(discovery.seed).toBe(api.seed)
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
    const method = escrowMethodEvent(sellerSecretKey, getPublicKey(escrowSecretKey))
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
        if (filter.kinds?.includes(EscrowMethod)) return [method]
        if (filter.kinds?.includes(EscrowService)) return [unsupportedService, service]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedSeed: string | undefined
    let receivedBytecodeHash: string | undefined
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
    const api = marketplace.createMarketplace({
      pool,
      relays: ['wss://relay.example'],
      seed: '4'.repeat(64),
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

    expect(result[0]?.type).toBe('order_ready')
    expect(result[0]?.data).toEqual({ tradeId: 'trade-1', amount: '50000' })
    expect(result[0]?.orderDraft?.kind).toBe(MarketplaceOrder)
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
      marketplace.escrowMethods.template({
        trustedEscrowPubkeys: [firstEscrowPubkey, secondEscrowPubkey],
        supportedContractBytecodeHashes: [bytecodeHash],
        acceptedPaymentForms: [{ denomination: 'BTC', assetId: btcAssetId, appId: 'hostr' }],
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
        if (filter.kinds?.includes(EscrowMethod)) return [method]
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
        appId: 'hostr',
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
    const api = marketplace.createMarketplace({
      pool,
      relays: ['wss://relay.example'],
      seed: '5'.repeat(64),
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

    expect(states[0]?.type).toBe('order_ready')
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
      marketplace.escrowMethods.template({
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
        if (filter.kinds?.includes(EscrowMethod)) return [method]
        if (filter.kinds?.includes(EscrowService)) return [service]
        return []
      },
      async get(): Promise<Event | null> {
        return null
      },
    }
    let receivedIntent: marketplace.MarketplacePaymentIntent | undefined
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
    const api = marketplace.createMarketplace({
      pool,
      relays: ['wss://relay.example'],
      seed: '6'.repeat(64),
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
    expect(result[0]?.type).toBe('order_ready')
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
    const api = marketplace.createMarketplace({
      pool,
      relays: ['wss://relay.example'],
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
    const api = marketplace.createMarketplace({
      pool: {
        async querySync(): Promise<Event[]> {
          return []
        },
        async get(): Promise<Event | null> {
          return null
        },
      },
      relays: ['wss://relay.example'],
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
    })

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

    const api = marketplace.createMarketplace({
      pool,
      relays: ['wss://relay.example'],
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
