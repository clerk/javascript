import { isClerkAPIResponseError } from '@clerk/shared/error';
import { isOrganizationId } from '@clerk/shared/internal/clerk-js/organization';
import { useAPIKeys, useClerk, useSession } from '@clerk/shared/react';
import type { APIKeyResource } from '@clerk/shared/types';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { FormSubmitError } from '../../components/form';
import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useNow } from '../../hooks/use-now';
import { useLocale, useMessages } from '../../localization';
import { formatDate, formatRelativeTime } from './api-keys-table.format';
import { resolveAPIKeysTableMessages } from './api-keys-table.messages';
import type { APIKey, APIKeysTableMessages } from './api-keys-table.types';
import { APIKeysTableView } from './api-keys-table.view';
import type { CreateAPIKeyInput } from './create-api-key.controller';
import { useCreateAPIKeyController } from './create-api-key.controller';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 500;
const READ_PERMISSION = 'org:sys_api_keys:read';
const MANAGE_PERMISSION = 'org:sys_api_keys:manage';

export interface APIKeysTableProps {
  subject: string;
  messages?: Partial<APIKeysTableMessages>;
  fallback?: ReactNode;
}

// -- Model --

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

function useAPIKeysTableModel(subject: string, query: string, messages: APIKeysTableMessages) {
  const clerk = useClerk();
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
    canManage,
    create: async ({ name, expiresAt }: CreateAPIKeyInput) => {
      try {
        const created = await clerk.apiKeys.create({
          name,
          subject,
          secondsUntilExpiration: expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 1000) : undefined,
        });
        void apiKeys.revalidate();
        return created.secret ?? '';
      } catch (error) {
        throw new FormSubmitError({ message: createErrorMessage(error, messages) });
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
  // TODO: Let the model propagate Clerk errors, now that the errors catalog covers token_quota_exceeded and token_creation_conflict, and give useForm an errorFallback so m.createError replaces the raw message.
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

function useApiKeyLabels(apiKeys: APIKeyResource[]): APIKey[] {
  const locale = useLocale();
  const now = useNow({ updateInterval: 60_000 });

  return apiKeys.map(key => ({
    id: key.id,
    name: key.name,
    createdAtLabel: formatDate(key.createdAt, locale),
    expiresAtLabel: key.expiration ? formatDate(key.expiration, locale) : null,
    lastUsedAtLabel: key.lastUsedAt ? formatRelativeTime(key.lastUsedAt, locale, now) : null,
  }));
}

// -- View --

export function APIKeysTable(props: APIKeysTableProps) {
  return (
    <SubjectAPIKeysTable
      key={props.subject}
      {...props}
    />
  );
}

function SubjectAPIKeysTable({ subject, messages: overrides, fallback }: APIKeysTableProps) {
  const messages = resolveAPIKeysTableMessages(
    useMessages('apiKeysTable'),
    isOrganizationId(subject) ? 'organization' : 'user',
    overrides,
  );
  const search = useDebouncedSearch();
  const model = useAPIKeysTableModel(subject, search.query, messages);
  const create = useCreateAPIKeyController({ messages, onCreate: model.create });
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

  if (!model.isLoaded || !model.isAvailable) {
    return fallback ?? null;
  }

  const manage = model.canManage
    ? { onCreate: create.onOpen, createDialog: create.dialog, onRevoke: model.revoke }
    : undefined;

  return (
    <APIKeysTableView
      messages={messages}
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
      {...manage}
    />
  );
}
