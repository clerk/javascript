import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

const goNext = vi.hoisted(() => vi.fn());
vi.mock('../../elements/Wizard', () => ({ useWizard: () => ({ goNext }) }));

import { useContinueTestSsoStepButtonController } from '../continue-test-sso-step-button.controller';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');
const setup = async () => {
  const { wrapper: Fixture } = await createFixtures();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  goNext.mockReset();
  const request = createDeferredPromise<boolean>();
  const revalidate = vi.fn(() => request.promise);
  const canRun = vi.fn(() => true);
  const hook = renderHook(
    ({
      connectionId,
      hasSuccess,
      ownerKey = 'owner',
    }: {
      connectionId: string;
      hasSuccess: boolean;
      ownerKey?: string;
    }) => {
      const card = useCardState();
      const controller = useContinueTestSsoStepButtonController(hasSuccess, revalidate, {
        canRun,
        scopeKey: JSON.stringify([ownerKey, connectionId]),
        noSuccessfulTestRunMessage: 'A successful test is required',
      });
      return { ...controller, error: card.error };
    },
    { wrapper, initialProps: { connectionId: 'first', hasSuccess: false } },
  );
  return { ...hook, request, revalidate, canRun };
};

describe('SSO Continue request ownership', () => {
  it.each([true, false])('discards a %s probe after canonical owner loss without render', async answer => {
    const { result, request, canRun } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleContinue();
    });
    canRun.mockReturnValue(false);
    await act(async () => {
      request.resolve(answer);
      await completion;
    });
    expect(goNext).not.toHaveBeenCalled();
    expect(result.current.error).toBeUndefined();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('blocks cached success navigation after canonical owner loss', async () => {
    const { result, rerender, canRun, revalidate } = await setup();
    rerender({ connectionId: 'first', hasSuccess: true });
    canRun.mockReturnValue(false);
    await result.current.handleContinue();
    expect(goNext).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('suppresses a late unknown probe error after canonical owner loss', async () => {
    const { result, request, canRun } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleContinue();
    });
    canRun.mockReturnValue(false);
    await act(async () => {
      request.reject(new Error('Earlier probe failed'));
      await expect(completion).resolves.toBeUndefined();
    });
    expect(result.current.error).toBeUndefined();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('invalidates an earlier cached-success callback when the owner changes with the same connection', async () => {
    const { result, rerender } = await setup();
    rerender({ connectionId: 'first', hasSuccess: true });
    const retained = result.current.handleContinue;
    rerender({ connectionId: 'first', hasSuccess: true, ownerKey: 'second-owner' });
    await retained();
    expect(goNext).not.toHaveBeenCalled();
  });

  it('shows a current error and permits a successful retry', async () => {
    const { result, request, revalidate } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleContinue();
    });
    await act(async () => {
      request.reject(
        new ClerkAPIResponseError('Request failed', {
          status: 500,
          data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
        }),
      );
      await completion;
    });
    expect(result.current.error).toBeTruthy();
    expect(goNext).not.toHaveBeenCalled();
    const retry = createDeferredPromise<boolean>();
    revalidate.mockReturnValueOnce(retry.promise);
    act(() => {
      completion = result.current.handleContinue();
    });
    expect(result.current.error).toBeUndefined();
    await act(async () => {
      retry.resolve(true);
      await completion;
    });
    expect(goNext).toHaveBeenCalledTimes(1);
  });

  it('starts one probe for duplicate calls before render', async () => {
    const { result, request, revalidate } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleContinue();
      void result.current.handleContinue();
    });
    expect(revalidate).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve(true);
      await completion;
    });
    expect(goNext).toHaveBeenCalledTimes(1);
  });

  it.each([true, false])('discards a %s result after closure', async answer => {
    const { result, request, unmount } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleContinue();
    });
    unmount();
    request.resolve(answer);
    await completion;
    expect(goNext).not.toHaveBeenCalled();
  });

  it('blocks a retained successful action after closure', async () => {
    const { result, rerender, unmount } = await setup();
    rerender({ connectionId: 'first', hasSuccess: true });
    const retained = result.current.handleContinue;
    unmount();
    await retained();
    expect(goNext).not.toHaveBeenCalled();
  });

  it('keeps a new connection probe pending when an earlier probe completes', async () => {
    const { result, request, rerender, revalidate } = await setup();
    const next = createDeferredPromise<boolean>();
    let earlier!: Promise<void>;
    act(() => {
      earlier = result.current.handleContinue();
    });
    rerender({ connectionId: 'second', hasSuccess: false });
    revalidate.mockReturnValueOnce(next.promise);
    let current!: Promise<void>;
    act(() => {
      current = result.current.handleContinue();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await act(async () => {
      request.resolve(true);
      await earlier;
    });
    expect(goNext).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeUndefined();
    await act(async () => {
      next.resolve(false);
      await current;
    });
    expect(result.current.error).toBe('A successful test is required');
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('suppresses a late rejection after closure', async () => {
    const { result, request, unmount } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleContinue();
    });
    unmount();
    request.reject(new Error('Earlier probe failed'));
    await expect(completion).resolves.toBeUndefined();
    expect(goNext).not.toHaveBeenCalled();
  });

  it('does not revive an action when a connection changes back', async () => {
    const { result, rerender, revalidate } = await setup();
    const retained = result.current.handleContinue;
    rerender({ connectionId: 'second', hasSuccess: false });
    rerender({ connectionId: 'first', hasSuccess: false });
    await retained();
    expect(revalidate).not.toHaveBeenCalled();
  });
});
