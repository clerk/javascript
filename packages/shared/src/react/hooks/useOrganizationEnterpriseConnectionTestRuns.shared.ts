import { useMemo } from 'react';

import type { GetEnterpriseConnectionTestRunsParams } from '../../types/enterpriseConnectionTestRun';
import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

/**
 * @internal
 */
export function useOrganizationEnterpriseConnectionTestRunsCacheKeys(params: {
  organizationId: string | null;
  enterpriseConnectionId: string | null;
  args: GetEnterpriseConnectionTestRunsParams;
}) {
  const { organizationId, enterpriseConnectionId, args } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.ORGANIZATION_ENTERPRISE_CONNECTION_TEST_RUNS_KEY,
      authenticated: Boolean(organizationId),
      tracked: {
        organizationId: organizationId ?? null,
        enterpriseConnectionId: enterpriseConnectionId ?? null,
      },
      untracked: {
        args,
      },
    });
    // The args object is intentionally serialized via the consumer to keep stability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, enterpriseConnectionId, JSON.stringify(args)]);
}
