import { useClerk } from '@clerk/shared/react';
import { useState } from 'react';

import { unixEpochToDate } from '../../../utils/date';
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

export const testFakeData = [
  {
    object: 'api_key',
    id: 'ak_391b78b3c0356d365886003bc0bf82ec',
    type: 'api_key',
    subject: 'user_2w6CPzG5HYSgQ0RDTMPcxSt9VTf',
    name: 'cv-api-key',
    scopes: [],
    claims: null,
    revoked: false,
    revocationReason: null,
    expired: false,
    expiration: null,
    createdBy: 'user_2w6CPzG5HYSgQ0RDTMPcxSt9VTf',
    creationReason: null,
    createdAt: unixEpochToDate(1746558122876),
    updatedAt: unixEpochToDate(1746558122876),
  },
  {
    object: 'api_key',
    id: 'ak_207c161bb75c3307cd29875ec749003d',
    type: 'api_key',
    subject: 'user_2w6CPzG5HYSgQ0RDTMPcxSt9VTf',
    name: 'moi-api-key',
    scopes: [],
    claims: null,
    revoked: false,
    revocationReason: null,
    expired: false,
    expiration: null,
    createdBy: 'user_2w6CPzG5HYSgQ0RDTMPcxSt9VTf',
    creationReason: null,
    createdAt: unixEpochToDate(1746736006701),
    updatedAt: unixEpochToDate(1746736006701),
  },
  {
    object: 'api_key',
    id: 'ak_aee92e09468b93050f3e427aefa4a8b4',
    type: 'api_key',
    subject: 'user_2w6CPzG5HYSgQ0RDTMPcxSt9VTf',
    name: 'samson-api-key',
    scopes: [],
    claims: null,
    revoked: false,
    revocationReason: null,
    expired: false,
    expiration: null,
    createdBy: 'user_2w6CPzG5HYSgQ0RDTMPcxSt9VTf',
    creationReason: null,
    createdAt: unixEpochToDate(1746758834447),
    updatedAt: unixEpochToDate(1746758834447),
  },
  {
    object: 'api_key',
    id: 'ak_8ff8da01d421308f1bd84619874e96a8',
    type: 'api_key',
    subject: 'user_2w6CPzG5HYSgQ0RDTMPcxSt9VTf',
    name: 'joshua-tree-api-key',
    scopes: [],
    claims: null,
    revoked: false,
    revocationReason: null,
    expired: false,
    expiration: unixEpochToDate(1749350855253),
    createdBy: 'user_2w6CPzG5HYSgQ0RDTMPcxSt9VTf',
    creationReason: '30 days api key expiration',
    createdAt: unixEpochToDate(1746758855253),
    updatedAt: unixEpochToDate(1746758855253),
  },
];
