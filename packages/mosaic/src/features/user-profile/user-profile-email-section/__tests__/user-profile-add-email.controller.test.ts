import { createDeferredPromise } from '@clerk/shared/utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SaveError } from '../../../../utils/errors';
import type { ReverificationController } from '../../../reverification';
import type { UserProfileEmailVerification, UserProfileEmailVerifier } from '../../user-profile-contact.types';
import { useUserProfileAddEmailController } from '../user-profile-add-email.controller';

const idleReverification = { status: 'idle', visible: false } satisfies ReverificationController;

const sentCode = (): UserProfileEmailVerification => ({ method: 'code' });

function sentLink(verified: Promise<void>, cancel = vi.fn()) {
  return (): UserProfileEmailVerification => ({ method: 'link', verified, cancel });
}

function verifier(
  start: () => UserProfileEmailVerification = sentCode,
  verifyCode: (code: string) => Promise<void> = () => Promise.resolve(),
) {
  return {
    prepare: vi.fn(async () => start()),
    cancel: vi.fn(),
    verifyCode: vi.fn(verifyCode),
  } satisfies UserProfileEmailVerifier;
}

const created = () => Promise.resolve(verifier());
const other = { id: 'email_2', value: 'other@example.com' };

function saveError(message: string, field?: 'emailAddress' | 'code') {
  return new SaveError(field ? { fields: { [field]: { message } } } : { global: { message } });
}

describe('useUserProfileAddEmailController', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps the resend countdown running while verification is pending', async () => {
    vi.useFakeTimers();
    const verification = createDeferredPromise();
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({
        reverification: idleReverification,
        onCreate: () =>
          Promise.resolve(
            verifier(sentCode, async () => {
              await verification.promise;
            }),
          ),
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    await act(async () => {
      result.current.onSubmit();
      await Promise.resolve();
    });
    act(() => result.current.onSubmit('123456'));
    for (let second = 0; second < 30; second++) {
      await act(async () => vi.advanceTimersByTimeAsync(1000));
    }
    expect(result.current.resendSeconds).toBe(0);
    await act(async () => {
      verification.reject(saveError('Incorrect code', 'code'));
      await Promise.resolve();
    });
    expect(result.current.errorMessage).toBe('Incorrect code');
    expect(result.current.resendSeconds).toBe(0);
  });

  it('starts with the supplied email address', () => {
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({
        reverification: idleReverification,
        initialEmailAddress: 'saved@example.com',
        onCreate: created,
      }),
    );
    act(() => result.current.onOpenChange(true));
    expect(result.current.emailAddress).toBe('saved@example.com');
  });

  it('ignores cancellation and duplicate submissions while creating, then resets on reopen', async () => {
    const request = createDeferredPromise();
    const onCreate = vi.fn(async () => {
      await request.promise;
      return verifier();
    });
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification, onCreate }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    act(() => {
      result.current.onSubmit();
      result.current.onSubmit();
      result.current.onEmailAddressChange('other@example.com');
    });
    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(true);
    expect(onCreate).toHaveBeenCalledExactlyOnceWith('new@example.com');
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    await waitFor(() => expect(result.current.isResending).toBe(false));
    act(() => result.current.onCodeChange('123'));
    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(false);
    act(() => result.current.onOpenChange(true));
    expect(result.current.step).toBe('email');
    expect(result.current.code).toBe('');
    expect(result.current.resendSeconds).toBe(0);
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('waits before resending, blocks overlapping requests, and restarts the countdown', async () => {
    vi.useFakeTimers();
    const email = verifier();
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification, onCreate: () => Promise.resolve(email) }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    await act(async () => {
      result.current.onSubmit();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.resendSeconds).toBe(30);
    act(() => result.current.onResend());
    expect(email.prepare).toHaveBeenCalledTimes(1);
    for (let second = 0; second < 30; second++) {
      await act(async () => vi.advanceTimersByTimeAsync(1000));
    }
    expect(result.current.resendSeconds).toBe(0);
    act(() => result.current.onCodeChange('123'));
    await act(async () => {
      result.current.onResend();
      result.current.onResend();
      result.current.onSubmit('123456');
      result.current.onOpenChange(false);
      await Promise.resolve();
    });
    expect(email.prepare).toHaveBeenCalledTimes(2);
    expect(email.verifyCode).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
    expect(result.current.code).toBe('');
    expect(result.current.resendSeconds).toBe(30);
  });
  it.each(['email', 'verify'] as const)('keeps the %s input after failure and allows retrying', async step => {
    const operation = vi.fn().mockRejectedValueOnce(saveError('Try again')).mockResolvedValue(verifier());
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({
        reverification: idleReverification,
        onCreate: step === 'email' ? operation : () => Promise.resolve(verifier(sentCode, operation)),
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    act(() => result.current.onSubmit());
    if (step === 'verify') {
      await waitFor(() => expect(result.current.step).toBe('verify'));
      act(() => result.current.onSubmit('000000'));
    }
    await waitFor(() => expect(result.current.errorMessage).toBe('Try again'));
    expect(result.current.isPending).toBe(false);
    expect(result.current.step).toBe(step);
    expect(result.current.emailAddress).toBe('new@example.com');
    if (step === 'verify') {
      expect(result.current.code).toBe('000000');
    }
    act(() => result.current.onSubmit());
    await waitFor(() => expect(operation).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.errorMessage).toBeUndefined());
  });
  it('creates the email, sends it a code, verifies the submitted code, and closes on success', async () => {
    const email = verifier();
    const onCreate = vi.fn(() => Promise.resolve(email));
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification, onCreate }),
    );

    expect(result.current.open).toBe(false);
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    act(() => result.current.onSubmit());
    expect(result.current.isPending).toBe(true);
    expect(result.current.open).toBe(true);
    await waitFor(() => expect(result.current.step).toBe('verify'));
    expect(onCreate).toHaveBeenCalledExactlyOnceWith('new@example.com');
    await waitFor(() => expect(email.prepare).toHaveBeenCalledOnce());

    act(() => result.current.onSubmit('123456'));
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(email.verifyCode).toHaveBeenCalledExactlyOnceWith('123456');
  });

  it('verifies an existing email without creating one', async () => {
    const onCreate = vi.fn(created);
    const email = verifier();
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification, onCreate }),
    );

    await act(() => result.current.onVerifyEmail(other, email));
    expect(result.current.open).toBe(true);
    expect(result.current.step).toBe('verify');
    expect(result.current.emailAddress).toBe('other@example.com');
    await waitFor(() => expect(email.prepare).toHaveBeenCalledOnce());

    act(() => result.current.onSubmit('123456'));
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(email.verifyCode).toHaveBeenCalledExactlyOnceWith('123456');
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('owns which address is being verified until the next add', async () => {
    const email = verifier();
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification, onCreate: created }),
    );
    expect(result.current.verifyingId).toBeUndefined();

    await act(() => result.current.onVerifyEmail(other, email));
    expect(result.current.verifyingId).toBe('email_2');
    await waitFor(() => expect(result.current.step).toBe('verify'));

    await act(() => result.current.onVerifyEmail({ id: 'email_3', value: 'person@acme.co' }, email));
    expect(result.current.verifyingId).toBe('email_2');
    expect(result.current.emailAddress).toBe('other@example.com');

    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(false);
    expect(result.current.verifyingId).toBe('email_2');

    act(() => result.current.onOpenChange(true));
    expect(result.current.verifyingId).toBeUndefined();
  });

  it('keeps preparation failure at the source and retries without creating another email', async () => {
    const email = verifier();
    email.prepare.mockRejectedValueOnce(saveError('Too many requests'));
    const onCreate = vi.fn(async () => email);
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification, onCreate }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    await act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.errorMessage).toBe('Too many requests'));
    expect(result.current.step).toBe('email');
    expect(result.current.resendSeconds).toBe(0);
    await act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.step).toBe('verify'));
    expect(onCreate).toHaveBeenCalledOnce();
    expect(email.prepare).toHaveBeenCalledTimes(2);
  });

  it('creates a different email when the value changes after failed preparation', async () => {
    const email = verifier();
    email.prepare.mockRejectedValueOnce(saveError('Try again'));
    const onCreate = vi.fn(async () => email);
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification, onCreate }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('first@example.com'));
    await act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.errorMessage).toBe('Try again'));
    act(() => result.current.onEmailAddressChange('second@example.com'));
    await act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.step).toBe('verify'));
    expect(onCreate.mock.calls).toEqual([['first@example.com'], ['second@example.com']]);
  });

  it.each(['code', 'link'] as const)(
    'keeps the ready %s destination through failed resend and starts cooldown after success',
    async method => {
      vi.useFakeTimers();
      const email = verifier(method === 'link' ? sentLink(new Promise(() => {})) : sentCode);
      const { result } = renderHook(() => useUserProfileAddEmailController({ reverification: idleReverification }));
      await act(() => result.current.onVerifyEmail(other, email));
      for (let second = 0; second < (method === 'link' ? 60 : 30); second++) {
        await act(async () => vi.advanceTimersByTimeAsync(1000));
      }
      const held = createDeferredPromise();
      email.prepare.mockImplementationOnce(async () => {
        await held.promise;
        return sentCode();
      });
      act(() => result.current.onResend());
      expect(result.current.step).toBe(method === 'link' ? 'link' : 'verify');
      expect(result.current.isResending).toBe(true);
      expect(result.current.resendSeconds).toBe(0);
      await act(async () => {
        held.reject(saveError('Send failed'));
        await Promise.resolve();
      });
      expect(result.current.step).toBe(method === 'link' ? 'link' : 'verify');
      expect(result.current.errorMessage).toBe('Send failed');
      expect(result.current.resendSeconds).toBe(0);
      await act(() => result.current.onResend());
      expect(result.current.resendSeconds).toBe(method === 'link' ? 60 : 30);
      expect(result.current.errorMessage).toBeUndefined();
    },
  );

  it('preserves a failed resend error after the previous link expired', async () => {
    vi.useFakeTimers();
    const expired = createDeferredPromise();
    const email = verifier(sentLink(expired.promise.then(() => undefined)));
    const { result } = renderHook(() => useUserProfileAddEmailController({ reverification: idleReverification }));
    await act(() => result.current.onVerifyEmail(other, email));
    await act(async () => {
      expired.reject(saveError('Link expired'));
      await Promise.resolve();
    });
    expect(result.current.errorMessage).toBe('Link expired');
    for (let second = 0; second < 60; second++) {
      await act(async () => vi.advanceTimersByTimeAsync(1000));
    }
    email.prepare.mockRejectedValueOnce(saveError('Too many requests'));
    await act(() => result.current.onResend());
    expect(result.current.step).toBe('link');
    expect(result.current.errorMessage).toBe('Too many requests');
    expect(result.current.resendSeconds).toBe(0);
  });

  it('cancels a held link resend without reopening the dialog when it settles', async () => {
    vi.useFakeTimers();
    const email = verifier(sentLink(new Promise(() => {})));
    const { result } = renderHook(() => useUserProfileAddEmailController({ reverification: idleReverification }));
    await act(() => result.current.onVerifyEmail(other, email));
    for (let second = 0; second < 60; second++) {
      await act(async () => vi.advanceTimersByTimeAsync(1000));
    }
    const held = createDeferredPromise();
    email.prepare.mockImplementationOnce(async () => {
      await held.promise;
      return sentLink(new Promise(() => {}))();
    });
    act(() => result.current.onResend());
    act(() => result.current.onOpenChange(false));
    expect(email.cancel).toHaveBeenCalled();
    expect(result.current.open).toBe(false);
    await act(async () => {
      held.resolve();
      await held.promise;
    });
    expect(result.current.open).toBe(false);
  });

  it('shows the error for the field that failed', async () => {
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({
        reverification: idleReverification,
        onCreate: () => Promise.reject(saveError('That email is taken.', 'emailAddress')),
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.errorMessage).toBe('That email is taken.'));
  });

  it('waits for the link to be opened, then closes', async () => {
    const verified = createDeferredPromise();
    const { result } = renderHook(() => useUserProfileAddEmailController({ reverification: idleReverification }));

    await act(() => result.current.onVerifyEmail(other, verifier(sentLink(verified.promise.then(() => undefined)))));
    expect(result.current.step).toBe('link');
    expect(result.current.resendSeconds).toBe(60);

    await act(async () => {
      verified.resolve();
      await verified.promise;
    });
    expect(result.current.open).toBe(false);
  });

  it('stops waiting for the link when closed or unmounted', async () => {
    const cancel = vi.fn();
    const email = verifier(sentLink(new Promise(() => {}), cancel));
    const { result, unmount } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification }),
    );

    await act(() => result.current.onVerifyEmail(other, email));
    await waitFor(() => expect(result.current.step).toBe('link'));
    act(() => result.current.onOpenChange(false));
    expect(cancel).toHaveBeenCalledOnce();

    await act(() => result.current.onVerifyEmail(other, email));
    await waitFor(() => expect(result.current.step).toBe('link'));
    unmount();
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it('shows a link failure and lets the user send a new link', async () => {
    const email = verifier(sentLink(Promise.reject(saveError('Link expired'))));
    const { result } = renderHook(() => useUserProfileAddEmailController({ reverification: idleReverification }));

    await act(() => result.current.onVerifyEmail(other, email));
    await waitFor(() => expect(result.current.errorMessage).toBe('Link expired'));
    expect(result.current.step).toBe('link');
    expect(result.current.open).toBe(true);
  });

  it('connects once per click and stays on the SSO step when connecting fails', async () => {
    const connect = vi.fn(() => Promise.reject(saveError('Connection unavailable')));
    const email = verifier(() => ({ method: 'sso', connect }));
    const { result } = renderHook(() => useUserProfileAddEmailController({ reverification: idleReverification }));

    await act(() => result.current.onVerifyEmail({ id: 'email_3', value: 'person@acme.co' }, email));
    expect(result.current.step).toBe('sso');
    expect(result.current.resendSeconds).toBe(0);

    act(() => {
      result.current.onConnect();
      result.current.onConnect();
    });
    expect(connect).toHaveBeenCalledOnce();

    await waitFor(() => expect(result.current.errorMessage).toBe('Connection unavailable'));
    expect(result.current.step).toBe('sso');
    expect(result.current.open).toBe(true);
  });

  it('moves from the email step straight to the step for the verification method', async () => {
    const shown: string[] = [];
    const { result } = renderHook(() => {
      const controller = useUserProfileAddEmailController({
        reverification: idleReverification,
        onCreate: () => Promise.resolve(verifier(sentLink(new Promise(() => {})))),
      });
      if (controller.open && shown.at(-1) !== controller.step) {
        shown.push(controller.step);
      }
      return controller;
    });

    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.step).toBe('link'));
    expect(shown).toEqual(['email', 'link']);
  });

  it('does not add an email that is the same as the username', () => {
    const onCreate = vi.fn(created);
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({
        reverification: idleReverification,
        username: 'person@example.com',
        onCreate,
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('person@example.com'));
    expect(result.current.canSubmitEmail).toBe(false);
    act(() => result.current.onSubmit());
    expect(onCreate).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);

    act(() => result.current.onEmailAddressChange('other@example.com'));
    expect(result.current.canSubmitEmail).toBe(true);
  });

  it('does not add an empty email', () => {
    const onCreate = vi.fn(created);
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification, onCreate }),
    );
    act(() => result.current.onOpenChange(true));
    expect(result.current.canSubmitEmail).toBe(false);
    act(() => result.current.onSubmit());
    expect(onCreate).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);
  });

  it('does not verify an incomplete code', async () => {
    const email = verifier();
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({ reverification: idleReverification, onCreate: () => Promise.resolve(email) }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.step).toBe('verify'));
    expect(result.current.canSubmitCode).toBe(false);
    act(() => result.current.onSubmit('123'));
    expect(email.verifyCode).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);

    act(() => result.current.onCodeChange('123456'));
    expect(result.current.canSubmitCode).toBe(true);
  });
});
