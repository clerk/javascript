import { useRef, useState } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { useDebouncedAsync } from '../../../hooks/use-debounced-async';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useLocale, useMessages } from '../../../localization';
import { formatDate } from '../../../utils/format-date';
import type { useMembersTableModel } from './members-table-tab.model';
import type { MembersRolesState, OrganizationProfileMember } from './members-table-tab.types';
import { canManageMember } from './members-table-tab.utils';

export function useMembersTableController(
  model: ReturnType<typeof useMembersTableModel>,
  { roles, isLoading: isLoadingRoles }: MembersRolesState,
) {
  const locale = useLocale();
  const messages = useMessages('membersTableTab');
  const roleNames = useMessages('roles');
  const roleAction = usePendingAction({ errorFallback: messages.roleChangeError });
  const members = model.rows.map(({ joinedAt, ...member }) => ({
    ...member,
    roleLabel: roleNames[member.role] ?? member.roleLabel,
    joinedAtLabel: formatDate(joinedAt, locale),
  }));
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inviteButtonRef = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: members.filter(canManageMember).map(member => member.id),
    onRemove: model.remove,
    fallback: () => inviteButtonRef.current ?? searchInputRef.current,
  });
  const remove = useConfirmController<OrganizationProfileMember>({
    onConfirm: member => removalFocus.remove(member.id),
    errorFallback: messages.removeError,
  });

  return {
    members,
    roles: roles?.roles.map(role => ({ value: role.key, label: roleNames[role.key] ?? role.name })) ?? [],
    pageSize: model.pageSize,
    totalCount: model.totalCount,
    page: model.page,
    onPageChange: model.fetchPage,
    isLoading: model.isLoading || isLoadingRoles,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: model.retry,
    hasRoleSetMigration: roles?.hasRoleSetMigration ?? false,
    isChangingRole: roleAction.isPending,
    roleError: roleAction.error,
    onChangeRole:
      model.changeRole && roles && !roles.hasRoleSetMigration
        ? (id: string, role: string) => void roleAction.run(id, () => model.changeRole?.(id, role, roles))
        : undefined,
    searchInputRef,
    inviteButtonRef,
    registerTrigger: removalFocus.registerTrigger,
    remove: model.remove ? remove : undefined,
    finalFocus: removalFocus.finalFocus,
  };
}

export function useMembersTableSearchController() {
  const [searchValue, setSearchValue] = useState('');
  const query = useDebouncedAsync(searchValue, value => Promise.resolve(value.trim()), { delayMs: 500 });
  return { searchValue, onSearchChange: setSearchValue, query: searchValue.trim() === '' ? '' : (query.data ?? '') };
}
