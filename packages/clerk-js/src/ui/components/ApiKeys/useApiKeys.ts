import { useClerk } from '@clerk/shared/react';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

export const useApiKeys = ({
  subject,
  perPage = 5,
  enabled,
}: {
  subject: string;
  perPage?: number;
  enabled: boolean;
}) => {
  const clerk = useClerk();
  const [currentPage, setCurrentPage] = useState(1);

  const cacheKey = {
    key: 'api-keys',
    subject,
    perPage,
    initialPage: currentPage,
  };

  const {
    data: apiKeysResource,
    isLoading,
    mutate,
  } = useSWR(enabled ? cacheKey : null, () =>
    clerk.apiKeys.getAll({
      subject,
      pageSize: perPage,
      initialPage: currentPage,
    }),
  );

  const apiKeys = useMemo(() => apiKeysResource?.data ?? [], [apiKeysResource]);
  const totalCount = useMemo(() => apiKeysResource?.total_count ?? 0, [apiKeysResource]);
  const [search, setSearch] = useState('');

  // For now, we'll keep client-side filtering as mentioned in the requirements
  const filteredApiKeys = apiKeys.filter(key => key.name.toLowerCase().includes(search.toLowerCase()));

  // Calculate pagination values based on server response
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));
  const startingRow = totalCount > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const endingRow = Math.min(currentPage * perPage, totalCount);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearch(''); // Reset search when changing pages
  };

  return {
    apiKeys: filteredApiKeys,
    cacheKey,
    mutate,
    isLoading,
    search,
    setSearch,
    page: currentPage,
    setPage: handlePageChange,
    pageCount,
    itemCount: totalCount,
    startingRow,
    endingRow,
  };
};
