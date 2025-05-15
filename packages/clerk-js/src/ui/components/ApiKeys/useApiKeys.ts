import { useClerk } from '@clerk/shared/react';
import { useState } from 'react';
import useSWR from 'swr';

import type { Expiration } from './CreateApiKeyForm';

export function getTimeLeftInSeconds(expirationOption: Expiration) {
  if (expirationOption === 'never') {
    return;
  }
  const now = new Date();
  const future = new Date(now);
  if (expirationOption === '30d') {
    future.setDate(future.getDate() + 30);
  } else if (expirationOption === '90d') {
    future.setDate(future.getDate() + 90);
  } else {
    throw new Error('TODO: Improve time handling');
  }
  const diffInMs = future.getTime() - now.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  return diffInSecs;
}

export const useApiKeys = ({ subject, perPage = 5 }: { subject: string; perPage?: number }) => {
  const clerk = useClerk();
  const cacheKey = {
    key: 'api-keys',
    subject,
  };
  const { data: apiKeys, isLoading, mutate } = useSWR(cacheKey, () => clerk.getApiKeys({ subject }));
  const [search, setSearch] = useState('');
  const filteredApiKeys = (apiKeys ?? []).filter(key => key.name.toLowerCase().includes(search.toLowerCase()));

  const {
    page,
    setPage,
    pageCount,
    itemCount,
    startingRow,
    endingRow,
    paginatedItems: paginatedApiKeys,
  } = usePagination(filteredApiKeys, perPage);

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

const usePagination = <T>(items: T[], itemsPerPage: number) => {
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
