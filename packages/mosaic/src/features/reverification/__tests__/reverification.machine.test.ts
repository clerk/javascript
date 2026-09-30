import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../../machine/createActor';
import { reverificationMachine } from '../reverification.machine';
import type { ReverificationMethod, ReverificationResult } from '../reverification.types';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

const password: ReverificationMethod = { id: 'password', stage: 'first', strategy: 'password' };
const email: ReverificationMethod = {
  id: 'email_code:ema_1',
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'ema_1',
  identifier: 'a***@example.com',
};

const result = (startingMethod: ReverificationMethod | null): ReverificationResult => ({
  status: 'needs_first_factor',
  methods: [password, email],
  startingMethod,
});

function start(
  startingMethod: ReverificationMethod | null,
  overrides: Partial<{ prepareFactor: () => Promise<void>; attemptFactor: () => Promise<ReverificationResult> }> = {},
) {
  const actors = {
    startVerification: vi.fn(() => Promise.resolve(result(startingMethod))),
    prepareFactor: vi.fn(overrides.prepareFactor ?? (() => Promise.resolve())),
    attemptFactor: vi.fn(
      overrides.attemptFactor ?? (() => Promise.resolve<ReverificationResult>(result(startingMethod))),
    ),
    finishVerification: vi.fn(() => Promise.resolve()),
  };
  const actor = createActor(reverificationMachine, { actors }).start();
  return { actor, actors };
}

describe('reverification machine', () => {
  it('lands on the starting factor', async () => {
    const { actor } = start(password);
    expect(actor.getSnapshot().value).toBe('starting');

    await tick();

    expect(actor.getSnapshot().value).toBe('factor.editing.ready');
    expect(actor.getSnapshot().context.activeMethod).toEqual(password);
  });

  it('is unavailable when there is no usable method', async () => {
    const { actor } = start(null);
    await tick();

    expect(actor.getSnapshot().value).toBe('unavailable');
  });

  it('prepares a factor that needs it, then waits for input', async () => {
    const prepared = deferred<void>();
    const { actor, actors } = start(email, { prepareFactor: () => prepared.promise });
    await tick();
    expect(actor.getSnapshot().value).toBe('factor.editing.preparing.idle');

    prepared.resolve();
    await tick();

    expect(actors.prepareFactor).toHaveBeenCalledWith(email);
    expect(actor.getSnapshot().value).toBe('factor.editing.ready');
  });

  it('queues a submit made while preparing and sends it once prepared', async () => {
    const prepared = deferred<void>();
    const { actor, actors } = start(email, { prepareFactor: () => prepared.promise });
    await tick();

    actor.send({ type: 'TYPE', value: '123456' });
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('factor.editing.preparing.queued');
    expect(actors.attemptFactor).not.toHaveBeenCalled();

    prepared.resolve();
    await tick();

    expect(actors.attemptFactor).toHaveBeenCalledWith({ method: email, value: '123456' });
  });

  it('shows the error and returns to the factor when an attempt fails', async () => {
    const { actor } = start(password, { attemptFactor: () => Promise.reject(new Error('Incorrect password')) });
    await tick();

    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('factor.submitting');
    actor.send({ type: 'SHOW_HELP' });
    expect(actor.getSnapshot().value).toBe('factor.submitting');
    await tick();

    expect(actor.getSnapshot().value).toBe('factor.editing.ready');
    expect(actor.getSnapshot().context.errorMessage).toBe('Incorrect password');
  });

  it('returns from help to wherever it was opened', async () => {
    const { actor } = start(password);
    await tick();

    actor.send({ type: 'SHOW_HELP' });
    expect(actor.getSnapshot().value).toBe('factor.help');
    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('factor.editing.ready');

    actor.send({ type: 'SHOW_METHODS' });
    actor.send({ type: 'SHOW_HELP' });
    expect(actor.getSnapshot().value).toBe('methods.help');
    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('methods.list');
  });

  it('keeps the current method active until a picked method is prepared', async () => {
    const prepared = deferred<void>();
    const { actor } = start(password, { prepareFactor: () => prepared.promise });
    await tick();

    actor.send({ type: 'SHOW_METHODS' });
    actor.send({ type: 'SELECT_METHOD', id: email.id });
    expect(actor.getSnapshot().value).toBe('methods.preparing');
    expect(actor.getSnapshot().context.activeMethod).toEqual(password);
    expect(actor.getSnapshot().context.pendingMethod).toEqual(email);

    prepared.resolve();
    await tick();

    expect(actor.getSnapshot().value).toBe('factor.editing.ready');
    expect(actor.getSnapshot().context.activeMethod).toEqual(email);
    expect(actor.getSnapshot().context.pendingMethod).toBeNull();
  });

  it('switches straight to a method that needs no preparation', async () => {
    const { actor } = start(email);
    await tick();
    await tick();

    actor.send({ type: 'SHOW_METHODS' });
    actor.send({ type: 'SELECT_METHOD', id: password.id });

    expect(actor.getSnapshot().value).toBe('factor.editing.ready');
    expect(actor.getSnapshot().context.activeMethod).toEqual(password);
  });

  it('finishes once verification is complete', async () => {
    const { actor, actors } = start(password, {
      attemptFactor: () => Promise.resolve({ status: 'complete', methods: [], startingMethod: null }),
    });
    await tick();

    actor.send({ type: 'SUBMIT' });
    await tick();
    await tick();

    expect(actors.finishVerification).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().value).toBe('verified');
    expect(actor.getSnapshot().status).toBe('done');
  });
});
