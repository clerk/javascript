import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';

import { useTestSyncStepController } from '../steps/test-sync-step.controller';
import type { useTestSyncStepModel } from '../steps/test-sync-step.model';

const { previous } = vi.hoisted(() => ({ previous: vi.fn() }));
vi.mock('../../ConfigureSSO/elements/Wizard', async original => ({
  ...(await original<typeof import('../../ConfigureSSO/elements/Wizard')>()),
  useWizard: () => ({ goPrev: previous }),
}));
const setup = (overrides: Partial<ReturnType<typeof useTestSyncStepModel>> = {}) => {
  const refresh = createDeferredPromise<void>();
  const revalidateUsers = vi.fn(() => refresh.promise);
  const revalidateStatus = vi.fn(() => Promise.resolve());
  const canRun = vi.fn(() => true);
  const model: ReturnType<typeof useTestSyncStepModel> = {
    requestKey: 'directory_1',
    canRun,
    isPull: true,
    rows: [],
    providerName: 'Google',
    status: undefined,
    lastSyncStatus: 'success',
    lastSyncedAt: new Date(1),
    changedUserCount: 0,
    hasUsersError: false,
    usersError: undefined,
    revalidateUsers,
    revalidateStatus,
    syncDirectory: vi.fn(() => Promise.resolve()),
    onExit: undefined,
    ...overrides,
  };
  const hook = renderHook(props => useTestSyncStepController(props), { initialProps: model });
  return { ...hook, model, refresh, revalidateUsers, revalidateStatus, canRun };
};

beforeEach(() => {
  previous.mockClear();
});

describe('Directory Sync test step ownership', () => {
  it('keeps waiting for the latest refresh when an older refresh completes', async () => {
    const { result, model, rerender, refresh, revalidateUsers } = setup();
    const latest = createDeferredPromise<void>();
    revalidateUsers.mockReturnValueOnce(latest.promise);
    rerender({ ...model, lastSyncedAt: new Date(2) });
    await act(async () => {
      refresh.resolve();
      await refresh.promise;
    });
    expect(result.current.isWaitingForUsers).toBe(true);
    await act(async () => {
      latest.resolve();
      await latest.promise;
    });
    expect(result.current.isWaitingForUsers).toBe(false);
  });

  it('clears a prior directory refresh when the current directory has no refresh', async () => {
    const { result, model, rerender, refresh } = setup();
    rerender({ ...model, requestKey: 'directory_2', lastSyncedAt: null });
    expect(result.current.isWaitingForUsers).toBe(false);
    await act(async () => {
      refresh.resolve();
      await refresh.promise;
    });
    expect(result.current.isWaitingForUsers).toBe(false);
  });

  it('blocks retained refresh and navigation commands after unmount', () => {
    const { result, unmount, revalidateStatus } = setup();
    const retained = result.current;
    unmount();
    void retained.onSynced();
    retained.goPrev();
    expect(revalidateStatus).not.toHaveBeenCalled();
    expect(previous).not.toHaveBeenCalled();
  });

  it('does not revive old commands when an earlier directory returns', () => {
    const { result, model, rerender, revalidateStatus } = setup();
    const retained = result.current;
    rerender({ ...model, requestKey: 'directory_2' });
    rerender(model);
    void retained.onSynced();
    retained.goPrev();
    expect(revalidateStatus).not.toHaveBeenCalled();
    expect(previous).not.toHaveBeenCalled();
  });

  it('blocks commands when canonical ownership changes before render', () => {
    const { result, canRun, revalidateStatus } = setup();
    canRun.mockReturnValue(false);
    void result.current.onSynced();
    result.current.goPrev();
    expect(revalidateStatus).not.toHaveBeenCalled();
    expect(previous).not.toHaveBeenCalled();
  });

  it('settles a current refresh and permits current navigation', async () => {
    const { result, refresh, revalidateStatus } = setup();
    await act(async () => {
      refresh.resolve();
      await refresh.promise;
    });
    expect(result.current.isWaitingForUsers).toBe(false);
    await act(async () => {
      await result.current.onSynced();
    });
    result.current.goPrev();
    expect(revalidateStatus).toHaveBeenCalledTimes(1);
    expect(previous).toHaveBeenCalledTimes(1);
  });
  it('does not refresh when the source no longer owns this step', () => {
    const { revalidateUsers } = setup({ canRun: () => false });
    expect(revalidateUsers).not.toHaveBeenCalled();
  });

  it('settles local loading when a user refresh fails', async () => {
    const { result, refresh } = setup();
    await act(async () => {
      refresh.reject(new Error('Refresh failed'));
      await refresh.promise.catch(() => undefined);
    });
    expect(result.current.isWaitingForUsers).toBe(false);
  });

  it('handles a rejected status refresh', async () => {
    const { result, revalidateStatus } = setup();
    revalidateStatus.mockRejectedValueOnce(new Error('Status refresh failed'));
    await expect(result.current.onSynced()).resolves.toBeUndefined();
  });
});
