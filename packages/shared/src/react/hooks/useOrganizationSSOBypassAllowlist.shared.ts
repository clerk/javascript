import { useMemo } from 'react';

import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

/**
 * @internal
 */
export function useOrganizationSSOBypassAllowlistCacheKeys(params: { organizationId: string | null }) {
  const { organizationId } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.ORGANIZATION_SSO_BYPASS_ALLOWLIST_KEY,
      authenticated: Boolean(organizationId),
      tracked: {
        organizationId: organizationId ?? null,
      },
      untracked: {
        args: {},
      },
    });
  }, [organizationId]);
}
