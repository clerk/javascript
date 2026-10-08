import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useVerifyDomainFormController } from '../verify-domain-form.controller';
import type { VerifyDomainFormModel } from '../verify-domain-form.types';

type OTPCallbacks = {
  onCodeEntryFinished: (code: string, resolve: () => Promise<void>, reject: (error: unknown) => Promise<void>) => void;
  onResendCodeClicked: () => void;
};
const otp = vi.hoisted(() => ({
  callbacks: undefined as OTPCallbacks | undefined,
  reset: vi.fn(),
  clearFeedback: vi.fn(),
}));
vi.mock('@/ui/elements/CodeControl', async importOriginal => ({
  ...(await importOriginal<typeof import('@/ui/elements/CodeControl')>()),
  useFieldOTP: (callbacks: OTPCallbacks) => {
    otp.callbacks = callbacks;
    return {
      isLoading: false,
      otpControl: { reset: otp.reset, otpInputProps: { clearFeedback: otp.clearFeedback } },
      onFakeContinue: vi.fn(),
    };
  },
}));

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
async function setup(strict = false) {
  const { wrapper: Fixture } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{strict ? <StrictMode>{children}</StrictMode> : children}</CardStateProvider>
    </Fixture>
  );
  const model: VerifyDomainFormModel = {
    scope: 'scope',
    canRun: () => true,
    retry: vi.fn(),
    available: true,
    hasDomain: true,
    isLoading: false,
    domainName: 'clerk.com',
    prepare: vi.fn().mockResolvedValue(true),
    attempt: vi.fn().mockResolvedValue(true),
  };
  const onSuccess = vi.fn();
  const hook = renderHook(
    () => ({ controller: useVerifyDomainFormController(model, false, onSuccess), card: useCardState() }),
    { wrapper },
  );
  return { ...hook, model, onSuccess, wrapper };
}

describe('Domain verification action ownership', () => {
  it('releases preparation ownership after an unexpected synchronous failure', async () => {
    const { result, model } = await setup();
    model.prepare = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('Unexpected failure');
      })
      .mockResolvedValue(true);
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(async () => {
      await expect(result.current.controller.onSubmitPrepare()).rejects.toThrow('Unexpected failure');
    });
    expect(result.current.controller.otp.isLoading).toBe(false);
    await act(() => result.current.controller.onSubmitPrepare());
    expect(model.prepare).toHaveBeenCalledTimes(2);
    expect(result.current.controller.wizardProps.step).toBe(1);
  });

  it('returns to code entry after an invalid code and permits retry', async () => {
    const { result, model } = await setup();
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(() => result.current.controller.onSubmitPrepare());
    const failure = new Error('Invalid code');
    model.attempt = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(true);
    const resolve = vi.fn().mockResolvedValue(undefined);
    const reject = vi.fn().mockResolvedValue(undefined);
    act(() => otp.callbacks!.onCodeEntryFinished('wrong', resolve, reject));
    await waitFor(() => expect(result.current.controller.otp.isLoading).toBe(false));
    expect(reject).toHaveBeenCalledExactlyOnceWith(failure);
    expect(result.current.controller.wizardProps.step).toBe(1);
    act(() => otp.callbacks!.onCodeEntryFinished('123456', resolve, reject));
    await waitFor(() => expect(result.current.controller.otp.isLoading).toBe(false));
    expect(resolve).toHaveBeenCalledOnce();
    expect(model.attempt).toHaveBeenCalledTimes(2);
  });

  it('deduplicates preparation and resends the full original email address', async () => {
    const { result, model } = await setup();
    const completion = createDeferredPromise<boolean>();
    model.prepare = vi.fn().mockReturnValueOnce(completion.promise).mockResolvedValue(true);
    act(() => result.current.controller.emailField.setValue('admin'));
    const submit = result.current.controller.onSubmitPrepare;
    let pending!: Promise<void>;
    act(() => {
      pending = submit();
      expect(submit()).toBe(pending);
      otp.callbacks!.onResendCodeClicked();
    });
    await waitFor(() => expect(model.prepare).toHaveBeenCalledExactlyOnceWith('admin@clerk.com', expect.any(Function)));
    expect(result.current.controller.canSubmit).toBe(false);
    await act(async () => {
      completion.resolve(true);
      await pending;
    });
    expect(result.current.controller.wizardProps.step).toBe(1);
    act(() => result.current.controller.emailField.setValue('changed'));
    act(() => otp.callbacks!.onResendCodeClicked());
    await waitFor(() => expect(result.current.controller.otp.isLoading).toBe(false));
    expect(model.prepare).toHaveBeenLastCalledWith('admin@clerk.com', expect.any(Function));
  });

  it('clears preparation errors on retry and withholds empty submissions', async () => {
    const { result, model } = await setup();
    await result.current.controller.onSubmitPrepare();
    expect(model.prepare).not.toHaveBeenCalled();
    model.prepare = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Prepare failed', {
          status: 422,
          data: [{ code: 'prepare_failed', message: 'Prepare failed' }],
        }),
      )
      .mockResolvedValue(true);
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(() => result.current.controller.onSubmitPrepare());
    expect(result.current.card.error).toBe('Prepare failed');
    expect(result.current.controller.wizardProps.step).toBe(0);
    await act(() => result.current.controller.onSubmitPrepare());
    expect(result.current.card.error).toBeUndefined();
    expect(result.current.controller.wizardProps.step).toBe(1);
  });

  it.each([true, false])('preserves verification result=%s and suppresses duplicate attempts', async verified => {
    const { result, model, onSuccess } = await setup();
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(() => result.current.controller.onSubmitPrepare());
    expect(result.current.controller.wizardProps.step).toBe(1);
    const completion = createDeferredPromise<boolean>();
    model.attempt = vi.fn().mockReturnValue(completion.promise);
    const resolve = vi.fn().mockResolvedValue(undefined);
    const reject = vi.fn().mockResolvedValue(undefined);
    act(() => {
      otp.callbacks!.onCodeEntryFinished('123456', resolve, reject);
      otp.callbacks!.onCodeEntryFinished('123456', resolve, reject);
      result.current.controller.onBack();
    });
    await waitFor(() => expect(model.attempt).toHaveBeenCalledOnce());
    await act(async () => {
      completion.resolve(verified);
      await completion.promise;
    });
    await waitFor(() => expect(result.current.controller.otp.isLoading).toBe(false));
    expect(resolve).toHaveBeenCalledOnce();
    expect(reject).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(verified ? 0 : 1);
    expect(result.current.controller.wizardProps.step).toBe(verified ? 2 : 1);
  });

  it('does not advance when preparation is stale and releases the action lock', async () => {
    const { result, model } = await setup();
    model.prepare = vi.fn().mockResolvedValue(false);
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(() => result.current.controller.onSubmitPrepare());
    expect(result.current.controller.wizardProps.step).toBe(0);
    expect(result.current.controller.otp.isLoading).toBe(false);
  });

  it('ignores late failures and retained callbacks after unmount', async () => {
    const { result, model, unmount } = await setup();
    const completion = createDeferredPromise<boolean>();
    model.prepare = vi.fn().mockReturnValue(completion.promise);
    act(() => result.current.controller.emailField.setValue('admin'));
    const retained = result.current.controller;
    const callbacks = otp.callbacks!;
    let pending!: Promise<void>;
    act(() => {
      pending = retained.onSubmitPrepare();
    });
    await waitFor(() => expect(model.prepare).toHaveBeenCalledOnce());
    unmount();
    completion.reject(new Error('Late failure'));
    await expect(pending).resolves.toBeUndefined();
    await retained.onSubmitPrepare();
    callbacks.onResendCodeClicked();
    callbacks.onCodeEntryFinished('123456', vi.fn(), vi.fn());
    expect(model.prepare).toHaveBeenCalledOnce();
    expect(model.attempt).not.toHaveBeenCalled();
  });

  it('does not advance after unmount during the OTP success feedback delay', async () => {
    const { result, onSuccess, unmount } = await setup();
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(() => result.current.controller.onSubmitPrepare());
    const feedback = createDeferredPromise();
    const resolve = vi.fn().mockReturnValue(feedback.promise);
    act(() => otp.callbacks!.onCodeEntryFinished('123456', resolve, vi.fn()));
    await waitFor(() => expect(resolve).toHaveBeenCalledOnce());
    const step = result.current.controller.wizardProps.step;
    unmount();
    feedback.resolve(undefined);
    await feedback.promise;
    expect(result.current.controller.wizardProps.step).toBe(step);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('does not attempt or resend a code before preparation or after verification', async () => {
    const { result, model } = await setup();
    const resolve = vi.fn().mockResolvedValue(undefined);
    const reject = vi.fn().mockResolvedValue(undefined);
    act(() => {
      otp.callbacks!.onCodeEntryFinished('123456', resolve, reject);
      otp.callbacks!.onResendCodeClicked();
    });
    expect(model.prepare).not.toHaveBeenCalled();
    expect(model.attempt).not.toHaveBeenCalled();
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(() => result.current.controller.onSubmitPrepare());
    act(() => otp.callbacks!.onCodeEntryFinished('123456', resolve, reject));
    await waitFor(() => expect(result.current.controller.wizardProps.step).toBe(2));
    await waitFor(() => expect(result.current.controller.otp.isLoading).toBe(false));
    act(() => {
      otp.callbacks!.onCodeEntryFinished('123456', resolve, reject);
      otp.callbacks!.onResendCodeClicked();
      result.current.controller.onBack();
    });
    expect(model.prepare).toHaveBeenCalledOnce();
    expect(model.attempt).toHaveBeenCalledOnce();
    expect(result.current.controller.wizardProps.step).toBe(2);
  });

  it('returns to the email step and prepares the edited address after Back', async () => {
    const { result, model } = await setup();
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(() => result.current.controller.onSubmitPrepare());
    act(() => result.current.controller.onBack());
    expect(result.current.controller.wizardProps.step).toBe(0);
    expect(result.current.controller.verificationEmail).toBe('');
    act(() => result.current.controller.emailField.setValue('other'));
    await act(() => result.current.controller.onSubmitPrepare());
    expect(model.prepare).toHaveBeenLastCalledWith('other@clerk.com', expect.any(Function));
    expect(result.current.controller.verificationEmail).toBe('other@clerk.com');
    expect(result.current.controller.wizardProps.step).toBe(1);
  });

  it.each([false, true])('cancels queued preparation when the form closes (Strict Mode: %s)', async strict => {
    const { result, model, unmount } = await setup(strict);
    act(() => result.current.controller.emailField.setValue('admin'));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.controller.onSubmitPrepare();
      unmount();
    });
    await pending;
    expect(model.prepare).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'])('ignores a late preparation %s after the source changes', async outcome => {
    const { result, model } = await setup();
    const completion = createDeferredPromise<boolean>();
    model.prepare = vi.fn().mockReturnValue(completion.promise);
    act(() => result.current.controller.emailField.setValue('admin'));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.controller.onSubmitPrepare();
    });
    await waitFor(() => expect(model.prepare).toHaveBeenCalledOnce());
    const isCurrent = vi.mocked(model.prepare).mock.calls[0][1]!;
    model.canRun = () => false;
    expect(isCurrent()).toBe(false);
    if (outcome === 'success') {
      completion.resolve(true);
    } else {
      completion.reject(new Error('Stale prepare error'));
    }
    await expect(pending).resolves.toBeUndefined();
    expect(result.current.controller.wizardProps.step).toBe(0);
    expect(result.current.card.error).toBeUndefined();
  });

  it('returns to code entry after an ignored attempt result', async () => {
    const { result, model, onSuccess } = await setup();
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(() => result.current.controller.onSubmitPrepare());
    model.attempt = vi.fn().mockResolvedValue(undefined);
    const resolve = vi.fn();
    const reject = vi.fn();
    act(() => otp.callbacks!.onCodeEntryFinished('123456', resolve, reject));
    await waitFor(() => expect(result.current.controller.otp.isLoading).toBe(false));
    expect(result.current.controller.wizardProps.step).toBe(1);
    expect(resolve).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('does not advance after the source changes during OTP success feedback', async () => {
    const { result, model, onSuccess } = await setup();
    act(() => result.current.controller.emailField.setValue('admin'));
    await act(() => result.current.controller.onSubmitPrepare());
    const feedback = createDeferredPromise<void>();
    const resolve = vi.fn().mockReturnValue(feedback.promise);
    act(() => otp.callbacks!.onCodeEntryFinished('123456', resolve, vi.fn()));
    await waitFor(() => expect(resolve).toHaveBeenCalledOnce());
    model.canRun = () => false;
    await act(async () => {
      feedback.resolve();
      await feedback.promise;
    });
    expect(result.current.controller.wizardProps.step).toBe(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('does not release a new source request when an old preparation settles', async () => {
    const { model, wrapper } = await setup();
    const first = createDeferredPromise<boolean>();
    const second = createDeferredPromise<boolean>();
    model.prepare = vi.fn().mockReturnValue(first.promise);
    const { result, rerender } = renderHook(({ source }) => useVerifyDomainFormController(source, false), {
      wrapper,
      initialProps: { source: model },
    });
    act(() => result.current.emailField.setValue('admin'));
    let oldRequest!: Promise<void>;
    act(() => {
      oldRequest = result.current.onSubmitPrepare();
    });
    await waitFor(() => expect(model.prepare).toHaveBeenCalledOnce());
    const replacement = { ...model, scope: 'second', prepare: vi.fn().mockReturnValue(second.promise) };
    rerender({ source: replacement });
    let newRequest!: Promise<void>;
    act(() => {
      newRequest = result.current.onSubmitPrepare();
    });
    await waitFor(() => expect(replacement.prepare).toHaveBeenCalledOnce());
    await act(async () => {
      first.resolve(true);
      await oldRequest;
    });
    expect(result.current.otp.isLoading).toBe(true);
    expect(result.current.onSubmitPrepare()).toBe(newRequest);
    await act(async () => {
      second.resolve(true);
      await newRequest;
    });
    expect(result.current.wizardProps.step).toBe(1);
    expect(result.current.otp.isLoading).toBe(false);
  });
});
