import { afterEach, describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { reverificationController, reverificationFactorKey } from './reverification.controller';
import type {
  ReverificationAttempt,
  ReverificationAttemptResult,
  ReverificationBackupCodeFactor,
  ReverificationChallenge,
  ReverificationCompleteResult,
  ReverificationEmailCodeFactor,
  ReverificationFirstFactorPhoneCodeFactor,
  ReverificationPasswordFactor,
  ReverificationPreparationFactor,
  ReverificationSecondFactorPhoneCodeFactor,
  ReverificationTOTPFactor,
} from './reverification.types';

const passwordFactor: ReverificationPasswordFactor = {
  stage: 'first',
  strategy: 'password',
};

const emailFactor: ReverificationEmailCodeFactor = {
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'email_1',
  safeIdentifier: 'a••••@clerk.dev',
};

const phoneFactor: ReverificationFirstFactorPhoneCodeFactor = {
  stage: 'first',
  strategy: 'phone_code',
  phoneNumberId: 'phone_1',
  safeIdentifier: '••••1234',
};

const totpFactor: ReverificationTOTPFactor = {
  stage: 'second',
  strategy: 'totp',
};

const backupCodeFactor: ReverificationBackupCodeFactor = {
  stage: 'second',
  strategy: 'backup_code',
};

const secondPhoneFactor: ReverificationSecondFactorPhoneCodeFactor = {
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
  challenge = firstFactorChallenge({ initialFactor: passwordFactor }),
  prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined),
  attempt = vi
    .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
    .mockResolvedValue({ status: 'complete', sessionId: 'sess_1' }),
  complete = vi.fn<(result: ReverificationCompleteResult) => Promise<void>>().mockResolvedValue(undefined),
  cancel = vi.fn(),
}: {
  challenge?: ReverificationChallenge;
  prepare?: (factor: ReverificationPreparationFactor) => Promise<void>;
  attempt?: (attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>;
  complete?: (result: ReverificationCompleteResult) => Promise<void>;
  cancel?: () => void;
} = {}) {
  const actor = createActor(reverificationController, {
    context: { initialChallenge: challenge, prepare, attempt, complete, cancel },
  }).start();
  return { actor, prepare, attempt, complete, cancel };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('reverificationController', () => {
  it('starts at factor selection when no initial factor is provided', () => {
    const { actor } = start({ challenge: firstFactorChallenge() });

    expect(actor.getSnapshot().value).toBe('selectingFactor');
    expect(actor.getSnapshot().context.challenge.factors).toEqual([passwordFactor, emailFactor, phoneFactor]);
    expect(actor.can({ type: 'BACK' })).toBe(false);

    actor.send({ type: 'SELECT_FACTOR', factorKey: reverificationFactorKey(passwordFactor) });
    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifying',
      context: { currentFactor: passwordFactor },
    });
  });

  it('treats an invalid initial factor as no selection', () => {
    const { actor } = start({
      challenge: firstFactorChallenge({
        initialFactor: { ...emailFactor, emailAddressId: 'missing' },
      }),
    });

    expect(actor.getSnapshot().value).toBe('selectingFactor');
    expect(actor.getSnapshot().context.currentFactor).toBeNull();
  });

  it('rejects factors whose derived identities collide', () => {
    expect(() =>
      start({
        challenge: firstFactorChallenge({
          factors: [emailFactor, { ...emailFactor, safeIdentifier: 'b••••@clerk.dev' }],
        }),
      }),
    ).toThrow('Reverification factors must have unique identities.');
  });

  it('submits the selected password and completes the attempt', async () => {
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockResolvedValue({ status: 'complete', sessionId: 'sess_1' });
    const complete = vi.fn();
    const { actor } = start({ attempt, complete });

    actor.send({ type: 'CHANGE_VALUE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('submitting');
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('completed'));
    expect(attempt).toHaveBeenCalledWith({ factor: passwordFactor, password: 'secret' });
    expect(complete).toHaveBeenCalledWith({ status: 'complete', sessionId: 'sess_1' });
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('stays open and pending until the caller finishes completing', async () => {
    let finish = () => {};
    const complete = vi.fn<(result: ReverificationCompleteResult) => Promise<void>>().mockReturnValue(
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
    expect(actor.can({ type: 'CANCEL' })).toBe(false);

    finish();
    await vi.waitFor(() => expect(actor.getSnapshot().status).toBe('done'));
  });

  it('retries completion with the verified result without repeating the attempt', async () => {
    const complete = vi
      .fn<(result: ReverificationCompleteResult) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Could not activate the session.'))
      .mockResolvedValue(undefined);
    const { actor, attempt } = start({ complete });

    actor.send({ type: 'CHANGE_VALUE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('completionFailed'));
    expect(actor.getSnapshot().context).toMatchObject({
      value: 'secret',
      verification: { status: 'complete', sessionId: 'sess_1' },
      error: { scope: 'flow', message: 'Could not activate the session.' },
    });
    expect(actor.getSnapshot().status).toBe('active');
    expect(actor.can({ type: 'CANCEL' })).toBe(true);

    actor.send({ type: 'RETRY_COMPLETE' });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('completed'));

    expect(attempt).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenNthCalledWith(1, { status: 'complete', sessionId: 'sess_1' });
    expect(complete).toHaveBeenNthCalledWith(2, { status: 'complete', sessionId: 'sess_1' });
  });

  it('allows cancellation after completion fails', async () => {
    const complete = vi
      .fn<(result: ReverificationCompleteResult) => Promise<void>>()
      .mockRejectedValue(new Error('Could not activate the session.'));
    const { actor, cancel } = start({ complete });

    actor.send({ type: 'CHANGE_VALUE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('completionFailed'));

    actor.send({ type: 'CANCEL' });

    expect(cancel).toHaveBeenCalledOnce();
    expect(actor.getSnapshot()).toMatchObject({ value: 'cancelled', status: 'done' });
  });

  it('prepares a delivered-code factor and automatically submits six normalized digits', async () => {
    const prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined);
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockResolvedValue({ status: 'complete', sessionId: 'sess_1' });
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactor: emailFactor }),
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
    const initialChallenge = firstFactorChallenge({ initialFactor: passwordFactor });
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockResolvedValue({
        status: 'needs_second_factor',
        factors: [totpFactor, secondPhoneFactor],
        initialFactor: totpFactor,
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
    actor.send({ type: 'SELECT_FACTOR', factorKey: reverificationFactorKey(secondPhoneFactor) });
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
      challenge: firstFactorChallenge({ factors: [passwordFactor], initialFactor: passwordFactor }),
    });
    expect(passwordActor.getSnapshot().value).toBe('verifying');
    expect(passwordActor.can({ type: 'SHOW_HELP' })).toBe(true);

    const { actor: emailActor } = start({
      challenge: firstFactorChallenge({ factors: [emailFactor], initialFactor: emailFactor }),
    });
    await vi.waitFor(() => expect(emailActor.getSnapshot().value).toBe('verifyingCooldown'));
    expect(emailActor.can({ type: 'SHOW_HELP' })).toBe(false);
    expect(emailActor.can({ type: 'SHOW_ALTERNATIVES' })).toBe(false);

    emailActor.send({ type: 'SHOW_HELP' });
    expect(emailActor.getSnapshot().value).toBe('verifyingCooldown');
  });

  it('returns from help to the state that opened it without storing a goto', () => {
    const { actor: selectionActor } = start({ challenge: firstFactorChallenge() });
    selectionActor.send({ type: 'SHOW_HELP' });
    expect(selectionActor.getSnapshot().value).toBe('helpFromSelection');
    selectionActor.send({ type: 'BACK' });
    expect(selectionActor.getSnapshot().value).toBe('selectingFactor');

    const { actor: factorActor } = start({
      challenge: firstFactorChallenge({ factors: [passwordFactor], initialFactor: passwordFactor }),
    });
    factorActor.send({ type: 'SHOW_HELP' });
    expect(factorActor.getSnapshot().value).toBe('helpFromFactor');
    factorActor.send({ type: 'BACK' });
    expect(factorActor.getSnapshot().value).toBe('verifying');
  });

  it('returns from alternatives without preparing the unchanged factor again', async () => {
    const prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactor: emailFactor }),
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
      challenge: firstFactorChallenge({ initialFactor: emailFactor }),
      prepare,
    });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifyingCooldown'));

    actor.send({ type: 'SHOW_ALTERNATIVES' });
    actor.send({ type: 'SELECT_FACTOR', factorKey: reverificationFactorKey(phoneFactor) });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifyingCooldown'));
    actor.send({ type: 'SHOW_ALTERNATIVES' });
    actor.send({ type: 'SELECT_FACTOR', factorKey: reverificationFactorKey(emailFactor) });
    await vi.waitFor(() => expect(prepare).toHaveBeenCalledTimes(3));

    expect(prepare).toHaveBeenNthCalledWith(1, emailFactor);
    expect(prepare).toHaveBeenNthCalledWith(2, phoneFactor);
    expect(prepare).toHaveBeenNthCalledWith(3, emailFactor);
  });

  it('holds the send cooldown when preparation fails, and retries through resend', async () => {
    vi.useFakeTimers();
    const prepare = vi
      .fn<(factor: ReverificationPreparationFactor) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Could not send the code.'))
      .mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactor: emailFactor }),
      prepare,
    });

    expect(actor.getSnapshot()).toMatchObject({
      value: 'preparing',
      context: { currentFactor: emailFactor, resendSecondsRemaining: 30 },
    });
    expect(actor.can({ type: 'RESEND' })).toBe(false);
    expect(actor.can({ type: 'SHOW_ALTERNATIVES' })).toBe(true);

    await vi.runAllTicks();
    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifyingCooldown',
      context: {
        currentFactor: emailFactor,
        error: { scope: 'flow', message: 'Could not send the code.' },
        resendSecondsRemaining: 30,
      },
    });
    expect(actor.can({ type: 'RESEND' })).toBe(false);

    await vi.advanceTimersByTimeAsync(30_000);
    expect(actor.getSnapshot().value).toBe('verifying');
    actor.send({ type: 'RESEND' });
    await vi.runAllTicks();
    expect(actor.getSnapshot().value).toBe('verifyingCooldown');
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it('does not resend inside the cooldown when alternatives are opened after a failed send', async () => {
    vi.useFakeTimers();
    const prepare = vi
      .fn<(factor: ReverificationPreparationFactor) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Could not send the code.'))
      .mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactor: emailFactor }),
      prepare,
    });
    await vi.runAllTicks();
    await vi.advanceTimersByTimeAsync(10_000);

    actor.send({ type: 'SHOW_ALTERNATIVES' });
    expect(actor.getSnapshot().value).toBe('selectingFactor');
    actor.send({ type: 'BACK' });
    await vi.runAllTicks();

    // The factor is still unprepared, but the cooldown from the failed send outranks that.
    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifyingCooldown',
      context: { preparedFactorKey: null, resendSecondsRemaining: 20 },
    });
    expect(prepare).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(20_000);
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(prepare).toHaveBeenCalledOnce();
  });

  it('throttles from when the send was issued, not from when it landed', async () => {
    vi.useFakeTimers();
    const prepare = vi
      .fn<(factor: ReverificationPreparationFactor) => Promise<void>>()
      .mockImplementation(() => new Promise<void>(resolve => setTimeout(resolve, 5_000)));
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactor: emailFactor }),
      prepare,
    });
    expect(actor.getSnapshot().value).toBe('preparing');

    await vi.advanceTimersByTimeAsync(5_000);
    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifyingCooldown',
      context: { resendSecondsRemaining: 25 },
    });

    await vi.advanceTimersByTimeAsync(25_000);
    expect(actor.getSnapshot().value).toBe('verifying');
  });

  it('clears a half-entered code when a new one is sent', async () => {
    vi.useFakeTimers();
    const { actor } = start({ challenge: firstFactorChallenge({ initialFactor: emailFactor }) });
    await vi.runAllTicks();
    await vi.advanceTimersByTimeAsync(30_000);

    actor.send({ type: 'CHANGE_VALUE', value: '123' });
    expect(actor.getSnapshot().context.value).toBe('123');

    actor.send({ type: 'RESEND' });
    expect(actor.getSnapshot().context.value).toBe('');
  });

  it('keeps a rejected password in the field and clears the error on input', async () => {
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockRejectedValue({ scope: 'answer', message: 'Incorrect password.' });
    const { actor } = start({ attempt });

    actor.send({ type: 'CHANGE_VALUE', value: 'wrong' });
    actor.send({ type: 'SUBMIT' });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifying'));

    expect(actor.getSnapshot().context).toMatchObject({
      value: 'wrong',
      error: { scope: 'answer', message: 'Incorrect password.' },
    });
    actor.send({ type: 'CHANGE_VALUE', value: 'new value' });
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('keeps a rejected backup code in the field', async () => {
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockRejectedValue({ scope: 'answer', message: 'Incorrect backup code.' });
    const { actor } = start({
      challenge: {
        status: 'needs_second_factor',
        factors: [backupCodeFactor],
        initialFactor: backupCodeFactor,
      },
      attempt,
    });

    actor.send({ type: 'CHANGE_VALUE', value: 'abcd-efgh' });
    actor.send({ type: 'SUBMIT' });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifying'));

    expect(actor.getSnapshot().context).toMatchObject({
      value: 'abcd-efgh',
      error: { scope: 'answer', message: 'Incorrect backup code.' },
    });
  });

  it('clears a rejected one-time code so the next one can be typed', async () => {
    vi.useFakeTimers();
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockRejectedValue({ scope: 'answer', message: 'Incorrect code.' });
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactor: emailFactor }),
      attempt,
    });
    await vi.runAllTicks();

    actor.send({ type: 'CHANGE_VALUE', value: '123456' });
    await vi.runAllTicks();

    expect(actor.getSnapshot().context).toMatchObject({
      value: '',
      error: { scope: 'answer', message: 'Incorrect code.' },
    });
  });

  it('owns resend cooldown and only retries after it expires', async () => {
    vi.useFakeTimers();
    const prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactor: emailFactor }),
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
    expect(actor.getSnapshot().value).toBe('preparing');
    await vi.runAllTicks();
    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifyingCooldown',
      context: { resendSecondsRemaining: 30 },
    });
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it('holds the cooldown after a failed resend', async () => {
    vi.useFakeTimers();
    const prepare = vi
      .fn<(factor: ReverificationPreparationFactor) => Promise<void>>()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Rate limited.'))
      .mockResolvedValue(undefined);
    const { actor } = start({
      challenge: firstFactorChallenge({ initialFactor: emailFactor }),
      prepare,
    });
    await vi.runAllTicks();
    await vi.advanceTimersByTimeAsync(30_000);

    actor.send({ type: 'RESEND' });
    await vi.runAllTicks();
    expect(actor.getSnapshot()).toMatchObject({
      value: 'verifyingCooldown',
      context: {
        resendSecondsRemaining: 30,
        error: { scope: 'flow', message: 'Rate limited.' },
      },
    });

    expect(actor.can({ type: 'RESEND' })).toBe(false);
    expect(prepare).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(30_000);
    expect(actor.getSnapshot().value).toBe('verifying');
    actor.send({ type: 'RESEND' });
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
