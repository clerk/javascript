import { useMemo } from 'react';

import type { ForPayerType } from '@/types/billing';

import { STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

export function useSubscriptionCacheKeys(params: {
  userId: string | undefined;
  orgId: string | undefined;
  for?: ForPayerType;
}) {
  const { userId, orgId, for: forType } = params;
  return useMemo(() => {
    const isOrganization = forType === 'organization';

    const safeOrgId = isOrganization ? orgId : undefined;
    return createCacheKeys({
      stablePrefix: STABLE_KEYS.SUBSCRIPTION_KEY,
      authenticated: true,
      tracked: {
        userId,
        orgId: safeOrgId,
      },
      untracked: {
        args: { orgId: safeOrgId },
      },
    });
  }, [userId, orgId, forType]);
}
