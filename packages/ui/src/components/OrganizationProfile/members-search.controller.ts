import { useCallback, useEffect, useRef } from 'react';

import type { MembersSearchData, MembersSearchProps } from './members-search.types';

const membersSearchDebounceMs = 500;

export const useMembersSearchController = (
  { query, value, memberships, onSearchChange, onQueryTrigger }: MembersSearchProps,
  pageSize: number,
): MembersSearchData => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);
  const cancelPendingQuery = useCallback(() => {
    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cancelPendingQuery();
    };
  }, [cancelPendingQuery]);

  const { hasData, page, count, fetchPage } = memberships;
  // If search is not performed on a initial page, resets pagination offset
  // based on the response count
  useEffect(() => {
    if (query && hasData && page !== 1 && count <= pageSize) {
      fetchPage(1);
    }
  }, [query, hasData, count, page, fetchPage, pageSize]);

  const handleChange = (eventValue: string) => {
    if (!isMounted.current) {
      return;
    }
    cancelPendingQuery();
    onSearchChange(eventValue);
    if (eventValue === '') {
      onQueryTrigger('');
      return;
    }
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null;
      onQueryTrigger(eventValue.trim());
    }, membersSearchDebounceMs);
  };

  const handleClear = () => {
    if (!isMounted.current) {
      return;
    }
    cancelPendingQuery();
    onSearchChange('');
    onQueryTrigger('');
  };

  return {
    value,
    isLoading: Boolean(value && memberships.isLoading && memberships.hasRows),
    handleChange,
    handleClear,
  };
};
