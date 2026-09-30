import { describe, expect, it, vi } from 'vitest';

import { childActor, createActor } from '../createActor';
import { createMachine } from '../createMachine';
import { stateIn } from '../guards';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  let reject: (reason?: unknown) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

type Evt = { type: 'NEXT' } | { type: 'CLOSE' } | { type: 'BACK' } | { type: 'JUMP' };

describe('nested states', () => {
  it('enters the initial leaf and exposes it as a dotted value', () => {
    const machine = createMachine<object, Evt>({
      initial: 'open',
      states: { open: { initial: 'confirming', states: { confirming: {}, running: {} } } },
    });

    const snapshot = createActor(machine).start().getSnapshot();

    expect(snapshot.value).toBe('open.confirming');
    expect(snapshot.matches('open')).toBe(true);
    expect(snapshot.matches('open.confirming')).toBe(true);
    expect(snapshot.matches('open.running')).toBe(false);
    expect(snapshot.matches('ope')).toBe(false);
  });

  it('bubbles unhandled events to the parent and lets children override them', () => {
    const machine = createMachine<object, Evt>({
      initial: 'open',
      states: {
        closed: {},
        open: {
          initial: 'confirming',
          on: { CLOSE: 'closed' },
          states: {
            confirming: { on: { NEXT: 'running' } },
            running: { on: { CLOSE: {} } },
          },
        },
      },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'NEXT' });
    actor.send({ type: 'CLOSE' });
    expect(actor.getSnapshot().value).toBe('open.running');

    const other = createActor(machine).start();
    other.send({ type: 'CLOSE' });
    expect(other.getSnapshot().value).toBe('closed');
  });

  it('resolves sibling, child and #id targets', () => {
    const machine = createMachine<object, Evt>({
      id: 'root',
      initial: 'a',
      states: {
        a: {
          initial: 'one',
          on: { JUMP: '.two' },
          states: {
            one: { on: { NEXT: 'two' } },
            two: { on: { BACK: '#root.b' } },
          },
        },
        b: { on: { NEXT: 'a.two' } },
      },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('a.two');
    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('b');
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('a.two');

    const jumper = createActor(machine).start();
    jumper.send({ type: 'JUMP' });
    expect(jumper.getSnapshot().value).toBe('a.two');
  });

  it('exits up to the shared parent and enters down to the target leaf', () => {
    const log: string[] = [];
    const track = (name: string) => ({ entry: () => log.push(`enter ${name}`), exit: () => log.push(`exit ${name}`) });
    const machine = createMachine<object, Evt>({
      initial: 'a',
      states: {
        a: {
          ...track('a'),
          initial: 'one',
          states: { one: { ...track('a.one'), on: { NEXT: 'two', JUMP: '#b' } }, two: track('a.two') },
        },
        b: { id: 'b', ...track('b'), initial: 'x', states: { x: track('b.x') } },
      },
    });
    const actor = createActor(machine).start();
    log.length = 0;

    actor.send({ type: 'NEXT' });
    expect(log).toEqual(['exit a.one', 'enter a.two']);

    const other = createActor(machine).start();
    log.length = 0;
    other.send({ type: 'JUMP' });
    expect(log).toEqual(['exit a.one', 'exit a', 'enter b', 'enter b.x']);
  });

  it('keeps a parent invoke running across child transitions', async () => {
    const work = deferred<string>();
    const src = vi.fn(() => work.promise);
    const machine = createMachine<object, Evt>({
      initial: 'busy',
      states: {
        busy: {
          initial: 'one',
          invoke: { src, onDone: 'done' },
          states: { one: { on: { NEXT: 'two' } }, two: {} },
        },
        done: {},
      },
    });
    const actor = createActor(machine).start();

    actor.send({ type: 'NEXT' });
    work.resolve('ok');
    await tick();

    expect(src).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().value).toBe('done');
  });
});

describe('invoking a child machine', () => {
  type ChildCtx = { level: string; code: string };
  const child = createMachine<ChildCtx, { type: 'SUBMIT'; code: string }>({
    id: 'child',
    initial: 'waiting',
    context: { level: '', code: '' },
    states: {
      waiting: {
        on: {
          SUBMIT: ({ event }) => ({ target: 'verified', context: { code: event.code } }),
        },
      },
      verified: { type: 'final' },
    },
  });

  const parent = createMachine<{ level: string; output: unknown }, Evt>({
    initial: 'idle',
    context: { level: 'strict', output: undefined },
    states: {
      idle: { on: { NEXT: 'verifying' } },
      verifying: {
        on: { CLOSE: 'idle' },
        invoke: {
          id: 'verify',
          src: 'verifier',
          input: ctx => ({ level: ctx.level }),
          onDone: ({ event }) => ({ target: 'done', context: { output: event.output } }),
        },
      },
      done: {},
    },
  });

  it('starts the child with input and exposes it on snapshot.children', () => {
    const actor = createActor(parent, { actors: { verifier: child } }).start();
    expect(actor.getSnapshot().children.verify).toBeUndefined();

    actor.send({ type: 'NEXT' });
    const verify = childActor(actor.getSnapshot().children.verify, child);

    expect(verify?.getSnapshot().value).toBe('waiting');
    expect(verify?.getSnapshot().context.level).toBe('strict');
  });

  it('takes onDone with the child context once the child reaches a final state', async () => {
    const actor = createActor(parent, { actors: { verifier: child } }).start();
    actor.send({ type: 'NEXT' });

    childActor(actor.getSnapshot().children.verify, child)?.send({ type: 'SUBMIT', code: '123' });
    await tick();

    expect(actor.getSnapshot().value).toBe('done');
    expect(actor.getSnapshot().context.output).toEqual({ level: 'strict', code: '123' });
    expect(actor.getSnapshot().children.verify).toBeUndefined();
  });

  it('stops the child when the invoking state is exited', () => {
    const actor = createActor(parent, { actors: { verifier: child } }).start();
    actor.send({ type: 'NEXT' });
    const verify = childActor(actor.getSnapshot().children.verify, child);

    actor.send({ type: 'CLOSE' });

    expect(verify?.getSnapshot().status).toBe('stopped');
    expect(actor.getSnapshot().children.verify).toBeUndefined();
  });

  it('shares provided actors with the child', async () => {
    const check = vi.fn((input: unknown) => Promise.resolve(input));
    const grandchild = createMachine<{ level: string }, Evt>({
      initial: 'checking',
      context: { level: '' },
      states: {
        checking: { invoke: { src: 'check', input: ctx => ctx.level, onDone: 'ok' } },
        ok: { type: 'final' },
      },
    });
    const actor = createActor(parent, { actors: { verifier: grandchild, check } }).start();

    actor.send({ type: 'NEXT' });
    await tick();
    await tick();

    expect(check).toHaveBeenCalledWith('strict');
    expect(actor.getSnapshot().value).toBe('done');
  });

  it('returns undefined from childActor for a different machine', () => {
    const actor = createActor(parent, { actors: { verifier: child } }).start();
    actor.send({ type: 'NEXT' });

    expect(childActor(actor.getSnapshot().children.verify, parent)).toBeUndefined();
  });
});

describe('stateIn', () => {
  it('lets a parent transition branch on the active child', async () => {
    const work = deferred<void>();
    const machine = createMachine<object, Evt>({
      initial: 'preparing',
      states: {
        preparing: {
          initial: 'idle',
          invoke: {
            src: () => work.promise,
            onDone: [{ target: 'submitting', guard: stateIn('preparing.queued') }, { target: 'ready' }],
          },
          states: { idle: { on: { NEXT: 'queued' } }, queued: {} },
        },
        submitting: {},
        ready: {},
      },
    });
    const queued = createActor(machine).start();
    const plain = createActor(machine).start();

    queued.send({ type: 'NEXT' });
    work.resolve();
    await tick();

    expect(queued.getSnapshot().value).toBe('submitting');
    expect(plain.getSnapshot().value).toBe('ready');
  });
});
