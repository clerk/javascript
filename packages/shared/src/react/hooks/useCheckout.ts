import type {
  __experimental_CheckoutCacheState,
  __experimental_CheckoutInstance,
  CommerceCheckoutResource,
  SetActiveNavigate,
} from '@clerk/types';
import { useMemo, useSyncExternalStore } from 'react';

import type { ClerkAPIResponseError } from '../..';
import type { __experimental_CheckoutProvider } from '../contexts';
import { useCheckoutContext, useClerkInstanceContext } from '../contexts';
import { useOrganization } from './useOrganization';
import { useUser } from './useUser';

/**
 * Utility type that makes all properties `null`.
 */
type ForceNull<T> = {
  [K in keyof T]: null;
};

type CheckoutProperties = Omit<RemoveFunctions<CommerceCheckoutResource>, 'pathRoot' | 'status'>;

type FetchStatusAndError =
  | {
      error: ClerkAPIResponseError;
      fetchStatus: 'error';
    }
  | {
      error: null;
      fetchStatus: 'idle' | 'fetching';
    };

/**
 * @internal
 * On status === 'needs_initialization', all properties are null.
 * On status === 'needs_confirmation' or 'completed', all properties are defined the same as the CommerceCheckoutResource.
 */
type CheckoutPropertiesPerStatus =
  | ({
      status: Extract<__experimental_CheckoutCacheState['status'], 'needs_initialization'>;
    } & ForceNull<CheckoutProperties>)
  | ({
      status: Extract<__experimental_CheckoutCacheState['status'], 'needs_confirmation' | 'completed'>;
    } & CheckoutProperties);

// TODO: I think I need to support `start({planId})` from the hook, and this will set the cache key instead.

type __experimental_UseCheckoutReturn = {
  checkout: FetchStatusAndError &
    CheckoutPropertiesPerStatus & {
      confirm: __experimental_CheckoutInstance['confirm'];
      start: __experimental_CheckoutInstance['start'];
      clear: () => void;
      finalize: (params?: { navigate?: SetActiveNavigate }) => void;
      getState: () => __experimental_CheckoutCacheState;
      isStarting: boolean;
      isConfirming: boolean;
    };
};

// type __experimental_UseCheckoutReturnV2 = FetchStatusAndError & {
//   checkout: CheckoutPropertiesPerStatus & {
//     confirm: __experimental_CheckoutInstance['confirm'];
//     start: __experimental_CheckoutInstance['start'];
//     clear: () => void;
//     finalize: (params?: { navigate?: SetActiveNavigate }) => void;
//     getState: () => __experimental_CheckoutCacheState;
//     isStarting: boolean;
//     isConfirming: boolean;
//   };
// };

type Params = Parameters<typeof __experimental_CheckoutProvider>[0];

export const useCheckout = (options?: Params): __experimental_UseCheckoutReturn => {
  const contextOptions = useCheckoutContext();
  const { for: forOrganization, planId, planPeriod } = options || contextOptions;

  const { organization } = useOrganization();
  const { isLoaded, user } = useUser();

  if (!user && isLoaded) {
    throw new Error('Clerk: Ensure that `useCheckout` is inside a component wrapped with `<SignedIn />`.');
  }

  if (isLoaded && forOrganization === 'organization' && !organization) {
    throw new Error(
      'Clerk: Ensure your flow checks for an active organization. Retrieve `orgId` from `useAuth()` and confirm it is defined. For SSR, see: https://clerk.com/docs/references/backend/types/auth-object#how-to-access-the-auth-object',
    );
  }

  const clerk = useClerkInstanceContext();

  const manager = useMemo(() => {
    return clerk.__experimental_checkout({ planId, planPeriod, for: forOrganization });
  }, [
    // user?.id, organization?.id,
    planId,
    planPeriod,
    forOrganization,
  ]);

  // const subscribe = useCallback(
  //   (callback: () => void) => {
  //     if (!clerk.loaded) {
  //       return () => {};
  //     }

  //     return manager.subscribe(callback);
  //   },
  //   [clerk.loaded, manager],
  // );
  // const getSnapshot = useCallback(() => {
  //   return manager.getState();
  // }, [manager]);

  const managerProperties = useSyncExternalStore(manager.subscribe, manager.getState, manager.getState);

  const properties = useMemo<CheckoutProperties | ForceNull<CheckoutProperties>>(() => {
    if (!managerProperties.checkout) {
      return {
        id: null,
        externalClientSecret: null,
        externalGatewayId: null,
        status: null,
        totals: null,
        isImmediatePlanChange: null,
        planPeriod: null,
        plan: null,
        paymentSource: null,
        freeTrialEndsAt: null,
        payer: null,
      };
    }
    const {
      // eslint-disable-next-line @typescript-eslint/unbound-method
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
  } as __experimental_UseCheckoutReturn;
};
