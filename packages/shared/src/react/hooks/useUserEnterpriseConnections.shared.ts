import { useMemo } from 'react';

import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

/**
 * @internal
 */
export function useUserEnterpriseConnectionsCacheKeys(params: { userId: string | null }) {
  const { userId } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.USER_ENTERPRISE_CONNECTIONS_KEY,
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
