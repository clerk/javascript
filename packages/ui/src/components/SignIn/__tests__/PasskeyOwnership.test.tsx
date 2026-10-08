import { ClerkWebAuthnError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useSignInPasskeyController } from '../sign-in-passkey.controller';
import { useSignInPasskeyModel } from '../sign-in-passkey.model';

const { createFixtures } = bindCreateFixtures('SignIn');
const complete = { status: 'complete', createdSessionId: 'session_result' } as SignInResource;

describe('Passkey SDK model ownership', () => {
  const setup = async () => {
    const { wrapper, fixtures, props } = await createFixtures();
    props.setProps({ forceRedirectUrl: '/done' });
    const request = createDeferredPromise<SignInResource>();
    const sdk = fixtures.signIn.authenticateWithPasskey.mockReturnValue(request.promise);
    const first = vi.fn(() => Promise.resolve());
    const second = vi.fn(() => Promise.resolve());
    const hook = renderHook(({ useSecond }) => useSignInPasskeyModel(useSecond ? second : first), {
      wrapper,
      initialProps: { useSecond: false },
    });
    return { ...hook, fixtures, request, sdk, first, second };
  };

  it('blocks a retained SDK command after closure without a Card provider', async () => {
    const { result, unmount, sdk } = await setup();
    const command = result.current.authenticateWithPasskey;
    unmount();
    await command();
    expect(sdk).not.toHaveBeenCalled();
  });

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks commands after canonical %s changes',
    async field => {
      const { result, fixtures, sdk } = await setup();
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await result.current.authenticateWithPasskey();
      expect(sdk).not.toHaveBeenCalled();
    },
  );

  it('discards a late result after closure', async () => {
    const { result, request, unmount, fixtures } = await setup();
    const pending = result.current.authenticateWithPasskey();
    unmount();
    request.resolve(complete);
    await pending;
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('suppresses an SDK error after the source changes', async () => {
    const { result, fixtures, request } = await setup();
    const pending = result.current.authenticateWithPasskey();
    vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'other' } as never);
    request.reject(new Error('Late failure'));
    await expect(pending).resolves.toBeUndefined();
  });

  it.each(['complete', 'needs_protect_check', 'needs_second_factor'] as const)(
    'discards an autofill %s result when an explicit request has started',
    async status => {
      const { result, fixtures, request, sdk, first, rerender } = await setup();
      const explicit = createDeferredPromise<SignInResource>();
      const autofill = result.current.authenticateWithPasskey({ flow: 'autofill' });
      sdk.mockReturnValue(explicit.promise);
      const pending = result.current.authenticateWithPasskey();
      rerender({ useSecond: false });
      request.resolve({ ...complete, status } as SignInResource);
      await autofill;
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
      expect(first).not.toHaveBeenCalled();
      explicit.resolve(complete);
      await pending;
      expect(fixtures.clerk.setActive).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ session: 'session_result' }),
      );
    },
  );

  it('discards an autofill result that arrives after explicit authentication completes', async () => {
    const { result, fixtures, request, sdk } = await setup();
    const autofill = result.current.authenticateWithPasskey({ flow: 'autofill' });
    sdk.mockResolvedValue(complete);
    await result.current.authenticateWithPasskey();
    request.resolve({ ...complete, createdSessionId: 'session_autofill' } as SignInResource);
    await autofill;
    expect(fixtures.clerk.setActive).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ session: 'session_result' }),
    );
  });

  it('suppresses superseded errors and preserves an error from the explicit request', async () => {
    const { result, request, sdk, fixtures } = await setup();
    const explicit = createDeferredPromise<SignInResource>();
    const autofill = result.current.authenticateWithPasskey({ flow: 'autofill' });
    sdk.mockReturnValue(explicit.promise);
    const pending = result.current.authenticateWithPasskey();
    request.reject(new Error('Superseded autofill failure'));
    await expect(autofill).resolves.toBeUndefined();
    const currentError = new Error('Explicit request failure');
    explicit.reject(currentError);
    await expect(pending).rejects.toBe(currentError);
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('uses the current second-factor callback after render and exposes no response', async () => {
    const { result, rerender, request, first, second } = await setup();
    rerender({ useSecond: true });
    const pending = result.current.authenticateWithPasskey();
    request.resolve({ status: 'needs_second_factor' } as SignInResource);
    await expect(pending).resolves.toBeUndefined();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('routes a current Protect result', async () => {
    const { result, fixtures, request } = await setup();
    const pending = result.current.authenticateWithPasskey();
    request.resolve({ status: 'needs_protect_check' } as SignInResource);
    await pending;
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../protect-check');
  });

  it.each(['passkey_retrieval_cancelled', 'passkey_invalid_rpID_or_domain'] as const)(
    'ignores %s for autofill but preserves it for explicit requests',
    async code => {
      const { result, request, sdk } = await setup();
      const error = new ClerkWebAuthnError('Browser rejection', { code });
      const pending = result.current.authenticateWithPasskey({ flow: 'autofill' });
      request.reject(error);
      await expect(pending).resolves.toBeUndefined();
      sdk.mockRejectedValue(error);
      await expect(result.current.authenticateWithPasskey()).rejects.toBe(error);
    },
  );

  it('finishes a valid activation redirect after the session changes and the form closes', async () => {
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
    const pending = result.current.authenticateWithPasskey();
    request.resolve(complete);
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(1));
    unmount();
    activation.resolve();
    await pending;
    expect(fixtures.router.navigate).toHaveBeenCalledWith(new URL('/done', window.location.href).href);
  });
});

describe('Passkey interaction ownership', () => {
  const setup = async (autofillAllowed = false) => {
    const { wrapper: Fixture } = await createFixtures();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <CardStateProvider>{children}</CardStateProvider>
      </Fixture>
    );
    const request = createDeferredPromise<void>();
    const support = createDeferredPromise<boolean>();
    const command = vi.fn(() => request.promise);
    const canRun = vi.fn(() => true);
    const check = vi.fn(() => support.promise);
    const hook = renderHook(
      ({ requestKey }) =>
        useSignInPasskeyController({
          requestKey,
          canRun,
          authenticateWithPasskey: command,
          autofillAllowed,
          checkAutofillSupport: check,
        }),
      { wrapper, initialProps: { requestKey: 'source_1' } },
    );
    return { ...hook, command, canRun, check, request, support };
  };

  it('keeps an explicit request pending across renders', async () => {
    const { result, request, command, rerender } = await setup();
    const pending = result.current.authenticateWithPasskey();
    rerender({ requestKey: 'source_1' });
    await result.current.authenticateWithPasskey();
    expect(command).toHaveBeenCalledTimes(1);
    request.resolve();
    await pending;
  });

  it('allows an explicit request while autofill is pending', async () => {
    const { result, support, request, command } = await setup(true);
    await act(async () => {
      support.resolve(true);
      await support.promise;
    });
    expect(command).toHaveBeenCalledExactlyOnceWith({ flow: 'autofill' });
    const pending = result.current.authenticateWithPasskey();
    expect(command).toHaveBeenCalledTimes(2);
    request.resolve();
    await pending;
  });

  it('does not start autofill when a capability check settles after an explicit request starts', async () => {
    const { result, support, request, command } = await setup(true);
    const pending = result.current.authenticateWithPasskey();
    await act(async () => {
      support.resolve(true);
      await support.promise;
    });
    expect(command).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(result.current.isWebAuthnAutofillSupported).toBe(true);
    request.resolve();
    await pending;
  });

  it('discards a capability result after canonical ownership is lost', async () => {
    const { result, canRun, support, command } = await setup(true);
    canRun.mockReturnValue(false);
    await act(async () => {
      support.resolve(true);
      await support.promise;
    });
    expect(command).not.toHaveBeenCalled();
    expect(result.current.isWebAuthnAutofillSupported).toBe(false);
  });

  it('suppresses a late capability error after closure', async () => {
    const { unmount, support, command } = await setup(true);
    unmount();
    await act(async () => {
      support.reject(new Error('Late browser failure'));
      await support.promise.catch(() => undefined);
    });
    expect(command).not.toHaveBeenCalled();
  });

  it('does not revive an old explicit action when an earlier source returns', async () => {
    const { result, rerender, command } = await setup();
    const previous = result.current.authenticateWithPasskey;
    rerender({ requestKey: 'source_2' });
    rerender({ requestKey: 'source_1' });
    await previous();
    expect(command).not.toHaveBeenCalled();
  });
});
