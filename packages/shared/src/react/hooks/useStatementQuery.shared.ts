import { useMemo } from 'react';

import type { ForPayerType } from '@/types/billing';

import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

export function useStatementQueryCacheKeys(params: {
  statementId: string | null;
  userId: string | null;
  orgId: string | null;
  for?: ForPayerType;
}) {
  const { statementId, userId, orgId, for: forType } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.BILLING_STATEMENTS_KEY,
      authenticated: true,
      tracked: {
        statementId,
        forType,
        userId,
        orgId,
      },
      untracked: {
        args: {
          id: statementId ?? undefined,
          orgId: orgId ?? undefined,
        },
      },
    });
  }, [statementId, forType, userId, orgId]);
}
