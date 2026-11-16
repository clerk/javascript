import { useRef, useState } from 'react';

import { useConfirmController } from '../../blocks/confirm';
import { useDebouncedAsync } from '../../hooks/use-debounced-async';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
import { useNow } from '../../hooks/use-now';
import { useLocale } from '../../localization';
import { formatDate } from '../../utils/format-date';
import { formatRelativeTime } from './api-keys-table.format';
import type { APIKeysTableModel } from './api-keys-table.model';
import type { APIKey, APIKeyRecord, APIKeysTableMessages } from './api-keys-table.types';
import { useCreateAPIKeyController } from './create-api-key.controller';

export interface APIKeysTableControllerOptions {
  showDescription: boolean;
  messages: APIKeysTableMessages;
}

export function useAPIKeysTableController(
  model: APIKeysTableModel,
  { showDescription, messages }: APIKeysTableControllerOptions,
) {
  const locale = useLocale();
  const now = useNow({ updateInterval: 60_000 });
  const create = useCreateAPIKeyController({ messages, showDescription, onCreate: model.create });
  const apiKeys = model.data.map(key => toAPIKey(key, locale, now));
  const searchInputRef = useRef<HTMLInputElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: apiKeys.map(key => key.id),
    onRemove: model.canManage
      ? async id => {
          const emptiesPage = model.page > 1 && model.data.length === 1;
          await model.revoke(id);
          if (emptiesPage) {
            model.fetchPage(model.page - 1);
          }
        }
      : undefined,
    fallback: () => createButtonRef.current ?? searchInputRef.current,
  });
  const revoke = useConfirmController<APIKey>({
    onConfirm: key => removalFocus.remove(key.id),
    errorFallback: messages.revokeError,
  });

  return {
    isLoaded: model.isLoaded,
    isAvailable: model.isAvailable,
    apiKeys,
    searchInputRef,
    createButtonRef,
    registerTrigger: removalFocus.registerTrigger,
    finalFocus: removalFocus.finalFocus,
    totalCount: model.count,
    page: model.page,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: () => void model.revalidate(),
    onPageChange: model.fetchPage,
    manage: model.canManage ? { onCreate: create.onOpen, createDialog: create.dialog, revoke } : undefined,
  };
}

export function useAPIKeysTableSearchController() {
  const [searchValue, setSearchValue] = useState('');
  const query = useDebouncedAsync(searchValue, value => Promise.resolve(value.trim()), { delayMs: 500 });
  return { searchValue, onSearchChange: setSearchValue, query: query.data ?? '' };
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
