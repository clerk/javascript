import type {
  __experimental_CheckoutCacheState,
  __experimental_CheckoutInstance,
  __experimental_CheckoutOptions,
  SetActiveNavigate,
} from '@clerk/types';

import type { Clerk } from '../../clerk';
import { type CheckoutKey, createCheckoutManager } from './manager';

/**
 * Generate cache key for checkout instance
 */
function cacheKey(options: { userId: string; orgId?: string; planId: string; planPeriod: string }): CheckoutKey {
  const { userId, orgId, planId, planPeriod } = options;
  return `${userId}-${orgId || 'user'}-${planId}-${planPeriod}` as CheckoutKey;
}

/**
 * Create a checkout instance with the given options
 */
function createCheckoutInstance(
  clerk: Clerk,
  options: __experimental_CheckoutOptions,
): __experimental_CheckoutInstance {
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

  const manager = createCheckoutManager(checkoutKey);

  const start: __experimental_CheckoutInstance['start'] = async () => {
    return manager.executeOperation('start', async () => {
      const result = await clerk.billing?.startCheckout({
        ...(forOrganization === 'organization' ? { orgId: clerk.organization?.id } : {}),
        planId,
        planPeriod,
      });
      return result;
    });
  };

  const confirm: __experimental_CheckoutInstance['confirm'] = async params => {
    return manager.executeOperation('confirm', async () => {
      const checkout = manager.getCacheState().checkout;
      if (!checkout) {
        throw new Error('Clerk: Call `start` before `confirm`');
      }
      return checkout.confirm(params);
    });
  };

  const finalize = (params?: { navigate?: SetActiveNavigate }) => {
    const { navigate } = params || {};
    return clerk.setActive({ session: clerk.session?.id, navigate });
  };

  const clear = () => manager.clearCheckout();

  const subscribe = (listener: (state: __experimental_CheckoutCacheState) => void) => {
    return manager.subscribe(listener);
  };

  return {
    start,
    confirm,
    finalize,
    clear,
    subscribe,
    getState: manager.getCacheState,
  };
}

export { createCheckoutInstance };
