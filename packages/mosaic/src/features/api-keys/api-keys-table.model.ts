import { ClerkRuntimeError } from '@clerk/shared/error';
import { isOrganizationId } from '@clerk/shared/internal/clerk-js/organization';
import { useAPIKeys, useClerk, useSession } from '@clerk/shared/react';
import type { APIKeyResource } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { ORGANIZATION_PERMISSIONS } from '../../utils/permissions';
import type { ClerkCall } from '../clerk/errors';
import { callClerk } from '../clerk/errors';
import type { APIKeyRecord } from './api-keys-table.types';
import type { CreateAPIKeyInput } from './create-api-key.controller';

export const PAGE_SIZE = 10;

export interface APIKeysAccess {
  isLoaded: boolean;
  isAvailable: boolean;
  canRead: boolean;
  canManage: boolean;
}

export interface APIKeysTableModel {
  isLoaded: boolean;
  isAvailable: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  data: APIKeyRecord[];
  count: number;
  page: number;
  fetchPage: (page: number) => void;
  revalidate: () => unknown;
  canManage: boolean;
  create: (input: CreateAPIKeyInput) => ClerkCall<string>;
  revoke: (id: string) => ClerkCall;
}

export function useAPIKeysAccess(subject: string | undefined): APIKeysAccess {
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

export function useAPIKeysTableModel(subject: string, pageSize: number, query: string): APIKeysTableModel {
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
  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
  fetchPage.current = apiKeys.fetchPage;
  useEffect(() => {
    fetchPage.current(1);
  }, [query]);

  return {
    isLoaded,
    isAvailable,
    isLoading: apiKeys.isLoading,
    isFetching: apiKeys.isFetching,
    isError: apiKeys.isError,
    data: apiKeys.data.map(toAPIKeyRecord),
    count: apiKeys.count,
    page: apiKeys.page,
    fetchPage: apiKeys.fetchPage,
    revalidate: apiKeys.revalidate,
    canManage,
    create: ({ name, description, expiresAt }) =>
      callClerk(async () => {
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
        return created.secret;
      }),
    revoke: id =>
      callClerk(async () => {
        await clerk.apiKeys.revoke({ apiKeyID: id });
        await apiKeys.revalidate();
      }),
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
