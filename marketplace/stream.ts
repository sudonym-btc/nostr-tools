export type ReplayStreamSubscription = {
  unsubscribe(): void
}

export type ReplayStreamHandler<T> = (value: T) => void

export type ReplayStreamSubscribeOptions = {
  replay?: boolean
}

export type ReplayStreamOptions = {
  replayLimit?: number
}

export class ReplayStream<T> {
  private readonly subscribers = new Set<ReplayStreamHandler<T>>()
  private readonly replayLimit: number
  private buffer: T[] = []

  constructor(options: ReplayStreamOptions = {}) {
    this.replayLimit = options.replayLimit ?? Number.POSITIVE_INFINITY
    if (Number.isNaN(this.replayLimit) || this.replayLimit < 0) throw new Error('Invalid replay stream limit')
  }

  get values(): readonly T[] {
    return this.buffer
  }

  get latest(): T | undefined {
    return this.buffer.at(-1)
  }

  next(value: T): void {
    if (this.replayLimit !== 0) {
      this.buffer.push(value)
      if (Number.isFinite(this.replayLimit) && this.buffer.length > this.replayLimit) {
        this.buffer = this.buffer.slice(this.buffer.length - this.replayLimit)
      }
    }
    for (const subscriber of [...this.subscribers]) subscriber(value)
  }

  subscribe(
    handler: ReplayStreamHandler<T>,
    options: ReplayStreamSubscribeOptions = {},
  ): ReplayStreamSubscription {
    this.subscribers.add(handler)
    if (options.replay !== false) {
      for (const value of this.buffer) handler(value)
    }
    return {
      unsubscribe: () => {
        this.subscribers.delete(handler)
      },
    }
  }

  clear(): void {
    this.buffer = []
  }
}

export abstract class StreamState {
  readonly at: number

  constructor(at = Date.now()) {
    this.at = at
  }
}

export class StreamIdle extends StreamState {}

export class StreamQuerying extends StreamState {
  readonly requestCount: number

  constructor(options: { requestCount?: number; at?: number } = {}) {
    super(options.at)
    this.requestCount = options.requestCount ?? 0
  }
}

export class StreamEose extends StreamState {
  readonly eventCount: number

  constructor(options: { eventCount?: number; at?: number } = {}) {
    super(options.at)
    this.eventCount = options.eventCount ?? 0
  }
}

export class StreamLive extends StreamState {
  readonly eventCount: number
  readonly since?: number

  constructor(options: { eventCount?: number; since?: number; at?: number } = {}) {
    super(options.at)
    this.eventCount = options.eventCount ?? 0
    if (options.since !== undefined) this.since = options.since
  }
}

export class StreamClosed extends StreamState {
  readonly reasons: string[]

  constructor(options: { reasons?: string[]; at?: number } = {}) {
    super(options.at)
    this.reasons = [...(options.reasons ?? [])]
  }
}

export class StreamError extends StreamState {
  readonly error: Error

  constructor(error: Error, options: { at?: number } = {}) {
    super(options.at)
    this.error = error
  }
}

export type MarketplaceStreamOptions<TSnapshot> = {
  status?: ReplayStream<StreamState>
  snapshot?: ReplayStream<TSnapshot>
  eventReplayLimit?: number
  snapshotReplayLimit?: number
  onClose?: (reason?: string) => void
  emitClosedOnClose?: boolean
  initialStatus?: StreamState | false
}

export type MarketplaceStreamPredicate<TEvent, TNext extends TEvent = TEvent> =
  | ((event: TEvent) => event is TNext)
  | ((event: TEvent) => boolean)

export class MarketplaceStream<TEvent, TSnapshot = never> {
  readonly status: ReplayStream<StreamState>
  readonly events: ReplayStream<TEvent>
  readonly stream: ReplayStream<TEvent>
  readonly snapshot: ReplayStream<TSnapshot>
  private readonly onClose?: (reason?: string) => void
  private readonly emitClosedOnClose: boolean
  private closed = false

  constructor(options: MarketplaceStreamOptions<TSnapshot> = {}) {
    this.status = options.status ?? new ReplayStream<StreamState>({ replayLimit: 1 })
    this.events = new ReplayStream<TEvent>({ replayLimit: options.eventReplayLimit })
    this.stream = this.events
    this.snapshot = options.snapshot ?? new ReplayStream<TSnapshot>({
      replayLimit: options.snapshotReplayLimit ?? 1,
    })
    this.onClose = options.onClose
    this.emitClosedOnClose = options.emitClosedOnClose ?? !options.status
    if (!options.status && options.initialStatus !== false) {
      this.status.next(options.initialStatus ?? new StreamIdle())
    }
  }

  get currentStatus(): StreamState | undefined {
    return this.status.latest
  }

  get currentSnapshot(): TSnapshot | undefined {
    return this.snapshot.latest
  }

  emitStatus(state: StreamState): void {
    this.status.next(state)
  }

  emitEvent(event: TEvent): void {
    this.events.next(event)
  }

  emitSnapshot(snapshot: TSnapshot): void {
    this.snapshot.next(snapshot)
  }

  markQuerying(options: { requestCount?: number; at?: number } = {}): StreamQuerying {
    const state = new StreamQuerying(options)
    this.emitStatus(state)
    return state
  }

  markEose(options: { eventCount?: number; at?: number } = {}): StreamEose {
    const state = new StreamEose(options)
    this.emitStatus(state)
    return state
  }

  markLive(options: { eventCount?: number; since?: number; at?: number } = {}): StreamLive {
    const state = new StreamLive(options)
    this.emitStatus(state)
    return state
  }

  fail(error: Error, options: { at?: number } = {}): StreamError {
    const state = new StreamError(error, options)
    this.emitStatus(state)
    return state
  }

  filter<TNext extends TEvent>(
    predicate: (event: TEvent) => event is TNext,
    options?: Pick<MarketplaceStreamOptions<TSnapshot>, 'eventReplayLimit'>,
  ): MarketplaceStream<TNext, TSnapshot>
  filter(
    predicate: (event: TEvent) => boolean,
    options?: Pick<MarketplaceStreamOptions<TSnapshot>, 'eventReplayLimit'>,
  ): MarketplaceStream<TEvent, TSnapshot>
  filter<TNext extends TEvent>(
    predicate: MarketplaceStreamPredicate<TEvent, TNext>,
    options: Pick<MarketplaceStreamOptions<TSnapshot>, 'eventReplayLimit'> = {},
  ): MarketplaceStream<TNext, TSnapshot> {
    let upstream: ReplayStreamSubscription | undefined
    const derived = new MarketplaceStream<TNext, TSnapshot>({
      status: this.status,
      snapshot: this.snapshot,
      eventReplayLimit: options.eventReplayLimit,
      emitClosedOnClose: false,
      onClose: () => upstream?.unsubscribe(),
    })
    upstream = this.events.subscribe(event => {
      if (predicate(event)) derived.emitEvent(event as TNext)
    })
    return derived
  }

  until<TState extends StreamState>(
    stateType: new (...args: any[]) => TState,
  ): Promise<TState> {
    const current = this.status.latest
    if (current instanceof stateType) return Promise.resolve(current)
    return new Promise(resolve => {
      const subscription = this.status.subscribe(state => {
        if (state instanceof stateType) {
          subscription.unsubscribe()
          resolve(state)
        }
      }, { replay: false })
    })
  }

  close(reason?: string): void {
    if (this.closed) return
    this.closed = true
    this.onClose?.(reason)
    if (this.emitClosedOnClose) {
      this.emitStatus(new StreamClosed({ reasons: reason ? [reason] : [] }))
    }
  }
}

export const marketplaceStreams = {
  ReplayStream,
  MarketplaceStream,
  StreamIdle,
  StreamQuerying,
  StreamEose,
  StreamLive,
  StreamClosed,
  StreamError,
}
