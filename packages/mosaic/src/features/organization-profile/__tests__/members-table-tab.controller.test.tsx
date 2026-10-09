import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { useMembersTableController, useMembersTableSearchController } from '../members-table-tab.controller';
import type { MembersRoles } from '../members-table-tab.types';

function createModel(loadRoles: () => Promise<MembersRoles>) {
  return {
    rows: [],
    loadRoles,
    totalCount: 0,
    page: 1,
    isLoading: false,
    isFetching: false,
    isError: false,
    retry: vi.fn(),
    fetchPage: vi.fn(),
    changeRole: vi.fn((_id: string, _role: string, _roles: MembersRoles) => Promise.resolve()),
    remove: vi.fn((_id: string) => Promise.resolve()),
  };
}

describe('members table role loading', () => {
  it('loads once, holds role editing until ready, and uses server labels', async () => {
    const request = deferred<MembersRoles>();
    const model = createModel(vi.fn(() => request.promise));
    const { result, rerender } = renderHook(() => useMembersTableController(model));

    expect(model.loadRoles).toHaveBeenCalledTimes(1);
    expect(result.current.onChangeRole).toBeUndefined();
    rerender();
    expect(model.loadRoles).toHaveBeenCalledTimes(1);

    const roles = { roles: [{ key: 'org:reader', name: 'Reader' }], hasRoleSetMigration: false };
    await act(() => Promise.resolve(request.resolve(roles)));
    expect(result.current.roles).toEqual([{ value: 'org:reader', label: 'Reader' }]);
    expect(result.current.onChangeRole).toBeDefined();

    await act(() => Promise.resolve(result.current.onChangeRole?.('member_1', 'org:reader')));
    expect(model.changeRole).toHaveBeenCalledWith('member_1', 'org:reader', roles);
  });

  it('keeps role editing unavailable after a failed role load', async () => {
    const first = deferred<MembersRoles>();
    const model = createModel(vi.fn(() => first.promise));
    const { result, rerender } = renderHook(() => useMembersTableController(model));

    expect(model.loadRoles).toHaveBeenCalledTimes(1);
    await act(() => Promise.resolve(first.reject(new Error('failed'))));
    expect(result.current.roles).toEqual([]);
    expect(result.current.onChangeRole).toBeUndefined();
    rerender();
    expect(model.loadRoles).toHaveBeenCalledTimes(1);
  });

  it('keeps migration roles visible but prevents role changes', async () => {
    const model = createModel(() =>
      Promise.resolve({
        roles: [{ key: 'org:admin', name: 'Admin' }],
        hasRoleSetMigration: true,
      }),
    );
    const { result } = renderHook(() => useMembersTableController(model));

    await waitFor(() => expect(result.current.roles).toHaveLength(1));
    expect(result.current.hasRoleSetMigration).toBe(true);
    expect(result.current.onChangeRole).toBeUndefined();
  });

  it.each(['resolve', 'reject'] as const)('drops an unresolved %s after unmount', async outcome => {
    const oldRequest = deferred<MembersRoles>();
    const oldModel = createModel(() => oldRequest.promise);
    const { unmount } = renderHook(() => useMembersTableController(oldModel));
    unmount();

    const newModel = createModel(() =>
      Promise.resolve({ roles: [{ key: 'org:new', name: 'New' }], hasRoleSetMigration: false }),
    );
    const { result } = renderHook(() => useMembersTableController(newModel));
    await waitFor(() => expect(result.current.roles).toEqual([{ value: 'org:new', label: 'New' }]));

    await act(() => {
      if (outcome === 'resolve') {
        oldRequest.resolve({ roles: [{ key: 'org:old', name: 'Old' }], hasRoleSetMigration: false });
      } else {
        oldRequest.reject(new Error('old request failed'));
      }
      return Promise.resolve();
    });
    expect(result.current.roles).toEqual([{ value: 'org:new', label: 'New' }]);
    expect(result.current.onChangeRole).toBeDefined();
  });

  it('applies a cleared search without waiting for the debounce', async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useMembersTableSearchController());
      act(() => result.current.onSearchChange('ada'));
      await act(() => vi.advanceTimersByTimeAsync(500));
      expect(result.current.query).toBe('ada');
      act(() => result.current.onSearchChange(''));
      expect(result.current.query).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });
});
