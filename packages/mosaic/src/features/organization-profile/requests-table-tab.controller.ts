import { useLocale } from '../../localization';
import { formatDate } from '../api-keys/api-keys-table.format';
import type { useRequestsTableModel } from './requests-table-tab.model';

export function useRequestsTableController(model: ReturnType<typeof useRequestsTableModel>) {
  const locale = useLocale();
  return {
    requests: model.rows.map(({ id, identifier, name, imageUrl, createdAt }) => ({
      id,
      email: identifier,
      name: name || undefined,
      imageUrl,
      requestedAtLabel: formatDate(createdAt, locale),
    })),
    totalCount: model.totalCount,
    page: model.page,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: model.retry,
    onPageChange: model.fetchPage,
    onAccept: model.accept,
    onDecline: model.reject,
  };
}
