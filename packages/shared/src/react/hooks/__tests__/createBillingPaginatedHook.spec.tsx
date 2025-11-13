import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClerkResource } from '../../../types';
import { createBillingPaginatedHook } from '../createBillingPaginatedHook';
import { createMockClerk, createMockOrganization, createMockQueryClient, createMockUser } from './mocks/clerk';
import { wrapper } from './wrapper';

// Mocks for contexts
let mockUser: any = createMockUser();
let mockOrganization: any = createMockOrganization();

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  queryClient: defaultQueryClient,
});

vi.mock('../../contexts', () => {
  return {
    useAssertWrappedByClerkProvider: () => {},
    useClerkInstanceContext: () => mockClerk,
    useUserContext: () => (mockClerk.loaded ? mockUser : null),
    useOrganizationContext: () => ({ organization: mockClerk.loaded ? mockOrganization : null }),
  };
});

type DummyResource = { id: string } & ClerkResource;
type DummyParams = { initialPage?: number; pageSize?: number } & { orgId?: string };

const fetcherMock = vi.fn();
const useFetcherMock = vi.fn(() => fetcherMock);

const useDummyAuth = createBillingPaginatedHook<DummyResource, DummyParams>({
  hookName: 'useDummyAuth',
  resourceType: 'dummy',
  useFetcher: useFetcherMock,
});

const useDummyUnauth = createBillingPaginatedHook<DummyResource, DummyParams>({
  hookName: 'useDummyUnauth',
  resourceType: 'dummy',
  useFetcher: useFetcherMock,
  options: { unauthenticated: true },
});

describe('createBillingPaginatedHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetcherMock.mockImplementation(() =>
      Promise.resolve({
        data: [],
        total_count: 0,
      }),
    );
    mockClerk.loaded = true;
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = true;
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = true;
    mockUser = createMockUser();
    mockOrganization = createMockOrganization();
    defaultQueryClient.client.clear();
  });

  it('fetches with default params when called with no params', async () => {
    const { result } = renderHook(() => useDummyAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(useFetcherMock).toHaveBeenCalledWith('user');
    expect(fetcherMock).toHaveBeenCalled();

    // Assert default params
    expect(fetcherMock.mock.calls[0][0]).toStrictEqual({ initialPage: 1, pageSize: 10 });
  });

  it('does not fetch when clerk.loaded is false', () => {
    mockClerk.loaded = false;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 5 }), { wrapper });

    // useFetcher is invoked eagerly, but the returned function should not be called
    expect(useFetcherMock).toHaveBeenCalledWith('user');

    expect(fetcherMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it('does not fetch when billing disabled (user)', () => {
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = false;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 4 }), { wrapper });

    expect(useFetcherMock).toHaveBeenCalledWith('user');

    expect(fetcherMock).not.toHaveBeenCalled();
    // Ensures that SWR does not update the loading state even if the fetcher is not called.
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });

  it('authenticated hook: does not fetch when user is null', () => {
    mockUser = null;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 4 }), { wrapper });

    expect(useFetcherMock).toHaveBeenCalledWith('user');

    expect(fetcherMock).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it('unauthenticated hook: fetches even when user is null', async () => {
    mockUser = null;

    const { result } = renderHook(() => useDummyUnauth({ initialPage: 1, pageSize: 4 }), { wrapper });

    expect(useFetcherMock).toHaveBeenCalledWith('user');
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(fetcherMock).toHaveBeenCalled();
    expect(fetcherMock.mock.calls[0][0]).toStrictEqual({ initialPage: 1, pageSize: 4 });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('unauthenticated hook: does not fetch when billing disabled for both user and organization', () => {
    mockUser = null;
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = false;
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = false;

    const { result } = renderHook(() => useDummyUnauth({ initialPage: 1, pageSize: 4 }), { wrapper });

    expect(useFetcherMock).toHaveBeenCalledWith('user');
    expect(fetcherMock).not.toHaveBeenCalled();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it('allows fetching for user when organization billing disabled', async () => {
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = false;
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = true;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 4 }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(useFetcherMock).toHaveBeenCalledWith('user');
    expect(fetcherMock.mock.calls[0][0]).toStrictEqual({ initialPage: 1, pageSize: 4 });
  });

  it('when for=organization orgId should be forwarded to fetcher', async () => {
    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 4, for: 'organization' } as any), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(useFetcherMock).toHaveBeenCalledWith('organization');
    expect(fetcherMock.mock.calls[0][0]).toStrictEqual({
      initialPage: 1,
      pageSize: 4,
      orgId: 'org_1',
    });
  });

  it('when for=organization orgId should be forwarded to fetcher (infinite mode)', async () => {
    fetcherMock.mockImplementation((params: any) =>
      Promise.resolve({
        data: Array.from({ length: params.pageSize }, (_, i) => ({ id: `item-${params.initialPage}-${i}` })),
        total_count: 20,
      }),
    );

    const { result } = renderHook(
      () => useDummyAuth({ initialPage: 1, pageSize: 4, for: 'organization', infinite: true } as any),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(useFetcherMock).toHaveBeenCalledWith('organization');
    expect(fetcherMock.mock.calls[0][0]).toStrictEqual({
      initialPage: 1,
      pageSize: 4,
      orgId: 'org_1',
    });
    expect(result.current.data.length).toBe(4);
  });

  it('does not fetch in organization mode when organization billing disabled', async () => {
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = false;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 4, for: 'organization' } as any), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(useFetcherMock).toHaveBeenCalledWith('organization');
    expect(fetcherMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('unauthenticated hook: does not fetch in organization mode when organization billing disabled', async () => {
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = false;

    const { result } = renderHook(() => useDummyUnauth({ initialPage: 1, pageSize: 4, for: 'organization' } as any), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(useFetcherMock).toHaveBeenCalledWith('organization');
    expect(fetcherMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  describe('authenticated hook - after sign-out previously loaded data are cleared', () => {
    it('pagination mode: data is cleared when user signs out', async () => {
      fetcherMock.mockImplementation((params: any) =>
        Promise.resolve({
          data: Array.from({ length: params.pageSize }, (_, i) => ({ id: `p${params.initialPage}-${i}` })),
          total_count: 5,
        }),
      );

      const { result, rerender } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 2 }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isFetching).toBe(true));
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(result.current.data.length).toBe(2);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(3); // ceil(5/2)

      // Simulate sign-out
      mockUser = null;
      rerender();

      // Data should become empty
      await waitFor(() => expect(result.current.data).toEqual([]));
      expect(result.current.count).toBe(0);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(0);
    });

    it('pagination mode: with keepPreviousData=true data is cleared after sign-out', async () => {
      fetcherMock.mockImplementation((params: any) =>
        Promise.resolve({
          data: Array.from({ length: params.pageSize }, (_, i) => ({ id: `item-${params.initialPage}-${i}` })),
          total_count: 20,
        }),
      );

      const { result, rerender } = renderHook(
        () => useDummyAuth({ initialPage: 1, pageSize: 5, keepPreviousData: true }),
        {
          wrapper,
        },
      );

      // Wait for initial data load
      await waitFor(() => expect(result.current.isLoading).toBe(true));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data.length).toBe(5);
      expect(result.current.data).toEqual([
        { id: 'item-1-0' },
        { id: 'item-1-1' },
        { id: 'item-1-2' },
        { id: 'item-1-3' },
        { id: 'item-1-4' },
      ]);
      expect(result.current.count).toBe(20);

      // Simulate sign-out by setting mockUser to null
      mockUser = null;
      rerender();

      if (__CLERK_USE_RQ__) {
        expect(result.current.isLoading).toBe(false);
      } else {
        // Attention: We are forcing fetcher to be executed instead of setting the key to null
        // because SWR will continue to display the cached data when the key is null and `keepPreviousData` is true.
        // This means that SWR will update the loading state to true even if the fetcher is not called,
        // because the key changes from `{..., userId: 'user_1'}` to `{..., userId: undefined}`.
        await waitFor(() => expect(result.current.isLoading).toBe(true));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
      }

      // Data should be cleared even with keepPreviousData: true
      // The key difference here vs usePagesOrInfinite test: userId in cache key changes
      // from 'user_1' to undefined, which changes the cache key (not just makes it null)
      await waitFor(() => expect(result.current.data).toEqual([]));
      expect(result.current.count).toBe(0);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(0);
    });

    it('infinite mode: data is cleared when user signs out', async () => {
      fetcherMock.mockImplementation((params: any) =>
        Promise.resolve({
          data: Array.from({ length: params.pageSize }, (_, i) => ({ id: `p${params.initialPage}-${i}` })),
          total_count: 10,
        }),
      );

      const { result, rerender } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 2, infinite: true }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isFetching).toBe(true));
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(result.current.data.length).toBe(2);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(5); // ceil(10/2)

      // Simulate sign-out
      mockUser = null;
      rerender();

      await waitFor(() => expect(result.current.data).toEqual([]));
      expect(result.current.count).toBe(0);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(0);
    });
  });

  describe('unauthenticated hook - data persists after sign-out', () => {
    it('pagination mode: data persists when user signs out', async () => {
      fetcherMock.mockImplementation((params: any) =>
        Promise.resolve({
          data: Array.from({ length: params.pageSize }, (_, i) => ({ id: `p${params.initialPage}-${i}` })),
          total_count: 5,
        }),
      );

      const { result, rerender } = renderHook(() => useDummyUnauth({ initialPage: 1, pageSize: 2 }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isFetching).toBe(true));
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(result.current.data.length).toBe(2);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(3); // ceil(5/2)

      const originalData = [...result.current.data];
      const originalCount = result.current.count;

      // Simulate sign-out
      mockUser = null;
      rerender();

      // Data should persist for unauthenticated hooks
      expect(result.current.data).toEqual(originalData);
      expect(result.current.count).toBe(originalCount);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(3);
    });

    it('pagination mode: with keepPreviousData=true data persists after sign-out', async () => {
      fetcherMock.mockImplementation((params: any) =>
        Promise.resolve({
          data: Array.from({ length: params.pageSize }, (_, i) => ({ id: `item-${params.initialPage}-${i}` })),
          total_count: 20,
        }),
      );

      const { result, rerender } = renderHook(
        () => useDummyUnauth({ initialPage: 1, pageSize: 5, keepPreviousData: true }),
        {
          wrapper,
        },
      );

      // Wait for initial data load
      await waitFor(() => expect(result.current.isLoading).toBe(true));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data.length).toBe(5);
      expect(result.current.data).toEqual([
        { id: 'item-1-0' },
        { id: 'item-1-1' },
        { id: 'item-1-2' },
        { id: 'item-1-3' },
        { id: 'item-1-4' },
      ]);
      expect(result.current.count).toBe(20);

      const originalData = [...result.current.data];

      // Simulate sign-out by setting mockUser to null
      mockUser = null;
      rerender();

      // Data should persist for unauthenticated hooks even with keepPreviousData: true
      expect(result.current.data).toEqual(originalData);
      expect(result.current.count).toBe(20);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(4); // ceil(20/5)
    });

    it('infinite mode: data persists when user signs out', async () => {
      fetcherMock.mockImplementation((params: any) =>
        Promise.resolve({
          data: Array.from({ length: params.pageSize }, (_, i) => ({ id: `p${params.initialPage}-${i}` })),
          total_count: 10,
        }),
      );

      const { result, rerender } = renderHook(() => useDummyUnauth({ initialPage: 1, pageSize: 2, infinite: true }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isFetching).toBe(true));
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(result.current.data.length).toBe(2);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(5); // ceil(10/2)

      const originalData = [...result.current.data];
      const originalCount = result.current.count;

      // Simulate sign-out
      mockUser = null;
      rerender();

      // Data should persist for unauthenticated hooks
      expect(result.current.data).toEqual(originalData);
      expect(result.current.count).toBe(originalCount);
      expect(result.current.page).toBe(1);
      expect(result.current.pageCount).toBe(5);
    });
  });
});
