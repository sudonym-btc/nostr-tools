import { describe, expect, test } from 'bun:test'

import {
  MarketplaceStream,
  ReplayStream,
  StreamClosed,
  StreamEose,
  StreamIdle,
  StreamLive,
  StreamQuerying,
} from './stream.ts'

type TestEvent =
  | { event: { kind: 1; id: string }; value: string }
  | { event: { kind: 2; id: string }; amount: number }

type KindOneEvent = Extract<TestEvent, { event: { kind: 1 } }>

function isKindOne(event: TestEvent): event is KindOneEvent {
  return event.event.kind === 1
}

describe('marketplace streams', () => {
  test('replay stream replays buffered values to late subscribers', () => {
    const stream = new ReplayStream<number>()
    stream.next(1)
    stream.next(2)

    const replayed: number[] = []
    const subscription = stream.subscribe(value => replayed.push(value))
    stream.next(3)
    subscription.unsubscribe()
    stream.next(4)

    expect(replayed).toEqual([1, 2, 3])
    expect(stream.values).toEqual([1, 2, 3, 4])
    expect(stream.latest).toBe(4)
  })

  test('replay stream can bound its replay buffer', () => {
    const stream = new ReplayStream<number>({ replayLimit: 2 })
    stream.next(1)
    stream.next(2)
    stream.next(3)

    const replayed: number[] = []
    stream.subscribe(value => replayed.push(value))

    expect(replayed).toEqual([2, 3])
    expect(stream.values).toEqual([2, 3])
  })

  test('marketplace stream exposes class-based status and replay-backed events', () => {
    const stream = new MarketplaceStream<TestEvent, { total: number }>()
    const earlyStatuses: string[] = []
    stream.status.subscribe(status => earlyStatuses.push(status.constructor.name))

    stream.markQuerying({ requestCount: 3, at: 10 })
    stream.emitEvent({ event: { kind: 1, id: 'a' }, value: 'first' })
    stream.emitSnapshot({ total: 1 })
    stream.markEose({ eventCount: 1, at: 20 })
    stream.markLive({ eventCount: 1, at: 30 })

    const lateEvents: TestEvent[] = []
    const lateSnapshots: Array<{ total: number }> = []
    const lateStatuses: string[] = []
    stream.events.subscribe(event => lateEvents.push(event))
    stream.snapshot.subscribe(snapshot => lateSnapshots.push(snapshot))
    stream.status.subscribe(status => lateStatuses.push(status.constructor.name))

    expect(stream.currentStatus).toBeInstanceOf(StreamLive)
    expect(stream.currentSnapshot).toEqual({ total: 1 })
    expect(earlyStatuses).toEqual(['StreamIdle', 'StreamQuerying', 'StreamEose', 'StreamLive'])
    expect(lateStatuses).toEqual(['StreamLive'])
    expect(lateEvents).toEqual([{ event: { kind: 1, id: 'a' }, value: 'first' }])
    expect(lateSnapshots).toEqual([{ total: 1 }])
    expect(stream.status.values[0]).toBeInstanceOf(StreamLive)
  })

  test('filtered streams inherit status and snapshot without creating a new source', () => {
    const source = new MarketplaceStream<TestEvent, { total: number }>()
    source.emitSnapshot({ total: 0 })

    const filtered = source.filter(isKindOne)
    const filteredEvents: KindOneEvent[] = []
    const filteredStatuses: string[] = []
    const filteredSnapshots: Array<{ total: number }> = []
    filtered.events.subscribe(event => filteredEvents.push(event))
    filtered.status.subscribe(status => filteredStatuses.push(status.constructor.name))
    filtered.snapshot.subscribe(snapshot => filteredSnapshots.push(snapshot))

    source.markQuerying({ requestCount: 1 })
    source.emitEvent({ event: { kind: 1, id: 'a' }, value: 'kept' })
    source.emitEvent({ event: { kind: 2, id: 'b' }, amount: 10 })
    source.emitSnapshot({ total: 2 })
    source.markEose({ eventCount: 2 })

    expect(filteredEvents).toEqual([{ event: { kind: 1, id: 'a' }, value: 'kept' }])
    expect(filteredStatuses).toEqual(['StreamIdle', 'StreamQuerying', 'StreamEose'])
    expect(filteredSnapshots).toEqual([{ total: 0 }, { total: 2 }])
    expect(filtered.currentStatus).toBeInstanceOf(StreamEose)
    expect(filtered.currentSnapshot).toEqual({ total: 2 })
  })

  test('filtered streams replay matching parent events and can detach without closing the parent', () => {
    const source = new MarketplaceStream<TestEvent, { total: number }>()
    source.emitEvent({ event: { kind: 1, id: 'a' }, value: 'first' })
    source.emitEvent({ event: { kind: 2, id: 'b' }, amount: 10 })

    const filtered = source.filter(isKindOne)
    const filteredEvents: KindOneEvent[] = []
    filtered.events.subscribe(event => filteredEvents.push(event))

    filtered.close('detach filtered stream')
    source.emitEvent({ event: { kind: 1, id: 'c' }, value: 'after detach' })
    source.markLive({ eventCount: 3 })

    expect(filteredEvents).toEqual([{ event: { kind: 1, id: 'a' }, value: 'first' }])
    expect(source.currentStatus).toBeInstanceOf(StreamLive)
    expect(filtered.currentStatus).toBeInstanceOf(StreamLive)
  })

  test('root close emits closed status and until resolves on matching state', async () => {
    const stream = new MarketplaceStream<TestEvent>()
    const eose = stream.until(StreamEose)

    stream.markQuerying()
    stream.markEose({ eventCount: 0 })
    const resolved = await eose
    stream.close('done')

    expect(resolved).toBeInstanceOf(StreamEose)
    expect(stream.currentStatus).toBeInstanceOf(StreamClosed)
    expect((stream.currentStatus as StreamClosed).reasons).toEqual(['done'])
  })

  test('can start from an explicit status without raw string phases', () => {
    const stream = new MarketplaceStream<TestEvent>({
      initialStatus: new StreamQuerying({ requestCount: 2 }),
    })

    expect(stream.currentStatus).toBeInstanceOf(StreamQuerying)
    expect(stream.currentStatus).not.toBeInstanceOf(StreamIdle)
  })
})
