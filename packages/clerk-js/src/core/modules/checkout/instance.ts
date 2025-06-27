import type {
  __experimental_CheckoutCacheState,
  __experimental_CheckoutInstance,
  __experimental_CheckoutOptions,
  CommerceCheckoutResource,
  ConfirmCheckoutParams,
} from '@clerk/types';

import type { Clerk } from '../../clerk';
import { createCheckoutManager } from './manager';

/**
 * Create a checkout instance with the given options
 */
function createCheckoutInstance(
  clerk: Clerk,
  options: __experimental_CheckoutOptions,
): __experimental_CheckoutInstance {
  const { for: forOrganization, planId, planPeriod } = options;

  if (!clerk.user) {
    throw new Error('Clerk: User is not authenticated');
  }

  if (forOrganization === 'organization' && !clerk.organization) {
    throw new Error('Clerk: Use `setActive` to set the organization');
  }

  const manager = createCheckoutManager({
    planId,
    planPeriod,
    for: forOrganization,
  });

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

  const subscribe = (listener: (state: __experimental_CheckoutCacheState) => void) => {
    return manager.subscribe(listener);
  };

  return {
    start,
    confirm,
    finalize,
    clear,
    subscribe,
    getState: () => manager.getCacheState(),
  };
}

export { createCheckoutInstance };
