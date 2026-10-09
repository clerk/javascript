import { useState } from 'react';

import { useDebouncedAsync } from '../../hooks/use-debounced-async';
import { usePendingAction } from '../../hooks/use-pending-action';
import { useLocale, useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import { formatDate } from '../../utils/format-date';
import type { useMembersTableModel } from './members-table-tab.model';
import type { MembersRoles } from './members-table-tab.types';

interface RolesContext {
  loadRoles: (() => Promise<MembersRoles>) | undefined;
  result: MembersRoles | null;
}

const { createMachine, assign, fromPromise } = setup<RolesContext, never>();

const rolesMachine = createMachine({
  id: 'membersRoles',
  initial: context => (context.loadRoles ? 'loading' : 'unavailable'),
  context: { loadRoles: undefined, result: null },
  states: {
    unavailable: {},
    loading: {
      invoke: fromPromise(context => context.loadRoles?.() ?? Promise.resolve(null), {
        onDone: {
          target: 'ready',
          actions: assign<DoneInvokeEvent<MembersRoles | null>>((_, event) => ({ result: event.output })),
        },
        onError: { target: 'unavailable' },
      }),
    },
    ready: {},
  },
});

export function useMembersTableController(model: ReturnType<typeof useMembersTableModel>) {
  const locale = useLocale();
  const messages = useMessages('membersTableTab');
  const roleNames = useMessages('roles');
  const roleAction = usePendingAction({ errorFallback: messages.roleChangeError });
  const [rolesState] = useMachine(rolesMachine, { context: { loadRoles: model.loadRoles } });
  const roles = rolesState.value === 'ready' ? rolesState.context.result : null;

  return {
    members: model.rows.map(({ joinedAt, ...member }) => ({
      ...member,
      roleLabel: roleNames[member.role] ?? member.roleLabel,
      joinedAtLabel: formatDate(joinedAt, locale),
    })),
    roles: roles?.roles.map(role => ({ value: role.key, label: roleNames[role.key] ?? role.name })) ?? [],
    pageSize: model.pageSize,
    totalCount: model.totalCount,
    page: model.page,
    onPageChange: model.fetchPage,
    isLoading: model.isLoading,
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
    onRemove: model.remove,
  };
}

export function useMembersTableSearchController() {
  const [searchValue, setSearchValue] = useState('');
  const query = useDebouncedAsync(searchValue, value => Promise.resolve(value.trim()), { delayMs: 500 });
  return { searchValue, onSearchChange: setSearchValue, query: searchValue.trim() === '' ? '' : (query.data ?? '') };
}
