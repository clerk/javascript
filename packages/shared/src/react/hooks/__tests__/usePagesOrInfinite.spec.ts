import { QueryClient } from '@tanstack/query-core';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createDeferredPromise } from '../../../utils/createDeferredPromise';
import { usePagesOrInfinite } from '../usePagesOrInfinite';
import { wrapper } from './wrapper';

const defaultQueryClient = {
  __tag: 'clerk-rq-client' as const,
  client: new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    },
  }),
};

const mockClerk = {
  loaded: true,
  telemetry: { record: vi.fn() },
  on: vi.fn(),
  off: vi.fn(),
};

Object.defineProperty(mockClerk, '__internal_queryClient', {
  configurable: true,
  get: vi.fn(() => defaultQueryClient),
});

vi.mock('../../contexts', () => {
  return {
    useAssertWrappedByClerkProvider: () => {},
    useClerkInstanceContext: () => mockClerk,
    useUserContext: () => ({ id: 'user_123' }),
    useOrganizationContext: () => ({ organization: { id: 'org_123' } }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  defaultQueryClient.client.clear();
  mockClerk.loaded = true;
});

describe('usePagesOrInfinite - basic pagination', () => {
  it('uses SWR with merged key and fetcher params; maps data and count', async () => {
    const fetcher = vi.fn(async (p: any) => {
      // simulate API returning paginated response
      return {
        data: Array.from({ length: p.pageSize }, (_, i) => ({ id: `item-${p.initialPage}-${i}` })),
        total_count: 42,
      };
    });

    const params = { initialPage: 2, pageSize: 5 } as const;
    const config = { infinite: false, keepPreviousData: true } as const;
    const cacheKeys = { type: 't-basic', userId: 'user_123' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    // wait until SWR mock finishes fetching
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // ensure fetcher received params without cache keys and with page info
    expect(fetcher).toHaveBeenCalledTimes(1);
    const calledWith = fetcher.mock.calls[0][0];
    expect(calledWith).toMatchObject({ initialPage: 2, pageSize: 5 });
    expect(calledWith.type).toBeUndefined();
    expect(calledWith.userId).toBeUndefined();

    // hook result mapping
    expect(result.current.isLoading).toBe(false);
    expect(result.current.page).toBe(2);
    expect(result.current.data).toHaveLength(5);
    expect(result.current.count).toBe(42);

    // pageCount calculation considers initialPage offset
    // offset = (2-1)*5 = 5; remaining = 42-5 = 37; pageCount = ceil(37/5) = 8
    expect(result.current.pageCount).toBe(8);

    // validate helpers update page state
    act(() => {
      result.current.fetchNext();
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.fetchPrevious();
    });
    expect(result.current.page).toBe(2);

    // setData should update cached data without revalidation
    await act(async () => {
      await (result.current as any).setData((prev: any) => ({ ...prev, data: [{ id: 'mutated' }] }));
    });
    expect(result.current.data).toEqual([{ id: 'mutated' }]);
  });
});

describe('usePagesOrInfinite - request params and getDifferentKeys', () => {
  it('calls fetcher with merged params and strips cache keys; updates params on page change', async () => {
    const fetcher = vi.fn((p: any) =>
      Promise.resolve({
        data: Array.from({ length: p.pageSize }, (_, i) => ({ id: `row-${p.initialPage}-${i}` })),
        total_count: 6,
      }),
    );

    const params = { initialPage: 2, pageSize: 3, someFilter: 'A' } as const;
    const cacheKeys = { type: 't-params', userId: 'user_42' } as const;
    const config = { infinite: false, enabled: true } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    // First call: should include provided params, not include cache keys
    expect(fetcher).toHaveBeenCalledTimes(1);
    const first = fetcher.mock.calls[0][0];
    expect(first).toStrictEqual({ initialPage: 2, pageSize: 3, someFilter: 'A' });
    expect(first.type).toBeUndefined();
    expect(first.userId).toBeUndefined();

    // Move to next page: getDifferentKeys should provide updated initialPage to fetcher
    act(() => {
      result.current.fetchNext();
    });

    await waitFor(() => expect(result.current.page).toBe(3));
    // The next call should have initialPage updated to 3
    const second = fetcher.mock.calls[1][0];
    expect(second.initialPage).toBe(3);
    expect(second.pageSize).toBe(3);
    expect(second.someFilter).toBe('A');
    expect(second.type).toBeUndefined();
    expect(second.userId).toBeUndefined();
  });
});

describe('usePagesOrInfinite - infinite mode', () => {
  it('aggregates pages, uses getKey offsets, and maps count to last page total_count', async () => {
    const fetcher = vi.fn((p: any) => {
      // return distinct pages based on initialPage
      const pageNo = p.initialPage;
      return Promise.resolve({
        data: [{ id: `p${pageNo}-a` }, { id: `p${pageNo}-b` }],
        total_count: 9 + pageNo, // varying count, last page should be used
      });
    });

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: true, keepPreviousData: false, enabled: true } as const;
    const cacheKeys = { type: 't-infinite', orgId: 'org_1' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    // first render should fetch first page
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetcher).toHaveBeenCalledTimes(1);
    const firstArgs = fetcher.mock.calls[0][0];
    expect(firstArgs).toStrictEqual({ initialPage: 1, pageSize: 2 });
    expect(firstArgs.type).toBeUndefined();
    expect(firstArgs.orgId).toBeUndefined();

    // Data should include page 1 entries
    expect(result.current.data).toEqual([{ id: 'p1-a' }, { id: 'p1-b' }]);
    expect(result.current.page).toBe(1);

    // load next page (size -> 2)
    act(() => {
      result.current.fetchNext();
    });
    await waitFor(() => expect(result.current.page).toBe(2));
    await waitFor(() => expect(result.current.data.length).toBe(4));

    // SWR may refetch the first page after size change; ensure both pages 1 and 2 were requested
    expect(fetcher.mock.calls.length).toBeGreaterThanOrEqual(2);
    const requestedPages = fetcher.mock.calls.map(c => c[0].initialPage);
    expect(requestedPages).toContain(1);
    expect(requestedPages).toContain(2);

    // flattened data of both pages
    expect(result.current.data).toEqual([{ id: 'p1-a' }, { id: 'p1-b' }, { id: 'p2-a' }, { id: 'p2-b' }]);

    // count should be taken from the last page's total_count
    expect(result.current.count).toBe(11);

    // setData should replace the aggregated pages
    await act(async () => {
      await (result.current as any).setData([{ data: [{ id: 'X' }], total_count: 1 }]);
    });
    expect(result.current.data).toEqual([{ id: 'X' }]);

    // revalidate should not throw
    await act(async () => {
      await (result.current as any).revalidate();
    });
  });
});

describe('usePagesOrInfinite - disabled and isSignedIn gating', () => {
  it('does not fetch when enabled=false (pagination mode)', () => {
    const fetcher = vi.fn(async () => ({ data: [], total_count: 0 }));

    const params = { initialPage: 1, pageSize: 3 } as const;
    const config = { infinite: false, enabled: false } as const;
    const cacheKeys = { type: 't-disabled' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    // our SWR mock sets loading=false if key is null and not calling fetcher
    expect(fetcher).toHaveBeenCalledTimes(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('does not fetch when isSignedIn=false (pagination mode)', () => {
    const fetcher = vi.fn(async () => ({ data: [], total_count: 0 }));

    const params = { initialPage: 1, pageSize: 3 } as const;
    const config = { infinite: false, enabled: true, isSignedIn: false } as const;
    const cacheKeys = { type: 't-signedin-false' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    expect(fetcher).toHaveBeenCalledTimes(0);
    expect(result.current.data).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('does not fetch when isSignedIn=false (infinite mode)', async () => {
    const fetcher = vi.fn(async () => ({ data: [], total_count: 0 }));

    const params = { initialPage: 1, pageSize: 3 } as const;
    const config = { infinite: true, enabled: true, isSignedIn: false } as const;
    const cacheKeys = { type: 't-signedin-false-inf' } as const;

    const { result } = renderHook(() => usePagesOrInfinite(params, fetcher, config, cacheKeys), { wrapper });

    expect(fetcher).toHaveBeenCalledTimes(0);
    expect(result.current.data).toEqual([]);
    expect(result.current.count).toBe(0);
  });
});

describe('usePagesOrInfinite - cache mode', () => {
  it('does not call fetcher in cache mode and allows local setData/revalidate', async () => {
    const fetcher = vi.fn(async () => ({ data: [{ id: 'remote' }], total_count: 10 }));

    const params = { initialPage: 1, pageSize: 3 } as const;
    const config = { infinite: false, enabled: true, __experimental_mode: 'cache' as const };
    const cacheKeys = { type: 't-cache', userId: 'u1' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    // Should never be fetching in cache mode
    expect(result.current.isFetching).toBe(false);
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    // Should not have called fetcher
    expect(fetcher).toHaveBeenCalledTimes(0);

    await act(async () => {
      await (result.current as any).setData({ data: [{ id: 'cached' }], total_count: 1 });
    });

    expect(result.current.data).toEqual([{ id: 'cached' }]);
    expect(result.current.count).toBe(1);

    await act(async () => {
      await (result.current as any).revalidate();
    });
  });
});

describe('usePagesOrInfinite - keepPreviousData behavior', () => {
  it('keeps previous page data while fetching next page (pagination mode)', async () => {
    const deferred = createDeferredPromise();
    const fetcher = vi.fn(async (p: any) => {
      if (p.initialPage === 1) {
        return { data: [{ id: 'p1-a' }, { id: 'p1-b' }], total_count: 4 };
      }
      return deferred.promise.then(() => ({ data: [{ id: 'p2-a' }, { id: 'p2-b' }], total_count: 4 }));
    });

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: false, keepPreviousData: true, enabled: true } as const;
    const cacheKeys = { type: 't-keepPrev' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: 'p1-a' }, { id: 'p1-b' }]);

    act(() => {
      result.current.fetchNext();
    });
    // page updated immediately, data remains previous while fetching
    expect(result.current.page).toBe(2);
    // expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.data).toEqual([{ id: 'p1-a' }, { id: 'p1-b' }]);

    // resolve next page
    deferred.resolve(undefined);
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.data).toEqual([{ id: 'p2-a' }, { id: 'p2-b' }]);
  });

  it('empties previous page data when fetching next page (pagination mode)', async () => {
    const deferred = createDeferredPromise();
    const fetcher = vi.fn(async (p: any) => {
      if (p.initialPage === 1) {
        return { data: [{ id: 'p1-a' }, { id: 'p1-b' }], total_count: 4 };
      }
      return deferred.promise.then(() => ({ data: [{ id: 'p2-a' }, { id: 'p2-b' }], total_count: 4 }));
    });

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: false, keepPreviousData: false, enabled: true } as const;
    const cacheKeys = { type: 't-keepPrev' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: 'p1-a' }, { id: 'p1-b' }]);

    act(() => {
      result.current.fetchNext();
    });
    // page updated immediately, data remains previous while fetching
    expect(result.current.page).toBe(2);
    // expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.data).toEqual([]);

    // resolve next page
    deferred.resolve(undefined);
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.data).toEqual([{ id: 'p2-a' }, { id: 'p2-b' }]);
  });
});

describe('usePagesOrInfinite - pagination helpers', () => {
  it('computes pageCount/hasNext/hasPrevious correctly for initialPage>1', async () => {
    const totalCount = 37;
    const fetcher = vi.fn(async (p: any) => ({
      data: Array.from({ length: p.pageSize }, (_, i) => ({ id: i })),
      total_count: totalCount,
    }));

    const params = { initialPage: 3, pageSize: 5 } as const;
    const config = { infinite: false, enabled: true } as const;
    const cacheKeys = { type: 't-helpers' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // offset = (3-1)*5 = 10; remaining = 37-10 = 27; pageCount = ceil(27/5) = 6
    expect(result.current.pageCount).toBe(6);

    act(() => {
      result.current.fetchPrevious();
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.fetchNext();
      result.current.fetchNext();
    });
    expect(result.current.page).toBe(4);
  });

  it('in infinite mode, page reflects size and hasNext/hasPrevious respond to size', async () => {
    const totalCount = 12;
    const fetcher = vi.fn(async (p: any) => ({
      data: Array.from({ length: p.pageSize }, (_, i) => ({ id: i })),
      total_count: totalCount,
    }));

    const params = { initialPage: 1, pageSize: 4 } as const;
    const config = { infinite: true, enabled: true } as const;
    const cacheKeys = { type: 't-infinite-page' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // size starts at 1
    expect(result.current.page).toBe(1);

    act(() => {
      result.current.fetchNext(); // size -> 2
    });
    await waitFor(() => expect(result.current.page).toBe(2));

    expect(result.current.page).toBe(2);
  });
});

describe('usePagesOrInfinite - behaviors mirrored from useCoreOrganization', () => {
  it('pagination mode: initial loading/fetching true, hasNextPage toggles, data replaced on next page (Promise-based fetcher)', async () => {
    const fetcher = vi.fn(async (p: any) => {
      if (p.initialPage === 1) {
        return Promise.resolve({
          data: [{ id: '1' }, { id: '2' }],
          total_count: 4,
        });
      }
      return Promise.resolve({
        data: [{ id: '3' }, { id: '4' }],
        total_count: 4,
      });
    });

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: false, keepPreviousData: false, enabled: true } as const;
    const cacheKeys = { type: 't-core-like-paginated' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    // initial
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.count).toBe(0);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.count).toBe(4);
    expect(result.current.page).toBe(1);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.data).toEqual([{ id: '1' }, { id: '2' }]);

    // trigger next page and assert loading toggles
    act(() => {
      result.current.fetchNext();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.page).toBe(2);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.data).toEqual([{ id: '3' }, { id: '4' }]);
  });

  it('infinite mode: isFetching toggles on fetchNext while isLoading stays false after first page', async () => {
    const deferred = createDeferredPromise();
    const fetcher = vi.fn(async (p: any) => {
      if (p.initialPage === 1) {
        return {
          data: [{ id: '1' }, { id: '2' }],
          total_count: 4,
        };
      }
      return deferred.promise.then(() => ({ data: [{ id: '3' }, { id: '4' }], total_count: 4 }));
    });

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: true, keepPreviousData: false, enabled: true } as const;
    const cacheKeys = { type: 't-core-like-infinite' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toEqual([{ id: '1' }, { id: '2' }]);

    act(() => {
      result.current.fetchNext();
    });
    // after first page loaded, next loads should not set isLoading, only isFetching
    expect(result.current.isLoading).toBe(false);
    await waitFor(() => expect(result.current.isFetching).toBe(true));

    deferred.resolve(undefined);
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.data).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
  });
});

describe('usePagesOrInfinite - revalidate behavior', () => {
  it('pagination mode: isFetching toggles during revalidate, isLoading stays false after initial load', async () => {
    const deferred = createDeferredPromise();
    let callCount = 0;
    const fetcher = vi.fn(async (_p: any) => {
      callCount++;
      if (callCount === 1) {
        return { data: [{ id: 'initial-1' }, { id: 'initial-2' }], total_count: 4 };
      }
      return deferred.promise.then(() => ({
        data: [{ id: 'revalidated-1' }, { id: 'revalidated-2' }],
        total_count: 4,
      }));
    });

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: false, enabled: true } as const;
    const cacheKeys = { type: 't-revalidate-paginated' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    // Wait for initial load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toEqual([{ id: 'initial-1' }, { id: 'initial-2' }]);

    // Trigger revalidate
    act(() => {
      (result.current as any).revalidate();
    });

    // isFetching should become true, but isLoading should stay false after initial load
    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.isLoading).toBe(false);

    // Resolve the revalidation
    deferred.resolve(undefined);
    await waitFor(() => expect(result.current.isFetching).toBe(false));

    // Data should be updated
    expect(result.current.data).toEqual([{ id: 'revalidated-1' }, { id: 'revalidated-2' }]);
    expect(result.current.isLoading).toBe(false);
  });

  it('infinite mode: isFetching toggles during revalidate, isLoading stays false after initial load', async () => {
    const deferred = createDeferredPromise();
    let callCount = 0;
    const fetcher = vi.fn(async (_p: any) => {
      callCount++;
      if (callCount === 1) {
        return { data: [{ id: 'initial-1' }, { id: 'initial-2' }], total_count: 4 };
      }
      return deferred.promise.then(() => ({
        data: [{ id: 'revalidated-1' }, { id: 'revalidated-2' }],
        total_count: 4,
      }));
    });

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: true, enabled: true } as const;
    const cacheKeys = { type: 't-revalidate-infinite' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    // Wait for initial load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toEqual([{ id: 'initial-1' }, { id: 'initial-2' }]);

    // Trigger revalidate
    act(() => {
      (result.current as any).revalidate();
    });

    // isFetching should become true, but isLoading should stay false after initial load
    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.isLoading).toBe(false);

    // Resolve the revalidation
    deferred.resolve(undefined);
    await waitFor(() => expect(result.current.isFetching).toBe(false));

    // Data should be updated
    expect(result.current.data).toEqual([{ id: 'revalidated-1' }, { id: 'revalidated-2' }]);
    expect(result.current.isLoading).toBe(false);
  });

  it('infinite mode: revalidate refetches all previously loaded pages', async () => {
    const fetcherCalls: Array<{ page: number; timestamp: string }> = [];
    const fetcher = vi.fn(async (p: any) => {
      const callTime = fetcherCalls.length < 2 ? 'initial' : 'revalidate';
      fetcherCalls.push({ page: p.initialPage, timestamp: callTime });

      return {
        data: Array.from({ length: p.pageSize }, (_, i) => ({
          id: `p${p.initialPage}-${i}-${callTime}`,
        })),
        total_count: 8,
      };
    });

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: true, enabled: true } as const;
    const cacheKeys = { type: 't-revalidate-all-pages' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    // Wait for initial page load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.length).toBe(2);
    expect(result.current.page).toBe(1);

    // Load second page
    act(() => {
      result.current.fetchNext();
    });
    await waitFor(() => expect(result.current.page).toBe(2));
    await waitFor(() => expect(result.current.data.length).toBe(4));

    // At this point, we should have 2 initial fetcher calls (page 1 and page 2)
    const initialCallCount = fetcherCalls.filter(c => c.timestamp === 'initial').length;
    expect(initialCallCount).toBeGreaterThanOrEqual(2);

    // Clear the array to track revalidation calls
    const callCountBeforeRevalidate = fetcherCalls.length;

    // Trigger revalidate
    await act(async () => {
      await (result.current as any).revalidate();
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    // After revalidate, we should have additional calls for both pages
    const revalidateCalls = fetcherCalls.slice(callCountBeforeRevalidate);
    expect(revalidateCalls.length).toBeGreaterThanOrEqual(2);

    // Verify both pages were revalidated (SWR refetches all pages in infinite mode)
    const revalidatedPages = revalidateCalls.map(c => c.page);
    expect(revalidatedPages).toContain(1);
    expect(revalidatedPages).toContain(2);

    // Data should reflect revalidated content
    expect(result.current.data).toEqual([
      { id: 'p1-0-revalidate' },
      { id: 'p1-1-revalidate' },
      { id: 'p2-0-revalidate' },
      { id: 'p2-1-revalidate' },
    ]);
  });
});

describe('usePagesOrInfinite - error propagation', () => {
  it('sets error and isError in pagination mode when fetcher throws', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('boom');
    });

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: false, enabled: true } as const;
    const cacheKeys = { type: 't-error' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets error and isError in infinite mode when fetcher throws', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('boom2')));

    const params = { initialPage: 1, pageSize: 2 } as const;
    const config = { infinite: true, enabled: true } as const;
    const cacheKeys = { type: 't-error-inf' } as const;

    const { result } = renderHook(
      () => usePagesOrInfinite(params as any, fetcher as any, config as any, cacheKeys as any),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.isLoading).toBe(false);
  });
});
