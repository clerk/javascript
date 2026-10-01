import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useAPIKeys, useClerk, useUser } from '@clerk/shared/react';
import type { APIKeyResource } from '@clerk/shared/types';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useLocale, useMessages } from '../../localization';
import { formatDate, formatRelativeTime } from './user-profile-api-keys.format';
import type { UserProfileAPIKey } from './user-profile-api-keys-panel.types';
import { UserProfileApiKeysPanelView } from './user-profile-api-keys-panel.view';
import type { UserProfileCreateAPIKeyInput } from './user-profile-create-api-key.controller';
import { useUserProfileCreateAPIKeyController } from './user-profile-create-api-key.controller';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 500;

export interface UserProfileApiKeysPanelProps {
  fallback?: ReactNode;
}

// -- Model --

function useUserProfileApiKeysModel(query: string) {
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const m = useMessages('userProfileApiKeysPanel');
  const subject = user?.id ?? '';
  const apiKeys = useAPIKeys({
    subject,
    query,
    pageSize: PAGE_SIZE,
    keepPreviousData: true,
    enabled: Boolean(user),
  });

  return {
    isLoaded,
    ...apiKeys,
    create: async ({ name, expiresAt }: UserProfileCreateAPIKeyInput) => {
      try {
        const created = await clerk.apiKeys.create({
          name,
          subject,
          secondsUntilExpiration: expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 1000) : undefined,
        });
        void apiKeys.revalidate();
        return created.secret ?? '';
      } catch (error) {
        throw new Error(createErrorMessage(error, m));
      }
    },
    revoke: async (id: string) => {
      await clerk.apiKeys.revoke({ apiKeyID: id });
      await apiKeys.revalidate();
    },
  };
}

function createErrorMessage(
  error: unknown,
  m: { createError: string; nameTakenError: string; quotaExceededError: string },
): string {
  if (isClerkAPIResponseError(error)) {
    const code = error.errors[0]?.code;
    if (code === 'token_quota_exceeded') {
      return m.quotaExceededError;
    }
    if (code === 'token_creation_conflict') {
      return m.nameTakenError;
    }
  }
  return error instanceof Error ? error.message : m.createError;
}

// -- Controllers --

function useDebouncedSearch() {
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return {
    searchValue,
    query,
    onSearchChange: (value: string) => {
      setSearchValue(value);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setQuery(value.trim());
      }, SEARCH_DEBOUNCE_MS);
    },
  };
}

function useApiKeyLabels(apiKeys: APIKeyResource[]): UserProfileAPIKey[] {
  const locale = useLocale();
  const now = new Date();

  return apiKeys.map(key => ({
    id: key.id,
    name: key.name,
    createdAtLabel: formatDate(key.createdAt, locale),
    expiresAtLabel: key.expiration ? formatDate(key.expiration, locale) : null,
    lastUsedAtLabel: key.lastUsedAt ? formatRelativeTime(key.lastUsedAt, locale, now) : null,
  }));
}

// -- View --

export function UserProfileApiKeysPanel({ fallback }: UserProfileApiKeysPanelProps) {
  const search = useDebouncedSearch();
  const model = useUserProfileApiKeysModel(search.query);
  const create = useUserProfileCreateAPIKeyController({ onCreate: model.create });
  const apiKeys = useApiKeyLabels(model.data);
  const { isFetching, page, pageCount, fetchPage } = model;
  const searchedQuery = useRef(search.query);

  useEffect(() => {
    if (searchedQuery.current !== search.query) {
      searchedQuery.current = search.query;
      fetchPage(1);
    }
  }, [search.query, fetchPage]);

  useEffect(() => {
    if (!isFetching && pageCount > 0 && page > pageCount) {
      fetchPage(pageCount);
    }
  }, [isFetching, page, pageCount, fetchPage]);

  if (!model.isLoaded) {
    return fallback ?? null;
  }

  return (
    <UserProfileApiKeysPanelView
      apiKeys={apiKeys}
      totalCount={model.count}
      page={model.page}
      pageSize={PAGE_SIZE}
      searchValue={search.searchValue}
      isLoading={model.isLoading}
      isFetching={model.isFetching}
      isError={model.isError}
      onRetry={() => void model.revalidate()}
      onPageChange={model.fetchPage}
      onSearchChange={search.onSearchChange}
      onCreate={create.onOpen}
      createDialog={create.dialog}
      onRevoke={model.revoke}
    />
  );
}
