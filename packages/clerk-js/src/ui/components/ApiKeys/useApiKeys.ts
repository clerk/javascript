import { useClerk } from '@clerk/shared/react';
import { useEffect, useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { useDebounce } from '@/ui/hooks';

const apiKeysSearchDebounceMs = 500;

/**
 * Invalidate all API keys cache entries for a given subject
 * @param subject - The subject (user ID or organization ID) to invalidate cache for
 * @returns A function to invalidate all cache entries for the subject
 */
export const useInvalidateApiKeys = (subject: string) => {
  const { mutate } = useSWRConfig();

  return () => {
    // Invalidate all cache entries for this subject (all pages and queries)
    void mutate(key => Array.isArray(key) && key[0] === 'api-keys' && key[1] === subject);
  };
};

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
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, apiKeysSearchDebounceMs);
  const query = debouncedSearchValue.trim();

  const cacheKey = ['api-keys', subject, perPage, currentPage, query];

  const {
    data: apiKeysResource,
    isLoading,
    mutate,
  } = useSWR(enabled ? cacheKey : null, () =>
    clerk.apiKeys.getAll({
      subject,
      pageSize: perPage,
      initialPage: currentPage,
      query,
    }),
  );

  const apiKeys = useMemo(() => apiKeysResource?.data ?? [], [apiKeysResource]);
  const totalCount = useMemo(() => apiKeysResource?.total_count ?? 0, [apiKeysResource]);

  // Calculate pagination values based on server response
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));
  const startingRow = totalCount > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const endingRow = Math.min(currentPage * perPage, totalCount);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Reset to previous page if current page is beyond available pages
  // This can happen after deleting the last item on a page
  // Go to previous page (or page 1) to preserve user context
  // Only do this when not loading to avoid interfering with page changes during refetch
  useEffect(() => {
    if (!isLoading && pageCount > 0 && currentPage > pageCount) {
      setCurrentPage(Math.max(1, pageCount));
    }
  }, [pageCount, currentPage, isLoading]);

  const invalidateAll = useInvalidateApiKeys(subject);

  return {
    apiKeys,
    mutate,
    isLoading,
    searchValue,
    setSearchValue,
    page: currentPage,
    setPage: handlePageChange,
    pageCount,
    itemCount: totalCount,
    startingRow,
    endingRow,
    invalidateAll,
  };
};
