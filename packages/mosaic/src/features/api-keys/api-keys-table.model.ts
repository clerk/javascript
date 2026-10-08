import { isOrganizationId } from '@clerk/shared/internal/clerk-js/organization';
import { useAPIKeys, useClerk, useSession } from '@clerk/shared/react';
import type { APIKeyResource } from '@clerk/shared/types';
import { useState } from 'react';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { save } from '../../utils/errors';
import type { APIKeyRecord } from './api-keys-table.types';
import type { CreateAPIKeyInput } from './create-api-key.controller';

export const PAGE_SIZE = 10;
const READ_PERMISSION = 'org:sys_api_keys:read';
const MANAGE_PERMISSION = 'org:sys_api_keys:manage';

export function useAPIKeysAccess(subject: string | undefined) {
  const { isLoaded, session } = useSession();
  const settings = useMosaicEnvironment()?.apiKeysSettings;
  const isOrganization = subject !== undefined && isOrganizationId(subject);
  const can = (permission: string) => !isOrganization || (session?.checkAuthorization({ permission }) ?? false);
  const canRead = can(READ_PERMISSION);
  const canManage = can(MANAGE_PERMISSION);
  const isAvailable =
    subject !== undefined &&
    (isOrganization
      ? session?.lastActiveOrganizationId === subject &&
        Boolean(settings?.orgs_api_keys_enabled) &&
        (canRead || canManage)
      : session?.user.id === subject && Boolean(settings?.user_api_keys_enabled));

  return { isLoaded, isAvailable, canRead, canManage };
}

export function useAPIKeysTableModel(subject: string) {
  const clerk = useClerk();
  const [query, setQuery] = useState('');
  const { isLoaded, isAvailable, canRead, canManage } = useAPIKeysAccess(subject);
  const apiKeys = useAPIKeys({
    subject,
    query,
    pageSize: PAGE_SIZE,
    keepPreviousData: true,
    enabled: isAvailable && canRead,
  });

  return {
    isLoaded,
    isAvailable,
    ...apiKeys,
    data: apiKeys.data.map(toAPIKeyRecord),
    canManage,
    search: (nextQuery: string) => {
      setQuery(nextQuery);
      apiKeys.fetchPage(1);
    },
    create: async ({ name, expiresAt }: CreateAPIKeyInput) => {
      let secret = '';
      await save(async () => {
        const created = await clerk.apiKeys.create({
          name,
          subject,
          secondsUntilExpiration: expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 1000) : undefined,
        });
        secret = created.secret ?? '';
      });
      void apiKeys.revalidate();
      return secret;
    },
    revoke: async (id: string) => {
      await clerk.apiKeys.revoke({ apiKeyID: id });
      await apiKeys.revalidate();
    },
  };
}

function toAPIKeyRecord(key: APIKeyResource): APIKeyRecord {
  return {
    id: key.id,
    name: key.name,
    createdAt: key.createdAt,
    expiration: key.expiration,
    lastUsedAt: key.lastUsedAt,
  };
}

export type APIKeysTableModel = ReturnType<typeof useAPIKeysTableModel>;
