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
    const { result } = renderHook(() => usePendingAction());

    let succeeded: boolean | undefined;
    await act(async () => {
      succeeded = await result.current.run('a', () => Promise.resolve());
    });

    expect(succeeded).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  it.each([
    ['the same key', 'a'],
    ['a different key', 'b'],
  ])('ignores a second run with %s until the first settles', async (_label, secondKey) => {
    const pending = deferred<void>();
    const first = vi.fn(() => pending.promise);
    const second = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => usePendingAction());

    let secondResult: boolean | undefined;
    act(() => {
      void result.current.run('a', first);
      void result.current.run(secondKey, second).then(value => {
        secondResult = value;
      });
    });

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    expect(secondResult).toBe(false);
  });

  it.each([
    ['success', () => Promise.resolve()],
    ['failure', () => Promise.reject(blocked())],
  ])('reports the pending key while the action runs and clears it after %s', async (_label, settle) => {
    const pending = deferred<void>();
    const { result } = renderHook(() => usePendingAction());

    let run: Promise<boolean> | undefined;
    act(() => {
      run = result.current.run('a', () => pending.promise.then(settle));
    });

    expect(result.current.pendingKey).toBe('a');
    expect(result.current.isPending).toBe(true);
    await act(async () => {
      pending.resolve();
      await run;
    });
    expect(result.current.pendingKey).toBeUndefined();
    expect(result.current.isPending).toBe(false);
  });

  it('reports which key failed', async () => {
    const { result } = renderHook(() => usePendingAction());

    await act(() => result.current.run('a', () => Promise.reject(blocked())));

    expect(result.current.errorKey).toBe('a');
    expect(result.current.error).toBeDefined();
  });

  it.each([
    ['the same key', 'a'],
    ['a different key', 'b'],
  ])('clears the last error when %s runs', async (_label, nextKey) => {
    const pending = deferred<void>();
    const { result } = renderHook(() => usePendingAction());
    await act(() => result.current.run('a', () => Promise.reject(blocked())));
    expect(result.current.error).toBeDefined();

    act(() => {
      void result.current.run(nextKey, () => pending.promise);
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.errorKey).toBeUndefined();
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
  });

  it('reports failure with the localized copy for the code Clerk refused with', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MosaicProvider localization={{ overrides: { 'errors.action_blocked': 'Acción bloqueada.' } }}>
        {children}
      </MosaicProvider>
    );
    const { result } = renderHook(() => usePendingAction(), { wrapper });

    let succeeded: boolean | undefined;
    await act(async () => {
      succeeded = await result.current.run('a', () => Promise.reject(blocked()));
    });

    expect(succeeded).toBe(false);
    expect(result.current.error).toBe('Acción bloqueada.');
  });

  it('shows the fallback, never the message, of an unexpected error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => usePendingAction({ errorFallback: 'Unable to sign out.' }));

    await act(() => result.current.run('a', () => Promise.reject(new Error('Cannot read properties of undefined'))));

    expect(result.current.error).toBe('Unable to sign out.');
  });

  it('prefers the fallback given to the run over the one given to the hook', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => usePendingAction({ errorFallback: 'Something went wrong.' }));
    const fail = () => Promise.reject(new Error('Network down'));

    await act(() => result.current.run('accept', fail, { errorFallback: 'Unable to accept.' }));
    expect(result.current.error).toBe('Unable to accept.');

    await act(() => result.current.run('decline', fail));
    expect(result.current.error).toBe('Something went wrong.');
  });

  it('catches an action that throws before returning a promise', async () => {
    const { result } = renderHook(() => usePendingAction());

    let succeeded: boolean | undefined;
    await act(async () => {
      succeeded = await result.current.run('a', () => {
        throw blocked();
      });
    });

    expect(succeeded).toBe(false);
    expect(result.current.errorKey).toBe('a');
    expect(result.current.isPending).toBe(false);
  });

  it('clears the error when reset', async () => {
    const { result } = renderHook(() => usePendingAction());
    await act(() => result.current.run('a', () => Promise.reject(blocked())));
    expect(result.current.error).toBeDefined();

    act(() => result.current.reset());

    expect(result.current.error).toBeUndefined();
    expect(result.current.errorKey).toBeUndefined();
  });
});
