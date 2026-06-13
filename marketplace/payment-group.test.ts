import { describe, expect, test } from 'bun:test'

import type { Event } from '../core.ts'
import {
  MarketplacePayment,
  MarketplacePaymentAck,
  MarketplacePaymentNack,
  MarketplacePaymentSettlement,
} from '../kinds.ts'
import {
  type PaymentLifecycleRefs,
  type ParsedPayment,
  type ParsedPaymentAck,
  type ParsedPaymentNack,
  type ParsedPaymentSettlement,
} from './payment-lifecycle.ts'
import { payments, type PaymentGroup, type PaymentValidation } from './payment-group.ts'
import { MarketplaceStream, StreamEose, StreamLive, StreamQuerying } from './stream.ts'

const buyerPubkey = 'a'.repeat(64)
const sellerPubkey = '1'.repeat(64)
const arbiterPubkey = '2'.repeat(64)
const outsiderPubkey = '3'.repeat(64)
const sig = 'b'.repeat(128)

function event(kind: number, id: string, createdAt: number, author = buyerPubkey): Event {
  return {
    kind,
    id,
    pubkey: author,
    sig,
    created_at: createdAt,
    content: '',
    tags: [],
  }
}

function refs(input: Partial<PaymentLifecycleRefs> = {}): PaymentLifecycleRefs {
  return {
    orders: [],
    auctionBids: [],
    auctionCompletes: [],
    payments: [],
    paymentAcks: [],
    paymentNacks: [],
    settlements: [],
    cancels: [],
    ...input,
  }
}

function linked(input: Partial<PaymentLifecycleRefs> = {}) {
  return {
    orderGroupId: 'order-group',
    tradeId: 'trade',
    anchors: {
      all: [{ value: 'listing-anchor', marker: 'listing' as const }],
      listing: 'listing-anchor',
    },
    participants: [
      { pubkey: buyerPubkey, role: 'buyer' },
      { pubkey: sellerPubkey, role: 'seller' },
      { pubkey: arbiterPubkey, role: 'arbiter' },
    ],
    refs: refs(input),
  }
}

function payment(id: string, createdAt: number): ParsedPayment {
  return {
    event: event(MarketplacePayment, id, createdAt),
    ...linked(),
    paymentProofKeys: [],
    content: {},
  }
}

function ack(
  id: string,
  paymentId: string,
  createdAt: number,
  author = sellerPubkey,
): ParsedPaymentAck {
  return {
    event: event(MarketplacePaymentAck, id, createdAt, author),
    ...linked({ payments: [paymentId] }),
    content: { status: 'accepted' },
  }
}

function nack(
  id: string,
  paymentId: string,
  createdAt: number,
  author = sellerPubkey,
): ParsedPaymentNack {
  return {
    event: event(MarketplacePaymentNack, id, createdAt, author),
    ...linked({ payments: [paymentId] }),
    content: { status: 'rejected' },
  }
}

function settlement(id: string, paymentId: string, createdAt: number): ParsedPaymentSettlement {
  return {
    event: event(MarketplacePaymentSettlement, id, createdAt),
    ...linked({ payments: [paymentId] }),
    content: { method: 'evm', action: 'release' },
  }
}

describe('payment group streams', () => {
  test('groups out-of-order payment lifecycle events by payment reference', () => {
    const paymentStream = new MarketplaceStream<ParsedPayment>()
    const ackStream = new MarketplaceStream<ParsedPaymentAck>()
    const nackStream = new MarketplaceStream<ParsedPaymentNack>()
    const settlementStream = new MarketplaceStream<ParsedPaymentSettlement>()
    const grouped = payments.group({
      payments: paymentStream,
      acks: ackStream,
      nacks: nackStream,
      settlements: settlementStream,
    })
    const groups: PaymentGroup[] = []
    grouped.events.subscribe(group => groups.push(group))

    ackStream.emitEvent(ack('ack-1', 'payment-1', 20))
    expect(grouped.currentSnapshot?.[0]).toMatchObject({
      id: 'payment-1',
      paymentIds: ['payment-1'],
      stage: 'acked',
      complete: false,
    })

    paymentStream.emitEvent(payment('payment-1', 10))
    expect(grouped.currentSnapshot).toHaveLength(1)
    expect(grouped.currentSnapshot?.[0]).toMatchObject({
      id: 'payment-1',
      stage: 'acked',
      complete: true,
      payment: { event: { id: 'payment-1' } },
      paymentAck: { event: { id: 'ack-1' } },
    })

    nackStream.emitEvent(nack('nack-1', 'payment-1', 30))
    expect(grouped.currentSnapshot?.[0].stage).toBe('conflicted')
    expect(grouped.currentSnapshot?.[0].paymentNacks.map(item => item.event.id)).toEqual(['nack-1'])

    settlementStream.emitEvent(settlement('settlement-1', 'payment-1', 40))
    expect(grouped.currentSnapshot?.[0]).toMatchObject({
      id: 'payment-1',
      stage: 'settled',
      settlement: { event: { id: 'settlement-1' } },
    })
    expect(groups.map(group => group.stage)).toEqual(['acked', 'acked', 'conflicted', 'settled'])
  })

  test('combines source stream status', () => {
    const paymentStream = new MarketplaceStream<ParsedPayment>()
    const ackStream = new MarketplaceStream<ParsedPaymentAck>()
    const grouped = payments.group({ payments: paymentStream, acks: ackStream })

    paymentStream.markQuerying({ requestCount: 1 })
    ackStream.markQuerying({ requestCount: 2 })
    expect(grouped.currentStatus).toBeInstanceOf(StreamQuerying)
    expect((grouped.currentStatus as StreamQuerying).requestCount).toBe(3)

    paymentStream.markEose({ eventCount: 1 })
    ackStream.markEose({ eventCount: 2 })
    expect(grouped.currentStatus).toBeInstanceOf(StreamEose)
    expect((grouped.currentStatus as StreamEose).eventCount).toBe(3)

    paymentStream.markLive({ eventCount: 2, since: 100 })
    expect(grouped.currentStatus).toBeInstanceOf(StreamEose)

    ackStream.markLive({ eventCount: 3, since: 90 })
    expect(grouped.currentStatus).toBeInstanceOf(StreamLive)
    expect((grouped.currentStatus as StreamLive).eventCount).toBe(5)
    expect((grouped.currentStatus as StreamLive).since).toBe(90)
  })

  test('validates payment groups with trusted seller or arbiter attestations', () => {
    const reducer = new payments.reducer()
    const paid = reducer.addPayment(payment('payment-1', 10))
    const untrusted = reducer.addPaymentAck(ack('ack-1', 'payment-1', 20, outsiderPubkey))[0]
    const untrustedValidation = payments.validateGroup(untrusted, {
      forceDriverValidation: group => group.id === 'payment-1',
    })

    expect(untrustedValidation).toMatchObject({
      status: 'indeterminate',
      basis: 'untrusted_attestation',
      driverValidation: { forced: true, status: 'not_requested' },
    })
    expect(untrustedValidation.hasAck).toBe(true)
    expect(untrustedValidation.hasTrustedAck).toBe(false)
    expect(typeof Object.getOwnPropertyDescriptor(untrustedValidation, 'hasAck')?.get).toBe('function')

    const trustedAck = reducer.addPaymentAck(ack('ack-2', 'payment-1', 30, sellerPubkey))[0]
    const trustedAckValidation = payments.validateGroup(trustedAck)
    expect(trustedAckValidation).toMatchObject({
      status: 'valid',
      basis: 'ack',
    })
    expect(trustedAckValidation.hasAck).toBe(true)
    expect(trustedAckValidation.hasTrustedAck).toBe(true)

    const trustedNackOnlyReducer = new payments.reducer()
    trustedNackOnlyReducer.addPayment(payment('payment-2', 10))
    const trustedNack = trustedNackOnlyReducer.addPaymentNack(nack('nack-1', 'payment-2', 20, arbiterPubkey))[0]
    const trustedNackValidation = payments.validateGroup(trustedNack)
    expect(trustedNackValidation).toMatchObject({
      status: 'invalid',
      basis: 'nack',
    })
    expect(trustedNackValidation.hasNack).toBe(true)
    expect(trustedNackValidation.hasTrustedNack).toBe(true)

    const conflict = reducer.addPaymentNack(nack('nack-2', 'payment-1', 40, arbiterPubkey))[0]
    expect(payments.validateGroup(conflict)).toMatchObject({
      status: 'indeterminate',
      basis: 'conflict',
    })
    expect(paid.stage).toBe('paid')
  })

  test('streams payment group validation updates without driver validation', () => {
    const paymentStream = new MarketplaceStream<ParsedPayment>()
    const ackStream = new MarketplaceStream<ParsedPaymentAck>()
    const grouped = payments.group({ payments: paymentStream, acks: ackStream })
    const validated = payments.validateGroups(grouped)
    const validations: PaymentValidation[] = []
    validated.events.subscribe(validation => validations.push(validation))

    paymentStream.emitEvent(payment('payment-1', 10))
    expect(validations.at(-1)).toMatchObject({
      status: 'indeterminate',
      basis: 'waiting',
      driverValidation: { forced: false, status: 'not_requested' },
    })

    ackStream.emitEvent(ack('ack-1', 'payment-1', 20, sellerPubkey))
    expect(validations.at(-1)).toMatchObject({
      status: 'valid',
      basis: 'ack',
    })
    expect(validated.currentSnapshot?.[0].hasAck).toBe(true)
    expect(validated.currentSnapshot?.[0].driverValidation.status).toBe('not_requested')
  })
})
