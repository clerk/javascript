import { isClerkAPIResponseError } from '@clerk/shared/error';
import { isOrganizationId } from '@clerk/shared/internal/clerk-js/organization';
import { __internal_useOrganizationBase, useAPIKeys, useClerk, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { useProtect } from '@/ui/common';
import { useAPIKeysContext } from '@/ui/contexts';
import { localizationKeys, useLocalizations } from '@/ui/customizables';

import type { APIKeyCreateParams, APIKeyRequestScope, APIKeysPageModel, APIKeysPageProps } from './api-keys.types';
import { toAPIKeyRow } from './api-keys-table.model';
import { useAPIKeysPagination } from './utils';

const API_KEYS_PAGE_SIZE = 10;

export const useAPIKeysPageModel = (
  { subject, perPage, query }: APIKeysPageProps & { query: string },
  scope: APIKeyRequestScope,
): APIKeysPageModel => {
  const isOrg = isOrganizationId(subject);
  const canReadAPIKeys = useProtect({ permission: 'org:sys_api_keys:read' });
  const canManageAPIKeys = useProtect({ permission: 'org:sys_api_keys:manage' });
  const pageSize = perPage ?? API_KEYS_PAGE_SIZE;
  const {
    data: apiKeys,
    isLoading,
    isFetching,
    page,
    fetchPage,
    pageCount,
    count: itemCount,
    revalidate: invalidateAll,
  } = useAPIKeys({
    subject,
    pageSize,
    query,
    keepPreviousData: true,
    enabled: scope.canRun() && (isOrg ? canReadAPIKeys : true),
  });

  const latest = useRef({ fetchPage, invalidateAll });
  latest.current = { fetchPage, invalidateAll };
  const fetchCurrentPage = (nextPage: number) => {
    if (scope.canRun()) {
      latest.current.fetchPage(nextPage);
    }
  };
  useAPIKeysPagination({ query, page, pageCount, isFetching, fetchPage: fetchCurrentPage });

  const clerk = useClerk();
  const { t } = useLocalizations();

  const canRead = scope.canRun() && (!isOrg || canReadAPIKeys);
  return {
    ...scope,
    rows: canRead ? apiKeys.map(toAPIKeyRow) : [],
    isLoading,
    page,
    pageCount: canRead ? pageCount : 0,
    itemCount: canRead ? itemCount : 0,
    startingRow: canRead && itemCount > 0 ? Math.max(0, (page - 1) * pageSize) + 1 : 0,
    endingRow: canRead ? Math.min(page * pageSize, itemCount) : 0,
    canManageAPIKeys: scope.canRun() && ((isOrg && canManageAPIKeys) || !isOrg),
    searchPlaceholder: t(localizationKeys('apiKeys.action__search')),
    quotaErrorText: t(localizationKeys('unstable__errors.api_key_usage_exceeded')),
    conflictErrorText: t(localizationKeys('unstable__errors.api_key_name_already_exists')),
    fetchPage: fetchCurrentPage,
    invalidateAll: async () => {
      if (scope.canRun()) {
        await latest.current.invalidateAll();
      }
    },
    createAPIKey: async (params: APIKeyCreateParams, canContinue = () => true) => {
      const isCurrent = () => scope.canRun() && canContinue();
      if (!isCurrent()) {
        return;
      }
      try {
        const apiKey = await clerk.apiKeys.create({ ...params, subject });
        if (!isCurrent()) {
          return;
        }
        void latest.current.invalidateAll().catch(() => {});
        return { name: apiKey.name, secret: apiKey.secret ?? '' };
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return undefined;
      }
    },
    getCreateErrorCode: (error: unknown) => (isClerkAPIResponseError(error) ? error.errors?.[0]?.code : undefined),
  };
};

export const useAPIKeysModel = () => {
  const ctx = useAPIKeysContext();
  const { user } = useUser();
  const organization = __internal_useOrganizationBase();

  return {
    subject: organization?.id ?? user?.id ?? '',
    perPage: ctx.perPage,
  };
};
