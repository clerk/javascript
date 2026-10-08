import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';

import { useSyncNowRowController } from '../sync-now-row.controller';

const setup = () => {
  const request = createDeferredPromise<void>();
  const sync = vi.fn(() => request.promise);
  const synced = vi.fn();
  const canRun = vi.fn(() => true);
  const hook = renderHook(
    ({ requestKey }) => useSyncNowRowController(sync, synced, 'Sync failed', { requestKey, canRun }),
    {
      initialProps: { requestKey: 'directory_1' },
    },
  );
  return { ...hook, request, sync, synced, canRun };
};

describe('Directory Sync manual sync ownership', () => {
  it('starts only one request before render', async () => {
    const { result, request, sync, synced } = setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.run();
      void result.current.run();
    });
    expect(sync).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve();
      await completion;
    });
    expect(synced).toHaveBeenCalledTimes(1);
    expect(result.current.isSyncing).toBe(false);
  });

  it('does not refresh after completion when the row has closed', async () => {
    const { result, request, unmount, synced } = setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.run();
    });
    unmount();
    request.resolve();
    await completion;
    expect(synced).not.toHaveBeenCalled();
  });

  it('blocks a retained command after unmount', () => {
    const { result, unmount, sync } = setup();
    const retained = result.current.run;
    unmount();
    void retained();
    expect(sync).not.toHaveBeenCalled();
  });

  it('discards an old error after the directory changes', async () => {
    const { result, request, rerender } = setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.run();
    });
    rerender({ requestKey: 'directory_2' });
    await act(async () => {
      request.reject(new Error('Earlier sync failed'));
      await completion;
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSyncing).toBe(false);
  });

  it('does not settle a later request when an earlier directory finishes', async () => {
    const { result, request, rerender, sync, synced } = setup();
    let earlier!: Promise<void>;
    act(() => {
      earlier = result.current.run();
    });
    rerender({ requestKey: 'directory_2' });
    expect(result.current.isSyncing).toBe(false);
    const current = createDeferredPromise<void>();
    sync.mockReturnValueOnce(current.promise);
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.run();
    });
    await act(async () => {
      request.resolve();
      await earlier;
    });
    expect(result.current.isSyncing).toBe(true);
    expect(synced).not.toHaveBeenCalled();
    await act(async () => {
      current.resolve();
      await completion;
    });
    expect(result.current.isSyncing).toBe(false);
    expect(synced).toHaveBeenCalledTimes(1);
  });

  it('blocks a retained command when an earlier directory returns', () => {
    const { result, rerender, sync } = setup();
    const retained = result.current.run;
    rerender({ requestKey: 'directory_2' });
    rerender({ requestKey: 'directory_1' });
    void retained();
    expect(sync).not.toHaveBeenCalled();
  });

  it('blocks dispatch when source ownership changes before render', () => {
    const { result, canRun, sync } = setup();
    canRun.mockReturnValue(false);
    void result.current.run();
    expect(sync).not.toHaveBeenCalled();
  });

  it('releases local loading without refreshing after source ownership is lost', async () => {
    const { result, request, canRun, synced } = setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.run();
    });
    canRun.mockReturnValue(false);
    await act(async () => {
      request.resolve();
      await completion;
    });
    expect(synced).not.toHaveBeenCalled();
    expect(result.current.isSyncing).toBe(false);
  });

  it('shows a current API error and permits retry', async () => {
    const { result, request, sync, synced } = setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.run();
    });
    await act(async () => {
      request.reject(
        new ClerkAPIResponseError('Failed', {
          status: 500,
          data: [{ code: 'internal_server_error', message: 'Failed', long_message: 'Request failed' }],
        }),
      );
      await completion;
    });
    expect(result.current.error).toBe('Request failed');
    expect(result.current.isSyncing).toBe(false);
    sync.mockResolvedValueOnce();
    await act(async () => {
      await result.current.run();
    });
    expect(result.current.error).toBeUndefined();
    expect(synced).toHaveBeenCalledTimes(1);
  });

  it('uses the localized fallback for a current unknown error', async () => {
    const { result, request } = setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.run();
    });
    await act(async () => {
      request.reject(new Error('Unknown sync failure'));
      await completion;
    });
    expect(result.current.error).toBe('Sync failed');
    expect(result.current.isSyncing).toBe(false);
  });
});
