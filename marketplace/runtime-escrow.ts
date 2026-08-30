import type { ParsedAuctionBidGroup } from './auction-bid-group.ts'
import type { MarketplaceDriverOrderSettlementAction } from '@sudonym-btc/marketplace-driver-interface'
import type { ParsedOrderGroup } from './order-group.ts'
import type { ParsedPayment } from './payment-lifecycle.ts'
import { validateOrderGroupPayments } from './order-group.ts'
import { resolvePaymentAmount } from './payment-amount.ts'
import { paymentProofParamsDecryptor, resolvePaymentProof } from './payment-proof.ts'
import { isPaymentValidationAccepted } from './payment-validation.ts'
import {
  paymentPolicies,
  paymentValidationItemForGroup,
  paymentValidationPolicies,
  policyForPayment,
  policyName,
} from './runtime-common.ts'
import {
  MarketplaceStream,
  StreamClosed,
  StreamEose,
  StreamError,
  StreamLive,
  type ReplayStreamSubscription,
  type StreamState,
} from './stream.ts'
import type {
  MarketplaceClient,
  MarketplaceEscrowAction,
  MarketplaceEscrowActionUnavailable,
  MarketplaceEscrowApi,
  MarketplaceEscrowAuctionBidRecord,
  MarketplaceEscrowExecuteOptions,
  MarketplaceEscrowOrderRecord,
  MarketplaceEscrowRecord,
  MarketplaceEscrowRecordsQuery,
  MarketplacePaymentPolicyImplementation,
  MarketplacePaymentValidationItem,
  MarketplaceOrderPolicy,
  MarketplaceRuntimeOptions,
  MarketplaceSessionDriversApi,
} from './runtime-types.ts'

const executableActions = new Set<MarketplaceEscrowAction>(['release', 'refund'])
const orderSettlementActions = new Set<MarketplaceDriverOrderSettlementAction>([
  'release',
  'refund',
  'split',
  'timeout_claim',
])

function unavailable(
  code: MarketplaceEscrowActionUnavailable['code'],
  message: string,
): MarketplaceEscrowActionUnavailable {
  return { code, message }
}

function latestEventTime(events: Array<{ event: { created_at: number } }>): number {
  return events.reduce((latest, entry) => Math.max(latest, entry.event.created_at), 0)
}

function sortedRecords(records: MarketplaceEscrowRecord[]): MarketplaceEscrowRecord[] {
  return records.sort((left, right) =>
    right.updatedAt - left.updatedAt ||
    left.kind.localeCompare(right.kind) ||
    left.id.localeCompare(right.id),
  )
}

function policyCanSettle(policy: MarketplacePaymentPolicyImplementation): boolean {
  return policy.purpose === 'order' &&
    policy.family === 'escrow' &&
    (typeof policy.settlePayment === 'function' || typeof policy.arbitrate === 'function')
}

export function declaredMarketplaceOrderSettlementActions(
  policy: MarketplacePaymentPolicyImplementation,
): MarketplaceDriverOrderSettlementAction[] {
  if (policy.purpose !== 'order' || !policyCanSettle(policy)) return []
  return [...new Set(policy.settlementActions ?? [])]
    .filter((action): action is MarketplaceDriverOrderSettlementAction =>
      orderSettlementActions.has(action as MarketplaceDriverOrderSettlementAction),
    )
}

export async function authorizedMarketplaceOrderSettlementActions(options: {
  opts: MarketplaceRuntimeOptions
  policy: MarketplacePaymentPolicyImplementation
  item: MarketplacePaymentValidationItem
  payment: ParsedPayment
  now?: number
}): Promise<MarketplaceDriverOrderSettlementAction[]> {
  const supported = declaredMarketplaceOrderSettlementActions(options.policy)
  if (options.policy.purpose !== 'order' || options.policy.family !== 'escrow') return []
  const policy = options.policy as MarketplaceOrderPolicy
  if (supported.length === 0 || !policy.settlementActionsForPayment) return supported
  const permitted = await policy.settlementActionsForPayment({
    driver: options.item.proof.driver,
    proof: options.item.proof,
    ...(options.item.expected ? { expected: options.item.expected } : {}),
    decryptParams: paymentProofParamsDecryptor({
      keys: options.payment.paymentProofKeys,
      signer: options.opts.signer,
      signerPubkey: options.opts.identity?.pubkey,
    }),
    ...(options.now !== undefined ? { now: options.now } : {}),
  })
  const available = new Set(permitted)
  return supported.filter(action => available.has(action))
}

export function declaredMarketplaceEscrowActions(
  policy: MarketplacePaymentPolicyImplementation,
): MarketplaceEscrowAction[] {
  return declaredMarketplaceOrderSettlementActions(policy)
    .filter((action): action is MarketplaceEscrowAction => executableActions.has(action as MarketplaceEscrowAction))
}

export async function authorizedMarketplaceEscrowActions(options: {
  opts: MarketplaceRuntimeOptions
  policy: MarketplacePaymentPolicyImplementation
  item: MarketplacePaymentValidationItem
  payment: ParsedPayment
  now?: number
}): Promise<MarketplaceEscrowAction[]> {
  return (await authorizedMarketplaceOrderSettlementActions(options))
    .filter((action): action is MarketplaceEscrowAction => executableActions.has(action as MarketplaceEscrowAction))
}

async function orderRecord(
  opts: MarketplaceRuntimeOptions,
  drivers: MarketplaceSessionDriversApi,
  input: ParsedOrderGroup,
  now?: number,
): Promise<MarketplaceEscrowOrderRecord> {
  let source = input
  let payment = input.payment
  let validation
  let driver
  let policy: MarketplacePaymentPolicyImplementation | undefined
  let item: MarketplacePaymentValidationItem | undefined

  try {
    const validated = await validateOrderGroupPayments(input, {
      policies: paymentValidationPolicies(paymentPolicies(opts)),
      ...(opts.signer ? { signer: opts.signer } : {}),
      ...(opts.identity?.pubkey ? { signerPubkey: opts.identity.pubkey } : {}),
      ...(now !== undefined ? { now } : {}),
    })
    source = validated.group
    payment = source.payment
    validation = validated.payment

    if (payment) {
      const amount = await resolvePaymentAmount(payment, { signer: opts.signer })
      const proof = await resolvePaymentProof(payment, {
        signer: opts.signer,
        signerPubkey: opts.identity?.pubkey,
      })
      item = amount.status === 'resolved' && amount.amount && proof.status === 'resolved' && proof.proof
        ? paymentValidationItemForGroup(source, payment, now, amount.amount, proof.proof)
        : undefined
      policy = item ? policyForPayment(opts, item) : undefined
      const sessionDriver = policy ? drivers.byId(policyName(policy)) : undefined
      driver = sessionDriver?.state.value
    }

    const base: Omit<MarketplaceEscrowOrderRecord, 'actions' | 'actionReason'> = {
      id: source.id,
      kind: 'order',
      tradeId: source.tradeId,
      listingAnchor: source.listingAnchor,
      stage: source.stage,
      updatedAt: latestEventTime(source.events),
      source,
      ...(payment ? { payment } : {}),
      ...(validation ? { validation } : {}),
      ...(driver ? { driver } : {}),
    }

    if (source.settlement || source.cancellation || source.stage === 'settled' || source.stage === 'cancel') {
      return {
        ...base,
        actions: [],
        actionReason: unavailable('terminal', 'This order is already settled or cancelled.'),
      }
    }
    if (!payment) {
      return {
        ...base,
        actions: [],
        actionReason: unavailable('no_payment', 'No escrow payment is attached to this order.'),
      }
    }
    if (!validation || validation.status === 'unverifiable') {
      return {
        ...base,
        actions: [],
        actionReason: unavailable(
          'payment_unverifiable',
          validation?.error ?? 'The escrow payment could not be verified.',
        ),
      }
    }
    if (!isPaymentValidationAccepted(validation)) {
      return {
        ...base,
        actions: [],
        actionReason: unavailable('payment_invalid', validation.error ?? 'The escrow payment is not valid.'),
      }
    }
    if (source.stage !== 'commit' || !source.confirmedCommitted || source.paymentNack) {
      return {
        ...base,
        actions: [],
        actionReason: unavailable('not_committed', 'The validated order has not reached the committed stage.'),
      }
    }

    if (!policy || policy.purpose !== 'order' || policy.family !== 'escrow') {
      return {
        ...base,
        actions: [],
        actionReason: unavailable('driver_unavailable', 'No matching order escrow driver is configured.'),
      }
    }

    const withDriver = { ...base, ...(driver ? { driver } : {}) }
    const supportedActions = declaredMarketplaceEscrowActions(policy)
    if (supportedActions.length === 0) {
      return {
        ...withDriver,
        actions: [],
        actionReason: unavailable(
          'settlement_unsupported',
          'The matching driver does not explicitly support dashboard settlement actions.',
        ),
      }
    }
    if (!driver) {
      return {
        ...withDriver,
        actions: [],
        actionReason: unavailable('driver_unavailable', 'The matching driver has no runtime state.'),
      }
    }
    if (driver.status !== 'ready') {
      return {
        ...withDriver,
        actions: [],
        actionReason: unavailable('driver_not_ready', `The matching driver is ${driver.status}.`),
      }
    }
    const actions = item
      ? await authorizedMarketplaceEscrowActions({ opts, policy, item, payment, ...(now !== undefined ? { now } : {}) })
      : []
    if (actions.length === 0) {
      return {
        ...withDriver,
        actions: [],
        actionReason: unavailable(
          'settlement_unauthorized',
          'The matching driver does not authorize this escrow identity for the payment.',
        ),
      }
    }
    return { ...withDriver, actions }
  } catch (error) {
    return {
      id: source.id,
      kind: 'order',
      tradeId: source.tradeId,
      listingAnchor: source.listingAnchor,
      stage: source.stage,
      updatedAt: latestEventTime(source.events),
      source,
      ...(payment ? { payment } : {}),
      ...(validation ? { validation } : {}),
      ...(driver ? { driver } : {}),
      actions: [],
      actionReason: unavailable(
        'record_error',
        error instanceof Error ? error.message : String(error),
      ),
    }
  }
}

async function auctionBidRecord(
  opts: MarketplaceRuntimeOptions,
  drivers: MarketplaceSessionDriversApi,
  source: ParsedAuctionBidGroup,
): Promise<MarketplaceEscrowAuctionBidRecord> {
  const payment = source.payment
  let driver
  if (payment) {
    try {
      const proof = await resolvePaymentProof(payment, {
        signer: opts.signer,
        signerPubkey: opts.identity?.pubkey,
      })
      const driverId = proof.status === 'resolved' ? proof.proof?.paymentProof?.driver : undefined
      driver = driverId ? drivers.byId(driverId)?.state.value : undefined
    } catch (_) {
      // A sealed or malformed proof remains monitor-only and never enables actions.
    }
  }
  return {
    id: source.id,
    kind: 'auction_bid',
    tradeId: source.tradeId,
    listingAnchor: source.listingAnchor,
    stage: source.stage,
    updatedAt: latestEventTime(source.events),
    source,
    ...(payment ? { payment } : {}),
    ...(driver ? { driver } : {}),
    actions: [],
    actionReason: unavailable(
      'auction_requires_settlement_context',
      'Auction actions require canonical whole-auction settlement context and are monitor-only here.',
    ),
  }
}

async function recordsFromSources(
  opts: MarketplaceRuntimeOptions,
  drivers: MarketplaceSessionDriversApi,
  orders: ParsedOrderGroup[],
  bids: ParsedAuctionBidGroup[],
  now?: number,
): Promise<MarketplaceEscrowRecord[]> {
  const [orderRecords, bidRecords] = await Promise.all([
    Promise.all(orders.map(group => orderRecord(opts, drivers, group, now))),
    Promise.all(bids.map(group => auctionBidRecord(opts, drivers, group))),
  ])
  return sortedRecords([...orderRecords, ...bidRecords])
}

function streamIsReady(state: StreamState | undefined): boolean {
  return state instanceof StreamEose || state instanceof StreamLive || state instanceof StreamClosed
}

export function createMarketplaceEscrowApi(
  opts: MarketplaceRuntimeOptions,
  market: MarketplaceClient,
  drivers: MarketplaceSessionDriversApi,
): MarketplaceEscrowApi {
  async function list(query: MarketplaceEscrowRecordsQuery = {}): Promise<MarketplaceEscrowRecord[]> {
    const [orders, bids] = await Promise.all([
      market.me.orders.arbitrating.list(query.orders),
      market.me.bids.arbitrating.list(query.bids),
    ])
    return recordsFromSources(opts, drivers, orders, bids, query.now)
  }

  function watch(query: MarketplaceEscrowRecordsQuery = {}) {
    const orderStream = market.me.orders.arbitrating.watch(query.orders)
    const bidStream = market.me.bids.arbitrating.watch(query.bids)
    const subscriptions: ReplayStreamSubscription[] = []
    let orders = orderStream.currentSnapshot ?? []
    let bids = bidStream.currentSnapshot ?? []
    let generation = 0
    let lastEventKeys = new Set<string>()
    const output = new MarketplaceStream<MarketplaceEscrowRecord, MarketplaceEscrowRecord[]>({
      eventReplayLimit: 50,
      onClose: reason => {
        for (const subscription of subscriptions) subscription.unsubscribe()
        orderStream.close(reason)
        bidStream.close(reason)
      },
    })
    output.emitSnapshot([])
    output.markQuerying({ requestCount: 2 })

    const refresh = () => {
      const currentGeneration = ++generation
      void recordsFromSources(opts, drivers, orders, bids, query.now).then(records => {
        if (currentGeneration !== generation) return
        output.emitSnapshot(records)
        const nextKeys = new Set(records.map(record =>
          `${record.kind}:${record.id}:${record.updatedAt}:${record.driver?.updatedAt ?? 0}:${record.actions.join(',')}`,
        ))
        for (const record of records) {
          const key = `${record.kind}:${record.id}:${record.updatedAt}:${record.driver?.updatedAt ?? 0}:${record.actions.join(',')}`
          if (!lastEventKeys.has(key)) output.emitEvent(record)
        }
        lastEventKeys = nextKeys
      }).catch(error => {
        if (currentGeneration === generation) {
          output.fail(error instanceof Error ? error : new Error(String(error)))
        }
      })
    }

    const syncStatus = () => {
      const states = [orderStream.currentStatus, bidStream.currentStatus]
      const failed = states.find((state): state is StreamError => state instanceof StreamError)
      if (failed) {
        output.fail(failed.error)
        return
      }
      if (states.every(state => state instanceof StreamClosed)) {
        output.emitStatus(new StreamClosed({
          reasons: states.flatMap(state => state instanceof StreamClosed ? state.reasons : []),
        }))
        return
      }
      if (states.every(streamIsReady)) output.markLive({ eventCount: output.events.values.length })
    }

    subscriptions.push(orderStream.snapshot.subscribe(snapshot => {
      orders = snapshot
      refresh()
    }))
    subscriptions.push(bidStream.snapshot.subscribe(snapshot => {
      bids = snapshot
      refresh()
    }))
    subscriptions.push(orderStream.status.subscribe(syncStatus))
    subscriptions.push(bidStream.status.subscribe(syncStatus))
    for (const driver of drivers.all) subscriptions.push(driver.state.subscribe(refresh))
    refresh()
    syncStatus()
    return output
  }

  async function* execute(
    record: MarketplaceEscrowRecord,
    action: MarketplaceEscrowAction,
    options: MarketplaceEscrowExecuteOptions = {},
  ) {
    if (!executableActions.has(action)) throw new Error(`Unsupported escrow action: ${String(action)}`)
    const records = await list({
      orders: { tradeIds: [record.tradeId] },
      bids: { tradeIds: [record.tradeId] },
      ...(options.now !== undefined ? { now: options.now } : {}),
    })
    const current = records.find(candidate => candidate.kind === record.kind && candidate.id === record.id)
    if (!current) throw new Error('Escrow record is no longer available')
    if (current.kind !== 'order') {
      throw new Error(current.actionReason?.message ?? 'Auction bid records are monitor-only')
    }
    if (!current.actions.includes(action)) {
      throw new Error(`Escrow action ${action} is unavailable: ${current.actionReason?.message ?? 'not allowed'}`)
    }
    yield * market.arbitration.arbitrate({
      group: current.source,
      ...(current.payment ? { payment: current.payment } : {}),
      action,
      ...(options.reason ? { reason: options.reason } : {}),
      ...(options.data ? { data: options.data } : {}),
      ...(options.now !== undefined ? { now: options.now } : {}),
    })
  }

  return {
    records: { list, watch },
    execute,
  }
}
