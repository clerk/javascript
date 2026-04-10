'use client';

import { useMemo } from 'react';

import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { LoadedClerk } from '../../types/clerk';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { useUserBase } from './base/useUserBase';
import { readOAuthConsentFromSearch, useOAuthConsentCacheKeys } from './useOAuthConsent.shared';
import type { UseOAuthConsentParams, UseOAuthConsentReturn } from './useOAuthConsent.types';

const HOOK_NAME = 'useOAuthConsent';

/**
 * The `useOAuthConsent()` hook loads OAuth application consent metadata for the **signed-in** user
 * (`GET /me/oauth/consent/{oauthClientId}`). Ensure the user is authenticated before relying on this hook
 * (for example, redirect to sign-in on your custom consent route).
 *
 * `oauthClientId` and `scope` are optional. On the client, values default from a single snapshot of
 * `window.location.search` (`client_id` and `scope`). Pass them explicitly to override.
 *
 * @internal
 *
 * @example
 * ### From the URL (`?client_id=...&scope=...`)
 *
 * ```tsx
 * import { useOAuthConsent } from '@clerk/react'
 *
 * export default function OAuthConsentPage() {
 *   const { data, isLoading, error } = useOAuthConsent()
 *   // ...
 * }
 * ```
 *
 * @example
 * ### Explicit values (override URL)
 *
 * ```tsx
 * const { data, isLoading, error } = useOAuthConsent({
 *   oauthClientId: clientIdFromProps,
 *   scope: scopeFromProps,
 * })
 * ```
 */
export function useOAuthConsent(params: UseOAuthConsentParams = {}): UseOAuthConsentReturn {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const { oauthClientId: oauthClientIdParam, scope: scopeParam, keepPreviousData = true, enabled = true } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserBase();

  const fromUrl = useMemo(() => {
    if (typeof window === 'undefined' || !window.location) {
      return { oauthClientId: '' };
    }
    return readOAuthConsentFromSearch(window.location.search);
  }, []);

  const oauthClientId = useMemo(() => {
    const raw = oauthClientIdParam !== undefined ? oauthClientIdParam : fromUrl.oauthClientId;
    return raw.trim();
  }, [oauthClientIdParam, fromUrl.oauthClientId]);

  const scope = useMemo(() => {
    return scopeParam !== undefined ? scopeParam : fromUrl.scope;
  }, [scopeParam, fromUrl.scope]);

  clerk.telemetry?.record(eventMethodCalled(HOOK_NAME));

  const { queryKey } = useOAuthConsentCacheKeys({
    userId: user?.id ?? null,
    oauthClientId,
    scope,
  });

  const hasClientId = oauthClientId.length > 0;
  const queryEnabled = Boolean(user) && hasClientId && enabled && clerk.loaded && !!clerk.oauthApplication;

  const query = useClerkQuery({
    queryKey,
    queryFn: () => fetchConsentInfo(clerk, { oauthClientId, scope }),
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
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
