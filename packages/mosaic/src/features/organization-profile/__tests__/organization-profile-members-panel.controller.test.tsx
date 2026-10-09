import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import type { MembersRoles } from '../members-table-tab.types';
import { useMembersPanelRolesController } from '../organization-profile-members-panel.controller';

describe('members panel role loading', () => {
  it('loads once and returns the roles when ready', async () => {
    const request = deferred<MembersRoles>();
    const loadRoles = vi.fn(() => request.promise);
    const { result, rerender } = renderHook(() => useMembersPanelRolesController(loadRoles));

    expect(loadRoles).toHaveBeenCalledTimes(1);
    expect(result.current).toBeNull();
    rerender();
    expect(loadRoles).toHaveBeenCalledTimes(1);

    const roles = { roles: [{ key: 'org:reader', name: 'Reader' }], hasRoleSetMigration: false };
    await act(() => Promise.resolve(request.resolve(roles)));
    expect(result.current).toEqual(roles);
  });

  it('stays unavailable after a failed role load', async () => {
    const request = deferred<MembersRoles>();
    const loadRoles = vi.fn(() => request.promise);
    const { result, rerender } = renderHook(() => useMembersPanelRolesController(loadRoles));

    await act(() => Promise.resolve(request.reject(new Error('failed'))));
    expect(result.current).toBeNull();
    rerender();
    expect(loadRoles).toHaveBeenCalledTimes(1);
  });

  it('does not load without a loader', () => {
    const { result } = renderHook(() => useMembersPanelRolesController(undefined));
    expect(result.current).toBeNull();
  });

  it.each(['resolve', 'reject'] as const)('drops an unresolved %s after unmount', async outcome => {
    const oldRequest = deferred<MembersRoles>();
    const { unmount } = renderHook(() => useMembersPanelRolesController(() => oldRequest.promise));
    unmount();

    const fresh = { roles: [{ key: 'org:new', name: 'New' }], hasRoleSetMigration: false };
    const { result } = renderHook(() => useMembersPanelRolesController(() => Promise.resolve(fresh)));
    await waitFor(() => expect(result.current).toEqual(fresh));

    await act(() => {
      if (outcome === 'resolve') {
        oldRequest.resolve({ roles: [{ key: 'org:old', name: 'Old' }], hasRoleSetMigration: false });
      } else {
        oldRequest.reject(new Error('old request failed'));
      }
      return Promise.resolve();
    });
    expect(result.current).toEqual(fresh);
  });
});
