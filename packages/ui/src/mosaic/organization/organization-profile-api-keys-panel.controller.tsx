import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useAPIKeys, useClerk, useOrganization, useSession } from '@clerk/shared/react';
import { useEffect, useRef, useState } from 'react';

import { useMachine } from '../machine/useMachine';
import type { OrganizationProfileApiKeysPanelViewProps } from './organization-profile-api-keys-panel.view';
import { organizationProfileApiKeysPanelCreateMachine } from './organization-profile-api-keys-panel-create.machine';
import { organizationProfileApiKeysPanelRevokeMachine } from './organization-profile-api-keys-panel-revoke.machine';

const API_KEYS_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 500;
/** The word the user must type to confirm a revocation (mirrors the legacy confirmation text). */
const REVOKE_CONFIRMATION_TEXT = 'Revoke';

/**
 * Maps a failed `apiKeys.create` into a user-facing message. Mirrors the legacy switch on
 * `err.errors[0].code` (`APIKeys.tsx`) so the machine can stay Clerk-free — it only stores a string.
 */
export function mapCreateApiKeyError(err: unknown): string {
  const fallback = 'Something went wrong. Please try again.';
  if (!isClerkAPIResponseError(err)) {
    return err instanceof Error ? err.message : fallback;
  }
  switch (err.errors?.[0]?.code) {
    case 'token_quota_exceeded':
      return 'You have reached your usage limit. You can remove the limit by upgrading to a paid plan.';
    case 'token_creation_conflict':
      return 'API Key name already exists.';
    default:
      return err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message ?? fallback;
  }
}

/** Re-renders `delayMs` after `value` last changed. Local so Mosaic stays self-contained. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

type OrganizationProfileApiKeysPanelController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | ({ status: 'ready' } & OrganizationProfileApiKeysPanelViewProps);

interface UseControllerOptions {
  perPage?: number;
  showDescription?: boolean;
}

export function useOrganizationProfileApiKeysPanelController(
  options: UseControllerOptions = {},
): OrganizationProfileApiKeysPanelController {
  const { perPage = API_KEYS_PAGE_SIZE, showDescription = false } = options;

  const { isLoaded: isOrganizationLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const clerk = useClerk();

  const [searchValue, setSearchValue] = useState('');
  const query = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS).trim();

  // Reads are gated by permission for organizations; an unresolved session yields `false` so the
  // fetch stays disabled until we definitively know the caller may read.
  const canRead = session?.checkAuthorization({ permission: 'org:sys_api_keys:read' }) ?? false;
  const canManage = session?.checkAuthorization({ permission: 'org:sys_api_keys:manage' }) ?? false;
  const subject = organization?.id ?? '';

  const { data, isLoading, isFetching, page, fetchPage, pageCount, count, revalidate } = useAPIKeys({
    subject,
    pageSize: perPage,
    query,
    keepPreviousData: true,
    enabled: canRead && subject !== '',
  });

  // Reset to the first page whenever the query changes (replicates useAPIKeysPagination).
  const previousQueryRef = useRef(query);
  useEffect(() => {
    if (previousQueryRef.current !== query) {
      previousQueryRef.current = query;
      fetchPage(1);
    }
  }, [query, fetchPage]);

  // Clamp back into range after a deletion empties the last page.
  useEffect(() => {
    if (!isFetching && pageCount > 0 && page > pageCount) {
      fetchPage(Math.max(1, pageCount));
    }
  }, [pageCount, page, isFetching, fetchPage]);

  const [createSnapshot, sendCreate, createActor] = useMachine(organizationProfileApiKeysPanelCreateMachine, {
    context: {
      showDescription,
      createAPIKey: async params => {
        try {
          const apiKey = await clerk.apiKeys.create({ ...params, subject });
          void revalidate();
          return { name: apiKey.name, secret: apiKey.secret ?? '' };
        } catch (err) {
          throw new Error(mapCreateApiKeyError(err));
        }
      },
    },
  });

  const [revokeSnapshot, sendRevoke, revokeActor] = useMachine(organizationProfileApiKeysPanelRevokeMachine, {
    context: {
      confirmationText: REVOKE_CONFIRMATION_TEXT,
      revokeAPIKey: async apiKeyId => {
        await clerk.apiKeys.revoke({ apiKeyID: apiKeyId });
        void revalidate();
      },
    },
  });

  // Both the organization and session must be resolved before the permission gate is meaningful.
  if (!isOrganizationLoaded || !isSessionLoaded) {
    return { status: 'loading' };
  }

  if (!organization || !canRead) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    list: {
      rows: data.map(key => ({
        id: key.id,
        name: key.name,
        createdAt: key.createdAt,
        expiration: key.expiration,
        lastUsedAt: key.lastUsedAt,
      })),
      isLoading,
      page,
      pageCount,
      itemCount: count,
      onPageChange: (newPage: number) => fetchPage(newPage),
      searchValue,
      onSearchChange: setSearchValue,
    },
    canManage,
    create: {
      snapshot: createSnapshot,
      send: sendCreate,
      canSubmit: createActor.can({ type: 'SUBMIT' }),
      showDescription,
    },
    revoke: {
      snapshot: revokeSnapshot,
      send: sendRevoke,
      canConfirm: revokeActor.can({ type: 'CONFIRM' }),
    },
  };
}
