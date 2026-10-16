import { useRef } from 'react';

import { useConfirmController } from '../../blocks/confirm';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
import { useLocale, useMessages } from '../../localization';
import { formatDate } from '../../utils/format-date';
import type { useInvitationsTableModel } from './invitations-table-tab.model';
import type { InvitationsTableTabViewProps, OrganizationProfileInvitation } from './invitations-table-tab.types';

export function useInvitationsTableController(
  model: ReturnType<typeof useInvitationsTableModel>,
): InvitationsTableTabViewProps {
  const locale = useLocale();
  const roleNames = useMessages('roles');
  const m = useMessages('invitationsTableTab');
  const invitations = model.rows.map(({ id, emailAddress, createdAt, role, roleName }) => ({
    id,
    email: emailAddress,
    invitedAtLabel: formatDate(createdAt, locale),
    roleLabel: roleNames[role] ?? roleName,
  }));
  const inviteButtonRef = useRef<HTMLButtonElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: invitations.map(invitation => invitation.id),
    onRemove: model.revoke,
    fallback: () => inviteButtonRef.current ?? tableContainerRef.current,
  });
  const revoke = useConfirmController<OrganizationProfileInvitation>({
    onConfirm: invitation => removalFocus.remove(invitation.id),
    errorFallback: m.revokeError,
  });

  return {
    invitations,
    pageSize: model.pageSize,
    totalCount: model.totalCount,
    page: model.page,
    onPageChange: model.fetchPage,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: () => void model.retry(),
    inviteButtonRef,
    tableContainerRef,
    registerTrigger: removalFocus.registerTrigger,
    revoke: model.revoke ? revoke : undefined,
    finalFocus: removalFocus.finalFocus,
  };
}
