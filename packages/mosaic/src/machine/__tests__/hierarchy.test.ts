import { describe, expect, it, vi } from 'vitest';

import { childActor, createActor } from '../createActor';
import { createMachine, provide } from '../createMachine';
import { childHasTag, stateIn } from '../guards';

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

describe('tags', () => {
  it('reports the tags of the active state and its ancestors', () => {
    const machine = createMachine<object, Evt>({
      initial: 'open',
      states: {
        open: {
          tags: ['visible'],
          initial: 'editing',
          states: { editing: { tags: ['cancellable'], on: { NEXT: 'saving' } }, saving: {} },
        },
      },
    });
    const actor = createActor(machine).start();

    expect(actor.getSnapshot().hasTag('visible')).toBe(true);
    expect(actor.getSnapshot().hasTag('cancellable')).toBe(true);

    actor.send({ type: 'NEXT' });

    expect(actor.getSnapshot().hasTag('visible')).toBe(true);
    expect(actor.getSnapshot().hasTag('cancellable')).toBe(false);
  });

  it('lets a parent guard on a tag of an invoked child', () => {
    const child = createMachine<object, Evt>({
      initial: 'waiting',
      states: { waiting: { tags: ['cancellable'], on: { NEXT: 'busy' } }, busy: {} },
    });
    const parent = createMachine<object, Evt>({
      initial: 'working',
      states: {
        working: {
          invoke: { id: 'job', src: child },
          on: { CLOSE: [{ target: 'closed', guard: childHasTag('job', 'cancellable') }, {}] },
        },
        closed: {},
      },
    });
    const busy = createActor(parent).start();
    busy.getSnapshot().children.job?.send({ type: 'NEXT' } as never);
    busy.send({ type: 'CLOSE' });
    expect(busy.getSnapshot().value).toBe('working');

    const waiting = createActor(parent).start();
    waiting.send({ type: 'CLOSE' });
    expect(waiting.getSnapshot().value).toBe('closed');
  });
});

describe('a child that finishes with an error', () => {
  it('takes the parent onError with the error', async () => {
    const child = createMachine<{ reason: string }, Evt>({
      initial: 'working',
      context: { reason: 'nope' },
      states: {
        working: { on: { NEXT: 'failed' } },
        failed: { type: 'final', error: ctx => new Error(ctx.reason) },
      },
    });
    const parent = createMachine<{ error: unknown }, Evt>({
      initial: 'running',
      context: { error: undefined },
      states: {
        running: {
          invoke: {
            id: 'job',
            src: child,
            onDone: 'done',
            onError: ({ event }) => ({ target: 'failed', context: { error: event.error } }),
          },
        },
        done: {},
        failed: {},
      },
    });
    const actor = createActor(parent).start();
    const job = childActor(actor.getSnapshot().children.job, child);

    job?.send({ type: 'NEXT' });
    expect(job?.getSnapshot().status).toBe('error');
    expect(job?.getSnapshot().error).toEqual(new Error('nope'));
    await tick();

    expect(actor.getSnapshot().value).toBe('failed');
    expect(actor.getSnapshot().context.error).toEqual(new Error('nope'));
  });
});

describe('provide', () => {
  const child = createMachine<object, Evt>({
    initial: 'working',
    states: { working: { invoke: { src: 'work', onDone: 'done' } }, done: { type: 'final' } },
  });

  it('binds actors to a machine', async () => {
    const work = vi.fn(() => Promise.resolve());
    const actor = createActor(provide(child, { work })).start();
    await tick();

    expect(work).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().value).toBe('done');
  });

  it('keeps a child on its own actors when the parent has one with the same name', async () => {
    const own = vi.fn(() => Promise.resolve());
    const parentWork = vi.fn(() => new Promise<void>(() => {}));
    const parent = createMachine<object, Evt>({
      initial: 'running',
      states: { running: { invoke: { id: 'job', src: 'job', onDone: 'done' } }, done: {} },
    });
    const actor = createActor(parent, { actors: { job: provide(child, { work: own }), work: parentWork } }).start();
    await tick();
    await tick();

    expect(own).toHaveBeenCalledTimes(1);
    expect(parentWork).not.toHaveBeenCalled();
    expect(actor.getSnapshot().value).toBe('done');
  });

  it('is still recognised by childActor as the original machine', () => {
    const provided = provide(child, { work: () => new Promise<void>(() => {}) });
    const parent = createMachine<object, Evt>({
      initial: 'running',
      states: { running: { invoke: { id: 'job', src: provided } } },
    });
    const actor = createActor(parent).start();

    expect(childActor(actor.getSnapshot().children.job, child)?.getSnapshot().value).toBe('working');
  });
});
