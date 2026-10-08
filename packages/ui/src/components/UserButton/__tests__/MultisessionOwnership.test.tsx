import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { useMultisessionController } from '../multisession.controller';
import { useMultisessionModel } from '../multisession.model';

const { createFixtures } = bindCreateFixtures('UserButton');
const CardBoundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
afterEach(() => vi.useRealTimers());

async function setup() {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withMultiSessionMode();
    f.withUser({ id: 'user_first', first_name: 'First', email_addresses: ['first@clerk.com'] });
    f.withUser({ id: 'user_second', first_name: 'Second', email_addresses: ['second@clerk.com'] });
  });
  const FixtureWrapper = wrapper;
  const wrapped = ({ children }: PropsWithChildren) => (
    <FixtureWrapper>
      <CardBoundary>{children}</CardBoundary>
    </FixtureWrapper>
  );
  const close = vi.fn();
  const hook = renderHook(
    () => {
      const model = useMultisessionModel({ userId: fixtures.clerk.user?.id, userProfileUrl: '/settings' });
      return {
        model,
        controller: useMultisessionController(model, { userProfileMode: 'navigation', actionCompleteCallback: close }),
      };
    },
    { wrapper: wrapped },
  );
  return { ...hook, fixtures, close };
}

describe('Multisession action ownership', () => {
  it('closes after profile navigation using the existing delay', async () => {
    const { result, fixtures, close } = await setup();
    vi.useFakeTimers();
    await act(async () => {
      await result.current.controller.handleManageAccountClicked();
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('/settings');
    expect(close).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it('cancels delayed closure when the source unmounts', async () => {
    const { result, unmount, close } = await setup();
    vi.useFakeTimers();
    const initialTimers = vi.getTimerCount();
    await act(async () => {
      await result.current.controller.handleManageAccountClicked();
    });
    expect(vi.getTimerCount()).toBe(initialTimers + 1);
    unmount();
    expect(vi.getTimerCount()).toBe(initialTimers);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(close).not.toHaveBeenCalled();
  });

  it('keeps failed profile navigation open and allows retry', async () => {
    const { result, fixtures, close } = await setup();
    fixtures.router.navigate.mockRejectedValueOnce(new Error('navigation failed'));
    await act(async () => {
      await expect(result.current.controller.handleManageAccountClicked()).rejects.toThrow('navigation failed');
    });
    expect(close).not.toHaveBeenCalled();
    vi.useFakeTimers();
    await act(async () => {
      await result.current.controller.handleManageAccountClicked();
    });
    expect(fixtures.router.navigate).toHaveBeenCalledTimes(2);
    expect(close).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it('does not create a delayed closure when navigation finishes after unmount', async () => {
    const { result, fixtures, unmount, close } = await setup();
    const deferred = createDeferredPromise<boolean>();
    fixtures.router.navigate.mockReturnValueOnce(deferred.promise);
    vi.useFakeTimers();
    const initialTimers = vi.getTimerCount();
    let action!: Promise<unknown>;
    act(() => {
      action = result.current.controller.handleManageAccountClicked();
    });
    await act(async () => {
      await Promise.resolve();
    });
    unmount();
    await act(async () => {
      deferred.resolve(true);
      await action;
    });
    expect(vi.getTimerCount()).toBe(initialTimers);
    expect(close).not.toHaveBeenCalled();
  });

  it('clears the add-account cooldown and settles its action on unmount', async () => {
    const { result, unmount } = await setup();
    vi.useFakeTimers();
    const initialTimers = vi.getTimerCount();
    let action!: Promise<unknown>;
    act(() => {
      action = result.current.controller.handleAddAccountClicked();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(vi.getTimerCount()).toBe(initialTimers + 1);
    unmount();
    await expect(action).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(initialTimers);
  });

  it('serializes session actions and closes once after a successful switch', async () => {
    const { result, fixtures, close } = await setup();
    const deferred = createDeferredPromise();
    fixtures.clerk.setActive.mockReturnValueOnce(deferred.promise);
    const sessionId = result.current.model.otherSessions[0].id;
    let first!: Promise<unknown>;
    let second!: Promise<unknown>;
    act(() => {
      first = result.current.controller.handleSessionClicked(sessionId)();
      second = result.current.controller.handleSessionClicked(sessionId)();
    });
    expect(first).toBe(second);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve();
      await first;
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it('does not close a new source when a previous switch finishes', async () => {
    const { result, fixtures, unmount, close } = await setup();
    const deferred = createDeferredPromise();
    fixtures.clerk.setActive.mockReturnValueOnce(deferred.promise);
    let action!: Promise<unknown>;
    act(() => {
      action = result.current.controller.handleSessionClicked(result.current.model.otherSessions[0].id)();
    });
    await act(async () => {
      await Promise.resolve();
    });
    unmount();
    await act(async () => {
      deferred.resolve();
      await action;
    });
    expect(close).not.toHaveBeenCalled();
  });

  it('keeps a failed session switch open and allows retry', async () => {
    const { result, fixtures, close } = await setup();
    fixtures.clerk.setActive.mockRejectedValueOnce(new Error('switch failed')).mockResolvedValueOnce(undefined);
    const sessionId = result.current.model.otherSessions[0].id;
    await act(async () => {
      await expect(result.current.controller.handleSessionClicked(sessionId)()).rejects.toThrow('switch failed');
    });
    expect(close).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.controller.handleSessionClicked(sessionId)();
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledOnce();
  });

  it('uses current sessions and rejects a removed target without closing', async () => {
    const { result, fixtures, close } = await setup();
    const sessionId = result.current.model.otherSessions[0].id;
    const retained = result.current.controller.handleSessionClicked(sessionId);
    vi.spyOn(fixtures.clerk.client, 'signedInSessions', 'get').mockReturnValue([]);
    await act(async () => {
      await retained();
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it.each(['user', 'session'] as const)('rejects retained actions after the %s changes', async resource => {
    const { result, fixtures } = await setup();
    const retained = result.current.controller;
    vi.spyOn(fixtures.clerk, resource, 'get').mockReturnValue({
      ...fixtures.clerk[resource]!,
      id: `${resource}_changed`,
    } as never);
    await act(async () => {
      await retained.handleSessionClicked(result.current.model.otherSessions[0].id)();
      await retained.handleSignOutAllClicked();
      await retained.handleManageAccountClicked();
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.clerk.signOut).not.toHaveBeenCalled();
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });
});
