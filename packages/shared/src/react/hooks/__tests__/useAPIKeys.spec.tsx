import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAPIKeys } from '../useAPIKeys';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

const getAllSpy = vi.fn(
  async () =>
    ({
      data: [],
      total_count: 0,
    }) as { data: Array<Record<string, unknown>>; total_count: number },
);

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  apiKeys: {
    getAll: getAllSpy,
  },
  queryClient: defaultQueryClient,
});

vi.mock('../../contexts', () => {
  return {
    useAssertWrappedByClerkProvider: () => {},
    useClerkInstanceContext: () => mockClerk,
  };
});

describe('useApiKeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultQueryClient.client.clear();
    mockClerk.loaded = true;
    mockClerk.user = { id: 'user_1' };
  });

  it('revalidate fetches fresh API keys', async () => {
    getAllSpy
      .mockResolvedValueOnce({
        data: [{ id: 'key_initial' }],
        total_count: 1,
      })
      .mockResolvedValueOnce({
        data: [{ id: 'key_updated' }],
        total_count: 1,
      });

    const { result } = renderHook(() => useAPIKeys({ subject: 'user_1', pageSize: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: 'key_initial' }]);

    await act(async () => {
      await result.current.revalidate();
    });

    await waitFor(() => expect(result.current.data).toEqual([{ id: 'key_updated' }]));
    expect(getAllSpy).toHaveBeenCalledTimes(2);
  });

  it('cascades revalidation for related queries only when using React Query', async () => {
    let sequence = 0;
    getAllSpy.mockImplementation(async ({ initialPage }: { initialPage?: number } = {}) => {
      sequence += 1;
      const page = initialPage ?? 1;
      return {
        data: [{ id: `key-${page}-${sequence}` }],
        total_count: 5,
      };
    });

    const useBoth = () => {
      const paginated = useAPIKeys({ subject: 'user_1', pageSize: 1 });
      const infinite = useAPIKeys({ subject: 'user_1', pageSize: 1, infinite: true });
      return { paginated, infinite };
    };

    const { result } = renderHook(useBoth, { wrapper });

    await waitFor(() => expect(result.current.paginated.isLoading).toBe(false));
    await waitFor(() => expect(result.current.infinite.isLoading).toBe(false));

    getAllSpy.mockClear();

    await act(async () => {
      await result.current.paginated.revalidate();
    });

    const isRQ = Boolean((globalThis as any).__CLERK_USE_RQ__);

    if (isRQ) {
      await waitFor(() => expect(getAllSpy.mock.calls.length).toBeGreaterThanOrEqual(2));
    } else {
      await waitFor(() => expect(getAllSpy).toHaveBeenCalledTimes(1));
    }
  });

  it('handles revalidation with different pageSize configurations', async () => {
    let seq = 0;
    getAllSpy.mockImplementation(async ({ pageSize }: { pageSize?: number } = {}) => {
      seq += 1;
      return {
        data: [{ id: `key-pageSize-${pageSize ?? 'unknown'}-${seq}` }],
        total_count: 3,
      };
    });

    const useHooks = () => {
      const small = useAPIKeys({ subject: 'user_1', pageSize: 1 });
      const large = useAPIKeys({ subject: 'user_1', pageSize: 5 });
      return { small, large };
    };

    const { result } = renderHook(useHooks, { wrapper });

    await waitFor(() => expect(result.current.small.isLoading).toBe(false));
    await waitFor(() => expect(result.current.large.isLoading).toBe(false));

    getAllSpy.mockClear();

    await act(async () => {
      await result.current.small.revalidate();
    });

    const isRQ = Boolean((globalThis as any).__CLERK_USE_RQ__);

    await waitFor(() => expect(getAllSpy.mock.calls.length).toBeGreaterThanOrEqual(1));

    if (isRQ) {
      await waitFor(() => expect(getAllSpy.mock.calls.length).toBeGreaterThanOrEqual(2));
    } else {
      expect(getAllSpy).toHaveBeenCalledTimes(2);
    }
  });

  it('handles revalidation with different query filters', async () => {
    let seq = 0;
    getAllSpy.mockImplementation(async ({ query }: { query?: string } = {}) => {
      seq += 1;
      return {
        data: [{ id: `key-query-${query ?? 'empty'}-${seq}` }],
        total_count: 2,
      };
    });

    const useHooks = () => {
      const defaultQuery = useAPIKeys({ subject: 'user_1', pageSize: 11, query: '' });
      const filtered = useAPIKeys({ subject: 'user_1', pageSize: 11, query: 'search' });
      return { defaultQuery, filtered };
    };

    const { result } = renderHook(useHooks, { wrapper });

    await waitFor(() => expect(result.current.defaultQuery.isLoading).toBe(false));
    await waitFor(() => expect(result.current.filtered.isLoading).toBe(false));

    getAllSpy.mockClear();

    await act(async () => {
      await result.current.defaultQuery.revalidate();
    });

    const isRQ = Boolean((globalThis as any).__CLERK_USE_RQ__);

    await waitFor(() => expect(getAllSpy.mock.calls.length).toBeGreaterThanOrEqual(1));

    if (isRQ) {
      await waitFor(() => expect(getAllSpy.mock.calls.length).toBeGreaterThanOrEqual(2));
    } else {
      expect(getAllSpy).toHaveBeenCalledTimes(2);
    }
  });

  it('does not cascade revalidation across different subjects', async () => {
    let seq = 0;
    getAllSpy.mockImplementation(async ({ subject }: { subject?: string } = {}) => {
      seq += 1;
      return {
        data: [{ id: `key-subject-${subject ?? 'none'}-${seq}` }],
        total_count: 4,
      };
    });

    const useHooks = () => {
      const primary = useAPIKeys({ subject: 'user_primary', pageSize: 1 });
      const secondary = useAPIKeys({ subject: 'user_secondary', pageSize: 1 });
      return { primary, secondary };
    };

    const { result } = renderHook(useHooks, { wrapper });

    await waitFor(() => expect(result.current.primary.isLoading).toBe(false));
    await waitFor(() => expect(result.current.secondary.isLoading).toBe(false));

    getAllSpy.mockClear();

    await act(async () => {
      await result.current.primary.revalidate();
    });

    await waitFor(() => expect(getAllSpy.mock.calls.length).toBeGreaterThanOrEqual(1));

    expect(getAllSpy).toHaveBeenCalledTimes(1);
    const subjects = (getAllSpy.mock.calls as Array<unknown[]>).map(
      call => (call[0] as { subject?: string } | undefined)?.subject,
    );
    expect(subjects).not.toContain('user_secondary');
    expect(subjects[0] === undefined || subjects[0] === 'user_primary').toBe(true);
  });
});
