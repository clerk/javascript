import { useEffect, useReducer, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { useDebounce } from '@/ui/hooks';
import { handleError } from '@/ui/utils/errorHandler';

import type {
  APIKeyCreateParams,
  APIKeysPageData,
  APIKeysPageModel,
  APIKeysPageProps,
  APIKeysSearchData,
} from './api-keys.types';

const apiKeysSearchDebounceMs = 500;

type PageState = {
  createPhase: 'idle' | 'creating' | 'copy';
  copyKey: { name: string; secret: string } | null;
  revoke: { id: string; name: string } | null;
};

type PageEvent =
  | { type: 'CREATE' }
  | { type: 'CREATED'; key: { name: string; secret: string } }
  | { type: 'CREATE_FAILED' }
  | { type: 'OPEN_COPY' }
  | { type: 'CLOSE_COPY' }
  | { type: 'OPEN_REVOKE'; id: string; name: string }
  | { type: 'CLOSE_REVOKE' };

const pageReducer = (state: PageState, event: PageEvent): PageState => {
  switch (event.type) {
    case 'CREATE':
      return { ...state, createPhase: 'creating' };
    case 'CREATED':
      return { ...state, createPhase: 'copy', copyKey: event.key };
    case 'CREATE_FAILED':
    case 'CLOSE_COPY':
      return { ...state, createPhase: 'idle' };
    case 'OPEN_COPY':
      return { ...state, createPhase: 'copy' };
    case 'OPEN_REVOKE':
      return { ...state, revoke: { id: event.id, name: event.name } };
    case 'CLOSE_REVOKE':
      return { ...state, revoke: null };
  }
};

export const useAPIKeysSearchController = (): APIKeysSearchData => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, apiKeysSearchDebounceMs);

  return { searchValue, setSearchValue, query: debouncedSearchValue.trim() };
};

export const useAPIKeysPageController = (
  model: APIKeysPageModel,
  props: APIKeysPageProps,
  search: APIKeysSearchData,
): APIKeysPageData => {
  const card = useCardState();
  const [state, dispatch] = useReducer(pageReducer, { createPhase: 'idle', copyKey: null, revoke: null });
  const isMounted = useRef(true);
  const pendingCreation = useRef<Promise<void> | null>(null);
  const latest = useRef({ model, card });
  latest.current = { model, card };
  const scopeKey = useRef(model.scopeKey);
  const canRun = () =>
    isMounted.current && latest.current.model.scopeKey === scopeKey.current && latest.current.model.canRun();
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const createAPIKey = async (params: APIKeyCreateParams) => {
    try {
      dispatch({ type: 'CREATE' });
      const key = await latest.current.model.createAPIKey(params, canRun);
      if (!canRun()) {
        return;
      }
      if (!key) {
        return;
      }
      latest.current.card.setError(undefined);
      dispatch({ type: 'CREATED', key: { name: key.name, secret: key.secret || '' } });
    } catch (error) {
      if (!canRun()) {
        return;
      }
      dispatch({ type: 'CREATE_FAILED' });
      switch (latest.current.model.getCreateErrorCode(error)) {
        case 'token_quota_exceeded':
          latest.current.card.setError(latest.current.model.quotaErrorText);
          break;
        case 'token_creation_conflict':
          latest.current.card.setError(latest.current.model.conflictErrorText);
          break;
        default:
          handleError(error as Error, [], latest.current.card.setError);
      }
    }
  };

  const handleCreateAPIKey = (params: APIKeyCreateParams): Promise<void> => {
    if (!canRun()) {
      return Promise.resolve();
    }
    if (pendingCreation.current) {
      return pendingCreation.current;
    }
    const pending = createAPIKey(params).finally(() => {
      pendingCreation.current = null;
    });
    pendingCreation.current = pending;
    return pending;
  };

  return {
    searchValue: search.searchValue,
    searchPlaceholder: model.searchPlaceholder,
    setSearchValue: value => {
      if (canRun()) {
        search.setSearchValue(value);
      }
    },
    canManageAPIKeys: model.canManageAPIKeys,
    rows: model.rows.map(row => ({
      ...row,
      onRevoke: () => {
        if (canRun()) {
          dispatch({ type: 'OPEN_REVOKE', id: row.id, name: row.name });
        }
      },
    })),
    isLoading: model.isLoading,
    page: model.page,
    pageCount: model.pageCount,
    itemCount: model.itemCount,
    startingRow: model.startingRow,
    endingRow: model.endingRow,
    onPageChange: (newPage: number) => {
      if (canRun()) {
        latest.current.model.fetchPage(newPage);
      }
    },
    handleCreateAPIKey,
    isCopyModalOpen: state.createPhase === 'copy',
    onOpenCopyModal: () => {
      if (canRun() && state.copyKey) {
        dispatch({ type: 'OPEN_COPY' });
      }
    },
    onCloseCopyModal: () => {
      if (canRun()) {
        dispatch({ type: 'CLOSE_COPY' });
      }
    },
    copyKeyName: state.copyKey?.name ?? '',
    copyKeySecret: state.copyKey?.secret ?? '',
    isRevokeModalOpen: !!state.revoke,
    onOpenRevokeModal: () => {
      if (canRun() && state.revoke) {
        dispatch({ type: 'OPEN_REVOKE', ...state.revoke });
      }
    },
    onCloseRevokeModal: () => {
      if (canRun()) {
        dispatch({ type: 'CLOSE_REVOKE' });
      }
    },
    revokeKeyId: state.revoke?.id ?? '',
    revokeKeyName: state.revoke?.name ?? '',
    onRevokeSuccess: async () => {
      if (canRun()) {
        await latest.current.model.invalidateAll();
      }
    },
    revokeModalRoot: props.revokeModalRoot,
  };
};
