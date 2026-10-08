import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { useSocialAuthenticationController } from '@/ui/common/useSocialAuthenticationController';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useSignInSocialButtonsModel } from '../sign-in-social-buttons.model';

const { createFixtures } = bindCreateFixtures('SignIn');
const failure = () =>
  new ClerkAPIResponseError('Failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Failed', long_message: 'Please try again' }],
  });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Social sign-in interaction ownership', () => {
  const setup = async () => {
    const { wrapper: Fixture } = await createFixtures();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <CardStateProvider>{children}</CardStateProvider>
      </Fixture>
    );
    const request = createDeferredPromise<void>();
    const popup = { closed: false };
    const open = vi.spyOn(window, 'open').mockReturnValue(popup as Window);
    const model = {
      requestKey: 'source_1',
      canRun: vi.fn(() => true),
      shouldUsePopup: true,
      hasOAuthTransport: false,
      authenticateWithPopup: vi.fn(() => request.promise),
      authenticateWithRedirect: vi.fn(() => request.promise),
      authenticateWithWeb3: vi.fn(() => request.promise),
      recoverSessionExists: vi.fn((_error: unknown): Promise<void> | undefined => undefined),
    };
    vi.useFakeTimers();
    const hook = renderHook(
      ({ requestKey }) => ({
        controller: useSocialAuthenticationController({ ...model, requestKey }),
        card: useCardState(),
      }),
      { wrapper, initialProps: { requestKey: 'source_1' } },
    );
    const timers = vi.getTimerCount();
    return { ...hook, model, request, popup, open, timers };
  };

  it('opens the popup synchronously and blocks duplicate requests across renders', async () => {
    const { result, model, open, request, rerender } = await setup();
    const pending = result.current.controller.oauthCallback('oauth_google');
    expect(open).toHaveBeenCalledExactlyOnceWith('about:blank', '', 'width=600,height=800');
    expect(model.authenticateWithPopup).toHaveBeenCalledExactlyOnceWith('oauth_google', open.mock.results[0].value);
    rerender({ requestKey: 'source_1' });
    await result.current.controller.oauthCallback('oauth_google');
    expect(open).toHaveBeenCalledTimes(1);
    request.resolve();
    await pending;
  });

  it('clears popup polling and loading when the SDK request ends', async () => {
    const { result, request, timers } = await setup();
    act(() => result.current.card.setLoading('oauth_google'));
    const pending = result.current.controller.oauthCallback('oauth_google');
    expect(vi.getTimerCount()).toBe(timers + 1);
    await act(async () => {
      request.resolve();
      await pending;
    });
    expect(vi.getTimerCount()).toBe(timers);
    expect(result.current.card.isLoading).toBe(false);
  });

  it('clears polling and displays a current SDK error', async () => {
    const { result, request, timers } = await setup();
    act(() => result.current.card.setLoading('oauth_google'));
    const pending = result.current.controller.oauthCallback('oauth_google');
    await act(async () => {
      request.reject(failure());
      await pending;
    });
    expect(vi.getTimerCount()).toBe(timers);
    expect(result.current.card.error).toBe('Please try again');
    expect(result.current.card.isLoading).toBe(false);
  });

  it('stops polling when the popup closes and waits for SDK completion before another request', async () => {
    const { result, request, popup, model, timers } = await setup();
    act(() => result.current.card.setLoading('oauth_google'));
    const pending = result.current.controller.oauthCallback('oauth_google');
    popup.closed = true;
    await act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(vi.getTimerCount()).toBe(timers);
    expect(result.current.card.isLoading).toBe(false);
    await result.current.controller.oauthCallback('oauth_google');
    expect(model.authenticateWithPopup).toHaveBeenCalledTimes(1);
    request.resolve();
    await pending;
  });

  it('clears polling on unmount and ignores a late error', async () => {
    const { result, request, unmount, model, timers } = await setup();
    const pending = result.current.controller.oauthCallback('oauth_google');
    unmount();
    expect(vi.getTimerCount()).toBe(timers);
    request.reject(failure());
    await pending;
    expect(model.recoverSessionExists).not.toHaveBeenCalled();
  });

  it('blocks retained callbacks after unmount', async () => {
    const { result, unmount, model, open } = await setup();
    const controller = result.current.controller;
    unmount();
    await controller.oauthCallback('oauth_google');
    await controller.web3Callback('web3_metamask_signature');
    expect(open).not.toHaveBeenCalled();
    expect(model.authenticateWithWeb3).not.toHaveBeenCalled();
  });

  it('stops a poll when canonical ownership changes before render', async () => {
    const { result, model, request, timers } = await setup();
    act(() => result.current.card.setLoading('oauth_google'));
    const pending = result.current.controller.oauthCallback('oauth_google');
    model.canRun.mockReturnValue(false);
    await act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(vi.getTimerCount()).toBe(timers);
    expect(result.current.card.isLoading).toBe(true);
    await act(async () => {
      request.reject(failure());
      await pending;
    });
    expect(result.current.card.error).toBeUndefined();
  });

  it('does not let an old request change the new source error or loading state', async () => {
    const { result, model, request, rerender } = await setup();
    const previous = result.current.controller;
    const old = previous.oauthCallback('oauth_google');
    rerender({ requestKey: 'source_2' });
    const next = createDeferredPromise<void>();
    model.authenticateWithPopup.mockReturnValue(next.promise);
    act(() => {
      result.current.card.setLoading('oauth_google');
      result.current.card.setError('New source error');
    });
    const pending = result.current.controller.oauthCallback('oauth_google');
    await act(async () => {
      request.reject(failure());
      await old;
    });
    expect(result.current.card.error).toBe('New source error');
    expect(result.current.card.isLoading).toBe(true);
    await previous.oauthCallback('oauth_google');
    expect(model.authenticateWithPopup).toHaveBeenCalledTimes(2);
    await act(async () => {
      next.resolve();
      await pending;
    });
  });

  it('does not revive an earlier source callback when that source returns', async () => {
    const { result, rerender, open } = await setup();
    const previous = result.current.controller;
    rerender({ requestKey: 'source_2' });
    rerender({ requestKey: 'source_1' });
    await previous.oauthCallback('oauth_google');
    expect(open).not.toHaveBeenCalled();
  });

  it('releases the pending lock if opening a window throws', async () => {
    const { result, open, request } = await setup();
    const error = new Error('Window failed');
    open.mockImplementationOnce(() => {
      throw error;
    });
    await expect(result.current.controller.oauthCallback('oauth_google')).rejects.toBe(error);
    const pending = result.current.controller.oauthCallback('oauth_google');
    expect(open).toHaveBeenCalledTimes(2);
    request.resolve();
    await pending;
  });
});

describe('Social sign-in SDK boundary', () => {
  const setup = async () => {
    const { wrapper, fixtures, props } = await createFixtures();
    props.setProps({ oauthFlow: 'popup' });
    const hook = renderHook(useSignInSocialButtonsModel, { wrapper });
    return { ...hook, fixtures };
  };

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks commands after canonical %s changes',
    async field => {
      const { result, fixtures } = await setup();
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await result.current.authenticateWithPopup('oauth_google', null);
      await result.current.authenticateWithRedirect('oauth_google');
      expect(fixtures.signIn.authenticateWithPopup).not.toHaveBeenCalled();
      expect(fixtures.signIn.authenticateWithRedirect).not.toHaveBeenCalled();
    },
  );

  it('blocks a retained SDK command after closure', async () => {
    const { result, fixtures, unmount } = await setup();
    const command = result.current.authenticateWithPopup;
    unmount();
    await command('oauth_google', null);
    expect(fixtures.signIn.authenticateWithPopup).not.toHaveBeenCalled();
  });

  it('permits the SDK to assign a new OAuth attempt ID', async () => {
    const { result, fixtures } = await setup();
    fixtures.signIn.id = 'attempt_1';
    fixtures.signIn.authenticateWithPopup.mockImplementation(() => {
      fixtures.signIn.id = 'attempt_2';
      return Promise.resolve();
    });
    await result.current.authenticateWithPopup('oauth_google', null);
    expect(result.current.canRun()).toBe(true);
    expect(fixtures.signIn.authenticateWithPopup).toHaveBeenCalledTimes(1);
  });

  it('does not expose the Web3 SDK response to the controller', async () => {
    const { result, fixtures } = await setup();
    const sdk = vi.spyOn(fixtures.clerk, 'authenticateWithWeb3').mockResolvedValue({ privateResponse: true });
    await expect(result.current.authenticateWithWeb3('web3_metamask_signature')).resolves.toBeUndefined();
    expect(sdk).toHaveBeenCalledWith(expect.objectContaining({ strategy: 'web3_metamask_signature' }));
  });

  it('recovers a session-exists error for the current account', async () => {
    const { result, fixtures } = await setup();
    const error = new ClerkAPIResponseError('Session exists', {
      status: 400,
      data: [{ code: 'session_exists', message: 'Session exists' }],
    });
    await result.current.recoverSessionExists(error);
    expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(1);
  });

  it('does not recover a session-exists error after closure', async () => {
    const { result, fixtures, unmount } = await setup();
    const recover = result.current.recoverSessionExists;
    unmount();
    const error = new ClerkAPIResponseError('Session exists', {
      status: 400,
      data: [{ code: 'session_exists', message: 'Session exists' }],
    });
    expect(recover(error)).toBeUndefined();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });
});
