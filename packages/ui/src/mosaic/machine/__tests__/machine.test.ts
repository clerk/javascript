import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { assign, isAssignAction } from '../assign';
import { createActor, mockActor } from '../createActor';
import { createMachine } from '../createMachine';
import type { DoneInvokeEvent } from '../types';
import {
  createDeleteOrgMachine,
  createLoaderMachine,
  type DeleteOrgContext,
  type DeleteOrgEvent,
} from './delete-organization-machine';

/** Flush microtasks (and the macrotask queue) so invoked promises settle. */
const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

/** A promise whose resolution is controlled by the test (for in-flight assertions). */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('createMachine — introspection (the swingset seam)', () => {
  it('exposes states, initial, context and id without running anything', () => {
    const machine = createDeleteOrgMachine(() => Promise.resolve());

    expect(machine.id).toBe('deleteOrg');
    expect(machine.initial).toBe('idle');
    expect(machine.context).toEqual({ name: 'Acme Inc', confirmValue: '', error: null });
    // Every step is enumerable statically — docs can navigate to each one.
    expect(Object.keys(machine.states)).toEqual(['idle', 'confirming', 'deleting', 'deleted']);
  });

  it('defaults context to an empty object when omitted', () => {
    const machine = createMachine({ initial: 'a', states: { a: {} } });
    expect(machine.context).toEqual({});
  });
});

describe('createActor — pre-start safety', () => {
  it('send() is a no-op before start() — does not run transitions without entry actions', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    const before = actor.getSnapshot();

    actor.send({ type: 'OPEN' });

    expect(actor.getSnapshot()).toBe(before);
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('can() returns false before start()', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    expect(actor.can({ type: 'OPEN' })).toBe(false);
  });
});

describe('createActor — transitions', () => {
  it('starts in the initial state', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().status).toBe('active');
  });

  it('moves between states on handled events', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();

    actor.send({ type: 'OPEN' });
    expect(actor.getSnapshot().value).toBe('confirming');

    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('ignores events the current state does not handle', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();

    // `idle` has no `CONFIRM` handler — the snapshot is untouched.
    const before = actor.getSnapshot();
    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot()).toBe(before);
    expect(actor.getSnapshot().value).toBe('idle');
  });
});

describe('createActor — guards', () => {
  it('blocks a transition while the guard fails and allows it once it passes', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();
    actor.send({ type: 'OPEN' });

    // Typed name does not match yet → CONFIRM is blocked.
    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('confirming');

    actor.send({ type: 'TYPE', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('deleting');
  });

  it('takes the first transition whose guard passes', () => {
    type Ctx = { score: number };
    type Ev = { type: 'GRADE' };
    const machine = createMachine<Ctx, Ev>({
      initial: 'grading',
      context: { score: 75 },
      states: {
        grading: {
          on: {
            GRADE: [
              { target: 'a', guard: c => c.score >= 90 },
              { target: 'b', guard: c => c.score >= 70 },
              { target: 'c' },
            ],
          },
        },
        a: {},
        b: {},
        c: {},
      },
    });
    const actor = createActor(machine);
    actor.start();
    actor.send({ type: 'GRADE' });
    expect(actor.getSnapshot().value).toBe('b');
  });
});

describe('createActor — assign & action order', () => {
  it('updates context via assign', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE', value: 'Ac' });
    expect(actor.getSnapshot().context.confirmValue).toBe('Ac');
    actor.send({ type: 'TYPE', value: 'Acme' });
    expect(actor.getSnapshot().context.confirmValue).toBe('Acme');
  });

  it('runs multiple actions in order, later assigns seeing earlier updates', () => {
    const order: string[] = [];
    type Ctx = { count: number };
    type Ev = { type: 'GO' };
    const machine = createMachine<Ctx, Ev>({
      initial: 'a',
      context: { count: 0 },
      states: {
        a: {
          on: {
            GO: {
              target: 'b',
              actions: [
                assign<Ctx, Ev>(c => ({ count: c.count + 1 })),
                c => order.push(`side-effect saw count=${c.count}`),
                assign<Ctx, Ev>(c => ({ count: c.count * 10 })),
              ],
            },
          },
        },
        b: {},
      },
    });
    const actor = createActor(machine);
    actor.start();
    actor.send({ type: 'GO' });

    expect(actor.getSnapshot().context.count).toBe(10);
    expect(order).toEqual(['side-effect saw count=1']);
  });

  it('runs entry and exit actions around a transition', () => {
    const log: string[] = [];
    type Ev = { type: 'NEXT' };
    const machine = createMachine<Record<string, never>, Ev>({
      initial: 'a',
      states: {
        a: { exit: () => log.push('exit-a'), on: { NEXT: 'b' } },
        b: { entry: () => log.push('entry-b') },
      },
    });
    const actor = createActor(machine);
    actor.start();
    actor.send({ type: 'NEXT' });
    expect(log).toEqual(['exit-a', 'entry-b']);
  });
});

describe('createActor — immediate (always) transitions', () => {
  it('takes a guarded eventless transition on entry', () => {
    type Ctx = { authed: boolean };
    type Ev = { type: 'LOGIN' };
    const machine = createMachine<Ctx, Ev>({
      initial: 'idle',
      context: { authed: true },
      states: {
        idle: { on: { LOGIN: 'checking' } },
        // No event handler — resolves immediately based on context.
        checking: {
          always: [{ target: 'granted', guard: c => c.authed }, { target: 'denied' }],
        },
        granted: {},
        denied: {},
      },
    });
    const actor = createActor(machine);
    actor.start();
    actor.send({ type: 'LOGIN' });
    // Never observably rests in `checking`.
    expect(actor.getSnapshot().value).toBe('granted');
  });
});

describe('createActor — invoke (async)', () => {
  it('lands the resolved output in context via onDone', async () => {
    const actor = createActor(createLoaderMachine(() => Promise.resolve('payload')));
    actor.start();
    actor.send({ type: 'FETCH' });
    expect(actor.getSnapshot().value).toBe('loading');

    await tick();
    expect(actor.getSnapshot().value).toBe('success');
    expect(actor.getSnapshot().context.data).toBe('payload');
  });

  it('routes a rejection to onError with the error in context', async () => {
    const actor = createActor(createLoaderMachine(() => Promise.reject(new Error('boom'))));
    actor.start();
    actor.send({ type: 'FETCH' });

    await tick();
    expect(actor.getSnapshot().value).toBe('failure');
    expect(actor.getSnapshot().context.error).toContain('boom');
  });

  it('passes the resolved value to onDone as event.output', async () => {
    const onDone = vi.fn();
    const machine = createMachine<{ out: string | null }, { type: 'GO' }>({
      initial: 'idle',
      context: { out: null },
      states: {
        idle: { on: { GO: 'running' } },
        running: {
          invoke: {
            src: () => Promise.resolve('the-output'),
            onDone: {
              target: 'done',
              actions: [
                (_c, e) => onDone((e as DoneInvokeEvent<string>).output),
                assign<{ out: string | null }, DoneInvokeEvent<string>>((_, e) => ({ out: e.output })),
              ],
            },
          },
        },
        done: { type: 'final' },
      },
    });
    const actor = createActor(machine);
    actor.start();
    actor.send({ type: 'GO' });
    await tick();

    expect(onDone).toHaveBeenCalledWith('the-output');
    expect(actor.getSnapshot().context.out).toBe('the-output');
  });

  it('does not transition when stopped mid-flight (no work after stop)', async () => {
    const gate = deferred<string>();
    const actor = createActor(createLoaderMachine(() => gate.promise));
    actor.start();
    actor.send({ type: 'FETCH' });
    expect(actor.getSnapshot().value).toBe('loading');

    actor.stop();
    gate.resolve('too-late');
    await tick();

    expect(actor.getSnapshot().value).toBe('loading');
    expect(actor.getSnapshot().status).toBe('stopped');
    expect(actor.getSnapshot().context.data).toBeNull();
  });

  it('abandons an in-flight invoke when the state is left via an event', async () => {
    const gate = deferred<string>();
    const machine = createMachine<Record<string, never>, { type: 'GO' } | { type: 'CANCEL' }>({
      initial: 'idle',
      states: {
        idle: { on: { GO: 'working' } },
        working: {
          invoke: { src: () => gate.promise, onDone: 'done' },
          on: { CANCEL: 'idle' },
        },
        done: {},
      },
    });
    const actor = createActor(machine);
    actor.start();
    actor.send({ type: 'GO' });
    expect(actor.getSnapshot().value).toBe('working');

    actor.send({ type: 'CANCEL' }); // leave `working` before the promise settles
    expect(actor.getSnapshot().value).toBe('idle');

    gate.resolve('late');
    await tick();
    expect(actor.getSnapshot().value).toBe('idle'); // stale onDone did not fire
  });
});

describe('createActor — final states', () => {
  it('marks the snapshot done and ignores further events', async () => {
    const actor = createActor(createLoaderMachine(() => Promise.resolve('x')));
    actor.start();
    actor.send({ type: 'FETCH' });
    await tick();

    expect(actor.getSnapshot().value).toBe('success');
    expect(actor.getSnapshot().status).toBe('done');

    // `success` is final — even a normally-handled event is a no-op now.
    actor.send({ type: 'FETCH' });
    expect(actor.getSnapshot().value).toBe('success');
  });
});

describe('createActor — can()', () => {
  it('reports whether the current state would handle an event', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();

    expect(actor.can({ type: 'OPEN' })).toBe(true);
    expect(actor.can({ type: 'CONFIRM' })).toBe(false); // not handled in idle

    actor.send({ type: 'OPEN' });
    // CONFIRM is handled but its guard fails → not currently takeable.
    expect(actor.can({ type: 'CONFIRM' })).toBe(false);
    expect(actor.can({ type: 'CANCEL' })).toBe(true);

    actor.send({ type: 'TYPE', value: 'Acme Inc' });
    expect(actor.can({ type: 'CONFIRM' })).toBe(true); // guard now passes
  });

  it('returns false once stopped', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();
    actor.stop();
    expect(actor.can({ type: 'OPEN' })).toBe(false);
  });
});

describe('createActor — state entry guards', () => {
  // Entry guards read live external data via closure — the Wizard's core need.
  function makeGatedMachine(canEnterB: () => boolean) {
    return createMachine<Record<string, never>, { type: 'GO' }>({
      initial: 'a',
      states: {
        a: { on: { GO: 'b' } },
        b: { guard: canEnterB },
      },
    });
  }

  it('blocks a transition whose target entry guard fails — a true no-op (same ref, no notify)', () => {
    const actor = createActor(makeGatedMachine(() => false));
    actor.start();
    const seen: string[] = [];
    actor.subscribe(s => seen.push(s.value));

    const before = actor.getSnapshot();
    actor.send({ type: 'GO' });

    expect(actor.getSnapshot()).toBe(before); // referentially unchanged
    expect(actor.getSnapshot().value).toBe('a');
    expect(seen).toEqual([]); // subscribers NOT notified on a no-op
  });

  it('allows the transition once the entry guard holds, and reflects it in can()', () => {
    let open = false;
    const actor = createActor(makeGatedMachine(() => open));
    actor.start();

    expect(actor.can({ type: 'GO' })).toBe(false);
    actor.send({ type: 'GO' });
    expect(actor.getSnapshot().value).toBe('a'); // still blocked

    open = true;
    expect(actor.can({ type: 'GO' })).toBe(true);
    actor.send({ type: 'GO' });
    expect(actor.getSnapshot().value).toBe('b');
  });
});

describe('createActor — derived initial state', () => {
  it('computes the start state from context via an initial resolver', () => {
    const machine = createMachine<{ resumeAt: string }, { type: 'X' }>({
      initial: context => context.resumeAt,
      context: { resumeAt: 'c' },
      states: { a: {}, b: {}, c: {} },
    });
    const actor = createActor(machine);
    actor.start();
    expect(actor.getSnapshot().value).toBe('c');
  });
});

describe('createActor — recheck (always re-evaluated on external-data change)', () => {
  it('takes a parked always transition once external data lets its guard pass', () => {
    let ready = false;
    const machine = createMachine<Record<string, never>, { type: never }>({
      initial: 'waiting',
      states: {
        waiting: { always: { target: 'ready', guard: () => ready } },
        ready: {},
      },
    });
    const actor = createActor(machine);
    actor.start();
    // Guard was false on entry → still parked in `waiting`.
    expect(actor.getSnapshot().value).toBe('waiting');

    const seen: string[] = [];
    actor.subscribe(s => seen.push(s.value));

    actor.recheck(); // data not ready yet → no-op, no notify
    expect(actor.getSnapshot().value).toBe('waiting');
    expect(seen).toEqual([]);

    ready = true;
    actor.recheck(); // external data changed → advance
    expect(actor.getSnapshot().value).toBe('ready');
    expect(seen).toEqual(['ready']);
  });

  it('re-seats to the resolved initial state when live data makes the current step unenterable', () => {
    // Self-correction: the actor is sitting on a step whose entry guard reads live
    // external data, and that data changes so the step is no longer enterable. A
    // recheck() re-seats to the freshly-resolved initial state — the seam the
    // Wizard's render-phase "clamp" stands on.
    let bReachable = true;
    const machine = createMachine<Record<string, never>, { type: never }>({
      initial: () => (bReachable ? 'b' : 'a'),
      states: {
        a: {},
        b: { guard: () => bReachable },
      },
    });
    const actor = createActor(machine);
    actor.start();
    expect(actor.getSnapshot().value).toBe('b'); // initial resolver landed on b

    const seen: string[] = [];
    actor.subscribe(s => seen.push(s.value));

    actor.recheck(); // b still enterable → no-op, no notify
    expect(actor.getSnapshot().value).toBe('b');
    expect(seen).toEqual([]);

    bReachable = false;
    actor.recheck(); // b unenterable → re-seat to the resolved initial (a)
    expect(actor.getSnapshot().value).toBe('a');
    expect(seen).toEqual(['a']);
  });

  it('does not re-seat while the current step is still enterable (a guard opening elsewhere does not yank)', () => {
    // Mirrors the Wizard's "create-style change" invariant: a later guard going
    // TRUE while the current step still holds must NOT move the user.
    let bReachable = false;
    const machine = createMachine<Record<string, never>, { type: never }>({
      initial: 'a',
      states: {
        a: {},
        b: { guard: () => bReachable },
      },
    });
    const actor = createActor(machine);
    actor.start();
    const seen: string[] = [];
    actor.subscribe(s => seen.push(s.value));

    bReachable = true; // b becomes reachable, but a still holds → no re-seat
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('a');
    expect(seen).toEqual([]);
  });
});

describe('createActor — observable contract', () => {
  it('notifies subscribers on each transition and stops after unsubscribe', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();

    const seen: string[] = [];
    const unsubscribe = actor.subscribe(snapshot => seen.push(snapshot.value));

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CANCEL' });
    expect(seen).toEqual(['confirming', 'idle']);

    unsubscribe();
    actor.send({ type: 'OPEN' });
    expect(seen).toEqual(['confirming', 'idle']); // no further notifications
  });

  it('getSnapshot is referentially stable until a change occurs', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();

    const first = actor.getSnapshot();
    expect(actor.getSnapshot()).toBe(first); // same reference, no change

    actor.send({ type: 'OPEN' });
    expect(actor.getSnapshot()).not.toBe(first); // new reference after transition
  });
});

describe('createActor — context init option', () => {
  type Ctx = { label: string; count: number };
  type Ev = { type: 'GO' };

  const machine = createMachine<Ctx, Ev>({
    initial: 'idle',
    context: { label: 'default', count: 0 },
    states: { idle: { on: { GO: 'done' } }, done: { type: 'final' } },
  });

  it('merges runtime context over machine defaults', () => {
    const actor = createActor(machine, { context: { label: 'runtime' } });
    actor.start();
    expect(actor.getSnapshot().context).toEqual({ label: 'runtime', count: 0 });
  });

  it('leaves unspecified fields at their machine defaults', () => {
    const actor = createActor(machine, { context: { count: 42 } });
    actor.start();
    expect(actor.getSnapshot().context).toEqual({ label: 'default', count: 42 });
  });

  it('snapshot.context takes precedence over context init', () => {
    const actor = createActor(machine, {
      context: { label: 'runtime' },
      snapshot: { value: 'idle', context: { label: 'teleport' } },
    });
    expect(actor.getSnapshot().context).toEqual({ label: 'teleport', count: 0 });
  });
});

describe('mockActor — teleport', () => {
  it('drops the actor into an arbitrary state + context', () => {
    const actor = mockActor(
      createDeleteOrgMachine(() => Promise.resolve()),
      {
        value: 'confirming',
        context: { confirmValue: 'Acme Inc' },
      },
    );
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('confirming');
    // Provided context is merged over the machine defaults.
    expect(snapshot.context).toEqual({ name: 'Acme Inc', confirmValue: 'Acme Inc', error: null });
    expect(snapshot.status).toBe('active');
  });

  it('is inert: teleporting into an invoking state does not fire the invoke', async () => {
    const destroyOrg = vi.fn(() => Promise.resolve());
    const actor = mockActor(createDeleteOrgMachine(destroyOrg), { value: 'deleting' });

    await tick();
    expect(destroyOrg).not.toHaveBeenCalled();
    expect(actor.getSnapshot().value).toBe('deleting');
  });

  it('reports done status when teleported into a final state', () => {
    const actor = mockActor(
      createDeleteOrgMachine(() => Promise.resolve()),
      { value: 'deleted' },
    );
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('is still live — can take events from the teleported state', () => {
    const actor = mockActor(
      createDeleteOrgMachine(() => Promise.resolve()),
      { value: 'confirming' },
    );
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('idle');
  });
});

describe('pure helpers (testable without an actor)', () => {
  it('a guard is just a (context, event) predicate', () => {
    const nameMatches = (context: DeleteOrgContext) => context.confirmValue === context.name;
    expect(nameMatches({ name: 'Acme Inc', confirmValue: 'Acme Inc', error: null })).toBe(true);
    expect(nameMatches({ name: 'Acme Inc', confirmValue: 'nope', error: null })).toBe(false);
  });

  it('assign builds a tagged action wrapping a pure updater', () => {
    const action = assign<DeleteOrgContext, DeleteOrgEvent>((_, event) =>
      event.type === 'TYPE' ? { confirmValue: event.value } : {},
    );
    expect(isAssignAction(action)).toBe(true);
    // The updater itself is pure and unit-testable in isolation.
    expect(
      action.assignment({ name: 'Acme Inc', confirmValue: '', error: null }, { type: 'TYPE', value: 'hi' }),
    ).toEqual({ confirmValue: 'hi' });
  });

  it('isAssignAction rejects plain side-effect actions', () => {
    expect(isAssignAction(() => undefined)).toBe(false);
    expect(isAssignAction(null)).toBe(false);
    expect(isAssignAction({ type: 'other' })).toBe(false);
  });
});

describe('actor restart — StrictMode start/stop/start cycle', () => {
  it('send works after stop() + start() (simulates StrictMode effect cleanup)', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));

    actor.start();
    expect(actor.getSnapshot().value).toBe('idle');

    // StrictMode cleanup runs the effect teardown…
    actor.stop();
    expect(actor.getSnapshot().status).toBe('stopped');

    // …then remounts and runs the effect again.
    actor.start();
    expect(actor.getSnapshot().status).toBe('active');

    actor.send({ type: 'OPEN' });
    expect(actor.getSnapshot().value).toBe('confirming');
  });

  it('does not re-fire an in-flight invoke when restarted from an invoke state', () => {
    const gate = deferred<void>();
    let invokeCount = 0;
    const actor = createActor(
      createDeleteOrgMachine(() => {
        invokeCount++;
        return gate.promise;
      }),
    );

    actor.start();
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('deleting');
    expect(invokeCount).toBe(1);

    // Stopped mid-invoke (e.g. Suspense remount) then restarted.
    actor.stop();
    actor.start();
    expect(actor.getSnapshot().status).toBe('active');
    // The invoke must not fire a second time.
    expect(invokeCount).toBe(1);
  });
});

describe('createActor — after (delayed transitions)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('auto-advances to the target state after the delay', () => {
    const machine = createMachine<Record<string, never>, { type: 'SUBMIT' }>({
      id: 'otp',
      initial: 'codeSent',
      context: {},
      states: {
        codeSent: {
          after: { 60_000: 'expired' },
          on: { SUBMIT: 'verifying' },
        },
        expired: {},
        verifying: {},
      },
    });

    const actor = createActor(machine);
    actor.start();
    expect(actor.getSnapshot().value).toBe('codeSent');

    vi.advanceTimersByTime(59_999);
    expect(actor.getSnapshot().value).toBe('codeSent');

    vi.advanceTimersByTime(1);
    expect(actor.getSnapshot().value).toBe('expired');
  });

  it('cancels the timer when an explicit event fires first', () => {
    const machine = createMachine<Record<string, never>, { type: 'SUBMIT' }>({
      id: 'otp',
      initial: 'codeSent',
      context: {},
      states: {
        codeSent: {
          after: { 60_000: 'expired' },
          on: { SUBMIT: 'verifying' },
        },
        expired: {},
        verifying: {},
      },
    });

    const actor = createActor(machine);
    actor.start();

    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('verifying');

    vi.advanceTimersByTime(60_000);
    expect(actor.getSnapshot().value).toBe('verifying');
  });

  it('cancels the timer on stop()', () => {
    const visited: string[] = [];
    const machine = createMachine<Record<string, never>, { type: 'never' }>({
      id: 'otp',
      initial: 'codeSent',
      context: {},
      states: {
        codeSent: { after: { 60_000: 'expired' } },
        expired: {},
      },
    });

    const actor = createActor(machine);
    actor.subscribe(snap => visited.push(snap.value));
    actor.start();
    actor.stop();

    vi.advanceTimersByTime(60_000);
    expect(visited).not.toContain('expired');
  });

  it('when two after keys exist, the first to fire clears the other', () => {
    const machine = createMachine<Record<string, never>, { type: 'never' }>({
      id: 'race',
      initial: 'waiting',
      context: {},
      states: {
        waiting: {
          after: {
            500: 'first',
            1_000: 'second',
          },
        },
        first: {},
        second: {},
      },
    });

    const actor = createActor(machine);
    actor.start();

    vi.advanceTimersByTime(500);
    expect(actor.getSnapshot().value).toBe('first');

    vi.advanceTimersByTime(500);
    expect(actor.getSnapshot().value).toBe('first'); // the 1000ms timer was cancelled
  });

  it('passes AfterEvent with the correct delay to transition actions', () => {
    let capturedDelay: number | undefined;
    const machine = createMachine<Record<string, never>, { type: 'never' }>({
      id: 'timed',
      initial: 'waiting',
      context: {},
      states: {
        waiting: {
          after: {
            500: {
              target: 'done',
              actions: [
                (_ctx, event) => {
                  capturedDelay = event.delay;
                },
              ],
            },
          },
        },
        done: { type: 'final' },
      },
    });

    const actor = createActor(machine);
    actor.start();
    vi.advanceTimersByTime(500);

    expect(capturedDelay).toBe(500);
    expect(actor.getSnapshot().value).toBe('done');
  });

  it('supports a guard on an after transition', () => {
    const machine = createMachine<{ allow: boolean }, { type: 'never' }>({
      id: 'guarded',
      initial: 'waiting',
      context: { allow: false },
      states: {
        waiting: {
          after: {
            500: { target: 'done', guard: ctx => ctx.allow },
          },
        },
        done: {},
      },
    });

    const actor = createActor(machine);
    actor.start();

    vi.advanceTimersByTime(500);
    expect(actor.getSnapshot().value).toBe('waiting'); // guard blocked it

    // Guards on after transitions are evaluated at fire-time, not schedule-time.
    // A failing guard leaves the state unchanged (same as event transitions).
  });

  it('restarts cleanly after stop/start (StrictMode cycle)', () => {
    const machine = createMachine<Record<string, never>, { type: 'never' }>({
      id: 'otp',
      initial: 'codeSent',
      context: {},
      states: {
        codeSent: { after: { 60_000: 'expired' } },
        expired: {},
      },
    });

    const actor = createActor(machine);
    actor.start();
    actor.stop(); // StrictMode cleanup

    actor.start(); // StrictMode remount — must reschedule the timer
    vi.advanceTimersByTime(60_000);
    expect(actor.getSnapshot().value).toBe('expired');
  });
});
