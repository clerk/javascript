import { useMemo } from 'react';

import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

export function usePlanDetailsQueryCacheKeys(params: { planId: string | null }) {
  const { planId } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.BILLING_PLANS_KEY,
      authenticated: false,
      tracked: {
        planId: planId ?? null,
      },
      untracked: {
        args: {
          id: planId ?? undefined,
        },
      },
    });
  }, [planId]);
}
