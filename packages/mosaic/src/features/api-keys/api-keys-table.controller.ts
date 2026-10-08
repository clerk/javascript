import { useEffect, useRef, useState } from 'react';

import { useNow } from '../../hooks/use-now';
import { useLocale } from '../../localization';
import { formatDate, formatRelativeTime } from './api-keys-table.format';
import { useAPIKeysTableModel } from './api-keys-table.model';
import type { APIKey, APIKeyRecord, APIKeysTableMessages } from './api-keys-table.types';
import { useCreateAPIKeyController } from './create-api-key.controller';

const SEARCH_DEBOUNCE_MS = 500;

export function useAPIKeysTableController(subject: string, messages: APIKeysTableMessages) {
  const [query, setQuery] = useState('');
  const model = useAPIKeysTableModel(subject, query);
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
        setQuery(value.trim());
        model.fetchPage(1);
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
