import { ClerkRuntimeError } from '@clerk/shared/error';
import { isOrganizationId } from '@clerk/shared/internal/clerk-js/organization';
import { useAPIKeys, useClerk, useSession } from '@clerk/shared/react';
import type { APIKeyResource } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { save } from '../../utils/errors';
import { ORGANIZATION_PERMISSIONS } from '../../utils/permissions';
import type { APIKeyRecord } from './api-keys-table.types';
import type { CreateAPIKeyInput } from './create-api-key.controller';

export const PAGE_SIZE = 10;

export function useAPIKeysAccess(subject: string | undefined) {
  const { isLoaded, session } = useSession();
  const settings = useMosaicEnvironment()?.apiKeysSettings;
  const isOrganization = subject !== undefined && isOrganizationId(subject);
  const can = (permission: string) => !isOrganization || (session?.checkAuthorization({ permission }) ?? false);
  const canRead = can(ORGANIZATION_PERMISSIONS.apiKeysRead);
  const canManage = can(ORGANIZATION_PERMISSIONS.apiKeysManage);
  const isAvailable =
    subject !== undefined &&
    (isOrganization
      ? session?.lastActiveOrganizationId === subject &&
        Boolean(settings?.orgs_api_keys_enabled) &&
        (canRead || canManage)
      : session?.user.id === subject && Boolean(settings?.user_api_keys_enabled));

  return { isLoaded, isAvailable, canRead, canManage };
}

export function useAPIKeysTableModel(subject: string, pageSize: number, query: string) {
  const clerk = useClerk();
  const { isLoaded, isAvailable, canRead, canManage } = useAPIKeysAccess(subject);
  const apiKeys = useAPIKeys({
    subject,
    query,
    pageSize,
    keepPreviousData: true,
    enabled: isAvailable && canRead,
  });
  const fetchPage = useRef(apiKeys.fetchPage);
  fetchPage.current = apiKeys.fetchPage;
  useEffect(() => {
    fetchPage.current(1);
  }, [query]);

  return {
    isLoaded,
    isAvailable,
    ...apiKeys,
    data: apiKeys.data.map(toAPIKeyRecord),
    canManage,
    create: async ({ name, description, expiresAt }: CreateAPIKeyInput) => {
      let secret = '';
      await save(async () => {
        const created = await clerk.apiKeys.create({
          name,
          description,
          subject,
          secondsUntilExpiration: expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 1000) : undefined,
        });
        void apiKeys.revalidate();
        if (!created.secret) {
          throw new ClerkRuntimeError('The API key was created without a secret.', {
            code: 'api_key_secret_unavailable',
          });
        }
        secret = created.secret;
      });
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
