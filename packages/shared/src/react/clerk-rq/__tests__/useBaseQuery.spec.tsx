import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockClerk, createMockQueryClient } from '../../hooks/__tests__/mocks/clerk';
import { useClerkInfiniteQuery } from '../useInfiniteQuery';
import { useClerkQuery } from '../useQuery';

let activeClerk: any;

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => activeClerk,
  useInitialStateContext: () => undefined,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const makeClerkWithoutQueryClient = () => {
  const mockClerk = createMockClerk({ queryClient: null });
  Object.defineProperty(mockClerk, '__internal_queryClient', {
    get: () => undefined,
    configurable: true,
  });
  return mockClerk;
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('useBaseQuery - dummy result while query client is not attached', () => {
  beforeEach(() => {
    activeClerk = makeClerkWithoutQueryClient();
  });

  it('reports isLoading: true when the query would be enabled', () => {
    const queryFn = vi.fn();
    const { result } = renderHook(
      () =>
        useClerkQuery({
          queryKey: ['useBaseQuery-pre-client-enabled'],
          queryFn,
          enabled: true,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.status).toBe('pending');
    expect(result.current.data).toBeUndefined();
    expect(queryFn).not.toHaveBeenCalled();
  });

  it('reports isLoading: false when enabled is explicitly false', () => {
    const queryFn = vi.fn();
    const { result } = renderHook(
      () =>
        useClerkQuery({
          queryKey: ['useBaseQuery-pre-client-disabled'],
          queryFn,
          enabled: false,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.status).toBe('pending');
    expect(result.current.data).toBeUndefined();
    expect(queryFn).not.toHaveBeenCalled();
  });

  it('defaults to enabled when the option is omitted', () => {
    const queryFn = vi.fn();
    const { result } = renderHook(
      () =>
        useClerkQuery({
          queryKey: ['useBaseQuery-pre-client-default'],
          queryFn,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('applies the same invariant to useClerkInfiniteQuery', () => {
    const queryFn = vi.fn();
    const { result } = renderHook(
      () =>
        useClerkInfiniteQuery({
          queryKey: ['useBaseQuery-pre-client-infinite'],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: () => undefined,
          enabled: true,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(queryFn).not.toHaveBeenCalled();
  });
});

describe('useBaseQuery - normal behavior once query client attaches', () => {
  it('delegates to the real observer when the query client is loaded', async () => {
    const queryClient = createMockQueryClient();
    activeClerk = createMockClerk({ queryClient });

    const queryFn = vi.fn(async () => 'result');
    const { result } = renderHook(
      () =>
        useClerkQuery({
          queryKey: ['useBaseQuery-loaded-client'],
          queryFn,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBe('result');
    expect(queryFn).toHaveBeenCalledTimes(1);
  });
});
