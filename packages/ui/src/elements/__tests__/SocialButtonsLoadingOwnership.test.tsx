import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';

import { CardStateProvider, useCardState } from '../contexts';
import { useSocialButtonsController } from '../social-buttons.controller';

const { createFixtures } = bindCreateFixtures('SignIn');
afterEach(() => {
  vi.useRealTimers();
});

const setup = async (idleAfterDelay = true) => {
  const { wrapper: Fixture } = await createFixtures();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const request = createDeferredPromise<void>();
  const oauthCallback = vi.fn(() => request.promise);
  const web3Callback = vi.fn(() => request.promise);
  const canRun = vi.fn(() => true);
  vi.useFakeTimers();
  const hook = renderHook(
    ({ requestKey }) => ({
      controller: useSocialButtonsController(
        { requestKey, canRun },
        {
          oauthCallback,
          web3Callback,
          alternativePhoneCodeCallback: vi.fn(),
          idleAfterDelay,
        },
      ),
      card: useCardState(),
    }),
    { wrapper, initialProps: { requestKey: 'source_1' } },
  );
  const timers = vi.getTimerCount();
  const start = () => {
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.controller.onSocialButtonClick('oauth_google')();
    });
    return pending;
  };
  return { ...hook, request, oauthCallback, web3Callback, canRun, timers, start };
};

describe('Social button loading ownership', () => {
  it('starts one request synchronously and keeps its lease across renders', async () => {
    const { result, rerender, request, oauthCallback, start } = await setup(false);
    const pending = start();
    expect(oauthCallback).toHaveBeenCalledTimes(1);
    expect(result.current.card.isLoading).toBe(true);
    rerender({ requestKey: 'source_1' });
    await result.current.controller.onSocialButtonClick('oauth_google')();
    expect(oauthCallback).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve();
      await pending;
    });
    expect(result.current.card.isLoading).toBe(false);
  });

  it('keeps redirect loading for five seconds after the command succeeds', async () => {
    const { result, request, timers, start } = await setup();
    const pending = start();
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(vi.getTimerCount()).toBe(timers + 1);
    await act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(result.current.card.isLoading).toBe(true);
    await act(async () => {
      vi.advanceTimersByTime(1);
      await pending;
    });
    expect(result.current.card.isLoading).toBe(false);
    expect(vi.getTimerCount()).toBe(timers);
  });

  it('releases a failed request after one second without a second delayed reset', async () => {
    const { result, request, timers, start } = await setup();
    const pending = start();
    await act(async () => {
      request.reject(new Error('Cancelled'));
      await request.promise.catch(() => undefined);
    });
    expect(result.current.card.isLoading).toBe(true);
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await pending;
    });
    expect(result.current.card.isLoading).toBe(false);
    expect(vi.getTimerCount()).toBe(timers);
  });

  it('cancels a pending delay when the form closes', async () => {
    const { request, unmount, timers, start } = await setup();
    const pending = start();
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    unmount();
    await pending;
    expect(vi.getTimerCount()).toBe(timers);
  });

  it('does not schedule a delay for an SDK result after closure', async () => {
    const { request, unmount, timers, start } = await setup();
    const pending = start();
    unmount();
    request.resolve();
    await pending;
    expect(vi.getTimerCount()).toBe(timers);
  });

  it('cancels an old delay and does not release a new source request', async () => {
    const { result, request, rerender, oauthCallback, timers, start } = await setup();
    const old = start();
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    rerender({ requestKey: 'source_2' });
    const next = createDeferredPromise<void>();
    oauthCallback.mockReturnValue(next.promise);
    const pending = start();
    await act(async () => {
      await old;
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.card.isLoading).toBe(true);
    expect(vi.getTimerCount()).toBe(timers);
    await act(async () => {
      next.resolve();
      await next.promise;
    });
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await pending;
    });
    expect(result.current.card.isLoading).toBe(false);
  });

  it('blocks retained callbacks after canonical ownership is lost', async () => {
    const { result, canRun, oauthCallback, web3Callback } = await setup();
    canRun.mockReturnValue(false);
    await result.current.controller.onSocialButtonClick('oauth_google')();
    await result.current.controller.onSocialButtonClick('web3_metamask_signature')();
    expect(oauthCallback).not.toHaveBeenCalled();
    expect(web3Callback).not.toHaveBeenCalled();
  });

  it('does not revive callbacks when an earlier source returns', async () => {
    const { result, rerender, oauthCallback } = await setup();
    const previous = result.current.controller.onSocialButtonClick('oauth_google');
    rerender({ requestKey: 'source_2' });
    rerender({ requestKey: 'source_1' });
    await previous();
    expect(oauthCallback).not.toHaveBeenCalled();
  });
});
