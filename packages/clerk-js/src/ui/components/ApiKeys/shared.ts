import { useClerk } from '@clerk/shared/react';
import { useState } from 'react';

import { useFetch } from '../../hooks';
import type { Expiration } from './CreateApiKeyForm';

function getTimeLeftInSeconds(expirationOption: Expiration) {
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

export function useApiKeys({ subject, perPage = 5 }: { subject: string; perPage?: number }) {
  const clerk = useClerk();
  const {
    data: apiKeys,
    isLoading,
    revalidate,
  } = useFetch(clerk.getApiKeys, { subject }, undefined, `api-key-source-${subject}`);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = perPage;

  const filteredApiKeys = (apiKeys ?? []).filter(key => key.name.toLowerCase().includes(search.toLowerCase()));
  const itemCount = filteredApiKeys.length;
  const pageCount = Math.max(1, Math.ceil(itemCount / itemsPerPage));
  const startingRow = itemCount > 0 ? (page - 1) * itemsPerPage + 1 : 0;
  const endingRow = Math.min(page * itemsPerPage, itemCount);
  const paginatedApiKeys = filteredApiKeys.slice(startingRow - 1, endingRow);

  const handleCreate = async (params: {
    name: string;
    description?: string;
    expiration: Expiration;
    closeFn: () => void;
  }) => {
    await clerk.createApiKey({
      name: params.name,
      creationReason: params.description,
      secondsUntilExpiration: getTimeLeftInSeconds(params.expiration),
    });
    params.closeFn();
    revalidate();
  };

  const revokeApiKey = async (apiKeyID: string) => {
    await clerk.revokeApiKey({ apiKeyID, revocationReason: 'Revoked by user' });
    setPage(1);
    revalidate();
  };

  return {
    apiKeys: paginatedApiKeys,
    isLoading: isLoading ?? false,
    revokeApiKey,
    search,
    setSearch,
    page,
    setPage,
    pageCount,
    itemCount,
    startingRow,
    endingRow,
    handleCreate,
  };
}
