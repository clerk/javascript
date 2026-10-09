import { useLocale } from '../../localization';
import { formatDate } from '../api-keys/api-keys-table.format';
import type { useInvitationsTableModel } from './invitations-table-tab.model';

export function useInvitationsTableController(model: ReturnType<typeof useInvitationsTableModel>) {
  const locale = useLocale();
  return {
    invitations: model.rows.map(({ id, emailAddress, createdAt, roleName }) => ({
      id,
      email: emailAddress,
      invitedAtLabel: formatDate(createdAt, locale),
      roleLabel: roleName,
    })),
    totalCount: model.totalCount,
    page: model.page,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: model.retry,
    onPageChange: model.fetchPage,
    onRevoke: model.revoke,
  };
}
