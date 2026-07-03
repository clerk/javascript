import { useMemo } from 'react';

import { STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

export function useOAuthConsentCacheKeys(params: {
  userId: string | null;
  oauthClientId: string;
  scope?: string;
  redirectUri?: string;
}) {
  const { userId, oauthClientId, scope, redirectUri } = params;
  return useMemo(() => {
    const args = {
      oauthClientId,
      ...(scope !== undefined && { scope }),
      ...(redirectUri !== undefined && { redirectUri }),
    };
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
  }, [userId, oauthClientId, scope, redirectUri]);
}
