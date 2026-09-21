import type { SignInResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { createSignInMachine } from '../signInMachine';
import { deferred, noop, tick } from './test-utils';

const makeAttempt = (status: string) => vi.fn().mockResolvedValue({ status } as SignInResource);

describe('signInMachine — initial state', () => {
  it('starts in collectingIdentifier', () => {
    const actor = createActor(createSignInMachine({ createAttemptFn: noop as never, resetPasswordFn: noop as never }));
    actor.start();
    expect(actor.getSnapshot().value).toBe('collectingIdentifier');
  });

  it('exposes every step as a named state — the whole flow is readable at a glance', () => {
    const machine = createSignInMachine({ createAttemptFn: noop as never, resetPasswordFn: noop as never });
    expect(Object.keys(machine.states)).toEqual([
      'collectingIdentifier',
      'submittingIdentifier',
      'routingIdentifier',
      'firstFactor',
      'secondFactor',
      'clientTrust',
      'resetPassword',
      'submittingResetPassword',
      'routingReset',
      'resetPasswordSuccess',
      'complete',
    ]);
  });
});

describe('signInMachine — identifier collection', () => {
  it('updates identifier in context on TYPE_IDENTIFIER', () => {
    const actor = createActor(createSignInMachine({ createAttemptFn: noop as never, resetPasswordFn: noop as never }));
    actor.start();
    actor.send({ type: 'TYPE_IDENTIFIER', value: 'alex@example.com' });
    expect(actor.getSnapshot().context.identifier).toBe('alex@example.com');
  });

  it('clears error when typing', async () => {
    const actor = createActor(
      createSignInMachine({
        createAttemptFn: vi.fn().mockRejectedValue(new Error('bad')),
        resetPasswordFn: noop as never,
      }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();

    actor.send({ type: 'TYPE_IDENTIFIER', value: 'alex@example.com' });
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('moves to submittingIdentifier on SUBMIT', () => {
    const gate = deferred<{ status: string }>();
    const actor = createActor(
      createSignInMachine({ createAttemptFn: () => gate.promise as never, resetPasswordFn: noop as never }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('submittingIdentifier');
  });
});

describe('signInMachine — identifier submission branches', () => {
  it('routes to firstFactor on needs_first_factor', async () => {
    const actor = createActor(
      createSignInMachine({ createAttemptFn: makeAttempt('needs_first_factor'), resetPasswordFn: noop as never }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('firstFactor');
  });

  it('routes to secondFactor on needs_second_factor', async () => {
    const actor = createActor(
      createSignInMachine({ createAttemptFn: makeAttempt('needs_second_factor'), resetPasswordFn: noop as never }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('secondFactor');
  });

  it('routes to clientTrust on needs_client_trust', async () => {
    const actor = createActor(
      createSignInMachine({ createAttemptFn: makeAttempt('needs_client_trust'), resetPasswordFn: noop as never }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('clientTrust');
  });

  it('routes to resetPassword on needs_new_password (forced reset flow)', async () => {
    const actor = createActor(
      createSignInMachine({ createAttemptFn: makeAttempt('needs_new_password'), resetPasswordFn: noop as never }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('resetPassword');
  });

  it('reaches complete (final) on status complete', async () => {
    const actor = createActor(
      createSignInMachine({ createAttemptFn: makeAttempt('complete'), resetPasswordFn: noop as never }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('complete');
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('returns to collectingIdentifier with error on failure', async () => {
    const actor = createActor(
      createSignInMachine({
        createAttemptFn: vi.fn().mockRejectedValue(new Error('Identifier is invalid.')),
        resetPasswordFn: noop as never,
      }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('collectingIdentifier');
    expect(actor.getSnapshot().context.error).toBe('Error: Identifier is invalid.');
  });
});

describe('signInMachine — firstFactor handoff', () => {
  async function inFirstFactor() {
    const actor = createActor(
      createSignInMachine({ createAttemptFn: makeAttempt('needs_first_factor'), resetPasswordFn: noop as never }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    return actor;
  }

  it('advances to complete on FACTOR_COMPLETE with status complete', async () => {
    const actor = await inFirstFactor();
    actor.send({ type: 'FACTOR_COMPLETE', nextStatus: 'complete' });
    expect(actor.getSnapshot().value).toBe('complete');
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('advances to secondFactor on FACTOR_COMPLETE with needs_second_factor', async () => {
    const actor = await inFirstFactor();
    actor.send({ type: 'FACTOR_COMPLETE', nextStatus: 'needs_second_factor' });
    expect(actor.getSnapshot().value).toBe('secondFactor');
  });

  it('advances to resetPassword on FACTOR_COMPLETE with needs_new_password', async () => {
    const actor = await inFirstFactor();
    actor.send({ type: 'FACTOR_COMPLETE', nextStatus: 'needs_new_password' });
    expect(actor.getSnapshot().value).toBe('resetPassword');
  });

  it('goes to resetPassword on FORGOT_PASSWORD', async () => {
    const actor = await inFirstFactor();
    actor.send({ type: 'FORGOT_PASSWORD' });
    expect(actor.getSnapshot().value).toBe('resetPassword');
  });

  it('returns to collectingIdentifier on BACK', async () => {
    const actor = await inFirstFactor();
    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('collectingIdentifier');
  });
});

describe('signInMachine — secondFactor handoff', () => {
  it('reaches complete on FACTOR_COMPLETE', async () => {
    const actor = createActor(
      createSignInMachine({ createAttemptFn: makeAttempt('needs_second_factor'), resetPasswordFn: noop as never }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    actor.send({ type: 'FACTOR_COMPLETE', nextStatus: 'complete' });
    expect(actor.getSnapshot().value).toBe('complete');
  });
});

describe('signInMachine — reset password flow', () => {
  async function inResetPassword(
    resetPasswordFn: (p: { password: string; signOutOfOtherSessions?: boolean }) => Promise<{ status: string }>,
  ) {
    const actor = createActor(
      createSignInMachine({
        createAttemptFn: makeAttempt('needs_first_factor'),
        resetPasswordFn: resetPasswordFn as never,
      }),
    );
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    actor.send({ type: 'FORGOT_PASSWORD' });
    return actor;
  }

  it('reaches resetPasswordSuccess on success', async () => {
    const actor = await inResetPassword(makeAttempt('complete'));
    actor.send({ type: 'SUBMIT_NEW_PASSWORD', password: 'hunter2', signOutOfOtherSessions: true });
    await tick();
    expect(actor.getSnapshot().value).toBe('resetPasswordSuccess');
  });

  it('routes to secondFactor if reset requires MFA', async () => {
    const actor = await inResetPassword(makeAttempt('needs_second_factor'));
    actor.send({ type: 'SUBMIT_NEW_PASSWORD', password: 'hunter2', signOutOfOtherSessions: false });
    await tick();
    expect(actor.getSnapshot().value).toBe('secondFactor');
  });

  it('stays in resetPassword with error on failure', async () => {
    const actor = await inResetPassword(vi.fn().mockRejectedValue(new Error('Password too weak.')));
    actor.send({ type: 'SUBMIT_NEW_PASSWORD', password: 'abc', signOutOfOtherSessions: false });
    await tick();
    expect(actor.getSnapshot().value).toBe('resetPassword');
    expect(actor.getSnapshot().context.error).toBe('Error: Password too weak.');
  });

  it('passes signOutOfOtherSessions to resetPasswordFn', async () => {
    const resetMock = vi.fn().mockResolvedValue({ status: 'complete' } as SignInResource);
    const actor = await inResetPassword(resetMock);
    actor.send({ type: 'SUBMIT_NEW_PASSWORD', password: 'newpass', signOutOfOtherSessions: true });
    await tick();
    expect(resetMock).toHaveBeenCalledWith({ password: 'newpass', signOutOfOtherSessions: true });
  });
});
