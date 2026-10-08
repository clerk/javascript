import type { APIKeyResource } from '@clerk/shared/types';

import { localizationKeys } from '@/ui/customizables';
import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';
import { timeAgo } from '@/ui/utils/timeAgo';

import type { APIKeyRowData, APIKeysTableData } from './api-keys.types';

export interface APIKeysTableProps {
  rows: APIKeyResource[];
  isLoading: boolean;
  onRevoke: (id: string, name: string) => void;
  elementDescriptor?: ElementDescriptor;
  canManageAPIKeys: boolean;
}

export const toAPIKeyRow = (apiKey: APIKeyResource): APIKeyRowData => ({
  id: apiKey.id,
  name: apiKey.name,
  createdStatus: apiKey.expiration
    ? localizationKeys('apiKeys.createdAndExpirationStatus__expiresOn', {
        createdDate: new Date(apiKey.createdAt.getTime()),
        expiresDate: new Date(apiKey.expiration.getTime()),
      })
    : localizationKeys('apiKeys.createdAndExpirationStatus__never', {
        createdDate: new Date(apiKey.createdAt.getTime()),
      }),
  lastUsed: apiKey.lastUsedAt ? timeAgo(apiKey.lastUsedAt) : '-',
});

export const useAPIKeysTableModel = ({
  rows,
  isLoading,
  elementDescriptor,
  canManageAPIKeys,
  onRevoke,
}: APIKeysTableProps): APIKeysTableData => ({
  rows: rows.map(apiKey => ({
    ...toAPIKeyRow(apiKey),
    onRevoke: () => onRevoke(apiKey.id, apiKey.name),
  })),
  isLoading,
  elementDescriptor,
  canManageAPIKeys,
});
