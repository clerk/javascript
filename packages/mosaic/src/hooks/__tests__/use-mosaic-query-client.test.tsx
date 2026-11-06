import {
  __createClerkTestQueryClient,
  __internal_useClerkQuery,
  __resetClerkQueryClientForTest,
  __setClerkQueryClientForTest,
} from '@clerk/shared/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { deferred } from '../../__tests__/async';
import { useMosaicMutation } from '../use-mosaic-mutation';
import { useMosaicQuery } from '../use-mosaic-query';
import { useMosaicQueryClient } from '../use-mosaic-query-client';

let client: ReturnType<typeof __createClerkTestQueryClient>;

beforeEach(() => {
  client = __createClerkTestQueryClient();
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
  client.clear();
  __resetClerkQueryClientForTest();
});

describe('Mosaic and shared query hooks', () => {
  it('preserves query and mutation type inference', () => {
    renderHook(() => {
      const queryFn = () => Promise.resolve({ name: 'Demo' });
      const query = useMosaicQuery({ queryKey: ['types'], queryFn, enabled: false });
      expectTypeOf(query.data).toEqualTypeOf<{ name: string } | undefined>();

      const initialized = useMosaicQuery({
        queryKey: ['initialized-types'],
        queryFn,
        initialData: { name: 'Initial' },
        select: data => data.name,
        enabled: false,
      });
      expectTypeOf(initialized.data).toEqualTypeOf<string>();

      const mutation = useMosaicMutation({
        mutationFn: (name: string) => Promise.resolve({ name }),
        onMutate: name => ({ previousName: name }),
        onError: (error, name, context) => {
          expectTypeOf(error).toEqualTypeOf<Error>();
          expectTypeOf(name).toEqualTypeOf<string>();
          expectTypeOf(context).toEqualTypeOf<{ previousName: string } | undefined>();
        },
      });
      expectTypeOf(mutation.data).toEqualTypeOf<{ name: string } | undefined>();
      expectTypeOf(mutation.mutateAsync).parameter(0).toEqualTypeOf<string>();
      expectTypeOf(mutation.mutateAsync).returns.toEqualTypeOf<Promise<{ name: string }>>();
    });
  });

  it('shares requests, mutation invalidation, and cache writes without using the application client', async () => {
    const applicationClient = new QueryClient();
    const first = deferred<string>();
    const refreshed = deferred<string>();
    const queryKey = ['mosaic-demo', true, { sessionId: 'session_1' }];
    const queryFn = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementation(() => refreshed.promise);
    const mount = vi.spyOn(client, 'mount');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={applicationClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(
      () => {
        const sharedClient = useMosaicQueryClient();
        return {
          legacy: __internal_useClerkQuery({ queryKey, queryFn }),
          mosaic: useMosaicQuery({ queryKey, queryFn }),
          mutation: useMosaicMutation({
            mutationFn: () => Promise.resolve('Saved'),
            onSuccess: () => sharedClient.invalidateQueries({ queryKey }),
          }),
        };
      },
      { wrapper },
    );

    expect(queryFn).toHaveBeenCalledTimes(1);
    await act(() => first.resolve('Before'));
    await waitFor(() => expect(result.current.mosaic.data).toBe('Before'));
    expect(result.current.legacy.data).toBe('Before');

    let mutation!: Promise<string>;
    act(() => {
      mutation = result.current.mutation.mutateAsync();
    });
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(2));
    expect(result.current.mutation.isPending).toBe(true);
    expect(client.isMutating()).toBe(1);
    await act(async () => {
      refreshed.resolve('After');
      await mutation;
    });
    await waitFor(() => expect(result.current.mutation.isSuccess).toBe(true));
    expect(result.current.legacy.data).toBe('After');
    expect(result.current.mosaic.data).toBe('After');

    await act(() => {
      client.setQueryData(queryKey, 'From a shared hook');
    });
    await waitFor(() => expect(result.current.mosaic.data).toBe('From a shared hook'));
    expect(result.current.legacy.data).toBe('From a shared hook');
    expect(applicationClient.getQueryCache().getAll()).toHaveLength(0);
    expect(applicationClient.getMutationCache().getAll()).toHaveLength(0);
    expect(mount).not.toHaveBeenCalled();
    applicationClient.clear();
  });

  it('uses the shared client across renders and exposes mutation errors and reset', async () => {
    const error = new Error('Request failed');
    const { result, rerender } = renderHook(() => {
      const sharedClient = useMosaicQueryClient();
      return {
        client: sharedClient,
        mutation: useMosaicMutation({
          mutationFn: () => Promise.reject(error),
          retry: false,
        }),
      };
    });
    rerender();
    expect(result.current.client).toBe(client);
    await act(async () => {
      await expect(result.current.mutation.mutateAsync()).rejects.toBe(error);
    });
    await waitFor(() => expect(result.current.mutation.error).toBe(error));
    act(() => result.current.mutation.reset());
    await waitFor(() => expect(result.current.mutation.isIdle).toBe(true));
  });

  it('does not create a separate browser cache when the shared client is unavailable', () => {
    __setClerkQueryClientForTest(undefined);
    function Consumer() {
      useMosaicQueryClient();
      return null;
    }
    expect(() => renderToString(<Consumer />)).toThrow('The Clerk query client is not available.');
  });

  it('isolates server renders and starts no queries or mutations', () => {
    const queryFn = vi.fn(() => Promise.resolve('Fetched'));
    const mutationFn = vi.fn(() => Promise.resolve('Saved'));
    function Consumer({ initialData }: { initialData?: string }) {
      const query = useMosaicQuery({ queryKey: ['server'], queryFn, initialData });
      const mutation = useMosaicMutation({ mutationFn });
      return (
        <span>
          {query.data ?? query.status}:{mutation.status}
        </span>
      );
    }
    vi.stubGlobal('window', undefined);
    expect(renderToString(<Consumer initialData='Private data' />)).toContain('Private data');
    expect(renderToString(<Consumer />)).toContain('pending');
    expect(renderToString(<Consumer />)).not.toContain('Private data');
    expect(client.getQueryData(['server'])).toBeUndefined();
    expect(queryFn).not.toHaveBeenCalled();
    expect(mutationFn).not.toHaveBeenCalled();
  });

  it('hydrates old and new hooks with the shared browser client', async () => {
    const response = deferred<string>();
    const queryFn = vi.fn(() => response.promise);
    const recoverableError = vi.fn();
    function Consumer() {
      const options = { queryKey: ['hydration'], queryFn };
      const legacy = __internal_useClerkQuery(options);
      const mosaic = useMosaicQuery(options);
      return (
        <span>
          {legacy.isLoading ? 'Loading' : legacy.data}/{mosaic.isLoading ? 'Loading' : mosaic.data}
        </span>
      );
    }
    vi.stubGlobal('window', undefined);
    const html = renderToString(<Consumer />);
    expect(html).toContain('Loading');
    expect(queryFn).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = html;
    const rendered = render(<Consumer />, { container, hydrate: true, onRecoverableError: recoverableError });
    expect(queryFn).toHaveBeenCalledTimes(1);
    await act(() => response.resolve('Ready'));
    await waitFor(() => expect(rendered.container).toHaveTextContent('Ready/Ready'));
    expect(client.getQueryData(['hydration'])).toBe('Ready');
    expect(recoverableError).not.toHaveBeenCalled();
  });
});
