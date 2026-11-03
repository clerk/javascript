import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  __createClerkTestQueryClient,
  __resetClerkQueryClientForTest,
  __setClerkQueryClientForTest,
} from '../clerk-query-client';
import { useClerkMutation } from '../useMutation';

let client: ReturnType<typeof __createClerkTestQueryClient>;

beforeEach(() => {
  client = __createClerkTestQueryClient();
});

afterEach(() => {
  cleanup();
  client.clear();
  __resetClerkQueryClientForTest();
});

describe('useClerkMutation', () => {
  it('uses the shared mutation cache and awaits success work before reporting success', async () => {
    let finish!: () => void;
    const onSuccess = () => new Promise<void>(resolve => (finish = resolve));
    const { result } = renderHook(() =>
      useClerkMutation({ mutationFn: (name: string) => Promise.resolve({ name }), onSuccess }),
    );
    let pending!: Promise<{ name: string }>;
    act(() => {
      pending = result.current.mutateAsync('Demo');
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(client.isMutating()).toBe(1);
    await act(async () => {
      finish();
      await expect(pending).resolves.toEqual({ name: 'Demo' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.isMutating()).toBe(0);
  });

  it('exposes an error and supports resetting it', async () => {
    const error = new Error('Request failed');
    const { result } = renderHook(() =>
      useClerkMutation({
        mutationFn: () => Promise.reject(error),
        retry: false,
      }),
    );
    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toBe(error);
    });
    await waitFor(() => expect(result.current.error).toBe(error));
    act(() => result.current.reset());
    await waitFor(() => expect(result.current.isIdle).toBe(true));
    expect(result.current.error).toBeNull();
  });

  it('rejects mutations when there is no browser query client', async () => {
    __setClerkQueryClientForTest(undefined);
    const { result } = renderHook(() => useClerkMutation({ mutationFn: () => Promise.resolve('Demo') }));
    await expect(result.current.mutateAsync()).rejects.toThrow('query client is not available');
  });

  it('uses a replacement query client when one becomes available', async () => {
    __setClerkQueryClientForTest(undefined);
    const { result, rerender } = renderHook(() => useClerkMutation({ mutationFn: () => Promise.resolve('Demo') }));
    __setClerkQueryClientForTest(client);
    rerender();
    await act(async () => {
      await expect(result.current.mutateAsync()).resolves.toBe('Demo');
    });
    expect(client.getMutationCache().getAll()).toHaveLength(1);
  });
});
