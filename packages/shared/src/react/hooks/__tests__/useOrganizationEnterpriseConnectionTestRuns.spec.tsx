import { act, render, renderHook, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GetEnterpriseConnectionTestRunsParams } from '@/types/enterpriseConnectionTestRun';

import { INTERNAL_STABLE_KEYS } from '../../stable-keys';
import { createCacheKeys } from '../createCacheKeys';
import type { UseOrganizationEnterpriseConnectionTestRunsReturn } from '../useOrganizationEnterpriseConnectionTestRuns';
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

describe('useOrganizationEnterpriseConnectionTestRuns — polling arm scope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultQueryClient.client.clear();
    mockClerk.loaded = true;
  });

  it('keeps polling armed by a child effect in the same commit the connection arrives', async () => {
    getTestRunsSpy.mockImplementation(() => Promise.resolve({ data: [], total_count: 0 }));
    let latest: UseOrganizationEnterpriseConnectionTestRunsReturn | undefined;

    // Child effects run before parent effects, so this is the ordering a
    // reset-in-effect implementation would silently cancel.
    const Child = ({
      enterpriseConnectionId,
      revalidate,
    }: {
      enterpriseConnectionId: string | null;
      revalidate: UseOrganizationEnterpriseConnectionTestRunsReturn['revalidate'];
    }) => {
      useEffect(() => {
        if (enterpriseConnectionId) {
          void revalidate();
        }
      }, [enterpriseConnectionId, revalidate]);
      return null;
    };

    const Parent = ({ enterpriseConnectionId }: { enterpriseConnectionId: string | null }) => {
      latest = __internal_useOrganizationEnterpriseConnectionTestRuns({ enterpriseConnectionId, pollIntervalMs: 20 });
      return (
        <Child
          enterpriseConnectionId={enterpriseConnectionId}
          revalidate={latest.revalidate}
        />
      );
    };

    const { rerender } = render(<Parent enterpriseConnectionId={null} />);
    expect(latest?.isPolling).toBe(false);

    rerender(<Parent enterpriseConnectionId='ent_1' />);

    await waitFor(() => expect(latest?.isPolling).toBe(true));
    await waitFor(() => expect(getTestRunsSpy.mock.calls.length).toBeGreaterThanOrEqual(3));
  });

  it('disarms polling when the connection changes', async () => {
    getTestRunsSpy.mockImplementation(() => Promise.resolve({ data: [], total_count: 0 }));
    const { result, rerender } = renderHook(
      ({ enterpriseConnectionId }: { enterpriseConnectionId: string }) =>
        __internal_useOrganizationEnterpriseConnectionTestRuns({ enterpriseConnectionId, pollIntervalMs: 20 }),
      { wrapper, initialProps: { enterpriseConnectionId: 'ent_1' } },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.revalidate();
    });
    expect(result.current.isPolling).toBe(true);

    rerender({ enterpriseConnectionId: 'ent_2' });
    expect(result.current.isPolling).toBe(false);
  });
});
