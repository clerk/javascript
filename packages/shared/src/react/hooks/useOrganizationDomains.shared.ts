import { useMemo } from 'react';

import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

/**
 * @internal
 */
export function useOrganizationDomainsCacheKeys(params: { organizationId: string | null; enrollmentMode?: string }) {
  const { organizationId, enrollmentMode } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.ORGANIZATION_DOMAINS_KEY,
      authenticated: Boolean(organizationId),
      tracked: {
        organizationId: organizationId ?? null,
        enrollmentMode: enrollmentMode ?? null,
      },
      untracked: {
        args: {},
      },
    });
  }, [organizationId, enrollmentMode]);
}
