import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it, vi } from 'vitest';

import { reverificationMachine } from '../../features/reverification/reverification.machine';
import type { ReverificationMethod, ReverificationResult } from '../../features/reverification/reverification.types';
import { childActor, createActor } from '../../machine/createActor';
import { destructiveMachine } from './destructive.machine';

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

function setupFlow(action: () => Promise<unknown>) {
  const actors = {
    action: vi.fn(action),
    reverification: reverificationMachine,
    startVerification: vi.fn(() => Promise.resolve(needsFactor)),
    prepareFactor: vi.fn(() => Promise.resolve()),
    attemptFactor: vi.fn(() => Promise.resolve(complete)),
    finishVerification: vi.fn(() => Promise.resolve()),
  };
  const actor = createActor(destructiveMachine, { actors, context: { reverifiable: true } }).start();
  const reverification = () => childActor(actor.getSnapshot().children.reverification, reverificationMachine);
  return { actor, actors, reverification };
}

describe('destructive flow', () => {
  it('closes after the action succeeds', async () => {
    const { actor, actors } = setupFlow(() => Promise.resolve());

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('open.running');
    await tick();

    expect(actors.action).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().value).toBe('closed');
  });

  it('cannot be closed while the action runs', () => {
    const { actor } = setupFlow(() => new Promise(() => {}));

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });
    actor.send({ type: 'CLOSE' });

    expect(actor.getSnapshot().value).toBe('open.running');
  });

  it('shows an error when the action fails and lets the user try again', async () => {
    const { actor, actors } = setupFlow(() => Promise.reject(new Error('boom')));

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });
    await tick();
    expect(actor.getSnapshot().value).toBe('open.failed');
    expect(actor.getSnapshot().context.errorMessage).toBe('Something went wrong');

    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('open.running');
    expect(actors.action).toHaveBeenCalledTimes(2);
  });

  it('reverifies, retries the action and closes', async () => {
    let calls = 0;
    const { actor, actors, reverification } = setupFlow(() =>
      ++calls === 1 ? Promise.reject(needsReverification()) : Promise.resolve(),
    );

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });
    await tick();
    expect(actor.getSnapshot().value).toBe('open.verifying.challenge');
    expect(reverification()?.getSnapshot().value).toBe('factor.editing.ready');

    reverification()?.send({ type: 'TYPE', value: 'hunter2' });
    reverification()?.send({ type: 'SUBMIT' });
    await tick();
    await tick();

    expect(actors.attemptFactor).toHaveBeenCalledWith({ method: password, value: 'hunter2' });
    expect(actors.finishVerification).toHaveBeenCalledTimes(1);
    expect(actors.action).toHaveBeenCalledTimes(2);
    expect(actor.getSnapshot().value).toBe('closed');
    expect(actor.getSnapshot().children).toEqual({});
  });

  it('keeps the dialog open and pending while retrying', async () => {
    let calls = 0;
    const { actor, reverification } = setupFlow(() =>
      ++calls === 1 ? Promise.reject(needsReverification()) : new Promise(() => {}),
    );

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });
    await tick();
    reverification()?.send({ type: 'SUBMIT' });
    await tick();
    await tick();

    expect(actor.getSnapshot().value).toBe('open.verifying.retrying');
    expect(reverification()?.getSnapshot().value).toBe('verified');
    actor.send({ type: 'CLOSE' });
    expect(actor.getSnapshot().value).toBe('open.verifying.retrying');
  });

  it('stops reverification and skips the retry when closed during the challenge', async () => {
    const { actor, actors, reverification } = setupFlow(() => Promise.reject(needsReverification()));

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });
    await tick();
    const child = reverification();

    actor.send({ type: 'CLOSE' });

    expect(actor.getSnapshot().value).toBe('closed');
    expect(child?.getSnapshot().status).toBe('stopped');
    expect(actors.action).toHaveBeenCalledTimes(1);
  });

  it('closes when the session changes during the challenge', async () => {
    const { actor } = setupFlow(() => Promise.reject(needsReverification()));

    actor.send({ type: 'SESSION_CHANGED' });
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });
    await tick();
    actor.send({ type: 'SESSION_CHANGED' });

    expect(actor.getSnapshot().value).toBe('closed');
  });

  it('treats a reverification error as a failure when it cannot reverify', async () => {
    const actor = createActor(destructiveMachine, {
      actors: { action: () => Promise.reject(needsReverification()) },
    }).start();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });
    await tick();

    expect(actor.getSnapshot().value).toBe('open.failed');
  });

  it('shows the error when the retry fails', async () => {
    let calls = 0;
    const { actor, reverification } = setupFlow(() =>
      ++calls === 1 ? Promise.reject(needsReverification()) : Promise.reject(new Error('boom')),
    );

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });
    await tick();
    reverification()?.send({ type: 'SUBMIT' });
    await tick();
    await tick();

    expect(actor.getSnapshot().value).toBe('open.failed');
  });
});
