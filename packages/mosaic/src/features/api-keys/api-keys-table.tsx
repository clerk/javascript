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
import type { APIKey, APIKeyRecord, APIKeysTableMessages } from './api-keys-table.types';
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

function useAPIKeysTableModel(subject: string, messages: APIKeysTableMessages) {
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

function toAPIKeyRecord(key: APIKeyResource): APIKeyRecord {
  return {
    id: key.id,
    name: key.name,
    createdAt: key.createdAt,
    expiration: key.expiration,
    lastUsedAt: key.lastUsedAt,
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

// -- Controller --

type APIKeysTableModel = ReturnType<typeof useAPIKeysTableModel>;

function useAPIKeysTableController(model: APIKeysTableModel, messages: APIKeysTableMessages) {
  const locale = useLocale();
  const now = useNow({ updateInterval: 60_000 });
  const [searchValue, setSearchValue] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const create = useCreateAPIKeyController({ messages, onCreate: model.create });

  useEffect(() => () => clearTimeout(timer.current), []);

  return {
    isLoaded: model.isLoaded,
    isAvailable: model.isAvailable,
    apiKeys: model.data.map(key => toAPIKey(key, locale, now)),
    totalCount: model.count,
    page: model.page,
    searchValue,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: () => void model.revalidate(),
    onPageChange: model.fetchPage,
    onSearchChange: (value: string) => {
      setSearchValue(value);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        model.search(value.trim());
      }, SEARCH_DEBOUNCE_MS);
    },
    manage: model.canManage
      ? {
          onCreate: create.onOpen,
          createDialog: create.dialog,
          onRevoke: async (id: string) => {
            const emptiesPage = model.page > 1 && model.data.length === 1;
            await model.revoke(id);
            if (emptiesPage) {
              model.fetchPage(model.page - 1);
            }
          },
        }
      : undefined,
  };
}

function toAPIKey(key: APIKeyRecord, locale: string, now: Date): APIKey {
  return {
    id: key.id,
    name: key.name,
    createdAtLabel: formatDate(key.createdAt, locale),
    expiresAtLabel: key.expiration ? formatDate(key.expiration, locale) : null,
    lastUsedAtLabel: key.lastUsedAt ? formatRelativeTime(key.lastUsedAt, locale, now) : null,
  };
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
  const model = useAPIKeysTableModel(subject, messages);
  const { isLoaded, isAvailable, manage, ...controller } = useAPIKeysTableController(model, messages);

  if (!isLoaded || !isAvailable) {
    return fallback ?? null;
  }

  return (
    <APIKeysTableView
      messages={messages}
      pageSize={PAGE_SIZE}
      {...controller}
      {...manage}
    />
  );
}
