import type { __experimental_CheckoutOptions, CheckoutSignalValue } from '@clerk/shared/types';

import { CheckoutFuture, createSignals } from '@/core/resources/BillingCheckout';

import type { Clerk } from '../../clerk';

type CheckoutKey = string & { readonly __tag: 'CheckoutKey' };

/**
 * Generate cache key for checkout instance
 */
function cacheKey(options: { userId: string; orgId?: string; planId: string; planPeriod: string }): CheckoutKey {
  const { userId, orgId, planId, planPeriod } = options;
  return `${userId}-${orgId || 'user'}-${planId}-${planPeriod}` as CheckoutKey;
}

/**
 * Stores the state of checkout instances in a cached based on their configuration as a cache key.
 */
const CheckoutSignalCache = new Map<
  CheckoutKey,
  { resource: CheckoutFuture; signals: ReturnType<typeof createSignals> }
>();

/**
 * Create a checkout instance with the given options
 */
function createCheckoutInstance(clerk: Clerk, options: __experimental_CheckoutOptions): CheckoutSignalValue {
  const { for: forOrganization, planId, planPeriod } = options;

  if (!clerk.isSignedIn || !clerk.user) {
    throw new Error('Clerk: User is not authenticated');
  }

  if (forOrganization === 'organization' && !clerk.organization) {
    throw new Error('Clerk: Use `setActive` to set the organization');
  }

  const checkoutKey = cacheKey({
    userId: clerk.user.id,
    orgId: forOrganization === 'organization' ? clerk.organization?.id : undefined,
    planId,
    planPeriod,
  });

  const checkoutInstance = CheckoutSignalCache.get(checkoutKey);
  if (checkoutInstance) {
    return checkoutInstance.signals.computedSignal() as CheckoutSignalValue;
  }

  const signals = createSignals();

  const checkout = new CheckoutFuture(signals, {
    ...(forOrganization === 'organization' ? { orgId: clerk.organization?.id } : {}),
    planId,
    planPeriod,
  });

  CheckoutSignalCache.set(checkoutKey, { resource: checkout, signals });
  return signals.computedSignal() as CheckoutSignalValue;
}

export { createCheckoutInstance };
