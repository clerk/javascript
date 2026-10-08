import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { __internal_useOrganizationRoles } from '../useOrganizationRoles';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

const getRoles = vi.fn(() =>
  Promise.resolve({ data: [{ key: 'org:admin', name: 'Admin' }], total_count: 1, has_role_set_migration: true }),
);
const queryClient = createMockQueryClient();
const mockClerk = createMockClerk({
  queryClient,
  __internal_lastEmittedResources: {
    user: null,
    session: { id: 'sess_1' },
    organization: { id: 'org_1', getRoles },
    client: null,
  },
});

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => mockClerk,
  useInitialStateContext: () => undefined,
}));

describe('useOrganizationRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.client.clear();
    mockClerk.loaded = true;
    mockClerk.__internal_lastEmittedResources.organization = { id: 'org_1', getRoles };
    mockClerk.__internal_lastEmittedResources.session = { id: 'sess_1' };
  });

  it('fetches roles and migration metadata, then revalidates', async () => {
    const { result } = renderHook(() => __internal_useOrganizationRoles(), { wrapper });
    await waitFor(() => expect(result.current.data?.[0]?.key).toBe('org:admin'));
    expect(result.current.hasRoleSetMigration).toBe(true);
    await act(async () => result.current.revalidate());
    expect(getRoles).toHaveBeenCalledTimes(2);
    expect(getRoles).toHaveBeenCalledWith({ pageSize: 20 });
  });

  it('does not fetch while disabled and masks a cached result', async () => {
    const { result, rerender } = renderHook(({ enabled }) => __internal_useOrganizationRoles({ enabled }), {
      wrapper,
      initialProps: { enabled: true },
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    rerender({ enabled: false });
    expect(result.current.data).toBeUndefined();
    expect(result.current.hasRoleSetMigration).toBe(false);
    expect(result.current.error).toBeNull();
    expect(getRoles).toHaveBeenCalledTimes(1);
  });

  it('isolates roles by organization and clears authenticated roles after sign-out', async () => {
    const { result, rerender } = renderHook(() => __internal_useOrganizationRoles(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    mockClerk.__internal_lastEmittedResources.organization = { id: 'org_2', getRoles };
    rerender();
    await waitFor(() => expect(getRoles).toHaveBeenCalledTimes(2));
    expect(queryClient.client.getQueryCache().getAll().length).toBe(2);
    mockClerk.__internal_lastEmittedResources.organization = null;
    mockClerk.__internal_lastEmittedResources.session = null;
    rerender();
    await waitFor(() =>
      expect(
        queryClient.client
          .getQueryCache()
          .getAll()
          .filter(query => query.queryKey[1] === true),
      ).toHaveLength(0),
    );
  });

  it('does not reuse another session’s roles in the same organization', async () => {
    const { result, rerender } = renderHook(() => __internal_useOrganizationRoles(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    mockClerk.__internal_lastEmittedResources.session = { id: 'sess_2' };
    rerender();
    await waitFor(() => expect(getRoles).toHaveBeenCalledTimes(2));
  });
});
