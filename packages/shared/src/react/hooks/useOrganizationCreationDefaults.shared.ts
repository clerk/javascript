import { useMemo } from 'react';

import { STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

export function useOrganizationCreationDefaultsCacheKeys(params: { userId: string | null }) {
  const { userId } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: STABLE_KEYS.ORGANIZATION_CREATION_DEFAULTS_KEY,
      authenticated: Boolean(userId),
      tracked: {
        userId: userId ?? null,
      },
      untracked: {
        args: {},
      },
    });
  }, [userId]);
}
