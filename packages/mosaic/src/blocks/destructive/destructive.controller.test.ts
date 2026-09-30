import { ClerkAPIResponseError } from '@clerk/shared/error';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { reverificationMachine } from '../../features/reverification/reverification.machine';
import { deferred } from '../../machines/__tests__/test-utils';
import { type DestructiveReverification, useDestructiveController } from './destructive.controller';

const needsReverification = () =>
  new ClerkAPIResponseError('reverify', {
    data: [{ code: 'session_reverification_required', message: 'Reverify', long_message: 'Reverify' }],
    status: 403,
  });

function reverification(sessionId: string | null | undefined = 'sess_1'): DestructiveReverification {
  return {
    sessionId,
    actors: {
      reverification: reverificationMachine,
      startVerification: () => new Promise(() => {}),
    },
  };
}

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
    act(() => result.current.onDelete());

    act(() => result.current.openDestructiveDialog());

    expect(result.current.isDeleting).toBe(true);
  });

  it('stays open and pending until the action resolves, then closes', async () => {
    const pending = deferred<void>();
    const onDelete = vi.fn(() => pending.promise);
    const { result } = renderHook(() => useDestructiveController({ onDelete }));
    act(() => result.current.onOpenChange(true));

    act(() => result.current.onDelete());
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

    act(() => result.current.onDelete());
    await waitFor(() => expect(result.current.errorMessage).toBe('Something went wrong'));
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(false);

    act(() => result.current.onDelete());
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(onDelete).toHaveBeenCalledTimes(2);
  });

  it('ignores a close while the action is in flight', () => {
    const { result } = renderHook(() => useDestructiveController({ onDelete: () => new Promise(() => {}) }));
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onDelete());

    act(() => result.current.onOpenChange(false));

    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(true);
  });

  it('moves to the verify step and exposes the reverification actor when reverification is required', async () => {
    const { result } = renderHook(() =>
      useDestructiveController({
        onDelete: () => Promise.reject(needsReverification()),
        reverification: reverification(),
      }),
    );
    act(() => result.current.onOpenChange(true));
    expect(result.current.step).toBe('confirm');

    act(() => result.current.onDelete());

    await waitFor(() => expect(result.current.step).toBe('verify'));
    expect(result.current.verification).toBeDefined();
    expect(result.current.isDeleting).toBe(false);
  });

  it('shows the error when reverification is required but not wired', async () => {
    const { result } = renderHook(() =>
      useDestructiveController({ onDelete: () => Promise.reject(needsReverification()) }),
    );
    act(() => result.current.onOpenChange(true));

    act(() => result.current.onDelete());

    await waitFor(() => expect(result.current.errorMessage).toBe('Something went wrong'));
    expect(result.current.step).toBe('confirm');
  });

  it('stops reverification when the dialog closes', async () => {
    const { result } = renderHook(() =>
      useDestructiveController({
        onDelete: () => Promise.reject(needsReverification()),
        reverification: reverification(),
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onDelete());
    await waitFor(() => expect(result.current.verification).toBeDefined());
    const child = result.current.verification;

    act(() => result.current.onOpenChange(false));

    expect(result.current.open).toBe(false);
    expect(result.current.verification).toBeUndefined();
    expect(child?.getSnapshot().status).toBe('stopped');
  });

  it('closes when the session changes during reverification', async () => {
    const { result, rerender } = renderHook(
      ({ sessionId }) =>
        useDestructiveController({
          onDelete: () => Promise.reject(needsReverification()),
          reverification: reverification(sessionId),
        }),
      { initialProps: { sessionId: 'sess_1' } },
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onDelete());
    await waitFor(() => expect(result.current.step).toBe('verify'));

    rerender({ sessionId: 'sess_2' });

    expect(result.current.open).toBe(false);
  });

  it('closes when the session is signed out during reverification, but not when it briefly unloads', async () => {
    const { result, rerender } = renderHook(
      ({ sessionId }: { sessionId: string | null | undefined }) =>
        useDestructiveController({
          onDelete: () => Promise.reject(needsReverification()),
          reverification: reverification(sessionId),
        }),
      { initialProps: { sessionId: 'sess_1' } },
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onDelete());
    await waitFor(() => expect(result.current.step).toBe('verify'));

    rerender({ sessionId: undefined });
    rerender({ sessionId: 'sess_1' });
    expect(result.current.step).toBe('verify');

    rerender({ sessionId: null });
    expect(result.current.open).toBe(false);
  });
});
