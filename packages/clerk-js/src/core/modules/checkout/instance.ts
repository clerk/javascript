import type { __experimental_CheckoutOptions, NullableCheckoutSignal } from '@clerk/types';

import { CheckoutFuture, createSignals } from '@/core/resources/CommerceCheckout';

import type { Clerk } from '../../clerk';

type CheckoutKey = string & { readonly __tag: 'CheckoutKey' };

/**
 * Generate cache key for checkout instance
 */
function cacheKey(options: { userId: string; orgId?: string; planId: string; planPeriod: string }): CheckoutKey {
  const { userId, orgId, planId, planPeriod } = options;
  return `${userId}-${orgId || 'user'}-${planId}-${planPeriod}` as CheckoutKey;
}

const cache = new Map<CheckoutKey, { resource: CheckoutFuture; signals: ReturnType<typeof createSignals> }>();

/**
 * Create a checkout instance with the given options
 */
function createCheckoutInstance(clerk: Clerk, options: __experimental_CheckoutOptions): NullableCheckoutSignal {
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

  if (cache.has(checkoutKey)) {
    return (
      cache.get(checkoutKey) as { resource: CheckoutFuture; signals: ReturnType<typeof createSignals> }
    ).signals.computedSignal();
  }

  const signals = createSignals();

  const checkout = new CheckoutFuture(signals, {
    ...(forOrganization === 'organization' ? { orgId: clerk.organization?.id } : {}),
    planId,
    planPeriod,
  });
  cache.set(checkoutKey, { resource: checkout, signals });
  return signals.computedSignal();
}

export { createCheckoutInstance };
