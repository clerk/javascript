import { describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../../__tests__/async';
import { createActor } from '../../../machine/create-actor';
import { type ReverificationDeps, reverificationMachine } from '../reverification.controller';
import type { ReverificationPreparation } from '../reverification.model';
import type { ReverificationPreparableMethod } from '../reverification.types';

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
    start: vi.fn(async () => ({ status: 'needs_first_factor', methods: [email, work], startingMethod: email })),
    prepare: vi.fn(async () => ({ status: 'unverified', strategy: 'email_code', expiresAt: Date.now() + 60_000 })),
    attempt: vi.fn(async () => ({ status: 'complete', methods: [], startingMethod: null })),
    finish: vi.fn(async () => {}),
  };
}

describe('reverification operation ordering', () => {
  it.each(['unavailable', 'failed', 'retrying'] as const)('starts a new active scope directly from %s', async value => {
    const effects = deps();
    const actor = createActor(reverificationMachine, {
      snapshot: { value, context: { deps: effects, scope: { runId: Symbol(), sessionId: 'session' } } },
    }).start();
    actor.setContext({ requestedScope: { runId: Symbol(), sessionId: 'session' } });
    actor.send({ type: 'START' });
    await tick();
    expect(effects.start).toHaveBeenCalledOnce();
    actor.stop();
  });

  it('coalesces A to B to A selections while A is pending', async () => {
    const effects = deps();
    const pending = deferred<ReverificationPreparation>();
    effects.prepare = vi.fn(() => pending.promise);
    const actor = createActor(reverificationMachine, {
      context: { deps: effects, requestedScope: { runId: Symbol(), sessionId: 'session' } },
    }).start();
    actor.send({ type: 'START' });
    await tick();
    actor.send({ type: 'SHOW_METHODS' });
    actor.send({ type: 'SELECT_METHOD', id: work.id });
    actor.send({ type: 'SELECT_METHOD', id: email.id });
    pending.resolve({ status: 'unverified', strategy: 'email_code', expiresAt: Date.now() + 60_000 });
    await tick();
    expect(effects.prepare).toHaveBeenCalledExactlyOnceWith(email);
    actor.send({ type: 'TYPE', value: '123456' });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(effects.attempt).toHaveBeenCalledExactlyOnceWith(email, '123456');
    actor.stop();
  });
});
