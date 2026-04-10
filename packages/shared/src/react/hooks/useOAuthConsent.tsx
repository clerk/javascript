'use client';

import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { GetOAuthConsentInfoParams } from '../../types';
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
 * **`oauthClientId` and `scope` are optional.** On the client, values default from a **single snapshot** of
 * `window.location.search` (`client_id` and `scope`). Pass them explicitly to override; see {@link UseOAuthConsentParams}.
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

  const [searchSnapshot, setSearchSnapshot] = useState(() =>
    typeof window !== 'undefined' ? window.location.search : '',
  );

  useLayoutEffect(() => {
    setSearchSnapshot(window.location.search);
  }, []);

  const fromUrl = useMemo(() => readOAuthConsentFromSearch(searchSnapshot), [searchSnapshot]);

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

  const getConsentInfo = clerk.oauthApplication?.getConsentInfo;
  const hasClientId = oauthClientId.length > 0;
  const queryEnabled = Boolean(user) && hasClientId && enabled && clerk.loaded && typeof getConsentInfo === 'function';

  const queryFn = useCallback(() => {
    if (!getConsentInfo) {
      return Promise.reject(new Error('OAuth consent is not available in this Clerk instance'));
    }
    const p: GetOAuthConsentInfoParams = scope !== undefined ? { oauthClientId, scope } : { oauthClientId };
    return getConsentInfo(p);
  }, [getConsentInfo, oauthClientId, scope]);

  const query = useClerkQuery({
    queryKey,
    queryFn,
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
