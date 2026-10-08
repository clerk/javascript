import { useState } from 'react';

import { useDebouncedAsync } from '../../hooks/use-debounced-async';
import { usePendingAction } from '../../hooks/use-pending-action';
import { useLocale, useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import { formatDate } from '../api-keys/api-keys-table.format';
import type { useMembersTableModel } from './members-table-tab.model';
import type { MembersRoles } from './members-table-tab.types';

interface RolesContext {
  loadRoles: () => Promise<MembersRoles>;
  result: MembersRoles | null;
}

type RolesEvent = { type: 'RETRY' };

const { createMachine, assign, fromPromise } = setup<RolesContext, RolesEvent>();

const rolesMachine = createMachine({
  id: 'membersRoles',
  initial: 'loading',
  context: { loadRoles: () => Promise.resolve({ roles: [], hasRoleSetMigration: false }), result: null },
  states: {
    loading: {
      invoke: fromPromise(context => context.loadRoles(), {
        onDone: {
          target: 'ready',
          actions: assign<DoneInvokeEvent<MembersRoles>>((_, event) => ({ result: event.output })),
        },
        onError: { target: 'failed' },
      }),
    },
    ready: {},
    failed: { on: { RETRY: 'loading' } },
  },
});

export function useMembersTableController(model: ReturnType<typeof useMembersTableModel>) {
  const locale = useLocale();
  const messages = useMessages('membersTableTab');
  const roleAction = usePendingAction({ errorFallback: messages.roleChangeError });
  const [rolesState, sendRoles] = useMachine(rolesMachine, { context: { loadRoles: model.loadRoles } });
  const roles = rolesState.value === 'ready' ? rolesState.context.result : null;

  return {
    members: model.rows.map(({ joinedAt, ...member }) => ({ ...member, joinedAtLabel: formatDate(joinedAt, locale) })),
    roles: roles?.roles.map(role => ({ value: role.key, label: role.name })) ?? [],
    totalCount: model.totalCount,
    page: model.page,
    onPageChange: model.fetchPage,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: model.retry,
    isRolesError: rolesState.value === 'failed',
    onRetryRoles: () => sendRoles({ type: 'RETRY' }),
    hasRoleSetMigration: roles?.hasRoleSetMigration ?? false,
    isChangingRole: roleAction.isPending,
    roleError: roleAction.error,
    onChangeRole:
      model.changeRole && roles && !roles.hasRoleSetMigration
        ? (id: string, role: string) => void roleAction.run(id, () => model.changeRole?.(id, role, roles))
        : undefined,
    onRemove: roleAction.isPending ? undefined : model.remove,
  };
}

export function useMembersTableSearchController() {
  const [searchValue, setSearchValue] = useState('');
  const query = useDebouncedAsync(searchValue, value => Promise.resolve(value.trim()), { delayMs: 500 });
  return { searchValue, onSearchChange: setSearchValue, query: query.data ?? '' };
}
