import { afterEach, describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { reverificationDialogMachine } from './reverification-dialog.machine';
import type {
  ReverificationAttempt,
  ReverificationAttemptResult,
  ReverificationChallenge,
  ReverificationEmailCodeFactor,
  ReverificationFirstFactorPhoneCodeFactor,
  ReverificationPasswordFactor,
  ReverificationPreparationFactor,
  ReverificationSecondFactorPhoneCodeFactor,
  ReverificationTOTPFactor,
} from './reverification-dialog.types';

const passwordFactor: ReverificationPasswordFactor = {
  id: 'password',
  stage: 'first',
  strategy: 'password',
};

const emailFactor: ReverificationEmailCodeFactor = {
  id: 'email_1',
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'email_1',
  safeIdentifier: 'a••••@clerk.dev',
};

const phoneFactor: ReverificationFirstFactorPhoneCodeFactor = {
  id: 'phone_1',
  stage: 'first',
  strategy: 'phone_code',
  phoneNumberId: 'phone_1',
  safeIdentifier: '••••1234',
};

const totpFactor: ReverificationTOTPFactor = {
  id: 'totp',
  stage: 'second',
  strategy: 'totp',
};

const secondPhoneFactor: ReverificationSecondFactorPhoneCodeFactor = {
  id: 'phone_2',
  stage: 'second',
  strategy: 'phone_code',
  phoneNumberId: 'phone_2',
  safeIdentifier: '••••5678',
};

const firstFactorChallenge = (
  overrides: Partial<Extract<ReverificationChallenge, { status: 'needs_first_factor' }>> = {},
): ReverificationChallenge => ({
  status: 'needs_first_factor',
  factors: [passwordFactor, emailFactor, phoneFactor],
  ...overrides,
});

function start({
  challenge = firstFactorChallenge({ initialFactorId: passwordFactor.id }),
  prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined),
  attempt = vi
    .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
    .mockResolvedValue({ status: 'complete' }),
  complete = vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  cancel = vi.fn(),
}: {
  challenge?: ReverificationChallenge;
  prepare?: (factor: ReverificationPreparationFactor) => Promise<void>;
  attempt?: (attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>;
  complete?: () => Promise<void>;
  cancel?: () => void;
} = {}) {
  const actor = createActor(reverificationDialogMachine, {
    context: { initialChallenge: challenge, prepare, attempt, complete, cancel },
  }).start();
  return { actor, prepare, attempt, complete, cancel };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('reverificationDialogMachine', () => {
  it('starts at factor selection when no initial factor is provided', () => {
    const { actor } = start({ challenge: firstFactorChallenge() });

    expect(actor.getSnapshot().value).toBe('selectingFactor');
    expect(actor.getSnapshot().context.challenge.factors).toEqual([passwordFactor, emailFactor, phoneFactor]);
    expect(actor.can({ type: 'BACK' })).toBe(false);

    actor.send({ type: 'SELECT_FACTOR', factorId: passwordFactor.id });
    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifying',
      context: { currentFactor: passwordFactor },
    });
  });

  it('treats an invalid initial factor as no selection', () => {
    const { actor } = start({ challenge: firstFactorChallenge({ initialFactorId: 'missing' }) });

    expect(actor.getSnapshot().value).toBe('selectingFactor');
    expect(actor.getSnapshot().context.currentFactor).toBeNull();
  });

  it('submits the selected password and completes the attempt', async () => {
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockResolvedValue({ status: 'complete' });
    const complete = vi.fn();
    const { actor } = start({ attempt, complete });

    actor.send({ type: 'CHANGE_VALUE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('submitting');
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('completed'));
    expect(attempt).toHaveBeenCalledWith({ factor: passwordFactor, password: 'secret' });
    expect(complete).toHaveBeenCalledOnce();
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('stays open and pending until the caller finishes completing', async () => {
    let finish = () => {};
    const complete = vi.fn<() => Promise<void>>().mockReturnValue(
      new Promise<void>(resolve => {
        finish = resolve;
      }),
    );
    const { actor } = start({ complete });

    actor.send({ type: 'CHANGE_VALUE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });

    // The attempt has landed but the session is not active yet, so the flow is not done with it.
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('completing'));
    expect(actor.getSnapshot().status).toBe('active');

    finish();
    await vi.waitFor(() => expect(actor.getSnapshot().status).toBe('done'));
  });

  it('returns to the factor when completion fails, so the reason is not lost', async () => {
    const complete = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('Could not activate the session.'));
    const { actor } = start({ complete });

    actor.send({ type: 'CHANGE_VALUE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifying'));
    expect(actor.getSnapshot().context).toMatchObject({
      value: '',
      error: { message: 'Could not activate the session.' },
    });
    expect(actor.getSnapshot().status).toBe('active');
  });

  it('prepares a delivered-code factor and automatically submits six normalized digits', async () => {
    const prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined);
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockResolvedValue({ status: 'complete' });
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactorId: emailFactor.id }),
      prepare,
      attempt,
    });

    expect(actor.getSnapshot().value).toBe('preparing');
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifyingCooldown'));
    expect(prepare).toHaveBeenCalledWith(emailFactor);

    actor.send({ type: 'CHANGE_VALUE', value: '12a3456' });
    expect(actor.getSnapshot().value).toBe('submitting');

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('completed'));
    expect(attempt).toHaveBeenCalledWith({ factor: emailFactor, code: '123456' });
  });

  it('continues from first-factor success into a normalized second-factor challenge', async () => {
    const initialChallenge = firstFactorChallenge({ initialFactorId: passwordFactor.id });
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockResolvedValue({
        status: 'needs_second_factor',
        factors: [totpFactor, secondPhoneFactor],
        initialFactorId: totpFactor.id,
      });
    const { actor } = start({ challenge: initialChallenge, attempt });

    actor.send({ type: 'CHANGE_VALUE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifying'));
    expect(actor.getSnapshot().context).toMatchObject({
      challenge: { status: 'needs_second_factor' },
      currentFactor: totpFactor,
      value: '',
    });

    actor.setContext({ initialChallenge });
    actor.send({ type: 'SHOW_ALTERNATIVES' });
    actor.send({ type: 'SELECT_FACTOR', factorId: secondPhoneFactor.id });
    expect(actor.getSnapshot()).toMatchObject({
      value: 'preparing',
      context: {
        challenge: { status: 'needs_second_factor' },
        currentFactor: secondPhoneFactor,
      },
    });
  });

  it('can begin directly at second-factor selection', () => {
    const { actor } = start({
      challenge: {
        status: 'needs_second_factor',
        factors: [totpFactor, secondPhoneFactor],
      },
    });

    expect(actor.getSnapshot()).toMatchObject({
      value: 'selectingFactor',
      context: { challenge: { status: 'needs_second_factor', factors: [totpFactor, secondPhoneFactor] } },
    });
  });

  it('matches legacy help visibility outside factor selection', async () => {
    const { actor: passwordActor } = start({
      challenge: firstFactorChallenge({ factors: [passwordFactor], initialFactorId: passwordFactor.id }),
    });
    expect(passwordActor.getSnapshot().value).toBe('verifying');
    expect(passwordActor.can({ type: 'SHOW_HELP' })).toBe(true);

    const { actor: emailActor } = start({
      challenge: firstFactorChallenge({ factors: [emailFactor], initialFactorId: emailFactor.id }),
    });
    await vi.waitFor(() => expect(emailActor.getSnapshot().value).toBe('verifyingCooldown'));
    expect(emailActor.can({ type: 'SHOW_HELP' })).toBe(false);
    expect(emailActor.can({ type: 'SHOW_ALTERNATIVES' })).toBe(false);

    emailActor.send({ type: 'SHOW_HELP' });
    expect(emailActor.getSnapshot().value).toBe('verifyingCooldown');
  });

  it('returns from alternatives without preparing the unchanged factor again', async () => {
    const prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactorId: emailFactor.id }),
      prepare,
    });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifyingCooldown'));

    actor.send({ type: 'SHOW_ALTERNATIVES' });
    expect(actor.getSnapshot()).toMatchObject({
      value: 'selectingFactor',
      context: { currentFactor: emailFactor },
    });

    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('verifyingCooldown');
    expect(prepare).toHaveBeenCalledOnce();
  });

  it('prepares a code factor again after it was replaced and selected again', async () => {
    const prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactorId: emailFactor.id }),
      prepare,
    });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifyingCooldown'));

    actor.send({ type: 'SHOW_ALTERNATIVES' });
    actor.send({ type: 'SELECT_FACTOR', factorId: phoneFactor.id });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifyingCooldown'));
    actor.send({ type: 'SHOW_ALTERNATIVES' });
    actor.send({ type: 'SELECT_FACTOR', factorId: emailFactor.id });
    await vi.waitFor(() => expect(prepare).toHaveBeenCalledTimes(3));

    expect(prepare).toHaveBeenNthCalledWith(1, emailFactor);
    expect(prepare).toHaveBeenNthCalledWith(2, phoneFactor);
    expect(prepare).toHaveBeenNthCalledWith(3, emailFactor);
  });

  it('stays on the current factor when preparation fails, and retries through resend', async () => {
    const prepare = vi
      .fn<(factor: ReverificationPreparationFactor) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Could not send the code.'))
      .mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactorId: emailFactor.id }),
      prepare,
    });

    expect(actor.getSnapshot()).toMatchObject({
      value: 'preparing',
      context: { currentFactor: emailFactor, resendSecondsRemaining: 0 },
    });
    expect(actor.can({ type: 'RESEND' })).toBe(false);
    expect(actor.can({ type: 'SHOW_ALTERNATIVES' })).toBe(true);

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('preparationFailed'));
    expect(actor.getSnapshot().context).toMatchObject({
      currentFactor: emailFactor,
      error: { location: 'form', message: 'Could not send the code.' },
      resendSecondsRemaining: 0,
    });
    expect(actor.can({ type: 'RESEND' })).toBe(true);
    expect(actor.can({ type: 'SHOW_ALTERNATIVES' })).toBe(true);

    actor.send({ type: 'RESEND' });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifyingCooldown'));
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it('returns verification failures to the field and clears them on input', async () => {
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockRejectedValue(new Error('Incorrect password.'));
    const { actor } = start({ attempt });

    actor.send({ type: 'CHANGE_VALUE', value: 'wrong' });
    actor.send({ type: 'SUBMIT' });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifying'));

    expect(actor.getSnapshot().context).toMatchObject({
      value: '',
      error: { location: 'field', message: 'Incorrect password.' },
    });
    actor.send({ type: 'CHANGE_VALUE', value: 'new value' });
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('owns resend cooldown and only retries after it expires', async () => {
    vi.useFakeTimers();
    const prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactorId: emailFactor.id }),
      prepare,
    });
    await vi.runAllTicks();

    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifyingCooldown',
      context: { resendSecondsRemaining: 30 },
    });
    actor.send({ type: 'RESEND' });
    expect(prepare).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(30_000);
    expect(actor.getSnapshot().value).toBe('verifying');
    actor.send({ type: 'RESEND' });
    expect(actor.getSnapshot().value).toBe('resending');
    await vi.runAllTicks();
    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifyingCooldown',
      context: { resendSecondsRemaining: 30 },
    });
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it('allows immediate resend retry after a resend failure', async () => {
    vi.useFakeTimers();
    const prepare = vi
      .fn<(factor: ReverificationPreparationFactor) => Promise<void>>()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Rate limited.'))
      .mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactorId: emailFactor.id }),
      prepare,
    });
    await vi.runAllTicks();
    await vi.advanceTimersByTimeAsync(30_000);

    actor.send({ type: 'RESEND' });
    await vi.runAllTicks();
    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifying',
      context: {
        resendSecondsRemaining: 0,
        error: { location: 'form', message: 'Rate limited.' },
      },
    });

    actor.send({ type: 'RESEND' });
    expect(actor.getSnapshot().value).toBe('resending');
    expect(prepare).toHaveBeenCalledTimes(3);
  });

  it('finishes cancellation and reports it once', () => {
    const cancel = vi.fn();
    const { actor } = start({ cancel });

    actor.send({ type: 'CANCEL' });

    expect(cancel).toHaveBeenCalledOnce();
    expect(actor.getSnapshot()).toMatchObject({ value: 'cancelled', status: 'done' });
    expect(actor.getSnapshot().status).toBe('done');
  });
});
