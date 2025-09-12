import type {
  __experimental_CheckoutCacheState,
  __experimental_CheckoutInstance,
  CheckoutSignalValue,
  CommerceCheckoutResource,
  RemoveFunctions,
  SetActiveNavigate,
} from '@clerk/types';
import { useCallback, useSyncExternalStore } from 'react';

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

export const useCheckout = (options?: Params): CheckoutSignalValue => {
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

  const signal = useCallback(() => {
    return clerk.__experimental_checkout({ planId, planPeriod, for: forOrganization });
  }, [
    // user?.id, organization?.id,
    planId,
    planPeriod,
    forOrganization,
  ]);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!clerk.loaded) {
        return () => {};
      }

      return clerk.__internal_state.__internal_effect(() => {
        signal();
        callback();
      });
    },
    [signal, clerk.loaded, clerk.__internal_state],
  );
  const getSnapshot = useCallback(() => {
    return signal();
  }, [signal]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return value as CheckoutSignalValue;
};
