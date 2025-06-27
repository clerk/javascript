import type { CommerceCheckoutResource, CommerceSubscriptionPlanPeriod, ConfirmCheckoutParams } from '@clerk/types';

import type { Clerk } from '../../clerk';
import { type CheckoutCacheState, type CheckoutKey, createCheckoutManager } from './manager';

export type CheckoutOptions = {
  for?: 'organization';
  planPeriod: CommerceSubscriptionPlanPeriod;
  planId: string;
};

export type CheckoutInstance = {
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  start: () => Promise<CommerceCheckoutResource>;
  clear: () => void;
  finalize: (params: { redirectUrl?: string }) => void;
  subscribe: (listener: (state: CheckoutCacheState) => void) => () => void;
  getState: () => CheckoutCacheState;
};

/**
 * Generate cache key for checkout instance
 */
function cacheKey(options: { userId: string; orgId?: string; planId: string; planPeriod: string }): CheckoutKey {
  const { userId, orgId, planId, planPeriod } = options;
  return `${userId}-${orgId || 'user'}-${planId}-${planPeriod}` as CheckoutKey;
}

export type CheckoutFunction = (options: CheckoutOptions) => CheckoutInstance;

/**
 * Create a checkout instance with the given options
 */
function createCheckoutInstance(clerk: Clerk, options: CheckoutOptions): CheckoutInstance {
  const { for: forOrganization, planId, planPeriod } = options;

  if (!clerk.user) {
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

  const start = async (): Promise<CommerceCheckoutResource> => {
    return manager.executeOperation('start', async () => {
      const result = await clerk.billing?.startCheckout({
        ...(forOrganization === 'organization' ? { orgId: clerk.organization?.id } : {}),
        planId,
        planPeriod,
      });
      return result;
    });
  };

  const confirm = async (params: ConfirmCheckoutParams): Promise<CommerceCheckoutResource> => {
    return manager.executeOperation('confirm', async () => {
      const checkout = manager.getCacheState().checkout;
      if (!checkout) {
        throw new Error('Clerk: Call `start` before `confirm`');
      }
      return checkout.confirm(params);
    });
  };

  const finalize = ({ redirectUrl }: { redirectUrl?: string }) => {
    void clerk.setActive({ session: clerk.session?.id, redirectUrl });
  };

  const clear = () => manager.clearCheckout();

  const subscribe = (listener: (state: CheckoutCacheState) => void) => {
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
