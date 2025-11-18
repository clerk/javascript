import { useMemo } from 'react';

import type { ForPayerType } from '@/types/billing';

import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { createCacheKeys } from './createCacheKeys';

export function usePaymentAttemptQueryCacheKeys(params: {
  paymentAttemptId: string;
  userId: string | null;
  orgId: string | null;
  for?: ForPayerType;
}) {
  const { paymentAttemptId, userId, orgId, for: forType } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.PAYMENT_ATTEMPT_KEY,
      authenticated: true,
      tracked: {
        paymentAttemptId,
        forType,
        userId,
        orgId,
      },
      untracked: {
        args: {
          id: paymentAttemptId ?? undefined,
          orgId: orgId ?? undefined,
        },
      },
    });
  }, [paymentAttemptId, forType, userId, orgId]);
}
