import type { __experimental_CheckoutOptions, CheckoutSignalValue } from '@clerk/shared/types';

import { CheckoutFlow, createSignals } from '@/core/resources/BillingCheckout';

import type { Clerk } from '../../clerk';

type CheckoutKey = string & { readonly __tag: 'CheckoutKey' };

/**
 * Generate cache key for checkout instance
 */
function cacheKey(options: {
  userId: string;
  orgId?: string;
  planId: string;
  planPeriod: string;
  seatsQuantity?: number;
}): CheckoutKey {
  const { userId, orgId, planId, planPeriod, seatsQuantity } = options;
  return `${userId}-${orgId || 'user'}-${planId}-${planPeriod}-${seatsQuantity}` as CheckoutKey;
}

/**
 * Stores the state of checkout instances based on their configuration as a cache key.
 */
const CheckoutSignalCache = new Map<
  CheckoutKey,
  { resource: CheckoutFlow; signals: ReturnType<typeof createSignals> }
>();

/**
 * Create a checkout instance with the given options
 */
function createCheckoutInstance(clerk: Clerk, options: __experimental_CheckoutOptions): CheckoutSignalValue {
  const { for: forOrganization, planId, planPeriod, seatsQuantity } = options;

  if (clerk.user === null) {
    throw new Error('Clerk: User is not authenticated');
  }

  if (forOrganization === 'organization' && clerk.organization === null) {
    throw new Error(
      'Clerk: The current session does not have an active organization. Use `setActive` to set the organization',
    );
  }

  const checkoutKey = cacheKey({
    userId: clerk.user?.id || '',
    orgId: forOrganization === 'organization' ? clerk.organization?.id : undefined,
    planId,
    planPeriod,
    seatsQuantity,
  });

  const checkoutInstance = CheckoutSignalCache.get(checkoutKey);
  if (checkoutInstance) {
    return checkoutInstance.signals.computedSignal() as CheckoutSignalValue;
  }

  const signals = createSignals();

  const checkout = new CheckoutFlow(signals, {
    ...(forOrganization === 'organization' ? { orgId: clerk.organization?.id } : {}),
    planId,
    planPeriod,
    seatsQuantity,
  });

  CheckoutSignalCache.set(checkoutKey, { resource: checkout, signals });
  return signals.computedSignal() as CheckoutSignalValue;
}

export { createCheckoutInstance };
