import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createActor } from '../createActor';
import { createMachine } from '../createMachine';
import { waitFor, WaitForTimeoutError } from '../waitFor';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

// A simple toggle machine used across all tests.
type Ctx = Record<string, never>;
type Ev = { type: 'NEXT' } | { type: 'STOP' };
const machine = createMachine<Ctx, Ev>({
  id: 'wait',
  initial: 'a',
  context: {},
  states: {
    a: { on: { NEXT: 'b', STOP: 'done' } },
    b: { on: { NEXT: 'c' } },
    c: { type: 'final' },
    done: { type: 'final' },
  },
});

describe('waitFor — happy path', () => {
  it('resolves immediately when predicate already holds on the current snapshot', async () => {
    const actor = createActor(machine);
    actor.start(); // initial state: 'a'

    const snap = await waitFor(actor, s => s.value === 'a');
    expect(snap.value).toBe('a');
  });

  it('resolves once a transition satisfies the predicate', async () => {
    const actor = createActor(machine);
    actor.start();

    const promise = waitFor(actor, s => s.value === 'b');
    actor.send({ type: 'NEXT' });

    const snap = await promise;
    expect(snap.value).toBe('b');
  });

  it('resolves when the predicate is satisfied on a final state', async () => {
    const actor = createActor(machine);
    actor.start();

    const promise = waitFor(actor, s => s.value === 'c');
    actor.send({ type: 'NEXT' }); // a → b
    actor.send({ type: 'NEXT' }); // b → c (final)

    const snap = await promise;
    expect(snap.value).toBe('c');
    expect(snap.status).toBe('done');
  });
});

describe('waitFor — invoke (async state)', () => {
  it('resolves when an invoked promise drives the machine to the target state', async () => {
    const gate = deferred<string>();

    type AsyncCtx = { result: string | null };
    type AsyncEv = { type: 'GO' };
    const asyncMachine = createMachine<AsyncCtx, AsyncEv>({
      initial: 'idle',
      context: { result: null },
      states: {
        idle: { on: { GO: 'loading' } },
        loading: {
          invoke: {
            src: () => gate.promise,
            onDone: {
              target: 'success',
              actions: (ctx, event) => {
                (ctx as AsyncCtx).result = (event as { output: string }).output;
              },
            },
            onError: 'failure',
          },
        },
        success: { type: 'final' },
        failure: {},
      },
    });

    const actor = createActor(asyncMachine);
    actor.start();
    actor.send({ type: 'GO' });

    const promise = waitFor(actor, s => s.value === 'success');
    await tick();

    gate.resolve('done!');
    await tick();

    const snap = await promise;
    expect(snap.value).toBe('success');
  });
});

describe('waitFor — rejection cases', () => {
  it('rejects when the actor is stopped before the predicate is satisfied', async () => {
    const actor = createActor(machine);
    actor.start();

    const promise = waitFor(actor, s => s.value === 'c');
    actor.stop();

    await expect(promise).rejects.toThrow('stopped');
  });

  it('rejects when the machine reaches a final state that does not satisfy the predicate', async () => {
    const actor = createActor(machine);
    actor.start();

    // Waiting for 'c', but the machine will go to 'done' (a different final state).
    const promise = waitFor(actor, s => s.value === 'c');
    actor.send({ type: 'STOP' }); // a → done (final, not 'c')

    await expect(promise).rejects.toThrow('done');
  });

  it('rejects immediately when called on an already-stopped actor with unsatisfied predicate', async () => {
    const actor = createActor(machine);
    actor.start();
    actor.stop();

    await expect(waitFor(actor, s => s.value === 'b')).rejects.toThrow('"stopped"');
  });
});

describe('waitFor — timeout', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('rejects with WaitForTimeoutError when the timeout elapses', async () => {
    const actor = createActor(machine);
    actor.start();

    const promise = waitFor(actor, s => s.value === 'c', { timeout: 1000 });

    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toBeInstanceOf(WaitForTimeoutError);
    await expect(promise).rejects.toThrow('1000ms');
  });

  it('does not reject if the predicate is satisfied before the timeout', async () => {
    const actor = createActor(machine);
    actor.start();

    const promise = waitFor(actor, s => s.value === 'b', { timeout: 1000 });

    actor.send({ type: 'NEXT' }); // satisfies predicate before timeout
    vi.advanceTimersByTime(1000);

    const snap = await promise;
    expect(snap.value).toBe('b');
  });
});

describe('waitFor — subscription cleanup', () => {
  it('unsubscribes after resolution so stale listeners do not accumulate', async () => {
    const actor = createActor(machine);
    actor.start();

    // Wrap subscribe to count active subscriptions.
    let live = 0;
    const realSubscribe = actor.subscribe;
    actor.subscribe = listener => {
      live++;
      const unsub = realSubscribe(listener);
      return () => {
        live--;
        unsub();
      };
    };

    const promise = waitFor(actor, s => s.value === 'b');
    expect(live).toBe(1);

    actor.send({ type: 'NEXT' });
    await promise;

    expect(live).toBe(0);
  });
});
