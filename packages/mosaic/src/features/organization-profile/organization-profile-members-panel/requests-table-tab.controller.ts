import { useRef } from 'react';

import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { useLocale } from '../../../localization';
import { formatDate } from '../../../utils/format-date';
import type { useRequestsTableModel } from './requests-table-tab.model';
import type { RequestsTableTabViewProps } from './requests-table-tab.types';

export function useRequestsTableController(model: ReturnType<typeof useRequestsTableModel>): RequestsTableTabViewProps {
  const locale = useLocale();
  const requests = model.rows.map(({ id, identifier, name, imageUrl, createdAt }) => ({
    id,
    email: identifier,
    name: name || undefined,
    imageUrl,
    requestedAtLabel: formatDate(createdAt, locale),
  }));
  const inviteButtonRef = useRef<HTMLButtonElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ids = requests.map(request => request.id);
  const fallback = () => inviteButtonRef.current ?? tableContainerRef.current;
  const acceptFocus = useListRemovalFocus({ ids, onRemove: model.accept, fallback });
  const declineFocus = useListRemovalFocus({ ids, onRemove: model.reject, fallback });

  return {
    requests,
    pageSize: model.pageSize,
    totalCount: model.totalCount,
    page: model.page,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: () => void model.retry(),
    onPageChange: model.fetchPage,
    inviteButtonRef,
    tableContainerRef,
    registerAcceptTrigger: acceptFocus.registerTrigger,
    registerDeclineTrigger: declineFocus.registerTrigger,
    onAccept: model.accept
      ? async id => {
          await acceptFocus.remove(id);
          acceptFocus.finalFocus()?.focus();
        }
      : undefined,
    onDecline: model.reject
      ? async id => {
          await declineFocus.remove(id);
          declineFocus.finalFocus()?.focus();
        }
      : undefined,
  };
}
