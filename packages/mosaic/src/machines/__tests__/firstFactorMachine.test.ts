import type { SignInFirstFactor, SignInResource } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { createFirstFactorMachine } from '../firstFactorMachine';
import { deferred, noop, tick } from './test-utils';

const passwordFactor = { strategy: 'password' } as SignInFirstFactor;
const emailCodeFactor = {
  strategy: 'email_code',
  emailAddressId: 'ea_1',
  safeIdentifier: 'a**@e**.com',
} as SignInFirstFactor;
const phoneCodeFactor = {
  strategy: 'phone_code',
  phoneNumberId: 'pn_1',
  safeIdentifier: '+1***5678',
} as SignInFirstFactor;

function makeActor(overrides: Partial<Parameters<typeof createFirstFactorMachine>[0]> = {}) {
  const actor = createActor(
    createFirstFactorMachine({
      factor: passwordFactor,
      attemptFn: noop as never,
      prepareFn: noop as never,
      ...overrides,
    }),
  );
  actor.start();
  return actor;
}

describe('firstFactorMachine — initial state', () => {
  it('starts in verifying for password factor', () => {
    expect(makeActor({ factor: passwordFactor }).getSnapshot().value).toBe('verifying');
  });

  it('starts in preparing for email_code factor', () => {
    const gate = deferred<SignInResource>();
    const actor = makeActor({ factor: emailCodeFactor, prepareFn: () => gate.promise });
    expect(actor.getSnapshot().value).toBe('preparing');
  });

  it('starts in preparing for phone_code factor', () => {
    const gate = deferred<SignInResource>();
    const actor = makeActor({ factor: phoneCodeFactor, prepareFn: () => gate.promise });
    expect(actor.getSnapshot().value).toBe('preparing');
  });

  it('moves to verifying once prepare resolves', async () => {
    const actor = makeActor({
      factor: emailCodeFactor,
      prepareFn: vi.fn().mockResolvedValue({ status: 'needs_first_factor' } as SignInResource),
    });
    await tick();
    expect(actor.getSnapshot().value).toBe('verifying');
  });

  it('moves to verifying (with error) if prepare fails', async () => {
    const actor = makeActor({
      factor: emailCodeFactor,
      prepareFn: vi.fn().mockRejectedValue(new Error('Delivery failed.')),
    });
    await tick();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.error).toBe('Error: Delivery failed.');
  });

  it('stores factor strategy in context', () => {
    expect(makeActor({ factor: emailCodeFactor }).getSnapshot().context.factor.strategy).toBe('email_code');
  });
});

describe('firstFactorMachine — typing', () => {
  it('updates value in context on TYPE', () => {
    const actor = makeActor();
    actor.send({ type: 'TYPE', value: 'mysecret' });
    expect(actor.getSnapshot().context.value).toBe('mysecret');
  });

  it('clears error on TYPE', async () => {
    const actor = makeActor({ attemptFn: vi.fn().mockRejectedValue(new Error('Wrong password.')) });
    actor.send({ type: 'TYPE', value: 'wrong' });
    actor.send({ type: 'SUBMIT' });
    await tick();

    actor.send({ type: 'TYPE', value: 'corrected' });
    expect(actor.getSnapshot().context.error).toBeNull();
  });
});

describe('firstFactorMachine — submission', () => {
  it('moves to submitting on SUBMIT', () => {
    const gate = deferred<SignInResource>();
    const actor = makeActor({ attemptFn: () => gate.promise });
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('submitting');
  });

  it('reaches complete (final) on success', async () => {
    const actor = makeActor({ attemptFn: vi.fn().mockResolvedValue({ status: 'complete' } as SignInResource) });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('complete');
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('stores completionStatus in context so parent can route on it', async () => {
    const actor = makeActor({
      attemptFn: vi.fn().mockResolvedValue({ status: 'needs_second_factor' } as SignInResource),
    });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().context.completionStatus).toBe('needs_second_factor');
  });

  it('returns to verifying with error on failure', async () => {
    const actor = makeActor({ attemptFn: vi.fn().mockRejectedValue(new Error('Wrong password.')) });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.error).toBe('Error: Wrong password.');
  });

  it('cannot SUBMIT from showingAlternatives — impossible state', () => {
    const actor = makeActor();
    actor.send({ type: 'SHOW_ALTERNATIVES' });
    const before = actor.getSnapshot();
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot()).toBe(before); // same reference — no transition
  });
});

describe('firstFactorMachine — alternatives overlay', () => {
  it('opens on SHOW_ALTERNATIVES', () => {
    const actor = makeActor();
    actor.send({ type: 'SHOW_ALTERNATIVES' });
    expect(actor.getSnapshot().value).toBe('showingAlternatives');
  });

  it('returns to verifying on BACK', () => {
    const actor = makeActor();
    actor.send({ type: 'SHOW_ALTERNATIVES' });
    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('verifying');
  });

  it('switches to verifying when selecting password factor', () => {
    // Start with default password factor (already in verifying), open alternatives, switch to password again.
    const actor = makeActor();
    actor.send({ type: 'SHOW_ALTERNATIVES' });
    actor.send({ type: 'SELECT_STRATEGY', factor: passwordFactor });
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.factor.strategy).toBe('password');
  });

  it('switches to preparing when selecting a code-based factor', () => {
    // Start in verifying (password factor), switch to email_code — should enter preparing.
    const gate = deferred<SignInResource>();
    const actor = makeActor({ prepareFn: () => gate.promise });
    actor.send({ type: 'SHOW_ALTERNATIVES' });
    actor.send({ type: 'SELECT_STRATEGY', factor: emailCodeFactor });
    expect(actor.getSnapshot().value).toBe('preparing');
    expect(actor.getSnapshot().context.factor.strategy).toBe('email_code');
  });
});

describe('firstFactorMachine — forgot password overlay', () => {
  it('opens on SHOW_FORGOT_PASSWORD', () => {
    const actor = makeActor();
    actor.send({ type: 'SHOW_FORGOT_PASSWORD' });
    expect(actor.getSnapshot().value).toBe('showingForgotPassword');
  });

  it('returns to verifying on BACK', () => {
    const actor = makeActor();
    actor.send({ type: 'SHOW_FORGOT_PASSWORD' });
    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('verifying');
  });

  it('switches to preparing when selecting a reset code strategy', () => {
    const gate = deferred<SignInResource>();
    const resetFactor = { strategy: 'reset_password_email_code', emailAddressId: 'ea_1' } as SignInFirstFactor;
    const actor = makeActor({ prepareFn: () => gate.promise });
    actor.send({ type: 'SHOW_FORGOT_PASSWORD' });
    actor.send({ type: 'SELECT_STRATEGY', factor: resetFactor });
    expect(actor.getSnapshot().value).toBe('preparing');
    expect(actor.getSnapshot().context.factor.strategy).toBe('reset_password_email_code');
  });
});

describe('firstFactorMachine — resend + cooldown', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('moves through resending → cooldown → verifying', async () => {
    const actor = makeActor({ prepareFn: vi.fn().mockResolvedValue({} as SignInResource) });

    actor.send({ type: 'RESEND' });
    expect(actor.getSnapshot().value).toBe('resending');

    await vi.runAllTicks();
    expect(actor.getSnapshot().value).toBe('cooldown');
    expect(actor.getSnapshot().context.canResend).toBe(false);

    vi.advanceTimersByTime(30_000);
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.canResend).toBe(true);
  });

  it('cannot RESEND during cooldown', async () => {
    const actor = makeActor({ prepareFn: vi.fn().mockResolvedValue({} as SignInResource) });
    actor.send({ type: 'RESEND' });
    await vi.runAllTicks(); // → cooldown

    const before = actor.getSnapshot();
    actor.send({ type: 'RESEND' });
    expect(actor.getSnapshot()).toBe(before);
  });

  it('returns to verifying with error if resend fails', async () => {
    const actor = makeActor({ prepareFn: vi.fn().mockRejectedValue(new Error('Rate limited.')) });
    actor.send({ type: 'RESEND' });
    await vi.runAllTicks();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.error).toBe('Error: Rate limited.');
  });
});
