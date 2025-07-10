import type {
  __experimental_CheckoutCacheState,
  __experimental_CheckoutInstance,
  CommerceCheckoutResource,
  CommerceSubscriptionPlanPeriod,
} from '@clerk/types';
import { useMemo, useSyncExternalStore } from 'react';

import type { ClerkAPIResponseError } from '../..';
import { useCheckoutContext } from '../contexts';
import { useClerk } from './useClerk';
import { useOrganization } from './useOrganization';
import { useUser } from './useUser';

/**
 * Utility type that removes function properties from a type.
 */
type RemoveFunctions<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

/**
 * Utility type that makes all properties `null`.
 */
type ForceNull<T> = {
  [K in keyof T]: null;
};

type CheckoutProperties = Omit<RemoveFunctions<CommerceCheckoutResource>, 'pathRoot' | 'status'>;

type NullableCheckoutProperties = CheckoutProperties | ForceNull<CheckoutProperties>;

type __experimental_UseCheckoutReturn = {
  checkout: NullableCheckoutProperties & {
    confirm: __experimental_CheckoutInstance['confirm'];
    start: __experimental_CheckoutInstance['start'];
    isStarting: boolean;
    isConfirming: boolean;
    error: ClerkAPIResponseError | null;
    status: __experimental_CheckoutCacheState['status'];
    clear: () => void;
    finalize: (params?: { redirectUrl: string }) => void;
    fetchStatus: 'idle' | 'fetching' | 'error';
    getState: () => __experimental_CheckoutCacheState;
  };
};

type UseCheckoutOptions = {
  for?: 'organization';
  planPeriod: CommerceSubscriptionPlanPeriod;
  planId: string;
};

export const useCheckout = (options?: UseCheckoutOptions): __experimental_UseCheckoutReturn => {
  const contextOptions = useCheckoutContext();
  const { for: forOrganization, planId, planPeriod } = options || contextOptions;

  const clerk = useClerk();
  const { organization } = useOrganization();
  const { user } = useUser();

  if (!user) {
    throw new Error('Clerk: User is not authenticated');
  }

  if (forOrganization === 'organization' && !organization) {
    throw new Error('Clerk: Use `setActive` to set the organization');
  }

  const manager = useMemo(
    () => clerk.__experimental_checkout({ planId, planPeriod, for: forOrganization }),
    [user.id, organization?.id, planId, planPeriod, forOrganization],
  );

  const managerProperties = useSyncExternalStore(
    cb => manager.subscribe(cb),
    () => manager.getState(),
    () => manager.getState(),
  );

  const properties = useMemo<NullableCheckoutProperties>(() => {
    if (!managerProperties.checkout) {
      return {
        id: null,
        externalClientSecret: null,
        externalGatewayId: null,
        statement_id: null,
        status: null,
        totals: null,
        isImmediatePlanChange: null,
        planPeriod: null,
        plan: null,
        paymentSource: null,
      };
    }
    const {
      reload,
      confirm,
      pathRoot,
      // All the above need to be removed from the properties
      ...rest
    } = managerProperties.checkout;
    return rest;
  }, [managerProperties.checkout]);

  const checkout = {
    ...properties,
    getState: manager.getState,
    start: manager.start,
    confirm: manager.confirm,
    clear: manager.clear,
    finalize: manager.finalize,
    isStarting: managerProperties.isStarting,
    isConfirming: managerProperties.isConfirming,
    error: managerProperties.error,
    status: managerProperties.status,
    fetchStatus: managerProperties.fetchStatus,
  };

  return {
    checkout,
  };
};
