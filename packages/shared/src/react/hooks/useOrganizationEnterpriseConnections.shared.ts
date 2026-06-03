import { useMemo } from 'react';

import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

/**
 * @internal
 */
export function useOrganizationEnterpriseConnectionsCacheKeys(params: {
  organizationId: string | null;
  withOrganizationAccountLinking?: boolean;
}) {
  const { organizationId, withOrganizationAccountLinking = false } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.ORGANIZATION_ENTERPRISE_CONNECTIONS_KEY,
      authenticated: Boolean(organizationId),
      tracked: {
        organizationId: organizationId ?? null,
        withOrganizationAccountLinking,
      },
      untracked: {
        args: {},
      },
    });
  }, [organizationId, withOrganizationAccountLinking]);
}
