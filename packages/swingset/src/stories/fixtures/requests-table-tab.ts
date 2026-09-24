import type {
  RequestsTableSort,
  RequestsTableTabViewProps,
} from '@clerk/mosaic/features/organization-profile/requests-table-tab.types';
import { useLocale } from '@clerk/mosaic/localization';
import { useState } from 'react';

const exampleRequests = [
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
  id: `request-${index}`,
  email: `${name}@example.com`,
  requestedAt: Date.UTC(2026, 8, index + 1),
}));

export function useRequestsTableFixture({ proposed = false, empty = false } = {}): RequestsTableTabViewProps {
  const locale = useLocale();
  const [items, setItems] = useState(empty ? [] : exampleRequests);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [sort, setSort] = useState<RequestsTableSort | null>(null);
  const query = searchValue.trim().toLowerCase();
  const filtered = items.filter(item => item.email.toLowerCase().includes(query));
  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const comparison =
          sort.column === 'requestedAt' ? a.requestedAt - b.requestedAt : a[sort.column].localeCompare(b[sort.column]);
        return sort.direction === 'ascending' ? comparison : -comparison;
      })
    : filtered;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(sorted.length / pageSize)));
  return {
    requests: sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(item => ({
      ...item,
      requestedAtLabel: new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(item.requestedAt),
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
    onAccept: id => setItems(current => current.filter(item => item.id !== id)),
    onDecline: id => setItems(current => current.filter(item => item.id !== id)),
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
