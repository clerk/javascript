import { createDeferredPromise } from '@clerk/shared/utils';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useExpiredNoticeController } from '../expired-notice.controller';

describe('Expired domain verification request ownership', () => {
  it('starts one request for duplicate calls before render', async () => {
    const request = createDeferredPromise<void>();
    const prepare = vi.fn(() => request.promise);
    const { result } = renderHook(() => useExpiredNoticeController(prepare));
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleVerifyAgain();
      void result.current.handleVerifyAgain();
    });
    expect(prepare).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve();
      await completion;
    });
    expect(result.current.isVerifying).toBe(false);
  });

  it('blocks a retained verification action after closure', async () => {
    const prepare = vi.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() => useExpiredNoticeController(prepare));
    const retained = result.current.handleVerifyAgain;
    unmount();
    await retained();
    expect(prepare).not.toHaveBeenCalled();
  });

  it('suppresses a late rejection after closure', async () => {
    const request = createDeferredPromise<void>();
    const { result, unmount } = renderHook(() => useExpiredNoticeController(() => request.promise));
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleVerifyAgain();
    });
    unmount();
    request.reject(new Error('Earlier verification failed'));
    await expect(completion).resolves.toBeUndefined();
  });

  it('returns a current failure and releases loading for retry', async () => {
    const request = createDeferredPromise<void>();
    const prepare = vi.fn(() => request.promise);
    const { result } = renderHook(() => useExpiredNoticeController(prepare));
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleVerifyAgain();
    });
    await act(async () => {
      request.reject(new Error('Current failure'));
      await expect(completion).rejects.toThrow('Current failure');
    });
    expect(result.current.isVerifying).toBe(false);
    prepare.mockResolvedValueOnce();
    await act(async () => result.current.handleVerifyAgain());
    expect(prepare).toHaveBeenCalledTimes(2);
  });
});
