import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useMembersTableController, useMembersTableSearchController } from '../members-table-tab.controller';
import type { MembersRoles } from '../members-table-tab.types';

function createModel() {
  return {
    rows: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    isLoading: false,
    isFetching: false,
    isError: false,
    retry: vi.fn(),
    fetchPage: vi.fn(),
    changeRole: vi.fn((_id: string, _role: string, _roles: MembersRoles) => Promise.resolve()),
    remove: vi.fn((_id: string) => Promise.resolve()),
  };
}

describe('members table roles', () => {
  it('holds role editing until roles arrive and uses server labels', async () => {
    const model = createModel();
    const { result, rerender } = renderHook(({ roles }) => useMembersTableController(model, roles), {
      initialProps: { roles: null as MembersRoles | null },
    });
    expect(result.current.onChangeRole).toBeUndefined();

    const roles = { roles: [{ key: 'org:reader', name: 'Reader' }], hasRoleSetMigration: false };
    rerender({ roles });
    expect(result.current.roles).toEqual([{ value: 'org:reader', label: 'Reader' }]);

    await act(() => Promise.resolve(result.current.onChangeRole?.('member_1', 'org:reader')));
    expect(model.changeRole).toHaveBeenCalledWith('member_1', 'org:reader', roles);
  });

  it('keeps migration roles visible but prevents role changes', () => {
    const roles = { roles: [{ key: 'org:admin', name: 'Admin' }], hasRoleSetMigration: true };
    const { result } = renderHook(() => useMembersTableController(createModel(), roles));
    expect(result.current.roles).toHaveLength(1);
    expect(result.current.hasRoleSetMigration).toBe(true);
    expect(result.current.onChangeRole).toBeUndefined();
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
