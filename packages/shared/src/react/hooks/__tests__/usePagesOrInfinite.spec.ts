import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createDeferredPromise } from '../../../utils/createDeferredPromise';
import type { ResourceCacheStableKey } from '../../stable-keys';
import { createCacheKeys } from '../createCacheKeys';
import { usePagesOrInfinite } from '../usePagesOrInfinite';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  queryClient: defaultQueryClient,
});

type ConfigOverrides = Partial<{
  infinite: boolean;
  keepPreviousData: boolean;
  enabled: boolean;
  isSignedIn: boolean;
  __experimental_mode: 'cache';
  initialPage: number;
  pageSize: number;
}>;

const buildConfig = <Params extends { initialPage?: number; pageSize?: number }>(
  params: Params,
  overrides: ConfigOverrides = {},
) => ({
  infinite: overrides.infinite ?? false,
  keepPreviousData: overrides.keepPreviousData ?? false,
  enabled: overrides.enabled ?? true,
  isSignedIn: overrides.isSignedIn,
  __experimental_mode: overrides.__experimental_mode,
  initialPage: overrides.initialPage ?? params.initialPage ?? 1,
  pageSize: overrides.pageSize ?? params.pageSize ?? 10,
});

const buildKeys = <Params extends Record<string, unknown>>(
  stablePrefix: string,
  params: Params,
  tracked: Record<string, unknown> = {},
  authenticated = true,
) =>
  createCacheKeys({
    // Casting to ResourceCacheStableKey to satisfy the type checker,
    // it is fine because we only want to limit the types to ensure our stable keys
    // do not diverge when consumed from other pacakges.
    // Since this is a test mocking most things we can safely ignore the type checker.
    stablePrefix: stablePrefix as ResourceCacheStableKey,
    authenticated,
    tracked,
    untracked: { args: params },
  });

const renderUsePagesOrInfinite = (args: { fetcher: any; config: any; keys: any }) =>
  renderHook(() => usePagesOrInfinite(args as any), { wrapper });

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
  it('uses query client with merged key and fetcher params; maps data and count', async () => {
    const fetcher = vi.fn(async (p: any) => {
      // simulate API returning paginated response
      return {
        data: Array.from({ length: p.pageSize }, (_, i) => ({ id: `item-${p.initialPage}-${i}` })),
        total_count: 42,
      };
    });

    const params = { initialPage: 2, pageSize: 5 };
    const config = buildConfig(params, { keepPreviousData: true });
    const keys = buildKeys('t-basic', params, { userId: 'user_123' });

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

    // wait until SWR mock finishes fetching
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // ensure fetcher received params without cache keys and with page info
    expect(fetcher).toHaveBeenCalledTimes(1);
    const calledWith = fetcher.mock.calls[0][0];
    expect(calledWith).toStrictEqual({ initialPage: 2, pageSize: 5 });

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

    const params = { initialPage: 2, pageSize: 3, someFilter: 'A' };
    const config = buildConfig(params);
    const keys = buildKeys('t-params', params, { userId: 'user_42' });

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params, { infinite: true });
    const keys = buildKeys('t-infinite', params, { orgId: 'org_1' });

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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

    const params = { initialPage: 1, pageSize: 3 };
    const config = buildConfig(params, { enabled: false });
    const keys = buildKeys('t-disabled', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

    // our SWR mock sets loading=false if key is null and not calling fetcher
    expect(fetcher).toHaveBeenCalledTimes(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('does not fetch when isSignedIn=false (pagination mode)', () => {
    const fetcher = vi.fn(async () => ({ data: [], total_count: 0 }));

    const params = { initialPage: 1, pageSize: 3 };
    const config = buildConfig(params, { isSignedIn: false });
    const keys = buildKeys('t-signedin-false', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

    expect(fetcher).toHaveBeenCalledTimes(0);
    expect(result.current.data).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('does not fetch when isSignedIn=false (infinite mode)', async () => {
    const fetcher = vi.fn(async () => ({ data: [], total_count: 0 }));

    const params = { initialPage: 1, pageSize: 3 };
    const config = buildConfig(params, { infinite: true, isSignedIn: false });
    const keys = buildKeys('t-signedin-false-inf', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

    expect(fetcher).toHaveBeenCalledTimes(0);
    expect(result.current.data).toEqual([]);
    expect(result.current.count).toBe(0);
  });
});

describe('usePagesOrInfinite - cache mode', () => {
  it('does not call fetcher in cache mode and allows local setData/revalidate', async () => {
    const fetcher = vi.fn(async () => ({ data: [{ id: 'remote' }], total_count: 10 }));

    const params = { initialPage: 1, pageSize: 3 };
    const config = buildConfig(params, { __experimental_mode: 'cache' });
    const keys = buildKeys('t-cache', params, { userId: 'u1' });

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params, { keepPreviousData: true });
    const keys = buildKeys('t-keepPrev', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });
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

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params, { keepPreviousData: false });
    const keys = buildKeys('t-keepPrev', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });
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

    const params = { initialPage: 3, pageSize: 5 };
    const config = buildConfig(params);
    const keys = buildKeys('t-helpers', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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

    const params = { initialPage: 1, pageSize: 4 };
    const config = buildConfig(params, { infinite: true });
    const keys = buildKeys('t-infinite-page', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params, { keepPreviousData: false });
    const keys = buildKeys('t-core-like-paginated', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params, { infinite: true, keepPreviousData: false });
    const keys = buildKeys('t-core-like-infinite', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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
  it('refetches current data when revalidate is invoked', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 'initial-1' }],
        total_count: 1,
      })
      .mockResolvedValueOnce({
        data: [{ id: 'refetched-1' }],
        total_count: 1,
      });

    const params = { initialPage: 1, pageSize: 1 };
    const config = buildConfig(params);
    const keys = buildKeys('t-revalidate-refresh', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: 'initial-1' }]);

    await act(async () => {
      await (result.current as any).revalidate();
    });

    await waitFor(() => expect(result.current.data).toEqual([{ id: 'refetched-1' }]));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

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

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params);
    const keys = buildKeys('t-revalidate-paginated', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params, { infinite: true });
    const keys = buildKeys('t-revalidate-infinite', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params, { infinite: true });
    const keys = buildKeys('t-revalidate-all-pages', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

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

  it('cascades revalidation to related queries only in React Query mode', async () => {
    const params = { initialPage: 1, pageSize: 1 };
    const keys = buildKeys('t-revalidate-cascade', params, { userId: 'user_123' });
    const fetcher = vi.fn(async ({ initialPage }: any) => ({
      data: [{ id: `item-${initialPage}-${fetcher.mock.calls.length}` }],
      total_count: 3,
    }));

    const useBoth = () => {
      const paginated = usePagesOrInfinite({
        fetcher,
        config: buildConfig(params),
        keys,
      });
      const infinite = usePagesOrInfinite({
        fetcher,
        config: buildConfig(params, { infinite: true }),
        keys,
      });

      return { paginated, infinite };
    };

    const { result } = renderHook(useBoth, { wrapper });

    await waitFor(() => expect(result.current.paginated.isLoading).toBe(false));
    await waitFor(() => expect(result.current.infinite.isLoading).toBe(false));

    fetcher.mockClear();

    await act(async () => {
      await result.current.paginated.revalidate();
    });

    if (__CLERK_USE_RQ__) {
      await waitFor(() => expect(fetcher.mock.calls.length).toBeGreaterThanOrEqual(2));
    } else {
      await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    }
  });
});

describe('usePagesOrInfinite - error propagation', () => {
  it('sets error and isError in pagination mode when fetcher throws', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('boom');
    });

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params);
    const keys = buildKeys('t-error', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets error and isError in infinite mode when fetcher throws', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('boom2')));

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params, { infinite: true });
    const keys = buildKeys('t-error-inf', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('usePagesOrInfinite - query state transitions and remounting', () => {
  it('pagination mode: isLoading may briefly be true when query key changes, even with cached data', async () => {
    const fetcher = vi.fn(async (p: any) => ({
      data: [{ id: `item-${p.filter}` }],
      total_count: 1,
    }));

    type TestParams = { initialPage: number; pageSize: number; filter: string };
    const params1: TestParams = { initialPage: 1, pageSize: 2, filter: 'A' };

    // First render with filter 'A'
    const { result, rerender } = renderHook(
      ({ params }: { params: TestParams }) =>
        usePagesOrInfinite({
          fetcher: fetcher as any,
          config: buildConfig(params),
          keys: buildKeys('t-transition-test', params),
        } as any),
      { wrapper, initialProps: { params: params1 } },
    );

    // Wait for initial data to load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: 'item-A' }]);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Change query parameters (simulating tab switch or filter change)
    const params2: TestParams = { initialPage: 1, pageSize: 2, filter: 'B' };
    rerender({ params: params2 });

    // During the transition, isLoading may briefly be true as RQ processes the new query
    // This is the behavior that caused the flaky test - components that conditionally
    // render based on isLoading may show loading state briefly
    const capturedStates: Array<{ isLoading: boolean; isFetching: boolean }> = [];

    // Capture states during transition
    let iterations = 0;
    while (iterations < 10 && result.current.data[0]?.id !== 'item-B') {
      capturedStates.push({
        isLoading: result.current.isLoading,
        isFetching: result.current.isFetching,
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      iterations++;
    }

    // Wait for new data to settle
    await waitFor(() => expect(result.current.data).toEqual([{ id: 'item-B' }]));
    expect(result.current.isLoading).toBe(false);

    // Document that during transition, we may see loading/fetching states
    // This is expected RQ behavior and tests must account for it
    expect(fetcher).toHaveBeenCalledTimes(2);
    const paramsCalls = fetcher.mock.calls.map(([params]) => params);
    expect(paramsCalls[0]).toStrictEqual({ initialPage: 1, pageSize: 2, filter: 'A' });
    expect(paramsCalls[1]).toStrictEqual({ initialPage: 1, pageSize: 2, filter: 'B' });
  });

  it('pagination mode: after data loads, subsequent renders with same params keep isLoading false', async () => {
    const fetcher = vi.fn(async (_p: any) => ({
      data: [{ id: 'stable' }],
      total_count: 1,
    }));

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params);
    const keys = buildKeys('t-stable-render', params);

    const { result, rerender } = renderUsePagesOrInfinite({ fetcher, config, keys });

    // Wait for initial load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: 'stable' }]);

    const initialCallCount = fetcher.mock.calls.length;

    // Multiple re-renders with same params should not trigger loading state
    rerender();
    expect(result.current.isLoading).toBe(false);

    rerender();
    expect(result.current.isLoading).toBe(false);

    rerender();
    expect(result.current.isLoading).toBe(false);

    // Should not have triggered additional fetches
    expect(fetcher).toHaveBeenCalledTimes(initialCallCount);
    expect(result.current.data).toEqual([{ id: 'stable' }]);
  });

  it('infinite mode: isLoading stays false when component re-renders after initial data load', async () => {
    const fetcher = vi.fn(async (_p: any) => ({
      data: [{ id: 'inf-1' }, { id: 'inf-2' }],
      total_count: 2,
    }));

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params, { infinite: true });
    const keys = buildKeys('t-infinite-stable', params);

    const { result, rerender } = renderUsePagesOrInfinite({ fetcher, config, keys });

    // Wait for initial load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: 'inf-1' }, { id: 'inf-2' }]);

    // Re-render multiple times - isLoading should remain false
    rerender();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([{ id: 'inf-1' }, { id: 'inf-2' }]);

    rerender();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([{ id: 'inf-1' }, { id: 'inf-2' }]);
  });

  it('documents the difference between isLoading and isFetching for test authors', async () => {
    const deferred = createDeferredPromise();
    let callCount = 0;
    const fetcher = vi.fn(async (_p: any) => {
      callCount++;
      if (callCount === 1) {
        return { data: [{ id: 'first' }], total_count: 1 };
      }
      return deferred.promise.then(() => ({ data: [{ id: 'second' }], total_count: 1 }));
    });

    const params = { initialPage: 1, pageSize: 2 };
    const config = buildConfig(params);
    const keys = buildKeys('t-loading-vs-fetching', params);

    const { result } = renderUsePagesOrInfinite({ fetcher, config, keys });

    // On initial mount:
    // - isLoading: true (first fetch, no data)
    // - isFetching: true (query is running)
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toEqual([{ id: 'first' }]);

    // Trigger refetch
    act(() => {
      (result.current as any).revalidate();
    });

    await waitFor(() => expect(result.current.isFetching).toBe(true));

    // After initial load, during refetch:
    // - isLoading: false (we have data, this is not the first fetch)
    // - isFetching: true (query is running)
    // This is CRITICAL for test stability - components that render based on
    // isLoading should not show loading state during refetches
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(true);

    // Resolve refetch
    deferred.resolve(undefined);
    await waitFor(() => expect(result.current.isFetching).toBe(false));

    // After refetch completes:
    // - isLoading: false
    // - isFetching: false
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toEqual([{ id: 'second' }]);
  });
});
