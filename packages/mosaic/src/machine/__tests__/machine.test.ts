import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../__tests__/async';
import { createActor, restoreActor } from '../create-actor';
import { createAsyncLogic, setup } from '../setup';
import type { AsyncArgs } from '../types';
import { createDeleteOrgMachine, createLoaderMachine } from './delete-organization-machine';

type Empty = Record<string, never>;

function toggleMachine() {
  return setup<Empty, { type: 'GO' } | { type: 'BACK' }>().createMachine({
    initial: 'a',
    context: {},
    states: {
      a: { on: { GO: { target: 'b' } } },
      b: { on: { BACK: { target: 'a' } } },
    },
  });
}

describe('createMachine — introspection', () => {
  it('exposes states, initial, context and id without running anything', () => {
    const entry = vi.fn();
    const machine = setup<{ n: number }, { type: 'GO' }>().createMachine({
      id: 'probe',
      initial: 'a',
      context: { n: 1 },
      states: { a: { entry, on: { GO: { target: 'b' } } }, b: {} },
    });

    expect(machine.id).toBe('probe');
    expect(machine.initial).toBe('a');
    expect(Object.keys(machine.states)).toEqual(['a', 'b']);
    expect(machine.config.context).toEqual({ n: 1 });
    expect(entry).not.toHaveBeenCalled();
  });

  it('resolves a persisted snapshot, marking a final state done', () => {
    const machine = createDeleteOrgMachine(() => Promise.resolve());
    const context = { name: 'Acme Inc', confirmValue: '', error: null };

    expect(machine.resolveState({ value: 'confirming', context })).toEqual({
      value: 'confirming',
      context,
      status: 'active',
    });
    expect(machine.resolveState({ value: 'deleted', context }).status).toBe('done');
  });
});

describe('createActor — before start', () => {
  it('runs no transition for events sent before start()', () => {
    const actor = createActor(toggleMachine());
    actor.send({ type: 'GO' });

    expect(actor.getSnapshot().value).toBe('a');
    actor.start();
    expect(actor.getSnapshot().value).toBe('b');
  });

  it('answers snapshot.can() for the initial state', () => {
    const actor = createActor(toggleMachine());

    expect(actor.getSnapshot().can({ type: 'GO' })).toBe(true);
    expect(actor.getSnapshot().can({ type: 'BACK' })).toBe(false);
  });
});

describe('createActor — transitions', () => {
  it('moves between states on handled events', () => {
    const actor = createActor(toggleMachine()).start();

    actor.send({ type: 'GO' });
    expect(actor.getSnapshot().value).toBe('b');
    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('a');
  });

  it('ignores an unhandled event without a new snapshot or a notify', () => {
    const actor = createActor(toggleMachine()).start();
    const before = actor.getSnapshot();
    const listener = vi.fn();
    actor.subscribe(listener);

    actor.send({ type: 'BACK' });

    expect(actor.getSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
  });

  it('treats a transition fn that returns undefined as unhandled', () => {
    const machine = setup<{ ok: boolean }, { type: 'GO' }>().createMachine({
      initial: 'a',
      context: { ok: false },
      states: { a: { on: { GO: ({ context }) => (context.ok ? { target: 'b' } : undefined) } }, b: {} },
    });
    const actor = createActor(machine).start();
    const before = actor.getSnapshot();

    actor.send({ type: 'GO' });

    expect(actor.getSnapshot()).toBe(before);
  });

  it('patches context and stays when the fn returns only context', () => {
    const machine = setup<{ value: string; other: number }, { type: 'TYPE'; value: string }>().createMachine({
      initial: 'a',
      context: { value: '', other: 1 },
      states: { a: { on: { TYPE: ({ event }) => ({ context: { value: event.value } }) } } },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'TYPE', value: 'x' });

    expect(actor.getSnapshot()).toMatchObject({ value: 'a', context: { value: 'x', other: 1 } });
  });

  it('patches context and moves when the fn returns both', () => {
    const machine = setup<{ n: number }, { type: 'GO'; n: number }>().createMachine({
      initial: 'a',
      context: { n: 0 },
      states: { a: { on: { GO: ({ event }) => ({ target: 'b', context: { n: event.n } }) } }, b: {} },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'GO', n: 3 });

    expect(actor.getSnapshot()).toMatchObject({ value: 'b', context: { n: 3 } });
  });

  it('treats a fn that only enqueues an effect as handled, without moving', () => {
    const effect = vi.fn();
    const machine = setup<Empty, { type: 'PING' }>().createMachine({
      initial: 'a',
      context: {},
      states: {
        a: {
          on: {
            PING: (_, enq) => {
              enq(effect, 'pinged');
            },
          },
        },
      },
    });
    const actor = createActor(machine).start();

    expect(actor.getSnapshot().can({ type: 'PING' })).toBe(true);
    actor.send({ type: 'PING' });

    expect(effect).toHaveBeenCalledWith('pinged');
    expect(actor.getSnapshot().value).toBe('a');
  });
});

describe('createActor — effects', () => {
  it('runs exit, transition and entry effects in that order', () => {
    const calls: string[] = [];
    const log = (name: string) => calls.push(name);
    const machine = setup<Empty, { type: 'GO' }>().createMachine({
      initial: 'a',
      context: {},
      states: {
        a: {
          exit: (_, enq) => enq(log, 'exit a'),
          on: {
            GO: (_, enq) => {
              enq(log, 'transition');
              return { target: 'b' };
            },
          },
        },
        b: { entry: (_, enq) => enq(log, 'entry b') },
      },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'GO' });

    expect(calls).toEqual(['exit a', 'transition', 'entry b']);
  });

  it('evaluates the transition against event-time context, then merges exit, transition and entry patches', () => {
    const machine = setup<{ trail: string; exit: boolean; entry: boolean }, { type: 'GO' }>().createMachine({
      initial: 'a',
      context: { trail: 'start', exit: false, entry: false },
      states: {
        a: {
          exit: ({ context }) => ({ context: { trail: `${context.trail}+exit`, exit: true } }),
          on: { GO: ({ context }) => ({ target: 'b', context: { trail: `${context.trail}+transition` } }) },
        },
        b: { entry: ({ context }) => ({ context: { trail: `${context.trail}+entry`, entry: true } }) },
      },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'GO' });

    expect(actor.getSnapshot().context).toEqual({ trail: 'start+transition+entry', exit: true, entry: true });
  });

  it('runs effects before the snapshot moves to the target state and before listeners are notified', () => {
    const calls: string[] = [];
    const machine = setup<Empty, { type: 'GO' }>().createMachine({
      initial: 'a',
      context: {},
      states: {
        a: { on: { GO: { target: 'b' } } },
        b: {
          entry: ({ self }, enq) => enq(() => calls.push(`effect sees ${self.getSnapshot().value}`)),
        },
      },
    });
    const actor = createActor(machine).start();
    actor.subscribe(snapshot => calls.push(`listener sees ${snapshot.value}`));

    actor.send({ type: 'GO' });

    expect(calls).toEqual(['effect sees a', 'listener sees b']);
  });

  it('processes an event sent from an effect after the current step', () => {
    const seen: string[] = [];
    const machine = setup<Empty, { type: 'GO' }>().createMachine({
      initial: 'a',
      context: {},
      states: {
        a: { on: { GO: { target: 'b' } } },
        b: { entry: ({ self }, enq) => enq(() => self.send({ type: 'GO' })), on: { GO: { target: 'c' } } },
        c: {},
      },
    });
    const actor = createActor(machine).start();
    actor.subscribe(snapshot => seen.push(snapshot.value));

    actor.send({ type: 'GO' });

    expect(seen).toEqual(['b', 'c']);
  });

  it('runs an initial entry effect on start, not on creation', () => {
    const effect = vi.fn();
    const machine = setup<Empty, { type: 'never' }>().createMachine({
      initial: 'a',
      context: {},
      states: { a: { entry: (_, enq) => enq(effect) } },
    });
    const actor = createActor(machine);

    expect(effect).not.toHaveBeenCalled();
    actor.start();
    expect(effect).toHaveBeenCalledTimes(1);
  });
});

describe('createActor — named actions', () => {
  function notifyMachine(notify: (message: string) => void) {
    return setup<Empty, { type: 'GO' }>().createMachine({
      initial: 'a',
      context: {},
      actions: { notify },
      states: {
        a: {
          on: {
            GO: ({ actions }, enq) => {
              enq(actions.notify, 'went');
              return { target: 'b' };
            },
          },
        },
        b: {},
      },
    });
  }

  it('runs the action given to the machine', () => {
    const notify = vi.fn();
    const actor = createActor(notifyMachine(notify)).start();

    actor.send({ type: 'GO' });

    expect(notify).toHaveBeenCalledWith('went');
  });

  it('runs the action from provide() and leaves the original machine as it was', () => {
    const original = vi.fn();
    const provided = vi.fn();
    const machine = notifyMachine(original);
    const withProvided = machine.provide({ actions: { notify: provided } });

    createActor(withProvided).start().send({ type: 'GO' });
    createActor(machine).start().send({ type: 'GO' });

    expect(withProvided.config).toBe(machine.config);
    expect(provided).toHaveBeenCalledTimes(1);
    expect(original).toHaveBeenCalledTimes(1);
  });
});

describe('createActor — always', () => {
  it('takes an always transition on entry when it returns a target', () => {
    const machine = setup<{ ready: boolean }, { type: 'GO' }>().createMachine({
      initial: 'a',
      context: { ready: true },
      states: {
        a: { on: { GO: { target: 'check' } } },
        check: { always: ({ context }) => (context.ready ? { target: 'done' } : undefined) },
        done: {},
      },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'GO' });

    expect(actor.getSnapshot().value).toBe('done');
  });

  it('stays when always returns undefined', () => {
    const machine = setup<{ ready: boolean }, { type: 'never' }>().createMachine({
      initial: 'check',
      context: { ready: false },
      states: {
        check: { always: ({ context }) => (context.ready ? { target: 'done' } : undefined) },
        done: {},
      },
    });

    expect(createActor(machine).start().getSnapshot().value).toBe('check');
  });

  it('re-checks always after an event that only changes context', () => {
    const machine = setup<{ ready: boolean }, { type: 'READY' }>().createMachine({
      initial: 'check',
      context: { ready: false },
      states: {
        check: {
          always: ({ context }) => (context.ready ? { target: 'done' } : undefined),
          on: { READY: () => ({ context: { ready: true } }) },
        },
        done: {},
      },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'READY' });

    expect(actor.getSnapshot().value).toBe('done');
  });

  it('re-checks always after an invoke settles with only a context change', async () => {
    const ready = setup<{ ready: boolean }, { type: 'never' }>();
    const machine = ready.createMachine({
      initial: 'check',
      context: { ready: false },
      states: {
        check: {
          always: ({ context }) => (context.ready ? { target: 'done' } : undefined),
          invoke: ready.createInvoke({
            src: () => Promise.resolve(),
            onDone: () => ({ context: { ready: true } }),
          }),
        },
        done: {},
      },
    });
    const actor = createActor(machine).start();

    await tick();

    expect(actor.getSnapshot().value).toBe('done');
  });

  it('applies a context-only always result and checks again', () => {
    const machine = setup<{ count: number }, { type: 'never' }>().createMachine({
      initial: 'count',
      context: { count: 0 },
      states: {
        count: {
          always: ({ context }) => (context.count < 3 ? { context: { count: context.count + 1 } } : { target: 'done' }),
        },
        done: {},
      },
    });

    expect(createActor(machine).start().getSnapshot()).toMatchObject({ value: 'done', context: { count: 3 } });
  });

  it('stops checking always once its context result no longer changes context', () => {
    let checks = 0;
    const machine = setup<{ count: number }, { type: 'never' }>().createMachine({
      initial: 'count',
      context: { count: 0 },
      states: {
        count: {
          always: ({ context }) => {
            checks += 1;
            if (checks > 10) {
              throw new Error('always is still being checked');
            }
            return { context: { count: Math.min(context.count + 1, 2) } };
          },
        },
      },
    });

    expect(createActor(machine).start().getSnapshot()).toMatchObject({ value: 'count', context: { count: 2 } });
    expect(checks).toBe(3);
  });

  it('notifies once for an event whose always transition follows', () => {
    const machine = setup<{ ready: boolean }, { type: 'READY' }>().createMachine({
      initial: 'check',
      context: { ready: false },
      states: {
        check: {
          always: ({ context }) => (context.ready ? { target: 'done' } : undefined),
          on: { READY: () => ({ context: { ready: true } }) },
        },
        done: {},
      },
    });
    const actor = createActor(machine).start();
    const seen: string[] = [];
    actor.subscribe(snapshot => seen.push(snapshot.value));

    actor.send({ type: 'READY' });

    expect(seen).toEqual(['done']);
  });
});

describe('createActor — inline invoke', () => {
  it('lands the resolved output in context via onDone', async () => {
    const actor = createActor(createLoaderMachine(() => Promise.resolve('payload'))).start();

    actor.send({ type: 'FETCH' });
    await tick();

    expect(actor.getSnapshot()).toMatchObject({ value: 'success', context: { data: 'payload' } });
  });

  it('routes a rejection to onError', async () => {
    const actor = createActor(createLoaderMachine(() => Promise.reject(new Error('boom')))).start();

    actor.send({ type: 'FETCH' });
    await tick();

    expect(actor.getSnapshot()).toMatchObject({ value: 'failure', context: { error: 'Error: boom' } });
  });

  it('routes a synchronous throw from src to onError', async () => {
    const actor = createActor(
      createLoaderMachine(() => {
        throw new Error('sync');
      }),
    ).start();

    actor.send({ type: 'FETCH' });
    await tick();

    expect(actor.getSnapshot()).toMatchObject({ value: 'failure', context: { error: 'Error: sync' } });
  });

  it('passes the mapped input to src', async () => {
    const destroy = vi.fn(() => Promise.resolve());
    const actor = createActor(createDeleteOrgMachine(destroy)).start();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM' });
    await tick();

    expect(destroy).toHaveBeenCalledWith({ name: 'Acme Inc', confirmValue: 'Acme Inc', error: null });
    expect(actor.getSnapshot()).toMatchObject({ value: 'deleted', status: 'done' });
  });

  it('runs no transition when stopped mid-flight', async () => {
    const gate = deferred<string>();
    const actor = createActor(createLoaderMachine(() => gate.promise)).start();
    actor.send({ type: 'FETCH' });

    actor.stop();
    gate.resolve('late');
    await tick();

    expect(actor.getSnapshot()).toMatchObject({ value: 'loading', status: 'stopped' });
  });

  it('drops the result and aborts the signal when the state is left first', async () => {
    const gate = deferred<string>();
    let signal: AbortSignal | undefined;
    const flow = setup<{ data: string }, { type: 'CANCEL' }>();
    const machine = flow.createMachine({
      initial: 'loading',
      context: { data: '' },
      states: {
        loading: {
          invoke: flow.createInvoke({
            src: (args: AsyncArgs<undefined>) => {
              signal = args.signal;
              return gate.promise;
            },
            onDone: ({ event }) => ({ target: 'done', context: { data: event.output } }),
          }),
          on: { CANCEL: { target: 'idle' } },
        },
        idle: {},
        done: {},
      },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'CANCEL' });
    gate.resolve('late');
    await tick();

    expect(signal?.aborted).toBe(true);
    expect(actor.getSnapshot()).toMatchObject({ value: 'idle', context: { data: '' } });
  });
});

describe('createActor — named actors', () => {
  type LoadContext = { id: string; out: string; error: string };
  const load = setup<LoadContext, { type: 'never' }>();

  function loadMachine(fetchById: (id: string) => Promise<string>) {
    return load.createMachine({
      initial: 'loading',
      context: { id: 'u1', out: '', error: '' },
      actors: { fetch: createAsyncLogic(({ input }: AsyncArgs<string>) => fetchById(input)) },
      states: {
        loading: {
          invoke: {
            src: 'fetch',
            input: ({ context }) => context.id,
            onDone: ({ event }) => ({ target: 'done', context: { out: event.output } }),
            onError: ({ event }) => ({ target: 'failed', context: { error: String(event.error) } }),
          },
        },
        done: {},
        failed: {},
      },
    });
  }

  it('invokes the named actor with the mapped input', async () => {
    const fetchById = vi.fn((id: string) => Promise.resolve(`user ${id}`));
    const actor = createActor(loadMachine(fetchById)).start();
    await tick();

    expect(fetchById).toHaveBeenCalledWith('u1');
    expect(actor.getSnapshot()).toMatchObject({ value: 'done', context: { out: 'user u1' } });
  });

  it('invokes the actor from provide()', async () => {
    const machine = loadMachine(() => Promise.resolve('original')).provide({
      actors: { fetch: createAsyncLogic(({ input }: AsyncArgs<string>) => Promise.resolve(`provided ${input}`)) },
    });
    const actor = createActor(machine).start();
    await tick();

    expect(actor.getSnapshot().context.out).toBe('provided u1');
  });

  it('routes a missing actor to onError', async () => {
    const machine = setup<{ error: string }, { type: 'never' }>().createMachine({
      initial: 'loading',
      context: { error: '' },
      actors: { fetch: createAsyncLogic(() => Promise.resolve('')) },
      states: {
        loading: {
          invoke: {
            src: 'fetch',
            onError: ({ event }) => ({ target: 'failed', context: { error: String(event.error) } }),
          },
        },
        failed: {},
      },
    });
    const actor = createActor(machine.provide({ actors: { fetch: undefined } })).start();
    await tick();

    expect(actor.getSnapshot()).toMatchObject({
      value: 'failed',
      context: { error: 'Error: [Clerk] Machine has no actor "fetch".' },
    });
  });
});

describe('createActor — final states', () => {
  it('marks the snapshot done and ignores further events', async () => {
    const actor = createActor(createLoaderMachine(() => Promise.resolve('x'))).start();
    actor.send({ type: 'FETCH' });
    await tick();
    const done = actor.getSnapshot();

    actor.send({ type: 'FETCH' });

    expect(done.status).toBe('done');
    expect(actor.getSnapshot()).toBe(done);
    expect(done.can({ type: 'FETCH' })).toBe(false);
  });
});

describe('snapshot.can()', () => {
  it('evaluates the transition fn without running its effects', () => {
    const effect = vi.fn();
    const machine = setup<{ ok: boolean }, { type: 'GO' }>().createMachine({
      initial: 'a',
      context: { ok: true },
      states: {
        a: {
          on: {
            GO: ({ context }, enq) => {
              enq(effect);
              return context.ok ? { target: 'b' } : undefined;
            },
          },
        },
        b: {},
      },
    });
    const actor = createActor(machine).start();

    expect(actor.getSnapshot().can({ type: 'GO' })).toBe(true);
    expect(effect).not.toHaveBeenCalled();
    expect(actor.getSnapshot().value).toBe('a');
  });

  it('answers for the snapshot it was read from', () => {
    const actor = createActor(toggleMachine()).start();
    const before = actor.getSnapshot();

    actor.send({ type: 'GO' });

    expect(before.can({ type: 'GO' })).toBe(true);
    expect(actor.getSnapshot().can({ type: 'GO' })).toBe(false);
  });

  it('returns false once stopped', () => {
    const actor = createActor(toggleMachine()).start();
    actor.stop();

    expect(actor.getSnapshot().can({ type: 'GO' })).toBe(false);
  });
});

describe('createActor — input', () => {
  it('builds context lazily from input', () => {
    const machine = setup<{ name: string; draft: string }, { type: 'never' }, { name: string }>().createMachine({
      initial: 'a',
      context: ({ input }) => ({ name: input.name, draft: '' }),
      states: { a: {} },
    });

    expect(createActor(machine, { input: { name: 'Acme' } }).getSnapshot().context).toEqual({
      name: 'Acme',
      draft: '',
    });
  });
});

describe('createActor — choice states', () => {
  type Ctx = { hasAuthenticator: boolean };
  const choose = setup<Ctx, { type: 'RESET' }, Ctx>();

  function choiceMachine() {
    return choose.createMachine({
      initial: 'start',
      context: ({ input }) => input,
      states: {
        start: {
          type: 'choice',
          choice: ({ context }) => (context.hasAuthenticator ? { target: 'verify' } : { target: 'pick' }),
        },
        pick: {},
        verify: { on: { RESET: () => ({ target: 'start', context: { hasAuthenticator: false } }) } },
      },
    });
  }

  it('resolves the initial choice before start', () => {
    expect(createActor(choiceMachine(), { input: { hasAuthenticator: true } }).getSnapshot().value).toBe('verify');
    expect(createActor(choiceMachine(), { input: { hasAuthenticator: false } }).getSnapshot().value).toBe('pick');
  });

  it('resolves a choice reached by a transition', () => {
    const actor = createActor(choiceMachine(), { input: { hasAuthenticator: true } }).start();

    actor.send({ type: 'RESET' });

    expect(actor.getSnapshot().value).toBe('pick');
  });
});

describe('createActor — route states', () => {
  type Ctx = { verified: boolean; step: string };
  const wizard = setup<Ctx, { type: 'VERIFY' }>();

  function wizardMachine(entry = vi.fn()) {
    return wizard.createMachine({
      initial: 'profile',
      context: { verified: false, step: '' },
      states: {
        profile: { id: 'profile', route: { context: { step: 'profile' } }, entry },
        security: { id: 'security', route: ({ context }) => context.verified },
        hidden: { on: { VERIFY: () => ({ context: { verified: true } }) } },
      },
    });
  }

  it('moves to a route state once its route allows it', () => {
    const actor = createActor(
      wizard.createMachine({
        initial: 'a',
        context: { verified: false, step: '' },
        states: {
          a: { on: { VERIFY: () => ({ context: { verified: true } }) } },
          b: { id: 'b', route: ({ context }) => context.verified },
        },
      }),
    ).start();
    expect(actor.getSnapshot().can({ type: 'machine.route', to: '#b' })).toBe(false);

    actor.send({ type: 'VERIFY' });
    actor.send({ type: 'machine.route', to: '#b' });

    expect(actor.getSnapshot().value).toBe('b');
  });

  it('blocks a route state whose route returns false', () => {
    const actor = createActor(wizardMachine()).start();
    const before = actor.getSnapshot();

    actor.send({ type: 'machine.route', to: '#security' });

    expect(actor.getSnapshot()).toBe(before);
  });

  it('applies the context a route returns', () => {
    const actor = createActor(wizardMachine()).start();

    actor.send({ type: 'machine.route', to: '#profile' });

    expect(actor.getSnapshot().context.step).toBe('profile');
  });

  it('re-enters the current state when routed to it', () => {
    const entry = vi.fn();
    const actor = createActor(wizardMachine(entry)).start();

    actor.send({ type: 'machine.route', to: '#profile' });

    expect(entry).toHaveBeenCalledTimes(2);
  });

  it('ignores an id with no route', () => {
    const snapshot = createActor(wizardMachine()).start().getSnapshot();

    expect(snapshot.can({ type: 'machine.route', to: '#hidden' })).toBe(false);
    expect(snapshot.can({ type: 'machine.route', to: '#missing' })).toBe(false);
  });
});

describe('restoreActor', () => {
  const context = { name: 'Acme Inc', confirmValue: '', error: 'shown' };

  it('seats the actor in the given state and context', () => {
    const machine = createDeleteOrgMachine(() => Promise.resolve());
    const actor = restoreActor(machine, machine.resolveState({ value: 'confirming', context }));

    expect(actor.getSnapshot()).toMatchObject({ value: 'confirming', status: 'active', context });
  });

  it('runs no invoke for the restored state, across a restart too', async () => {
    const destroy = vi.fn(() => Promise.resolve());
    const machine = createDeleteOrgMachine(destroy);
    const actor = restoreActor(machine, machine.resolveState({ value: 'deleting', context })).start();

    actor.stop();
    actor.start();
    await tick();

    expect(destroy).not.toHaveBeenCalled();
    expect(actor.getSnapshot()).toMatchObject({ value: 'deleting', status: 'active' });
  });

  it('reports done for a final state', () => {
    const machine = createDeleteOrgMachine(() => Promise.resolve());
    const actor = restoreActor(machine, machine.resolveState({ value: 'deleted', context }));

    expect(actor.getSnapshot().status).toBe('done');
  });

  it('takes events from the restored state', () => {
    const machine = createDeleteOrgMachine(() => Promise.resolve());
    const actor = restoreActor(machine, machine.resolveState({ value: 'confirming', context })).start();

    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot()).toMatchObject({ value: 'idle', context: { error: null } });
  });
});

describe('createActor — observable contract', () => {
  it('notifies subscribers on each transition and stops after unsubscribe', () => {
    const actor = createActor(toggleMachine()).start();
    const seen: string[] = [];
    const unsubscribe = actor.subscribe(snapshot => seen.push(snapshot.value));

    actor.send({ type: 'GO' });
    actor.send({ type: 'BACK' });
    unsubscribe();
    actor.send({ type: 'GO' });

    expect(seen).toEqual(['b', 'a']);
  });

  it('does not notify a listener another listener unsubscribed during the same pass', () => {
    const actor = createActor(toggleMachine()).start();
    const calls: string[] = [];
    const unsubscribeA = actor.subscribe(() => calls.push('A'));
    actor.subscribe(() => {
      calls.push('B');
      unsubscribeA();
    });

    actor.send({ type: 'GO' });

    expect(calls).toEqual(['B']);
  });

  it('keeps getSnapshot referentially stable until a change', () => {
    const actor = createActor(toggleMachine()).start();
    const first = actor.getSnapshot();

    expect(actor.getSnapshot()).toBe(first);
    actor.send({ type: 'GO' });
    expect(actor.getSnapshot()).not.toBe(first);
  });
});

describe('actor restart — stop/start resumes the current state', () => {
  it('takes events after stop() and start()', () => {
    const actor = createActor(toggleMachine()).start();
    actor.stop();
    expect(actor.getSnapshot().status).toBe('stopped');

    actor.start();
    actor.send({ type: 'GO' });

    expect(actor.getSnapshot()).toMatchObject({ value: 'b', status: 'active' });
  });

  it('does not re-run an in-flight invoke on restart', () => {
    const destroy = vi.fn(() => deferred<void>().promise);
    const actor = createActor(createDeleteOrgMachine(destroy)).start();
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM' });

    actor.stop();
    actor.start();

    expect(actor.getSnapshot()).toMatchObject({ value: 'deleting', status: 'active' });
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('applies an invoke that resolved while stopped once started again', async () => {
    const gate = deferred<string>();
    const actor = createActor(createLoaderMachine(() => gate.promise)).start();
    actor.send({ type: 'FETCH' });

    actor.stop();
    gate.resolve('loaded');
    await tick();
    actor.start();

    expect(actor.getSnapshot()).toMatchObject({ value: 'success', status: 'done', context: { data: 'loaded' } });
  });

  it('applies an invoke that rejected while stopped once started again', async () => {
    const gate = deferred<string>();
    const actor = createActor(createLoaderMachine(() => gate.promise)).start();
    actor.send({ type: 'FETCH' });

    actor.stop();
    gate.reject('boom');
    await tick();
    actor.start();

    expect(actor.getSnapshot()).toMatchObject({ value: 'failure', status: 'active', context: { error: 'boom' } });
  });

  it('handles an invoke that settles after the restart exactly once', async () => {
    const gate = deferred<string>();
    const seen: string[] = [];
    const actor = createActor(createLoaderMachine(() => gate.promise)).start();
    actor.send({ type: 'FETCH' });

    actor.stop();
    actor.start();
    actor.subscribe(snapshot => seen.push(snapshot.value));
    gate.resolve('late');
    await tick();

    expect(actor.getSnapshot()).toMatchObject({ value: 'success', context: { data: 'late' } });
    expect(seen).toEqual(['success']);
  });

  it('runs entry effects and the invoke once across start/stop/start', async () => {
    const effect = vi.fn();
    const src = vi.fn(() => Promise.resolve('ok'));
    const working = setup<{ out: string }, { type: 'never' }>();
    const machine = working.createMachine({
      initial: 'working',
      context: { out: '' },
      states: {
        working: {
          entry: (_, enq) => enq(effect),
          invoke: working.createInvoke({
            src,
            onDone: ({ event }) => ({ target: 'done', context: { out: event.output } }),
          }),
        },
        done: { type: 'final' },
      },
    });
    const actor = createActor(machine);

    actor.start();
    actor.stop();
    actor.start();
    await tick();

    expect(effect).toHaveBeenCalledTimes(1);
    expect(src).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot()).toMatchObject({ value: 'done', status: 'done', context: { out: 'ok' } });
  });

  it('never notifies or schedules work once stopped for good', async () => {
    vi.useFakeTimers();
    try {
      const gate = deferred<string>();
      const working = setup<Empty, { type: 'never' }>();
      const machine = working.createMachine({
        initial: 'working',
        context: {},
        states: {
          working: {
            invoke: working.createInvoke({ src: () => gate.promise, onDone: { target: 'done' } }),
            after: { 1000: { target: 'done' } },
          },
          done: {},
        },
      });
      const actor = createActor(machine).start();
      const listener = vi.fn();
      actor.subscribe(listener);

      actor.stop();
      listener.mockClear();
      expect(vi.getTimerCount()).toBe(0);
      gate.resolve('ignored');
      await vi.runAllTimersAsync();

      expect(listener).not.toHaveBeenCalled();
      expect(actor.getSnapshot()).toMatchObject({ value: 'working', status: 'stopped' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('queues events sent while stopped and applies them in order on start with one notify', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve())).start();
    actor.stop();
    const listener = vi.fn();
    actor.subscribe(listener);

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE', value: 'Acme' });
    expect(actor.getSnapshot()).toMatchObject({ value: 'idle', status: 'stopped' });
    expect(listener).not.toHaveBeenCalled();
    actor.start();

    expect(actor.getSnapshot()).toMatchObject({
      value: 'confirming',
      status: 'active',
      context: { confirmValue: 'Acme' },
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('applies an invoke result and events in the order they arrived while stopped', async () => {
    const gate = deferred<void>();
    const actor = createActor(createDeleteOrgMachine(() => gate.promise)).start();
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM' });

    actor.stop();
    gate.reject('boom');
    await tick();
    actor.send({ type: 'TYPE', value: 'retry' });
    actor.start();

    expect(actor.getSnapshot()).toMatchObject({
      value: 'confirming',
      context: { error: 'boom', confirmValue: 'retry' },
    });
  });

  it('drops an invoke result when an event queued before it leaves the invoking state', async () => {
    const gate = deferred<string>();
    const flow = setup<Empty, { type: 'GO' } | { type: 'CANCEL' }>();
    const machine = flow.createMachine({
      initial: 'idle',
      context: {},
      states: {
        idle: { on: { GO: { target: 'working' } } },
        working: {
          invoke: flow.createInvoke({ src: () => gate.promise, onDone: { target: 'done' } }),
          on: { CANCEL: { target: 'idle' } },
        },
        done: {},
      },
    });
    const actor = createActor(machine).start();
    actor.send({ type: 'GO' });

    actor.stop();
    actor.send({ type: 'CANCEL' });
    gate.resolve('late');
    await tick();
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('applies events sent before the first start in order, after entering the initial state', () => {
    const entered: string[] = [];
    const enter = (name: string) => entered.push(name);
    const machine = setup<Empty, { type: 'NEXT' }>().createMachine({
      initial: 'a',
      context: {},
      states: {
        a: { entry: (_, enq) => enq(enter, 'a'), on: { NEXT: { target: 'b' } } },
        b: { entry: (_, enq) => enq(enter, 'b'), on: { NEXT: { target: 'c' } } },
        c: { entry: (_, enq) => enq(enter, 'c') },
      },
    });
    const actor = createActor(machine);
    actor.send({ type: 'NEXT' });
    actor.send({ type: 'NEXT' });

    expect(entered).toEqual([]);
    actor.start();

    expect(entered).toEqual(['a', 'b', 'c']);
    expect(actor.getSnapshot().value).toBe('c');
  });

  it('keeps events sent before the first start when an initial entry effect stops the actor', () => {
    let stopOnce = () => {};
    const machine = setup<Empty, { type: 'NEXT' }>().createMachine({
      initial: 'a',
      context: {},
      states: { a: { entry: (_, enq) => enq(() => stopOnce()), on: { NEXT: { target: 'b' } } }, b: {} },
    });
    const actor = createActor(machine);
    stopOnce = () => {
      stopOnce = () => {};
      actor.stop();
    };
    actor.send({ type: 'NEXT' });

    actor.start();
    expect(actor.getSnapshot()).toMatchObject({ value: 'a', status: 'stopped' });
    actor.start();

    expect(actor.getSnapshot().value).toBe('b');
  });
});

describe('createActor — after', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const otp = setup<{ expiredAt: number }, { type: 'SUBMIT' }>();

  function otpMachine() {
    return otp.createMachine({
      initial: 'codeSent',
      context: { expiredAt: 0 },
      states: {
        codeSent: {
          after: { 60_000: ({ event }) => ({ target: 'expired', context: { expiredAt: event.delay } }) },
          on: { SUBMIT: { target: 'verifying' } },
        },
        expired: {},
        verifying: {},
      },
    });
  }

  it('moves after the delay and passes the delay on the event', () => {
    const actor = createActor(otpMachine()).start();

    vi.advanceTimersByTime(59_999);
    expect(actor.getSnapshot().value).toBe('codeSent');
    vi.advanceTimersByTime(1);

    expect(actor.getSnapshot()).toMatchObject({ value: 'expired', context: { expiredAt: 60_000 } });
  });

  it('cancels the timer when an event leaves the state first', () => {
    const actor = createActor(otpMachine()).start();

    actor.send({ type: 'SUBMIT' });
    vi.advanceTimersByTime(60_000);

    expect(actor.getSnapshot().value).toBe('verifying');
  });

  it('clears the other timer when the first one fires', () => {
    const machine = otp.createMachine({
      initial: 'waiting',
      context: { expiredAt: 0 },
      states: {
        waiting: { after: { 1000: { target: 'first' }, 2000: { target: 'second' } } },
        first: {},
        second: {},
      },
    });
    const actor = createActor(machine).start();

    vi.advanceTimersByTime(1000);

    expect(vi.getTimerCount()).toBe(0);
    expect(actor.getSnapshot().value).toBe('first');
  });

  it('stays when the after transition returns undefined', () => {
    const machine = otp.createMachine({
      initial: 'waiting',
      context: { expiredAt: 0 },
      states: {
        waiting: { after: { 1000: ({ context }) => (context.expiredAt > 0 ? { target: 'done' } : undefined) } },
        done: {},
      },
    });
    const actor = createActor(machine).start();

    vi.advanceTimersByTime(1000);

    expect(actor.getSnapshot().value).toBe('waiting');
  });

  it('pauses on stop() and re-arms on start()', () => {
    const actor = createActor(otpMachine()).start();

    actor.stop();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(60_000);
    expect(actor.getSnapshot().value).toBe('codeSent');

    actor.start();
    vi.advanceTimersByTime(60_000);
    expect(actor.getSnapshot().value).toBe('expired');
  });
});

describe('createActor — unknown states', () => {
  it('warns when a transition targets a state the machine does not define', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const machine = setup<Empty, { type: 'GO' }>().createMachine<string>({
      initial: 'a',
      context: {},
      states: { a: { on: { GO: { target: 'ghost' } } } },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'GO' });

    expect(warn).toHaveBeenCalledWith('[Clerk] Machine has no state "ghost".');
  });

  it('does not warn for an empty graph', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const machine = setup<Empty, { type: 'GO' }>().createMachine<string>({ initial: '', context: {}, states: {} });

    createActor(machine).start();

    expect(warn).not.toHaveBeenCalled();
  });
});
