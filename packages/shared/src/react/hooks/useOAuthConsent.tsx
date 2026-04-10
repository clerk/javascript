'use client';

import { useCallback } from 'react';

import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { GetOAuthConsentInfoParams } from '../../types';
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
 * @example
 * ### Basic usage
 *
 * ```tsx
 * import { useOAuthConsent } from '@clerk/react'
 *
 * export default function OAuthConsentPage({ clientId, scope }: { clientId: string; scope?: string }) {
 *   const { data, isLoading, error } = useOAuthConsent({ oauthClientId: clientId, scope })
 *
 *   if (isLoading) return <div>Loading…</div>
 *   if (error) return <div>Unable to load consent</div>
 *
 *   return <div>{data?.oauthApplicationName}</div>
 * }
 * ```
 */
export function useOAuthConsent(params: UseOAuthConsentParams): UseOAuthConsentReturn {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const { oauthClientId, scope, keepPreviousData = true, enabled = true } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserBase();

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
