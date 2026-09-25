import { createDeferredPromise } from '@clerk/shared/utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SaveError } from '../../../utils/form-error';
import type { UserProfileEmailVerification, UserProfileEmailVerifier } from './user-profile-account-section.types';
import { useUserProfileAddEmailController } from './user-profile-add-email.controller';

const sentCode = (): UserProfileEmailVerification => ({ method: 'code', sent: Promise.resolve() });

function sentLink(verified: Promise<void>, cancel = vi.fn()) {
  return (): UserProfileEmailVerification => ({ method: 'link', verified, cancel });
}

function verifier(
  start: () => UserProfileEmailVerification = sentCode,
  verifyCode: (code: string) => Promise<void> = () => Promise.resolve(),
) {
  return { start: vi.fn(start), verifyCode: vi.fn(verifyCode) } satisfies UserProfileEmailVerifier;
}

const created = () => Promise.resolve(verifier());

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
        onCreate: () =>
          Promise.resolve(
            verifier(sentCode, async () => {
              await verification.promise;
            }),
          ),
      }),
    );
    act(() => result.current.onOpenChange(true));
    await act(async () => {
      result.current.onSubmit();
      await Promise.resolve();
    });
    act(() => result.current.onSubmit('123456'));
    for (let second = 0; second < 12; second++) {
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
    const { result } = renderHook(() => useUserProfileAddEmailController({ onCreate }));
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
    const { result } = renderHook(() => useUserProfileAddEmailController({ onCreate: () => Promise.resolve(email) }));
    act(() => result.current.onOpenChange(true));
    await act(async () => {
      result.current.onSubmit();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.resendSeconds).toBe(12);
    act(() => result.current.onResend());
    expect(email.start).toHaveBeenCalledTimes(1);
    for (let second = 0; second < 12; second++) {
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
    expect(email.start).toHaveBeenCalledTimes(2);
    expect(email.verifyCode).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
    expect(result.current.code).toBe('');
    expect(result.current.resendSeconds).toBe(12);
  });
  it.each(['email', 'verify'] as const)('keeps the %s input after failure and allows retrying', async step => {
    const operation = vi.fn().mockRejectedValueOnce(saveError('Try again')).mockResolvedValue(verifier());
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({
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
    const { result } = renderHook(() => useUserProfileAddEmailController({ onCreate }));

    expect(result.current.open).toBe(false);
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('new@example.com'));
    act(() => result.current.onSubmit());
    expect(result.current.isPending).toBe(true);
    expect(result.current.open).toBe(true);
    await waitFor(() => expect(result.current.step).toBe('verify'));
    expect(onCreate).toHaveBeenCalledExactlyOnceWith('new@example.com');
    await waitFor(() => expect(email.start).toHaveBeenCalledOnce());

    act(() => result.current.onSubmit('123456'));
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(email.verifyCode).toHaveBeenCalledExactlyOnceWith('123456');
  });

  it('verifies an existing email without creating one', async () => {
    const onCreate = vi.fn(created);
    const email = verifier();
    const { result } = renderHook(() => useUserProfileAddEmailController({ onCreate }));

    act(() => result.current.onVerifyEmail('other@example.com', email));
    expect(result.current.open).toBe(true);
    expect(result.current.step).toBe('verify');
    expect(result.current.emailAddress).toBe('other@example.com');
    await waitFor(() => expect(email.start).toHaveBeenCalledOnce());

    act(() => result.current.onSubmit('123456'));
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(email.verifyCode).toHaveBeenCalledExactlyOnceWith('123456');
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('stays on the code step when sending fails, and lets the user resend at once', async () => {
    const email = verifier();
    email.start.mockImplementationOnce(() => ({
      method: 'code',
      sent: Promise.reject(saveError('Too many requests')),
    }));
    const { result } = renderHook(() => useUserProfileAddEmailController({ onCreate: created }));

    act(() => result.current.onVerifyEmail('other@example.com', email));
    await waitFor(() => expect(result.current.errorMessage).toBe('Too many requests'));
    expect(result.current.step).toBe('verify');
    expect(result.current.resendSeconds).toBe(0);

    act(() => result.current.onResend());
    await waitFor(() => expect(email.start).toHaveBeenCalledTimes(2));
  });

  it('shows the error for the field that failed', async () => {
    const { result } = renderHook(() =>
      useUserProfileAddEmailController({
        onCreate: () => Promise.reject(saveError('That email is taken.', 'emailAddress')),
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.errorMessage).toBe('That email is taken.'));
  });

  it('waits for the link to be opened, then closes', async () => {
    const verified = createDeferredPromise();
    const { result } = renderHook(() => useUserProfileAddEmailController({}));

    act(() =>
      result.current.onVerifyEmail('other@example.com', verifier(sentLink(verified.promise.then(() => undefined)))),
    );
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
    const { result, unmount } = renderHook(() => useUserProfileAddEmailController({}));

    act(() => result.current.onVerifyEmail('other@example.com', email));
    await waitFor(() => expect(result.current.step).toBe('link'));
    act(() => result.current.onOpenChange(false));
    expect(cancel).toHaveBeenCalledOnce();

    act(() => result.current.onVerifyEmail('other@example.com', email));
    await waitFor(() => expect(result.current.step).toBe('link'));
    unmount();
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it('shows a link failure and lets the user send a new link', async () => {
    const email = verifier(sentLink(Promise.reject(saveError('Link expired'))));
    const { result } = renderHook(() => useUserProfileAddEmailController({}));

    act(() => result.current.onVerifyEmail('other@example.com', email));
    await waitFor(() => expect(result.current.errorMessage).toBe('Link expired'));
    expect(result.current.step).toBe('link');
    expect(result.current.open).toBe(true);
  });

  it('connects through the SSO provider, closes once verified, and stops waiting when closed', async () => {
    const verified = createDeferredPromise();
    const cancel = vi.fn();
    const connect = vi.fn();
    const email = verifier(() => ({
      method: 'sso',
      verified: verified.promise.then(() => undefined),
      cancel,
      connect,
    }));
    const { result } = renderHook(() => useUserProfileAddEmailController({}));

    act(() => result.current.onVerifyEmail('person@acme.co', email));
    expect(result.current.step).toBe('sso');
    expect(result.current.resendSeconds).toBe(0);
    result.current.onConnect();
    expect(connect).toHaveBeenCalledOnce();
    act(() => result.current.onOpenChange(false));
    expect(cancel).toHaveBeenCalledOnce();

    act(() => result.current.onVerifyEmail('person@acme.co', email));
    await waitFor(() => expect(result.current.step).toBe('sso'));
    await act(async () => {
      verified.resolve();
      await verified.promise;
    });
    expect(result.current.open).toBe(false);
  });

  it('moves from the email step straight to the step for the verification method', async () => {
    const shown: string[] = [];
    const { result } = renderHook(() => {
      const controller = useUserProfileAddEmailController({
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
    const { result } = renderHook(() => useUserProfileAddEmailController({ username: 'person@example.com', onCreate }));
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onEmailAddressChange('person@example.com'));
    expect(result.current.canSubmitEmail).toBe(false);
    act(() => result.current.onSubmit());
    expect(onCreate).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);

    act(() => result.current.onEmailAddressChange('other@example.com'));
    expect(result.current.canSubmitEmail).toBe(true);
  });
});
