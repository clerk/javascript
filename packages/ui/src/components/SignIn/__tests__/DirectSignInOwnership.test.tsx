import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useSignInFactorOnePasswordModel } from '../sign-in-factor-one-password.model';
import { useSignInFactorTwoBackupCodeModel } from '../sign-in-factor-two-backup-code.model';
import { SignInFactorOnePasswordCard } from '../SignInFactorOnePasswordCard';

const { createFixtures } = bindCreateFixtures('SignIn');
const response = { status: 'complete', createdSessionId: 'session_result' } as SignInResource;
const scenarios = [
  { name: 'password', method: 'attemptFirstFactor' as const, useModel: useSignInFactorOnePasswordModel },
  { name: 'backup code', method: 'attemptSecondFactor' as const, useModel: useSignInFactorTwoBackupCodeModel },
];

describe.each(scenarios)('$name request ownership', ({ method, useModel }) => {
  const setup = async () => {
    const { wrapper, fixtures, props } = await createFixtures();
    props.setProps({ forceRedirectUrl: '/done' });
    fixtures.signIn.id = 'attempt_1';
    const request = createDeferredPromise<SignInResource>();
    const sdk = vi.spyOn(fixtures.signIn, method).mockReturnValue(request.promise);
    return { ...renderHook(useModel, { wrapper }), fixtures, sdk, request };
  };

  it('blocks a retained attempt after closure', async () => {
    const { result, unmount, sdk } = await setup();
    const attempt = result.current.attempt;
    unmount();
    await attempt('secret');
    expect(sdk).not.toHaveBeenCalled();
  });

  it('blocks a retained attempt when the SDK attempt changes before render', async () => {
    const { result, fixtures, sdk } = await setup();
    fixtures.signIn.id = 'attempt_2';
    await result.current.attempt('secret');
    expect(sdk).not.toHaveBeenCalled();
  });

  it('discards a late result after closure', async () => {
    const { result, request, fixtures, unmount } = await setup();
    const pending = result.current.attempt('secret');
    unmount();
    request.resolve(response);
    await pending;
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('does not route a late Protect result after ownership changes', async () => {
    const { result, request, fixtures } = await setup();
    const pending = result.current.attempt('secret');
    fixtures.signIn.id = 'attempt_2';
    request.resolve({ status: 'needs_protect_check' } as SignInResource);
    await pending;
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('routes a current Protect result', async () => {
    const { result, request, fixtures } = await setup();
    const pending = result.current.attempt('secret');
    request.resolve({ status: 'needs_protect_check' } as SignInResource);
    await pending;
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../protect-check');
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('suppresses an SDK error after ownership changes', async () => {
    const { result, request, fixtures } = await setup();
    const pending = result.current.attempt('secret');
    fixtures.signIn.id = 'attempt_2';
    request.reject(new Error('Late failure'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('preserves an SDK error for the current owner', async () => {
    const { result, request } = await setup();
    const pending = result.current.attempt('secret');
    const error = new Error('Invalid credential');
    request.reject(error);
    await expect(pending).rejects.toBe(error);
  });

  if (method === 'attemptFirstFactor') {
    it.each([
      ['needs_second_factor', '../factor-two'],
      ['needs_client_trust', '../client-trust'],
    ] as const)('routes a current %s response', async (status, path) => {
      const { result, request, fixtures } = await setup();
      const pending = result.current.attempt('secret');
      request.resolve({ status } as SignInResource);
      await pending;
      expect(fixtures.router.navigate).toHaveBeenCalledWith(path);
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    });
  } else {
    it('routes a completed password reset to its success page', async () => {
      const { result, request, fixtures } = await setup();
      const pending = result.current.attempt('secret');
      request.resolve({
        ...response,
        firstFactorVerification: { strategy: 'reset_password_email_code', status: 'verified' },
      } as SignInResource);
      await pending;
      expect(fixtures.router.navigate).toHaveBeenCalledWith(
        '../reset-password-success?createdSessionId=session_result',
      );
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    });
  }

  it('finishes an activation redirect after activation changes the session and closes the form', async () => {
    const { result, fixtures, request, unmount } = await setup();
    const activation = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockImplementation(async options => {
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ id: 'session_result' } as never);
      await activation.promise;
      await options?.navigate?.({
        session: { id: 'session_result', currentTask: null } as never,
        decorateUrl: url => url,
      });
    });
    const pending = result.current.attempt('secret');
    request.resolve(response);
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(1));
    unmount();
    activation.resolve();
    await pending;
    expect(fixtures.router.navigate).toHaveBeenCalledWith(new URL('/done', window.location.href).href);
  });
});

describe('Password form submission', () => {
  const setup = async (onPasswordError = vi.fn()) => {
    const { wrapper: Fixture, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPassword();
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <CardStateProvider>{children}</CardStateProvider>
      </Fixture>
    );
    const request = createDeferredPromise<SignInResource>();
    fixtures.signIn.id = 'attempt_1';
    fixtures.signIn.attemptFirstFactor.mockReturnValue(request.promise);
    const view = render(
      <SignInFactorOnePasswordCard
        onForgotPasswordMethodClick={undefined}
        onShowAlternativeMethodsClick={undefined}
        onPasswordError={onPasswordError}
      />,
      { wrapper },
    );
    return { ...view, fixtures, request, onPasswordError, form: view.getByLabelText('Password').closest('form')! };
  };

  it.each(['pwned', 'compromised'] as const)('preserves the %s password callback', async code => {
    const { form, request, onPasswordError } = await setup();
    fireEvent.submit(form);
    await act(async () => {
      request.reject(
        new ClerkAPIResponseError('Failed', {
          status: 422,
          data: [{ code: `form_password_${code}`, message: 'Password is unsafe' }],
        }),
      );
      await request.promise.catch(() => undefined);
    });
    expect(onPasswordError).toHaveBeenCalledExactlyOnceWith(code);
  });

  it('holds the form pending until the password attempt settles', async () => {
    const { form, fixtures, request, getByRole } = await setup();
    fireEvent.submit(form);
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.submit(form);
    expect(fixtures.signIn.attemptFirstFactor).toHaveBeenCalledTimes(1);
    expect(getByRole('button', { name: 'Loading' })).toBeDisabled();
    await act(async () => {
      request.resolve({ status: 'needs_second_factor' } as SignInResource);
      await request.promise;
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../factor-two');
  });

  it('does not focus another input when an error timer outlives its form', async () => {
    const { form, request, unmount, getByLabelText } = await setup();
    const input = getByLabelText('Password') as HTMLInputElement;
    const focus = vi.spyOn(input, 'focus');
    vi.useFakeTimers();
    try {
      fireEvent.submit(form);
      await act(async () => {
        request.reject(
          new ClerkAPIResponseError('Failed', {
            status: 422,
            data: [{ code: 'form_password_incorrect', message: 'Incorrect password' }],
          }),
        );
        await request.promise.catch(() => undefined);
      });
      expect(focus).not.toHaveBeenCalled();
      unmount();
      await act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(focus).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
