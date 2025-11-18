import type { ForPayerType } from '../../types';
import { createCacheKeys } from '../hooks/createCacheKeys';

const BILLING_PLANS_STABLE_KEY = 'billing-plans' as const;
const BILLING_STATEMENTS_STABLE_KEY = 'billing-statements' as const;
const BILLING_PAYMENT_ATTEMPTS_STABLE_KEY = 'billing-payment-attempts' as const;

export const billingPlanDetailQueryKeys = ({ planId }: { planId: string | null }) => {
  return createCacheKeys({
    stablePrefix: BILLING_PLANS_STABLE_KEY,
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
};

export const billingStatementQueryKeys = ({
  statementId,
  forType,
  userId = null,
  orgId = null,
}: {
  statementId: string | null;
  forType: ForPayerType;
  userId?: string | null;
  orgId?: string | null;
}) => {
  return createCacheKeys({
    stablePrefix: BILLING_STATEMENTS_STABLE_KEY,
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
};

export const billingPaymentAttemptQueryKeys = ({
  paymentAttemptId,
  forType,
  userId = null,
  orgId = null,
}: {
  paymentAttemptId: string | null;
  forType: ForPayerType;
  userId?: string | null;
  orgId?: string | null;
}) => {
  return createCacheKeys({
    stablePrefix: BILLING_PAYMENT_ATTEMPTS_STABLE_KEY,
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
};
