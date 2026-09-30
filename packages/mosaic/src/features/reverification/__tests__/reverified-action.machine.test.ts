import { ClerkAPIResponseError, isReverificationCancelledError } from '@clerk/shared/error';
import { describe, expect, it, vi } from 'vitest';

import { childActor, createActor } from '../../../machine/createActor';
import { provide } from '../../../machine/createMachine';
import { reverificationMachine } from '../reverification.machine';
import type { ReverificationMethod, ReverificationResult } from '../reverification.types';
import { reverifiedActionMachine } from '../reverified-action.machine';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const password: ReverificationMethod = { id: 'password', stage: 'first', strategy: 'password' };

const needsReverification = () =>
  new ClerkAPIResponseError('reverify', {
    data: [{ code: 'session_reverification_required', message: 'Reverify', long_message: 'Reverify' }],
    status: 403,
  });

const needsFactor: ReverificationResult = {
  status: 'needs_first_factor',
  methods: [password],
  startingMethod: password,
};
const complete: ReverificationResult = { status: 'complete', methods: [], startingMethod: null };

function run(action: () => Promise<unknown>) {
  const challenge = {
    startVerification: vi.fn(() => Promise.resolve(needsFactor)),
    prepareFactor: vi.fn(() => Promise.resolve()),
    attemptFactor: vi.fn(() => Promise.resolve(complete)),
    finishVerification: vi.fn(() => Promise.resolve()),
  };
  const spy = vi.fn(action);
  const actor = createActor(reverifiedActionMachine, {
    actors: { action: spy, reverification: provide(reverificationMachine, challenge) },
  }).start();
  const reverification = () => childActor(actor.getSnapshot().children.reverification, reverificationMachine);
  return { actor, action: spy, challenge, reverification };
}

describe('reverified action', () => {
  it('finishes when the action succeeds', async () => {
    const { actor } = run(() => Promise.resolve());
    await tick();

    expect(actor.getSnapshot().status).toBe('done');
  });

  it('fails with the error when the action fails for another reason', async () => {
    const boom = new Error('boom');
    const { actor } = run(() => Promise.reject(boom));
    await tick();

    expect(actor.getSnapshot().status).toBe('error');
    expect(actor.getSnapshot().error).toBe(boom);
  });

  it('reverifies, retries the action and finishes', async () => {
    let calls = 0;
    const { actor, action, challenge, reverification } = run(() =>
      ++calls === 1 ? Promise.reject(needsReverification()) : Promise.resolve(),
    );
    await tick();
    expect(actor.getSnapshot().value).toBe('verifying.challenge');
    expect(actor.getSnapshot().hasTag('interactive')).toBe(true);
    expect(actor.getSnapshot().hasTag('cancellable')).toBe(true);

    await tick();
    reverification()?.send({ type: 'TYPE', value: 'hunter2' });
    reverification()?.send({ type: 'SUBMIT' });
    await tick();
    await tick();

    expect(challenge.attemptFactor).toHaveBeenCalledWith({ method: password, value: 'hunter2' });
    expect(action).toHaveBeenCalledTimes(2);
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('stays interactive but not cancellable while retrying', async () => {
    let calls = 0;
    const { actor, reverification } = run(() =>
      ++calls === 1 ? Promise.reject(needsReverification()) : new Promise(() => {}),
    );
    await tick();
    await tick();
    reverification()?.send({ type: 'SUBMIT' });
    await tick();
    await tick();

    expect(actor.getSnapshot().value).toBe('verifying.retrying');
    expect(actor.getSnapshot().hasTag('interactive')).toBe(true);
    expect(actor.getSnapshot().hasTag('cancellable')).toBe(false);
  });

  it('fails with the retry error when the retry fails', async () => {
    let calls = 0;
    const boom = new Error('boom');
    const { actor, reverification } = run(() =>
      ++calls === 1 ? Promise.reject(needsReverification()) : Promise.reject(boom),
    );
    await tick();
    await tick();
    reverification()?.send({ type: 'SUBMIT' });
    await tick();
    await tick();

    expect(actor.getSnapshot().status).toBe('error');
    expect(actor.getSnapshot().error).toBe(boom);
  });

  it('is cancelled when the session changes during the challenge', async () => {
    const { actor, action } = run(() => Promise.reject(needsReverification()));
    await tick();

    actor.send({ type: 'SESSION_CHANGED' });

    expect(actor.getSnapshot().status).toBe('error');
    expect(isReverificationCancelledError(actor.getSnapshot().error)).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);
  });
});
