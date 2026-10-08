import { useEffect, useRef } from 'react';

import type { Expiration } from './api-keys.types';

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

export const EXPIRATION_VALUES = ['never', '1d', '7d', '30d', '60d', '90d', '180d', '1y'] as const;

const EXPIRATION_DURATIONS: Record<Exclude<Expiration, 'never'>, (date: Date) => void> = {
  '1d': date => date.setDate(date.getDate() + 1),
  '7d': date => date.setDate(date.getDate() + 7),
  '30d': date => date.setDate(date.getDate() + 30),
  '60d': date => date.setDate(date.getDate() + 60),
  '90d': date => date.setDate(date.getDate() + 90),
  '180d': date => date.setDate(date.getDate() + 180),
  '1y': date => date.setFullYear(date.getFullYear() + 1),
};

export const getTimeLeftInSeconds = (expirationOption?: Expiration): number | undefined => {
  if (expirationOption === 'never' || !expirationOption) {
    return;
  }

  const now = new Date();
  const future = new Date(now);
  EXPIRATION_DURATIONS[expirationOption](future);
  return Math.floor((future.getTime() - now.getTime()) / 1000);
};
