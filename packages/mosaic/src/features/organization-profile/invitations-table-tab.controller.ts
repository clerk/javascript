import { useLocale, useMessages } from '../../localization';
import { formatDate } from '../../utils/format-date';
import type { useInvitationsTableModel } from './invitations-table-tab.model';

export function useInvitationsTableController(model: ReturnType<typeof useInvitationsTableModel>) {
  const locale = useLocale();
  const roleNames = useMessages('roles');
  return {
    invitations: model.rows.map(({ id, emailAddress, createdAt, role, roleName }) => ({
      id,
      email: emailAddress,
      invitedAtLabel: formatDate(createdAt, locale),
      roleLabel: roleNames[role] ?? roleName,
    })),
    pageSize: model.pageSize,
    totalCount: model.totalCount,
    page: model.page,
    onPageChange: model.fetchPage,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: model.retry,
    onRevoke: model.revoke,
  };
}
