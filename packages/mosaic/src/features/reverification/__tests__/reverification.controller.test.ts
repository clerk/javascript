import { describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../../__tests__/async';
import { createActor } from '../../../machine/create-actor';
import { type ReverificationDeps, reverificationMachine } from '../reverification.controller';
import type { ReverificationPreparation } from '../reverification.model';
import type {
  ReverificationMethod,
  ReverificationPreparableMethod,
  ReverificationResult,
} from '../reverification.types';

const email: ReverificationPreparableMethod = {
  id: 'email_code:alice',
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'alice',
  identifier: 'alice@example.com',
};
const work: ReverificationPreparableMethod = {
  id: 'email_code:work',
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'work',
  identifier: 'alice@work.example',
};

function deps(): ReverificationDeps {
  return {
    start: vi.fn(() =>
      Promise.resolve({ status: 'needs_first_factor', methods: [email, work], startingMethod: email }),
    ),
    prepare: vi.fn(() => Promise.resolve({ reusableUntil: Date.now() + 60_000 })),
    attempt: vi.fn(() => Promise.resolve({ status: 'complete', methods: [], startingMethod: null })),
    finish: vi.fn(async () => {}),
  };
}

describe('reverification operation ordering', () => {
  it.each(['unavailable', 'failed', 'retrying'] as const)('starts a new active scope directly from %s', async value => {
    const effects = deps();
    const actor = createActor(reverificationMachine, {
      snapshot: { value, context: { deps: effects, scope: { runId: Symbol(), sessionId: 'session' } } },
    }).start();
    actor.send({ type: 'START', scope: { runId: Symbol(), sessionId: 'session' } });
    await tick();
    expect(effects.start).toHaveBeenCalledOnce();
    actor.stop();
  });

  it('coalesces A to B to A selections while A is pending', async () => {
    const effects = deps();
    const password: ReverificationMethod = { id: 'password', stage: 'first', strategy: 'password' };
    effects.start = vi.fn(() =>
      Promise.resolve({ status: 'needs_first_factor', methods: [password, email, work], startingMethod: password }),
    );
    const pending = deferred<ReverificationPreparation>();
    effects.prepare = vi.fn(() => pending.promise);
    const actor = createActor(reverificationMachine, {
      context: { deps: effects },
    }).start();
    actor.send({ type: 'START', scope: { runId: Symbol(), sessionId: 'session' } });
    await tick();
    actor.send({ type: 'SHOW_METHODS' });
    actor.send({ type: 'SELECT_METHOD', id: email.id });
    actor.send({ type: 'SELECT_METHOD', id: work.id });
    actor.send({ type: 'SELECT_METHOD', id: email.id });
    pending.resolve({ reusableUntil: Date.now() + 60_000 });
    await tick();
    expect(effects.prepare).toHaveBeenCalledExactlyOnceWith(email);
    actor.send({ type: 'TYPE', value: '123456' });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(effects.attempt).toHaveBeenCalledExactlyOnceWith(email, '123456');
    actor.stop();
  });
});

describe('reverification interrupted requests', () => {
  it.each(['start', 'prepare', 'attempt', 'finish'] as const)(
    'waits for an interrupted %s before starting the latest run',
    async operation => {
      for (const fails of [false, true]) {
        const effects = deps();
        const result = deferred<ReverificationResult>();
        const preparation = deferred<ReverificationPreparation>();
        const finish = deferred<void>();
        if (operation === 'start') {
          effects.start = vi.fn(() => result.promise);
        }
        if (operation === 'prepare') {
          effects.prepare = vi.fn(() => preparation.promise);
        }
        if (operation === 'attempt') {
          effects.attempt = vi.fn(() => result.promise);
        }
        if (operation === 'finish') {
          effects.finish = vi.fn(() => finish.promise);
        }
        const actor = createActor(reverificationMachine, { context: { deps: effects } }).start();
        const start = () => {
          const scope = { runId: Symbol(), sessionId: 'session' };
          actor.send({ type: 'START', scope });
          return scope;
        };
        start();
        await tick();
        if (operation === 'attempt' || operation === 'finish') {
          actor.send({ type: 'SUBMIT' });
          await tick();
        }
        actor.send({ type: 'RESET' });
        start();
        actor.send({ type: 'RESET' });
        const latest = start();
        await tick();
        expect(effects.start).toHaveBeenCalledOnce();
        const nextStart = vi.fn(deps().start);
        actor.setContext({ deps: { ...deps(), start: nextStart } });
        if (operation === 'prepare') {
          if (fails) {
            preparation.reject(new Error('stale prepare'));
          } else {
            preparation.resolve({ reusableUntil: Date.now() + 60_000 });
          }
        } else if (operation === 'finish') {
          if (fails) {
            finish.reject(new Error('stale finish'));
          } else {
            finish.resolve();
          }
        } else {
          if (fails) {
            result.reject(new Error('stale result'));
          } else {
            result.resolve({ status: 'complete', methods: [], startingMethod: null });
          }
        }
        await tick();
        expect(nextStart).toHaveBeenCalledOnce();
        expect(actor.getSnapshot().context.scope).toBe(latest);
        expect(actor.getSnapshot().context.error).toBeUndefined();
        expect(effects.finish).toHaveBeenCalledTimes(operation === 'finish' ? 1 : 0);
        actor.stop();
      }
    },
  );

  it('checking whether a method can be selected never sends a code', async () => {
    const effects = deps();
    const actor = createActor(reverificationMachine, { context: { deps: effects } }).start();
    actor.send({ type: 'START', scope: { runId: Symbol(), sessionId: 'session' } });
    await tick();
    actor.send({ type: 'SHOW_METHODS' });
    expect(actor.can({ type: 'SELECT_METHOD', id: work.id })).toBe(true);
    expect(actor.can({ type: 'SELECT_METHOD', id: work.id })).toBe(true);
    expect(effects.prepare).toHaveBeenCalledExactlyOnceWith(email);
    actor.stop();
  });
});
