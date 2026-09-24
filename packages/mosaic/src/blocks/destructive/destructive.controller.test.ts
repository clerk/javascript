import { ClerkRuntimeError } from '@clerk/shared/error';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReverificationController } from '../../features/reverification';
import { deferred } from '../../machines/__tests__/test-utils';
import { useDestructiveController } from './destructive.controller';

const idleReverification = { status: 'idle', phase: 'inactive' } as ReverificationController;

describe('useDestructiveController', () => {
  it('starts closed and opens from the opener or from onOpenChange', () => {
    const { result } = renderHook(() => useDestructiveController({ onDelete: () => Promise.resolve() }));
    expect(result.current.open).toBe(false);
    expect(result.current.isDeleting).toBe(false);

    act(() => result.current.openDestructiveDialog());
    expect(result.current.open).toBe(true);

    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(false);
  });

  it('ignores the opener once the dialog is already open', () => {
    const { result } = renderHook(() => useDestructiveController({ onDelete: () => Promise.resolve() }));
    act(() => result.current.onOpenChange(true));
    act(() => {
      void result.current.onDelete();
    });

    act(() => result.current.openDestructiveDialog());

    expect(result.current.isDeleting).toBe(true);
  });

  it('stays open and pending until the action resolves, then closes', async () => {
    const pending = deferred<void>();
    const onDelete = vi.fn(() => pending.promise);
    const { result } = renderHook(() => useDestructiveController({ onDelete }));
    act(() => result.current.onOpenChange(true));

    act(() => {
      void result.current.onDelete();
    });
    expect(onDelete).toHaveBeenCalledOnce();
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(result.current.isDeleting).toBe(false);
  });

  it('stays open with a message when the action rejects, and a retry can succeed', async () => {
    const onDelete = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error('Your subscription is still active.'))
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useDestructiveController({ onDelete }));
    act(() => result.current.onOpenChange(true));

    await act(async () => {
      await result.current.onDelete();
    });
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.errorMessage).toBe('Something went wrong');

    await act(async () => {
      await result.current.onDelete();
    });
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(onDelete).toHaveBeenCalledTimes(2);
  });

  it('closes without a message when reverification is cancelled', async () => {
    const onDelete = vi.fn(() =>
      Promise.reject(new ClerkRuntimeError('cancelled', { code: 'reverification_cancelled' })),
    );
    const { result } = renderHook(() => useDestructiveController({ onDelete, reverification: idleReverification }));
    act(() => result.current.onOpenChange(true));

    await act(async () => {
      await result.current.onDelete();
    });

    expect(result.current.open).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('ignores a close while the action is in flight, unless reverification is active', async () => {
    const pending = deferred<void>();
    const { result } = renderHook(() =>
      useDestructiveController({ onDelete: () => pending.promise, reverification: idleReverification }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => {
      void result.current.onDelete();
    });

    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
  });

  it('lets an active reverification close the dialog while the action is still pending', () => {
    const { result } = renderHook(() =>
      useDestructiveController({
        onDelete: () => new Promise(() => {}),
        reverification: { status: 'ready', phase: 'active' } as ReverificationController,
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => {
      void result.current.onDelete();
    });

    act(() => result.current.onOpenChange(false));

    expect(result.current.open).toBe(false);
  });

  it('passes reverification through', () => {
    const { result } = renderHook(() =>
      useDestructiveController({ onDelete: () => Promise.resolve(), reverification: idleReverification }),
    );

    expect(result.current.reverification).toBe(idleReverification);
  });
});
