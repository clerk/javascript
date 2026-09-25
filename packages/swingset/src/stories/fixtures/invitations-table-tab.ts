import type {
  InvitationsTableSort,
  InvitationsTableTabViewProps,
} from '@clerk/mosaic/features/organization-profile/invitations-table-tab.types';
import { useLocale } from '@clerk/mosaic/localization';
import { useState } from 'react';

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
  const [items, setItems] = useState(empty ? [] : exampleInvitations);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [sort, setSort] = useState<InvitationsTableSort | null>(null);
  const query = searchValue.trim().toLowerCase();
  const filtered = items.filter(item => item.email.toLowerCase().includes(query));
  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const comparison =
          sort.column === 'invitedAt' ? a.invitedAt - b.invitedAt : a[sort.column].localeCompare(b[sort.column]);
        return sort.direction === 'ascending' ? comparison : -comparison;
      })
    : filtered;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(sorted.length / pageSize)));
  return {
    invitations: sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(item => ({
      ...item,
      invitedAtLabel: new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(item.invitedAt),
    })),
    totalCount: sorted.length,
    page: currentPage,
    pageSize,
    searchValue,
    isLoading: false,
    onSearchChange: value => {
      setSearchValue(value);
      setPage(1);
    },
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onRevoke: id => setItems(current => current.filter(item => item.id !== id)),
    onBulkAction: proposed ? () => undefined : undefined,
    sort,
    onSortChange: proposed
      ? next => {
          setSort(next);
          setPage(1);
        }
      : undefined,
  };
}
