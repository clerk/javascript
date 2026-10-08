import { useState } from 'react';

import { useDebouncedAsync } from '../../hooks/use-debounced-async';
import { usePendingAction } from '../../hooks/use-pending-action';
import { useLocale, useMessages } from '../../localization';
import { formatDate } from '../api-keys/api-keys-table.format';
import type { useMembersTableModel } from './members-table-tab.model';

export function useMembersTableController(model: ReturnType<typeof useMembersTableModel>) {
  const locale = useLocale();
  const messages = useMessages('membersTableTab');
  const roleAction = usePendingAction({ errorFallback: messages.roleChangeError });

  return {
    members: model.rows.map(({ joinedAt, ...member }) => ({ ...member, joinedAtLabel: formatDate(joinedAt, locale) })),
    roles: model.roles,
    totalCount: model.totalCount,
    page: model.page,
    onPageChange: model.fetchPage,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: model.retry,
    isRolesError: model.isRolesError,
    onRetryRoles: model.retryRoles,
    hasRoleSetMigration: model.hasRoleSetMigration,
    isChangingRole: roleAction.isPending,
    roleError: roleAction.error,
    onChangeRole: model.changeRole
      ? (id: string, role: string) => void roleAction.run(id, () => model.changeRole?.(id, role))
      : undefined,
    onRemove: roleAction.isPending ? undefined : model.remove,
  };
}

export function useMembersTableSearchController() {
  const [searchValue, setSearchValue] = useState('');
  const query = useDebouncedAsync(searchValue, value => Promise.resolve(value.trim()), { delayMs: 500 });
  return { searchValue, onSearchChange: setSearchValue, query: query.data ?? '' };
}
