import type {
  ParsedOrderPayment,
  ParsedOrderPaymentAck,
  ParsedOrderPaymentNack,
  ParsedOrderPaymentSettlement,
} from './order-lifecycle.ts'
import type { MarketplacePaymentValidationResult } from './payment-validation.ts'
import {
  MarketplaceStream,
  StreamClosed,
  StreamEose,
  StreamError,
  StreamIdle,
  StreamLive,
  StreamQuerying,
  type MarketplaceStreamOptions,
  type ReplayStreamSubscription,
  type StreamState,
} from './stream.ts'

export type PaymentGroupEvent =
  | ParsedOrderPayment
  | ParsedOrderPaymentAck
  | ParsedOrderPaymentNack
  | ParsedOrderPaymentSettlement

export type PaymentGroupStage =
  | 'pending'
  | 'paid'
  | 'acked'
  | 'nacked'
  | 'conflicted'
  | 'settled'

export type PaymentGroup = {
  id: string
  paymentIds: string[]
  payments: ParsedOrderPayment[]
  paymentAcks: ParsedOrderPaymentAck[]
  paymentNacks: ParsedOrderPaymentNack[]
  settlements: ParsedOrderPaymentSettlement[]
  events: PaymentGroupEvent[]
  stage: PaymentGroupStage
  updatedAt: number
  complete: boolean
  orderGroupId?: string
  tradeId?: string
  listingAnchor?: string
  payment?: ParsedOrderPayment
  paymentAck?: ParsedOrderPaymentAck
  paymentNack?: ParsedOrderPaymentNack
  settlement?: ParsedOrderPaymentSettlement
}

export type ParsedPaymentGroup = PaymentGroup

export type PaymentGroupSnapshot = PaymentGroup[]

export type MarketplacePaymentGroupStream =
  MarketplaceStream<PaymentGroup, PaymentGroupSnapshot>

export type ValidationStatus = 'valid' | 'invalid' | 'indeterminate'

export type PaymentValidationBasis =
  | 'ack'
  | 'nack'
  | 'settlement'
  | 'conflict'
  | 'missing_payment'
  | 'untrusted_attestation'
  | 'waiting'
  | 'driver'

export type Valid<T> = {
  status: 'valid'
  value: T
  basis: PaymentValidationBasis
}

export type Invalid<T> = {
  status: 'invalid'
  value: T
  basis: PaymentValidationBasis
}

export type Indeterminate<T> = {
  status: 'indeterminate'
  value: T
  basis: PaymentValidationBasis
}

export type Validation<T> = Valid<T> | Invalid<T> | Indeterminate<T>

export type PaymentDriverValidationStatus =
  | 'not_requested'
  | 'pending'
  | 'valid'
  | 'invalid'
  | 'inconclusive'
  | 'unverifiable'
  | 'error'

export type PaymentDriverValidation = {
  forced: boolean
  status: PaymentDriverValidationStatus
  key?: string
  result?: MarketplacePaymentValidationResult
  error?: string
}

export type PaymentValidation = Validation<ParsedPaymentGroup> & {
  readonly hasAck: boolean
  readonly hasNack: boolean
  readonly hasSettlement: boolean
  readonly hasTrustedAck: boolean
  readonly hasTrustedNack: boolean
  readonly driverValidation: PaymentDriverValidation
}

export type PaymentValidationSnapshot = PaymentValidation[]

export type MarketplacePaymentValidationStream =
  MarketplaceStream<PaymentValidation, PaymentValidationSnapshot>

export type PaymentGroupValidationOptions = {
  sellerPubkeys?: Iterable<string | undefined>
  arbiterPubkeys?: Iterable<string | undefined>
  isTrustedAck?: (ack: ParsedOrderPaymentAck, group: ParsedPaymentGroup) => boolean
  isTrustedNack?: (nack: ParsedOrderPaymentNack, group: ParsedPaymentGroup) => boolean
  forceDriverValidation?: (group: ParsedPaymentGroup) => boolean
}

export type PaymentGroupSource<T> =
  Pick<MarketplaceStream<T, unknown>, 'events' | 'status'>

export type PaymentGroupStreamSources = {
  payments?: PaymentGroupSource<ParsedOrderPayment>
  acks?: PaymentGroupSource<ParsedOrderPaymentAck>
  nacks?: PaymentGroupSource<ParsedOrderPaymentNack>
  settlements?: PaymentGroupSource<ParsedOrderPaymentSettlement>
}

export type PaymentGroupValidationStreamOptions =
  Pick<MarketplaceStreamOptions<PaymentValidationSnapshot>, 'eventReplayLimit' | 'snapshotReplayLimit'> &
  PaymentGroupValidationOptions

export type PaymentGroupStreamOptions =
  Pick<MarketplaceStreamOptions<PaymentGroupSnapshot>, 'eventReplayLimit' | 'snapshotReplayLimit'>

type SourceEntry<T> = {
  name: keyof PaymentGroupStreamSources
  stream: PaymentGroupSource<T>
}

const contextGroupPrefix = 'context:'

function unique(values: Iterable<string | undefined>): string[] {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function eventOrder(left: PaymentGroupEvent, right: PaymentGroupEvent): number {
  return right.event.created_at - left.event.created_at || right.event.id.localeCompare(left.event.id)
}

function sortParsed<T extends PaymentGroupEvent>(values: Iterable<T>): T[] {
  return [...values].sort(eventOrder)
}

function latest<T extends PaymentGroupEvent>(values: T[]): T | undefined {
  return values[0]
}

function latestValidation(left: PaymentValidation, right: PaymentValidation): number {
  return right.value.updatedAt - left.value.updatedAt || right.value.id.localeCompare(left.value.id)
}

function eventPubkey(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('pubkey' in value)) return undefined
  const pubkey = (value as { pubkey?: unknown }).pubkey
  return typeof pubkey === 'string' ? pubkey : undefined
}

function contextGroupId(event: PaymentGroupEvent): string {
  return `${contextGroupPrefix}${event.listingAnchor}:${event.orderGroupId}:${event.tradeId}`
}

function groupIdsForLinkedEvent(
  event: ParsedOrderPaymentAck | ParsedOrderPaymentNack | ParsedOrderPaymentSettlement,
): string[] {
  const paymentIds = unique(event.refs.payments)
  return paymentIds.length > 0 ? paymentIds : [contextGroupId(event)]
}

function stageForGroup(input: {
  payment?: ParsedOrderPayment
  paymentAck?: ParsedOrderPaymentAck
  paymentNack?: ParsedOrderPaymentNack
  settlement?: ParsedOrderPaymentSettlement
}): PaymentGroupStage {
  if (input.settlement) return 'settled'
  if (input.paymentAck && input.paymentNack) return 'conflicted'
  if (input.paymentNack) return 'nacked'
  if (input.paymentAck) return 'acked'
  if (input.payment) return 'paid'
  return 'pending'
}

function metadataEvent(group: {
  payment?: ParsedOrderPayment
  events: PaymentGroupEvent[]
}): PaymentGroupEvent | undefined {
  return group.payment ?? group.events[0]
}

function snapshotOrder(left: PaymentGroup, right: PaymentGroup): number {
  return right.updatedAt - left.updatedAt || right.id.localeCompare(left.id)
}

function paymentGroupSellerPubkeys(group: ParsedPaymentGroup, options: PaymentGroupValidationOptions): string[] {
  const proof = group.payment?.content.proof
  return unique([
    ...(options.sellerPubkeys ?? []),
    ...(group.payment?.participants ?? [])
      .filter(participant => participant.role === 'seller')
      .map(participant => participant.pubkey),
    eventPubkey(proof?.arbitration?.paymentMethod),
  ])
}

function paymentGroupArbiterPubkeys(group: ParsedPaymentGroup, options: PaymentGroupValidationOptions): string[] {
  const proof = group.payment?.content.proof
  return unique([
    ...(options.arbiterPubkeys ?? []),
    ...(group.payment?.participants ?? [])
      .filter(participant => participant.role === 'arbiter')
      .map(participant => participant.pubkey),
    eventPubkey(proof?.arbitration?.arbitrationService),
  ])
}

function paymentGroupTrustedActorPubkeys(
  group: ParsedPaymentGroup,
  options: PaymentGroupValidationOptions,
): Set<string> {
  return new Set([
    ...paymentGroupSellerPubkeys(group, options),
    ...paymentGroupArbiterPubkeys(group, options),
  ])
}

function trustedPaymentAcks(
  group: ParsedPaymentGroup,
  options: PaymentGroupValidationOptions,
): ParsedOrderPaymentAck[] {
  const trusted = paymentGroupTrustedActorPubkeys(group, options)
  return group.paymentAcks.filter(ack =>
    options.isTrustedAck?.(ack, group) ?? trusted.has(ack.event.pubkey),
  )
}

function trustedPaymentNacks(
  group: ParsedPaymentGroup,
  options: PaymentGroupValidationOptions,
): ParsedOrderPaymentNack[] {
  const trusted = paymentGroupTrustedActorPubkeys(group, options)
  return group.paymentNacks.filter(nack =>
    options.isTrustedNack?.(nack, group) ?? trusted.has(nack.event.pubkey),
  )
}

function validationBasis(input: {
  group: ParsedPaymentGroup
  trustedAcks: ParsedOrderPaymentAck[]
  trustedNacks: ParsedOrderPaymentNack[]
}): Pick<Validation<ParsedPaymentGroup>, 'status' | 'basis'> {
  if (!input.group.payment) return { status: 'indeterminate', basis: 'missing_payment' }
  if (input.trustedAcks.length > 0 && input.trustedNacks.length > 0) {
    return { status: 'indeterminate', basis: 'conflict' }
  }
  if (input.trustedNacks.length > 0) return { status: 'invalid', basis: 'nack' }
  if (input.trustedAcks.length > 0) return { status: 'valid', basis: 'ack' }
  if (input.group.settlements.length > 0) return { status: 'valid', basis: 'settlement' }
  if (input.group.paymentAcks.length > 0 || input.group.paymentNacks.length > 0) {
    return { status: 'indeterminate', basis: 'untrusted_attestation' }
  }
  return { status: 'indeterminate', basis: 'waiting' }
}

function sourceEntries(sources: PaymentGroupStreamSources): Array<SourceEntry<any>> {
  return [
    sources.payments ? { name: 'payments', stream: sources.payments } : undefined,
    sources.acks ? { name: 'acks', stream: sources.acks } : undefined,
    sources.nacks ? { name: 'nacks', stream: sources.nacks } : undefined,
    sources.settlements ? { name: 'settlements', stream: sources.settlements } : undefined,
  ].filter((entry): entry is SourceEntry<any> => entry !== undefined)
}

function statusAt(statuses: Iterable<StreamState>): number {
  return Math.max(...[...statuses].map(status => status.at), Date.now())
}

function statusEventCount(statuses: Iterable<StreamState>): number {
  return [...statuses].reduce((sum, status) => {
    if (status instanceof StreamLive || status instanceof StreamEose) return sum + status.eventCount
    return sum
  }, 0)
}

function combineStatuses(statuses: StreamState[], expectedCount: number): StreamState {
  if (statuses.length < expectedCount) return new StreamIdle()
  const at = statusAt(statuses)
  const error = statuses.find((status): status is StreamError => status instanceof StreamError)
  if (error) return new StreamError(error.error, { at })
  const closed = statuses.filter((status): status is StreamClosed => status instanceof StreamClosed)
  if (closed.length === expectedCount) {
    return new StreamClosed({
      reasons: closed.flatMap(status => status.reasons),
      at,
    })
  }
  const querying = statuses.filter((status): status is StreamQuerying => status instanceof StreamQuerying)
  if (querying.length > 0) {
    return new StreamQuerying({
      requestCount: querying.reduce((sum, status) => sum + status.requestCount, 0),
      at,
    })
  }
  if (statuses.every(status => status instanceof StreamLive)) {
    const sinceValues = statuses
      .filter((status): status is StreamLive => status instanceof StreamLive)
      .map(status => status.since)
      .filter((since): since is number => since !== undefined)
    return new StreamLive({
      eventCount: statusEventCount(statuses),
      ...(sinceValues.length > 0 ? { since: Math.min(...sinceValues) } : {}),
      at,
    })
  }
  if (statuses.every(status => status instanceof StreamEose || status instanceof StreamLive)) {
    return new StreamEose({
      eventCount: statusEventCount(statuses),
      at,
    })
  }
  return new StreamIdle(at)
}

function statusSignature(status: StreamState | undefined): string {
  if (!status) return 'none'
  if (status instanceof StreamError) return `error:${status.error.message}`
  if (status instanceof StreamClosed) return `closed:${status.reasons.join('|')}`
  if (status instanceof StreamQuerying) return `querying:${status.requestCount}`
  if (status instanceof StreamLive) return `live:${status.eventCount}:${status.since ?? ''}`
  if (status instanceof StreamEose) return `eose:${status.eventCount}`
  return status.constructor.name
}

export class PaymentGroupReducer {
  private readonly groupIds = new Set<string>()
  private readonly payments = new Map<string, ParsedOrderPayment>()
  private readonly paymentAcks = new Map<string, ParsedOrderPaymentAck>()
  private readonly paymentNacks = new Map<string, ParsedOrderPaymentNack>()
  private readonly settlements = new Map<string, ParsedOrderPaymentSettlement>()
  private readonly ackIdsByGroupId = new Map<string, Set<string>>()
  private readonly nackIdsByGroupId = new Map<string, Set<string>>()
  private readonly settlementIdsByGroupId = new Map<string, Set<string>>()

  addPayment(payment: ParsedOrderPayment): PaymentGroup {
    const id = payment.event.id
    this.payments.set(id, payment)
    this.groupIds.add(id)
    return this.group(id)
  }

  addPaymentAck(ack: ParsedOrderPaymentAck): PaymentGroup[] {
    this.paymentAcks.set(ack.event.id, ack)
    return groupIdsForLinkedEvent(ack).map(id => {
      this.index(this.ackIdsByGroupId, id, ack.event.id)
      return this.group(id)
    })
  }

  addPaymentNack(nack: ParsedOrderPaymentNack): PaymentGroup[] {
    this.paymentNacks.set(nack.event.id, nack)
    return groupIdsForLinkedEvent(nack).map(id => {
      this.index(this.nackIdsByGroupId, id, nack.event.id)
      return this.group(id)
    })
  }

  addSettlement(settlement: ParsedOrderPaymentSettlement): PaymentGroup[] {
    this.settlements.set(settlement.event.id, settlement)
    return groupIdsForLinkedEvent(settlement).map(id => {
      this.index(this.settlementIdsByGroupId, id, settlement.event.id)
      return this.group(id)
    })
  }

  group(id: string): PaymentGroup {
    this.groupIds.add(id)
    const payments = sortParsed(this.payments.get(id) ? [this.payments.get(id)!] : [])
    const paymentAcks = sortParsed(this.valuesFor(this.paymentAcks, this.ackIdsByGroupId.get(id)))
    const paymentNacks = sortParsed(this.valuesFor(this.paymentNacks, this.nackIdsByGroupId.get(id)))
    const settlements = sortParsed(this.valuesFor(this.settlements, this.settlementIdsByGroupId.get(id)))
    const events = sortParsed([...payments, ...paymentAcks, ...paymentNacks, ...settlements])
    const payment = latest(payments)
    const paymentAck = latest(paymentAcks)
    const paymentNack = latest(paymentNacks)
    const settlement = latest(settlements)
    const metadata = metadataEvent({ payment, events })
    const updatedAt = events[0]?.event.created_at ?? 0
    return {
      id,
      paymentIds: payment ? [payment.event.id] : id.startsWith(contextGroupPrefix) ? [] : [id],
      payments,
      paymentAcks,
      paymentNacks,
      settlements,
      events,
      stage: stageForGroup({ payment, paymentAck, paymentNack, settlement }),
      updatedAt,
      complete: payment !== undefined,
      ...(metadata ? {
        orderGroupId: metadata.orderGroupId,
        tradeId: metadata.tradeId,
        listingAnchor: metadata.listingAnchor,
      } : {}),
      ...(payment ? { payment } : {}),
      ...(paymentAck ? { paymentAck } : {}),
      ...(paymentNack ? { paymentNack } : {}),
      ...(settlement ? { settlement } : {}),
    }
  }

  snapshot(): PaymentGroupSnapshot {
    return [...this.groupIds].map(id => this.group(id)).sort(snapshotOrder)
  }

  private index(index: Map<string, Set<string>>, groupId: string, eventId: string): void {
    this.groupIds.add(groupId)
    const ids = index.get(groupId) ?? new Set<string>()
    ids.add(eventId)
    index.set(groupId, ids)
  }

  private valuesFor<T>(values: Map<string, T>, ids: Set<string> | undefined): T[] {
    if (!ids) return []
    return [...ids].map(id => values.get(id)).filter((value): value is T => value !== undefined)
  }
}

export function groupPaymentStreams(
  sources: PaymentGroupStreamSources,
  options: PaymentGroupStreamOptions = {},
): MarketplacePaymentGroupStream {
  const entries = sourceEntries(sources)
  if (entries.length === 0) throw new Error('Payment group stream requires at least one source stream')

  const reducer = new PaymentGroupReducer()
  const subscriptions: ReplayStreamSubscription[] = []
  const stream = new MarketplaceStream<PaymentGroup, PaymentGroupSnapshot>({
    eventReplayLimit: options.eventReplayLimit,
    snapshotReplayLimit: options.snapshotReplayLimit,
    onClose: () => {
      for (const subscription of subscriptions) subscription.unsubscribe()
    },
  })
  const statuses = new Map<keyof PaymentGroupStreamSources, StreamState>()
  let lastStatusSignature = statusSignature(stream.currentStatus)

  function emitStatus(): void {
    const combined = combineStatuses([...statuses.values()], entries.length)
    const signature = statusSignature(combined)
    if (signature === lastStatusSignature) return
    lastStatusSignature = signature
    stream.emitStatus(combined)
  }

  function emitGroups(groups: PaymentGroup[]): void {
    for (const group of groups) stream.emitEvent(group)
    stream.emitSnapshot(reducer.snapshot())
  }

  for (const entry of entries) {
    subscriptions.push(entry.stream.status.subscribe(status => {
      statuses.set(entry.name, status)
      emitStatus()
    }))
  }

  if (sources.payments) {
    subscriptions.push(sources.payments.events.subscribe(payment => {
      emitGroups([reducer.addPayment(payment)])
    }))
  }
  if (sources.acks) {
    subscriptions.push(sources.acks.events.subscribe(ack => {
      emitGroups(reducer.addPaymentAck(ack))
    }))
  }
  if (sources.nacks) {
    subscriptions.push(sources.nacks.events.subscribe(nack => {
      emitGroups(reducer.addPaymentNack(nack))
    }))
  }
  if (sources.settlements) {
    subscriptions.push(sources.settlements.events.subscribe(settlement => {
      emitGroups(reducer.addSettlement(settlement))
    }))
  }

  stream.emitSnapshot(reducer.snapshot())
  return stream
}

export function validatePaymentGroup(
  group: ParsedPaymentGroup,
  options: PaymentGroupValidationOptions = {},
): PaymentValidation {
  const trustedAcks = trustedPaymentAcks(group, options)
  const trustedNacks = trustedPaymentNacks(group, options)
  const result = validationBasis({ group, trustedAcks, trustedNacks })
  const driverValidation: PaymentDriverValidation = {
    forced: options.forceDriverValidation?.(group) === true,
    status: 'not_requested',
  }
  return {
    ...result,
    value: group,
    basis: result.basis,
    driverValidation,
    get hasAck() {
      return group.paymentAcks.length > 0
    },
    get hasNack() {
      return group.paymentNacks.length > 0
    },
    get hasSettlement() {
      return group.settlements.length > 0
    },
    get hasTrustedAck() {
      return trustedPaymentAcks(group, options).length > 0
    },
    get hasTrustedNack() {
      return trustedPaymentNacks(group, options).length > 0
    },
  }
}

function validationSnapshotOrder(left: PaymentValidation, right: PaymentValidation): number {
  return latestValidation(left, right)
}

export function validatePaymentGroupStream(
  groups: MarketplacePaymentGroupStream,
  options: PaymentGroupValidationStreamOptions = {},
): MarketplacePaymentValidationStream {
  const validations = new Map<string, PaymentValidation>()
  const subscriptions: ReplayStreamSubscription[] = []
  const stream = new MarketplaceStream<PaymentValidation, PaymentValidationSnapshot>({
    status: groups.status,
    eventReplayLimit: options.eventReplayLimit,
    snapshotReplayLimit: options.snapshotReplayLimit,
    emitClosedOnClose: false,
    onClose: () => {
      for (const subscription of subscriptions) subscription.unsubscribe()
    },
  })

  function emitSnapshot(): void {
    stream.emitSnapshot([...validations.values()].sort(validationSnapshotOrder))
  }

  subscriptions.push(groups.events.subscribe(group => {
    const validation = validatePaymentGroup(group, options)
    validations.set(group.id, validation)
    stream.emitEvent(validation)
    emitSnapshot()
  }))

  if (groups.currentSnapshot) {
    for (const group of groups.currentSnapshot) {
      validations.set(group.id, validatePaymentGroup(group, options))
    }
    emitSnapshot()
  }

  return stream
}

export const payments = {
  group: groupPaymentStreams,
  validateGroup: validatePaymentGroup,
  validateGroups: validatePaymentGroupStream,
  reducer: PaymentGroupReducer,
}
