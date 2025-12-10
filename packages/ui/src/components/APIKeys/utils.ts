import { useEffect, useRef } from 'react';

type UseAPIKeysPaginationParams = {
  query: string;
  page: number;
  pageCount: number;
  isFetching: boolean;
  fetchPage: (page: number) => void;
};

/**
 * Hook that manages pagination logic for API keys:
 * - Resets to page 1 when query changes
 * - Adjusts page when current page exceeds available pages (e.g., after deletion)
 * - Provides cache invalidation function for mutations
 */
export const useAPIKeysPagination = ({ query, page, pageCount, isFetching, fetchPage }: UseAPIKeysPaginationParams) => {
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
};
