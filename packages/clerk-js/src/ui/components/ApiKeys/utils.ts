import { useCallback, useEffect, useRef } from 'react';
import { useSWRConfig } from 'swr';

type UseAPIKeysPaginationParams = {
  query: string;
  page: number;
  pageCount: number;
  isFetching: boolean;
  subject: string;
  fetchPage: (page: number) => void;
};

/**
 * Hook that manages pagination logic for API keys:
 * - Resets to page 1 when query changes
 * - Adjusts page when current page exceeds available pages (e.g., after deletion)
 * - Provides cache invalidation function for mutations
 */
export const useAPIKeysPagination = ({
  query,
  page,
  pageCount,
  isFetching,
  subject,
  fetchPage,
}: UseAPIKeysPaginationParams) => {
  const { mutate } = useSWRConfig();

  // Invalidate all cache entries for this user or organization
  const invalidateAll = useCallback(() => {
    void mutate(key => {
      if (!key || typeof key !== 'object') {
        return false;
      }
      // Match all apiKeys cache entries for this user or organization, regardless of page, pageSize, or query
      return 'type' in key && key.type === 'apiKeys' && 'subject' in key && key.subject === subject;
    });
  }, [mutate, subject]);

  // Reset to first page when query changes
  const previousQueryRef = useRef(query);
  useEffect(() => {
    if (previousQueryRef.current !== query) {
      previousQueryRef.current = query;
      fetchPage(1);
    }
  }, [query, fetchPage]);

  // Reset to previous page if current page is beyond available pages
  // This can happen after deleting the last item on a page
  useEffect(() => {
    if (!isFetching && pageCount > 0 && page > pageCount) {
      fetchPage(Math.max(1, pageCount));
    }
  }, [pageCount, page, isFetching, fetchPage]);

  return {
    invalidateAll,
  };
};
