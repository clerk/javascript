import type { CommerceCheckoutResource, CommerceSubscriptionPlanPeriod, ConfirmCheckoutParams } from '@clerk/types';
import { useMemo, useSyncExternalStore } from 'react';

import type { ClerkAPIResponseError } from '../..';
import { useCheckoutContext } from '../contexts';
import { useClerk } from './useClerk';
import { useOrganization } from './useOrganization';
import { useUser } from './useUser';

type CheckoutStatus = 'awaiting_initialization' | 'awaiting_confirmation' | 'completed';

/**
 * Utility type that removes function properties from a type.
 */
type RemoveFunctions<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

/**
 * Utility type that makes all properties nullable.
 */
type Nullable<T> = {
  [K in keyof T]: null;
};

type CheckoutProperties = Omit<
  RemoveFunctions<CommerceCheckoutResource>,
  'paymentSource' | 'plan' | 'pathRoot' | 'reload' | 'confirm'
> & {
  plan: RemoveFunctions<CommerceCheckoutResource['plan']>;
  paymentSource: RemoveFunctions<CommerceCheckoutResource['paymentSource']>;
  __internal_checkout: CommerceCheckoutResource;
};
type NullableCheckoutProperties = Nullable<
  Omit<RemoveFunctions<CommerceCheckoutResource>, 'paymentSource' | 'plan' | 'pathRoot' | 'reload' | 'confirm'>
> & {
  plan: null;
  paymentSource: null;
  __internal_checkout: null;
};

type CheckoutCacheState = {
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | null;
  checkout: CommerceCheckoutResource | null;
  fetchStatus: 'idle' | 'fetching' | 'error';
  status: CheckoutStatus;
};

type UseCheckoutReturn = (CheckoutProperties | NullableCheckoutProperties) & {
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  start: () => Promise<CommerceCheckoutResource>;
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | null;
  status: CheckoutStatus;
  clear: () => void;
  finalize: (params: { redirectUrl?: string }) => void;
  fetchStatus: 'idle' | 'fetching' | 'error';
  getState: () => CheckoutCacheState;
};

type UseCheckoutOptions = {
  for?: 'organization';
  planPeriod: CommerceSubscriptionPlanPeriod;
  planId: string;
};

export const useCheckout = (options?: UseCheckoutOptions): UseCheckoutReturn => {
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

  const properties = useMemo(() => {
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

  return {
    ...properties,
    getState: manager.getState,
    checkout: null,
    __internal_checkout: managerProperties.checkout,
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
};
