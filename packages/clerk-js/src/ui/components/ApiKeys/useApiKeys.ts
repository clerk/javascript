import { useClerk } from '@clerk/shared/react';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

export const useApiKeys = ({
  subject,
  pageSize = 5,
  initialPage = 1,
  enabled,
}: {
  subject: string;
  pageSize?: number;
  initialPage?: number;
  enabled: boolean;
}) => {
  const clerk = useClerk();

  const cacheKey = {
    key: 'api-keys',
    subject,
    initialPage,
    pageSize,
  };
  const {
    data: apiKeysResource,
    isLoading,
    mutate,
  } = useSWR(enabled ? cacheKey : null, () => clerk.apiKeys.getAll({ subject, pageSize, initialPage }));
  const apiKeys = useMemo(() => apiKeysResource?.data ?? [], [apiKeysResource]);
  const [search, setSearch] = useState('');

  const filteredApiKeys = apiKeys.filter(key => key.name.toLowerCase().includes(search.toLowerCase()));

  const {
    page,
    setPage,
    pageCount,
    itemCount,
    startingRow,
    endingRow,
    paginatedItems: paginatedApiKeys,
  } = useClientSidePagination(filteredApiKeys, pageSize);

  return {
    apiKeys: paginatedApiKeys,
    cacheKey,
    mutate,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    pageCount,
    itemCount,
    startingRow,
    endingRow,
  };
};
const useClientSidePagination = <T>(items: T[], itemsPerPage: number) => {
  const [page, setPage] = useState(1);

  const itemCount = items.length;
  const pageCount = Math.max(1, Math.ceil(itemCount / itemsPerPage));
  const startingRow = itemCount > 0 ? (page - 1) * itemsPerPage + 1 : 0;
  const endingRow = Math.min(page * itemsPerPage, itemCount);
  const paginatedItems = items.slice(startingRow - 1, endingRow);

  return {
    page,
    setPage,
    pageCount,
    itemCount,
    startingRow,
    endingRow,
    paginatedItems,
  };
};
