import type { InvitationsTableTabViewProps } from '@clerk/mosaic/features/organization-profile/invitations-table-tab.types';
import { useLocale } from '@clerk/mosaic/localization';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosRows, chaosText } from '@/lib/chaos';

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
      roleLabel: chaosText(invitation.roleLabel),
    })),
  );
  const [items, setItems] = useState(empty ? [] : invitations);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(items.length / pageSize)));
  return {
    invitations: items.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(item => ({
      ...item,
      invitedAtLabel: new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(item.invitedAt),
    })),
    totalCount: items.length,
    page: currentPage,
    pageSize,
    isLoading: false,
    onPageChange: setPage,
    onRevoke: id => setItems(current => current.filter(item => item.id !== id)),
    onBulkAction: proposed ? () => undefined : undefined,
  };
}
