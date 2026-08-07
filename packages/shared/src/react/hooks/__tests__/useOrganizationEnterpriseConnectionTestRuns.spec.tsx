import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GetEnterpriseConnectionTestRunsParams } from '@/types/enterpriseConnectionTestRun';

import { INTERNAL_STABLE_KEYS } from '../../stable-keys';
import { createCacheKeys } from '../createCacheKeys';
import { __internal_useOrganizationEnterpriseConnectionTestRuns } from '../useOrganizationEnterpriseConnectionTestRuns';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

// The success-filtered, single-row probe the Test step uses to answer
// `hasSuccessfulTestRun`. It is a sibling of the visible list page: both live
// under the same broad org+connection invalidation key, differing only in their
// fetch params (`untracked`).
const PROBE_PARAMS: GetEnterpriseConnectionTestRunsParams = { initialPage: 1, pageSize: 1, status: ['success'] };

const getTestRunsSpy = vi.fn(() => Promise.resolve({ data: [{ id: 'run_success' }], total_count: 1 }));

const defaultQueryClient = createMockQueryClient();

// Only `mock`-prefixed names may be referenced inside the hoisted `vi.mock`
// factory below, hence `mockClerk`.
const mockClerk = createMockClerk({
  queryClient: defaultQueryClient,
  __internal_lastEmittedResources: {
    user: null,
    session: null,
    organization: { id: 'org_1', getEnterpriseConnectionTestRuns: getTestRunsSpy },
    client: null,
  },
});

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => mockClerk,
  useInitialStateContext: () => undefined,
}));

// The exact per-query key (includes the fetch params under `untracked`) vs the
// broad org+connection prefix shared by every test-runs query for the
// connection. `invalidateQueries` prefix-matches, so invalidating the broad key
// refetches the probe AND the visible list; the exact key hits only this query.
const { queryKey: exactKey, invalidationKey: broadKey } = createCacheKeys({
  stablePrefix: INTERNAL_STABLE_KEYS.ORGANIZATION_ENTERPRISE_CONNECTION_TEST_RUNS_KEY,
  authenticated: true,
  tracked: { organizationId: 'org_1', enterpriseConnectionId: 'ent_1' },
  untracked: { args: PROBE_PARAMS },
});

const renderProbe = () =>
  renderHook(
    () =>
      __internal_useOrganizationEnterpriseConnectionTestRuns({
        enterpriseConnectionId: 'ent_1',
        params: PROBE_PARAMS,
        enabled: true,
      }),
    { wrapper },
  );

describe('useOrganizationEnterpriseConnectionTestRuns — revalidate invalidation scope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultQueryClient.client.clear();
    mockClerk.loaded = true;
  });

  it('revalidate({ exact: true }) invalidates ONLY the exact queryKey, never the broad org+connection key — so a sibling list query is left untouched', async () => {
    const { result } = renderProbe();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const invalidateSpy = vi.spyOn(defaultQueryClient.client, 'invalidateQueries');
    await act(async () => {
      await result.current.revalidate({ armPolling: false, exact: true });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: exactKey, exact: true });
    // Never the broad prefix — invalidating it is exactly what would also
    // refetch the visible list and spin its `isFetching`-bound "Refresh logs"
    // button when the Test step revalidates the probe on Continue.
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: broadKey });

    invalidateSpy.mockRestore();
  });

  it('revalidate() (default) keeps the broad org+connection invalidation so refresh()/"Refresh logs" still refetches the whole connection', async () => {
    const { result } = renderProbe();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const invalidateSpy = vi.spyOn(defaultQueryClient.client, 'invalidateQueries');
    await act(async () => {
      await result.current.revalidate({ armPolling: false });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: broadKey });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: exactKey, exact: true });

    invalidateSpy.mockRestore();
  });
});
