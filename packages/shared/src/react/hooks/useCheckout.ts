import { useMemo, useSyncExternalStore } from 'react';

import type { ClerkAPIResponseError } from '../..';
import type {
  __experimental_CheckoutCacheState,
  __experimental_CheckoutInstance,
  BillingCheckoutResource,
  SetActiveNavigate,
} from '../../types';
import type { __experimental_CheckoutProvider } from '../contexts';
import { useCheckoutContext, useOrganizationContext } from '../contexts';
import { useClerk } from './useClerk';
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

/**
 * @inline
 */
type CheckoutProperties = Omit<RemoveFunctions<BillingCheckoutResource>, 'pathRoot' | 'status'>;

/**
 * @inline
 */
type FetchStatusAndError =
  | {
      /**
       * Returns an error object if any part of the checkout process fails.
       */
      error: ClerkAPIResponseError;
      /**
       * The data fetching status.
       */
      fetchStatus: 'error';
    }
  | {
      error: null;
      fetchStatus: 'idle' | 'fetching';
    };

/**
 * @inline
 * On status === 'needs_initialization', all properties are null.
 * On status === 'needs_confirmation' or 'completed', all properties are defined the same as the BillingCheckoutResource.
 */
type CheckoutPropertiesPerStatus =
  | ({
      /**
       * @inline
       * The current status of the checkout session. The following statuses are possible:
       *  <ul>
       *  <li>`needs_initialization`: The checkout hasn't started but the hook is mounted. Call `start()` to continue.</li>
       *  <li>`needs_confirmation`: The checkout has been initialized and is awaiting confirmation. Call `confirm()` to continue.</li>
       *  <li>`completed`: The checkout has been successfully confirmed. Call `finalize()` to complete the checkout.</li>
       * </ul>
       */
      status: Extract<__experimental_CheckoutCacheState['status'], 'needs_initialization'>;
    } & ForceNull<CheckoutProperties>)
  | ({
      status: Extract<__experimental_CheckoutCacheState['status'], 'needs_confirmation' | 'completed'>;
    } & CheckoutProperties);

/**
 * @interface
 */
export type UseCheckoutReturn = FetchStatusAndError &
  CheckoutPropertiesPerStatus & {
    /**
     * A function that confirms and finalizes the checkout process, usually after the user has provided and validated payment information.
     */
    confirm: __experimental_CheckoutInstance['confirm'];
    /**
     * A function that initializes the checkout process by creating a checkout resource on the server.
     */
    start: __experimental_CheckoutInstance['start'];
    /**
     * A function that clears the current checkout state from the cache.
     */
    clear: () => void;
    /**
     * A function that finalizes the checkout process. Can optionally accept a `navigate()` function to redirect the user after completion.
     */
    finalize: (params?: { navigate?: SetActiveNavigate }) => void;
    getState: () => __experimental_CheckoutCacheState;
    /**
     * A boolean that indicates if the `start()` method is in progress.
     */
    isStarting: boolean;
    /**
     * A boolean that indicates if the `confirm()` method is in progress.
     */
    isConfirming: boolean;
  };

type __experimental_UseCheckoutReturn = {
  checkout: UseCheckoutReturn;
};

type UseCheckoutParams = Parameters<typeof __experimental_CheckoutProvider>[0];

/**
 * @function
 *
 * @param [options] - An object containing the configuration for the checkout flow.
 *
 * **Required** if the hook is used without a `<CheckoutProvider />` wrapping the component tree.
 */
export const useCheckout = (options?: UseCheckoutParams): __experimental_UseCheckoutReturn => {
  const contextOptions = useCheckoutContext();
  const { for: forOrganization, planId, planPeriod } = options || contextOptions;

  const clerk = useClerk();
  // Do not use `useOrganization` to avoid triggering the in-app enable organizations prompt in development instance
  const organizationCtx = useOrganizationContext();
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    throw new Error('Clerk: Ensure that `useCheckout` is inside a component wrapped with `<ClerkLoaded />`.');
  }

  if (!user) {
    throw new Error('Clerk: Ensure that `useCheckout` is inside a component wrapped with `<SignedIn />`.');
  }

  if (forOrganization === 'organization' && !organizationCtx?.organization) {
    throw new Error(
      'Clerk: Ensure your flow checks for an active organization. Retrieve `orgId` from `useAuth()` and confirm it is defined. For SSR, see: https://clerk.com/docs/reference/backend/types/auth-object#how-to-access-the-auth-object',
    );
  }

  const manager = useMemo(
    () => clerk.__experimental_checkout({ planId, planPeriod, for: forOrganization }),
    [user.id, organizationCtx?.organization?.id, planId, planPeriod, forOrganization],
  );

  const managerProperties = useSyncExternalStore(
    cb => manager.subscribe(cb),
    () => manager.getState(),
    () => manager.getState(),
  );

  const properties = useMemo<CheckoutProperties | ForceNull<CheckoutProperties>>(() => {
    if (!managerProperties.checkout) {
      return {
        id: null,
        externalClientSecret: null,
        externalGatewayId: null,
        totals: null,
        isImmediatePlanChange: null,
        planPeriod: null,
        plan: null,
        paymentMethod: null,
        freeTrialEndsAt: null,
        payer: null,
        needsPaymentMethod: null,
        planPeriodStart: null,
      } satisfies ForceNull<CheckoutProperties>;
    }
    const {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      reload,
      confirm,
      pathRoot,
      // All the above need to be removed from the properties
      ...rest
    } = managerProperties.checkout;
    return rest satisfies CheckoutProperties;
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
  } as __experimental_UseCheckoutReturn;
};
