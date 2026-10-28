import { useConfirmController } from '@clerk/mosaic/blocks/confirm';
import type {
  InvitationsTableTabViewProps,
  OrganizationProfileInvitation,
} from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel/invitations-table-tab.types';
import { useListRemovalFocus } from '@clerk/mosaic/hooks/use-list-removal-focus';
import { useLocale } from '@clerk/mosaic/localization';
import { useRef, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosRole, chaosRows } from '@/lib/chaos';

const exampleInvitations = [
  'ada',
  'grace',
  'alan',
  'katherine',
  'margaret',
  'edsger',
  'barbara',
  'donald',
  'radia',
  'john',
  'frances',
  'ken',
].map((name, index) => ({
  id: `invitation-${index}`,
  email: `${name}@example.com`,
  invitedAt: Date.UTC(2026, 8, index + 1),
  roleLabel: index % 3 === 0 ? 'Admin' : 'Member',
}));

export function useInvitationsTableFixture({ proposed = false, empty = false } = {}): InvitationsTableTabViewProps {
  const locale = useLocale();
  const invitations = useChaosFixture(exampleInvitations, items =>
    chaosRows(items).map((invitation, index) => ({
      ...invitation,
      email: chaosEmail(index),
      roleLabel: chaosRole(index).label,
    })),
  );
  const [items, setItems] = useState(empty ? [] : invitations);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(items.length / pageSize)));
  const pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(item => ({
    ...item,
    invitedAtLabel: new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(item.invitedAt),
  }));
  const inviteButtonRef = useRef<HTMLButtonElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: pageItems.map(item => item.id),
    onRemove: id => setItems(current => current.filter(item => item.id !== id)),
    fallback: () => inviteButtonRef.current ?? tableContainerRef.current,
  });
  const revoke = useConfirmController<OrganizationProfileInvitation>({
    onConfirm: invitation => removalFocus.remove(invitation.id),
  });
  return {
    invitations: pageItems,
    totalCount: items.length,
    page: currentPage,
    pageSize,
    isLoading: false,
    onPageChange: setPage,
    inviteButtonRef,
    tableContainerRef,
    registerTrigger: removalFocus.registerTrigger,
    revoke,
    finalFocus: removalFocus.finalFocus,
    onBulkAction: proposed ? () => undefined : undefined,
  };
}
