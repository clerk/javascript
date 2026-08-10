import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The umbrella test-run hook composes the shared internal hook TWICE — once for
// the success probe (success-filtered, pageSize 1) and once for the visible list
// (pageSize 5). We mock the shared module so each gets its own `revalidate` spy,
// letting us assert exactly which query Continue's probe revalidation drives and
// with which options.
const probeRevalidate = vi.fn(() => Promise.resolve({ data: [], totalCount: 0 }));
const listRevalidate = vi.fn(() => Promise.resolve({ data: [], totalCount: 0 }));

vi.mock('@clerk/shared/react', () => ({
  __internal_useOrganizationEnterpriseConnectionTestRuns: (params: { params?: { status?: string[] } }) => {
    // The probe is the only call that passes a `status` filter; the list omits
    // it. Route each render's `revalidate` to the matching spy.
    const isProbe = Array.isArray(params.params?.status);
    return {
      data: [],
      totalCount: 0,
      error: null,
      isLoading: false,
      isFetching: false,
      isPolling: false,
      revalidate: isProbe ? probeRevalidate : listRevalidate,
    };
  },
}));

import { useEnterpriseConnectionTestRuns } from '../useEnterpriseConnectionTestRuns';

const connection = { id: 'ent_1' } as EnterpriseConnectionResource;

beforeEach(() => {
  probeRevalidate.mockClear();
  listRevalidate.mockClear();
});

describe('useEnterpriseConnectionTestRuns', () => {
  it('revalidateHasSuccessfulTestRun revalidates ONLY the probe, with exact invalidation — so Continue never refetches (or spins) the visible list', async () => {
    const { result } = renderHook(() => useEnterpriseConnectionTestRuns(connection, true));

    await act(async () => {
      await result.current.revalidateHasSuccessfulTestRun();
    });

    // Continue's probe revalidation scopes invalidation to the probe's own query
    // (`exact: true`) and never arms polling — so the list query, and its
    // `isFetching`-bound "Refresh logs" spinner, stays idle.
    expect(probeRevalidate).toHaveBeenCalledTimes(1);
    expect(probeRevalidate).toHaveBeenCalledWith({ armPolling: false, exact: true });
    expect(listRevalidate).not.toHaveBeenCalled();
  });
});
