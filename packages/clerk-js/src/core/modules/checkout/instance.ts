import type { __experimental_CheckoutOptions, NullableCheckoutSignal } from '@clerk/types';

import { CheckoutFuture } from '@/core/resources/CommerceCheckout';

import type { Clerk } from '../../clerk';
import { type CheckoutKey } from './manager';

/**
 * Generate cache key for checkout instance
 */
function cacheKey(options: { userId: string; orgId?: string; planId: string; planPeriod: string }): CheckoutKey {
  const { userId, orgId, planId, planPeriod } = options;
  return `${userId}-${orgId || 'user'}-${planId}-${planPeriod}` as CheckoutKey;
}

const cache = new Map<CheckoutKey, CheckoutFuture>();

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
    return (cache.get(checkoutKey) as CheckoutFuture).signal();
  }

  const checkout = new CheckoutFuture({
    ...(forOrganization === 'organization' ? { orgId: clerk.organization?.id } : {}),
    planId,
    planPeriod,
  });
  cache.set(checkoutKey, checkout);
  return checkout.signal();
}

export { createCheckoutInstance };
