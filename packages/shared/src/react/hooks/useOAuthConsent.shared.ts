import { useMemo } from 'react';

import type { GetOAuthConsentInfoParams } from '../../types';
import { STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

/**
 * Parses OAuth authorize-style query data from a search string (typically `window.location.search`).
 *
 * @internal
 */
export function readOAuthConsentFromSearch(search: string): {
  oauthClientId: string;
  scope?: string;
} {
  const sp = new URLSearchParams(search);
  const oauthClientId = sp.get('client_id') ?? '';
  const scopeValue = sp.get('scope');
  if (scopeValue === null) {
    return { oauthClientId };
  }
  return { oauthClientId, scope: scopeValue };
}

export function useOAuthConsentCacheKeys(params: { userId: string | null; oauthClientId: string; scope?: string }) {
  const { userId, oauthClientId, scope } = params;
  return useMemo(() => {
    const args: Pick<GetOAuthConsentInfoParams, 'oauthClientId'> & { scope?: string } = { oauthClientId };
    if (scope !== undefined) {
      args.scope = scope;
    }
    return createCacheKeys({
      stablePrefix: STABLE_KEYS.OAUTH_CONSENT_INFO_KEY,
      authenticated: true,
      tracked: {
        userId: userId ?? null,
      },
      untracked: {
        args,
      },
    });
  }, [userId, oauthClientId, scope]);
}
