import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../__tests__/async';
import { clerkApiError } from '../../__tests__/clerk-errors';
import { MosaicProvider } from '../../mosaic-provider';
import { usePendingAction } from '../use-pending-action';

afterEach(() => {
  vi.restoreAllMocks();
});

function blocked() {
  return clerkApiError('action_blocked', 'Raw server sentence.');
}

describe('usePendingAction', () => {
  it('reports success and leaves no error', async () => {
    const { result } = renderHook(() => usePendingAction(() => Promise.resolve()));

    let succeeded: boolean | undefined;
    await act(async () => {
      succeeded = await result.current.run();
    });

    expect(succeeded).toBe(true);
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('is pending while the action runs and ignores a second run until it settles', async () => {
    const pending = deferred<void>();
    const action = vi.fn(() => pending.promise);
    const { result } = renderHook(() => usePendingAction(action));

    act(() => {
      void result.current.run();
      void result.current.run();
    });

    expect(result.current.isPending).toBe(true);
    expect(action).toHaveBeenCalledOnce();
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(result.current.isPending).toBe(false);
  });

  it('passes its arguments to the action', async () => {
    const action = vi.fn((_id: string) => Promise.resolve());
    const { result } = renderHook(() => usePendingAction(action));

    await act(() => result.current.run('phone_1'));

    expect(action).toHaveBeenCalledWith('phone_1');
  });

  it('reports failure with the localized copy for the code Clerk refused with', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MosaicProvider localization={{ overrides: { 'errors.action_blocked': 'Acción bloqueada.' } }}>
        {children}
      </MosaicProvider>
    );
    const { result } = renderHook(() => usePendingAction(() => Promise.reject(blocked())), { wrapper });

    let succeeded: boolean | undefined;
    await act(async () => {
      succeeded = await result.current.run();
    });

    expect(succeeded).toBe(false);
    expect(result.current.errorMessage).toBe('Acción bloqueada.');
    expect(result.current.isPending).toBe(false);
  });

  it('shows the fallback, never the message, of an unexpected error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() =>
      usePendingAction(() => Promise.reject(new Error('Cannot read properties of undefined')), {
        errorFallback: 'Unable to sign out.',
      }),
    );

    await act(() => result.current.run());

    expect(result.current.errorMessage).toBe('Unable to sign out.');
  });

  it('clears the last error when run again and when reset', async () => {
    const action = vi.fn<() => Promise<void>>().mockRejectedValueOnce(blocked()).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => usePendingAction(action));
    await act(() => result.current.run());
    expect(result.current.errorMessage).toBeDefined();

    await act(() => result.current.run());
    expect(result.current.errorMessage).toBeUndefined();

    action.mockRejectedValueOnce(blocked());
    await act(() => result.current.run());
    act(() => result.current.reset());
    expect(result.current.errorMessage).toBeUndefined();
  });
});
