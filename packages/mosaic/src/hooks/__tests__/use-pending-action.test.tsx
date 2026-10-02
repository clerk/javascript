import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePendingAction } from '../use-pending-action';

describe('usePendingAction', () => {
  it('refuses same-tick competing actions and clears a failed action on retry', async () => {
    const pending = Promise.withResolvers<void>();
    const execute = vi.fn(() => pending.promise);
    const competing = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => usePendingAction('Try again.'));
    act(() => {
      void result.current.run('first', execute);
      void result.current.run('second', competing);
    });
    expect(execute).toHaveBeenCalledOnce();
    expect(competing).not.toHaveBeenCalled();
    expect(result.current.pendingId).toBe('first');
    await act(async () => {
      pending.reject(new Error('Could not connect.'));
      await pending.promise.catch(() => undefined);
    });
    expect(result.current.pendingId).toBeUndefined();
    expect(result.current.errors.first).toBe('Could not connect.');
    await act(async () => {
      await result.current.run('first', () => Promise.resolve());
    });
    expect(result.current.errors.first).toBeUndefined();
  });

  it('holds the pending action until a redirect grace period completes', async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => usePendingAction('Try again.'));
      act(() => {
        void result.current.run('oauth', () => new Promise(resolve => setTimeout(resolve, 2000)));
      });
      await act(() => vi.advanceTimersByTimeAsync(1999));
      expect(result.current.pendingId).toBe('oauth');
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(result.current.pendingId).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
