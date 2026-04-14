import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { LoadedClerk } from '../../types/clerk';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { useUserBase } from './base/useUserBase';
import { useOAuthConsentCacheKeys } from './useOAuthConsent.shared';
import type { UseOAuthConsentParams, UseOAuthConsentReturn } from './useOAuthConsent.types';

const HOOK_NAME = 'useOAuthConsent';

/**
 * The `useOAuthConsent()` hook loads OAuth application consent metadata for the **signed-in** user
 * (`GET /me/oauth/consent/{oauthClientId}`). Ensure the user is authenticated before relying on this hook
 * (for example, redirect to sign-in on your custom consent route).
 *
 * The hook is a pure data fetcher: it takes an explicit `oauthClientId` and optional `scope` and
 * issues the fetch when both the user is signed in and `oauthClientId` is non-empty. The query is
 * disabled when `oauthClientId` is empty or omitted.
 *
 * @internal
 *
 * @example
 * ```tsx
 * import { useOAuthConsent } from '@clerk/react/internal'
 *
 * const { data, isLoading, error } = useOAuthConsent({
 *   oauthClientId: clientIdFromProps,
 *   scope: scopeFromProps,
 * })
 * ```
 */
export function useOAuthConsent(params: UseOAuthConsentParams = {}): UseOAuthConsentReturn {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const { oauthClientId: oauthClientIdParam, scope, keepPreviousData = true, enabled = true } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserBase();

  const oauthClientId = (oauthClientIdParam ?? '').trim();

  clerk.telemetry?.record(eventMethodCalled(HOOK_NAME));

  const { queryKey } = useOAuthConsentCacheKeys({
    userId: user?.id ?? null,
    oauthClientId,
    scope,
  });

  const hasClientId = oauthClientId.length > 0;
  const queryEnabled = Boolean(user) && hasClientId && enabled && clerk.loaded;

  const query = useClerkQuery({
    queryKey,
    queryFn: () => fetchConsentInfo(clerk, { oauthClientId, scope }),
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData && queryEnabled),
  });

  return {
    data: query.data,
    error: (query.error ?? null) as UseOAuthConsentReturn['error'],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}

function fetchConsentInfo(clerk: LoadedClerk, params: { oauthClientId: string; scope?: string }) {
  const { oauthClientId, scope } = params;
  return clerk.oauthApplication.getConsentInfo(scope !== undefined ? { oauthClientId, scope } : { oauthClientId });
}
