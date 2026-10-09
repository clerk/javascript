import type { RequestsTableTabViewProps } from '@clerk/mosaic/features/organization-profile/requests-table-tab.types';
import { useLocale } from '@clerk/mosaic/localization';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosRows } from '@/lib/chaos';

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
  const requests = useChaosFixture(exampleRequests, items =>
    chaosRows(items).map((request, index) => ({ ...request, email: chaosEmail(index) })),
  );
  const [items, setItems] = useState(empty ? [] : requests);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(items.length / pageSize)));
  return {
    requests: items.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(item => ({
      ...item,
      requestedAtLabel: new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(item.requestedAt),
    })),
    totalCount: items.length,
    page: currentPage,
    pageSize,
    isLoading: false,
    onPageChange: setPage,
    onAccept: id => setItems(current => current.filter(item => item.id !== id)),
    onDecline: id => setItems(current => current.filter(item => item.id !== id)),
    onBulkAction: proposed ? () => undefined : undefined,
  };
}
