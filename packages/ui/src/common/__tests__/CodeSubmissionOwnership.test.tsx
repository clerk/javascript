import { createDeferredPromise } from '@clerk/shared/utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCodeSubmissionController } from '../useCodeSubmissionController';

const setup = () => {
  const request = createDeferredPromise<() => Promise<void>>();
  const complete = vi.fn(() => Promise.resolve());
  const attempt = vi.fn(() => request.promise);
  const canRun = vi.fn(() => true);
  const recoveryComplete = vi.fn(() => Promise.resolve());
  const recovery = vi.fn(
    (_error: unknown) => undefined as { resolveCode: boolean; complete: () => Promise<void> } | undefined,
  );
  const resolve = vi.fn(() => Promise.resolve());
  const reject = vi.fn(() => Promise.resolve());
  const hook = renderHook(
    ({ requestKey }) =>
      useCodeSubmissionController({ requestKey, canRun: () => canRun(), attempt, getErrorRecovery: recovery }),
    { initialProps: { requestKey: 'factor_1' } },
  );
  return { ...hook, request, complete, attempt, canRun, recovery, recoveryComplete, resolve, reject };
};

describe('Code submission ownership', () => {
  it('keeps a pending submission across renders with new command callbacks', async () => {
    const { result, request, complete, attempt, resolve, reject, rerender } = setup();
    const previous = result.current;
    previous('123456', resolve, reject);
    rerender({ requestKey: 'factor_1' });
    expect(result.current).toBe(previous);
    result.current('654321', resolve, reject);
    expect(attempt).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve(complete);
      await request.promise;
    });
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('blocks a retained action after unmount', () => {
    const { result, unmount, attempt, resolve, reject } = setup();
    const previous = result.current;
    unmount();
    previous('123456', resolve, reject);
    expect(attempt).not.toHaveBeenCalled();
  });

  it('does not revive an earlier factor action when the factor returns', () => {
    const { result, rerender, attempt, resolve, reject } = setup();
    const previous = result.current;
    rerender({ requestKey: 'factor_2' });
    rerender({ requestKey: 'factor_1' });
    previous('123456', resolve, reject);
    expect(attempt).not.toHaveBeenCalled();
  });

  it('does not resolve a field after its source changes while the SDK request is pending', async () => {
    const { result, request, complete, canRun, resolve, reject } = setup();
    result.current('123456', resolve, reject);
    canRun.mockReturnValue(false);
    await act(async () => {
      request.resolve(complete);
      await request.promise;
    });
    expect(resolve).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
  });

  it('does not recover or reject a stale SDK error', async () => {
    const { result, request, canRun, recovery, resolve, reject } = setup();
    result.current('123456', resolve, reject);
    canRun.mockReturnValue(false);
    await act(async () => {
      request.reject(new Error('Late failure'));
      await request.promise.catch(() => undefined);
    });
    expect(recovery).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
  });

  it('waits for field success and blocks completion after source ownership changes', async () => {
    const { result, request, complete, canRun, resolve, reject } = setup();
    const field = createDeferredPromise<void>();
    resolve.mockReturnValue(field.promise);
    result.current('123456', resolve, reject);
    await act(async () => {
      request.resolve(complete);
      await request.promise;
    });
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(complete).not.toHaveBeenCalled();
    canRun.mockReturnValue(false);
    await act(async () => {
      field.resolve();
      await field.promise;
    });
    expect(complete).not.toHaveBeenCalled();
  });

  it('blocks transfer recovery after source loss while field success is pending', async () => {
    const { result, request, canRun, recovery, recoveryComplete, resolve, reject } = setup();
    const field = createDeferredPromise<void>();
    resolve.mockReturnValue(field.promise);
    recovery.mockReturnValue({ resolveCode: true, complete: recoveryComplete });
    result.current('123456', resolve, reject);
    await act(async () => {
      request.reject(new Error('Transfer required'));
      await request.promise.catch(() => undefined);
    });
    expect(resolve).toHaveBeenCalledTimes(1);
    canRun.mockReturnValue(false);
    await act(async () => {
      field.resolve();
      await field.promise;
    });
    expect(recoveryComplete).not.toHaveBeenCalled();
  });

  it('preserves recovery that does not resolve the code field', async () => {
    const { result, request, recovery, recoveryComplete, resolve, reject } = setup();
    recovery.mockReturnValue({ resolveCode: false, complete: recoveryComplete });
    result.current('123456', resolve, reject);
    await act(async () => {
      request.reject(new Error('Locked'));
      await request.promise.catch(() => undefined);
    });
    expect(resolve).not.toHaveBeenCalled();
    expect(recoveryComplete).toHaveBeenCalledTimes(1);
    expect(reject).not.toHaveBeenCalled();
  });

  it('releases a failed submission so the current owner can retry', async () => {
    const { result, request, attempt, resolve, reject, complete } = setup();
    result.current('123456', resolve, reject);
    await act(async () => {
      request.reject(new Error('Invalid code'));
      await request.promise.catch(() => undefined);
    });
    await waitFor(() => expect(reject).toHaveBeenCalledTimes(1));
    attempt.mockResolvedValue(complete);
    result.current('654321', resolve, reject);
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1));
    expect(attempt).toHaveBeenCalledTimes(2);
  });
});
