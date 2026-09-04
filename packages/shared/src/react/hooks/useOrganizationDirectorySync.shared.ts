import { useMemo } from 'react';

import type { GetDirectorySyncUsersParams } from '../../types/directorySync';
import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

/**
 * @internal
 */
export function useOrganizationDirectorySyncCacheKeys(params: {
  organizationId: string | null;
  enterpriseConnectionId: string | null;
}) {
  const { organizationId, enterpriseConnectionId } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.ORGANIZATION_DIRECTORY_SYNC_KEY,
      authenticated: Boolean(organizationId),
      tracked: {
        organizationId: organizationId ?? null,
        enterpriseConnectionId: enterpriseConnectionId ?? null,
      },
      untracked: {
        args: {},
      },
    });
  }, [organizationId, enterpriseConnectionId]);
}

/**
 * @internal
 */
export function useOrganizationDirectorySyncUsersCacheKeys(params: {
  organizationId: string | null;
  enterpriseConnectionId: string | null;
  directoryId: string | null;
  args: GetDirectorySyncUsersParams;
}) {
  const { organizationId, enterpriseConnectionId, directoryId, args } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.ORGANIZATION_DIRECTORY_SYNC_USERS_KEY,
      authenticated: Boolean(organizationId),
      tracked: {
        organizationId: organizationId ?? null,
        enterpriseConnectionId: enterpriseConnectionId ?? null,
        directoryId: directoryId ?? null,
      },
      untracked: {
        args,
      },
    });
    // The args object is intentionally serialized via the consumer to keep stability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, enterpriseConnectionId, directoryId, JSON.stringify(args)]);
}
