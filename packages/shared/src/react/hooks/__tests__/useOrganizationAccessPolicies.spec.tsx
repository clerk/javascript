import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { __createClerkTestQueryClient } from '../../query/clerk-query-client';
import { useOrganizationAccessPolicies, useOrganizationAccessPolicy } from '../useOrganizationAccessPolicies';

const { getOrganization } = vi.hoisted(() => ({ getOrganization: vi.fn() }));

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => ({ loaded: true }),
}));
vi.mock('../base/useOrganizationBase', () => ({ useOrganizationBase: getOrganization }));
vi.mock('../base/useUserBase', () => ({ useUserBase: () => ({ id: 'user_1' }) }));

describe('organization access policy queries', () => {
  beforeEach(() => {
    __createClerkTestQueryClient();
    getOrganization.mockReset();
  });

  it('does not show the previous organization’s policies while loading the next organization', async () => {
    getOrganization.mockReturnValue({
      id: 'org_first',
      getAccessPolicies: () => Promise.resolve({ data: [{ id: 'first' }], total_count: 1 }),
    });
    const { result, rerender } = renderHook(() => useOrganizationAccessPolicies({ keepPreviousData: true }));
    await waitFor(() => expect(result.current.data).toEqual([{ id: 'first' }]));

    getOrganization.mockReturnValue({
      id: 'org_second',
      getAccessPolicies: () => Promise.resolve({ data: [{ id: 'second' }], total_count: 1 }),
    });
    rerender();
    expect(result.current.data).toEqual([]);
    await waitFor(() => expect(result.current.data).toEqual([{ id: 'second' }]));
  });

  it('waits for a policy ID and for a runtime that supports the detail method', async () => {
    const getAccessPolicy = vi.fn(({ policyId }: { policyId: string }) => Promise.resolve({ id: policyId }));
    getOrganization.mockReturnValue({ id: 'org_first' });

    const { result, rerender } = renderHook(
      ({ policyId }: { policyId?: string }) => useOrganizationAccessPolicy({ policyId }),
      { initialProps: { policyId: 'policy_1' } },
    );
    expect(result.current.isFetching).toBe(false);

    getOrganization.mockReturnValue({ id: 'org_first', getAccessPolicy });
    rerender({});
    expect(getAccessPolicy).not.toHaveBeenCalled();

    rerender({ policyId: 'policy_1' });
    await waitFor(() => expect(result.current.data).toEqual({ id: 'policy_1' }));
    expect(getAccessPolicy).toHaveBeenCalledWith({ policyId: 'policy_1' });
  });
});
