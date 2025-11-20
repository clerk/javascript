import { useCallback, useSyncExternalStore } from 'react';

import type { CheckoutSignalValue } from '../../types/clerk';
import type { __experimental_CheckoutProvider } from '../contexts';
import { useCheckoutContext, useClerkInstanceContext } from '../contexts';
import { useOrganization } from './useOrganization';
import { useUser } from './useUser';

type UseCheckoutParams = Parameters<typeof __experimental_CheckoutProvider>[0];

/**
 * @function
 *
 * @param [options] - An object containing the configuration for the checkout flow.
 *
 * **Required** if the hook is used without a `<CheckoutProvider />` wrapping the component tree.
 */
export const useCheckout = (options?: UseCheckoutParams): CheckoutSignalValue => {
  const contextOptions = useCheckoutContext();
  const { for: forOrganization, planId, planPeriod } = options || contextOptions;
  const { organization } = useOrganization();
  const { isLoaded, user } = useUser();
  const clerk = useClerkInstanceContext();

  if (user === null && isLoaded) {
    throw new Error('Clerk: Ensure that `useCheckout` is inside a component wrapped with `<SignedIn />`.');
  }

  if (isLoaded && forOrganization === 'organization' && organization === null) {
    throw new Error(
      'Clerk: Ensure your flow checks for an active organization. Retrieve `orgId` from `useAuth()` and confirm it is defined. For SSR, see: https://clerk.com/docs/reference/backend/types/auth-object#how-to-access-the-auth-object',
    );
  }

  const signal = useCallback(() => {
    return clerk.__experimental_checkout({ planId, planPeriod, for: forOrganization });
  }, [user?.id, organization?.id, planId, planPeriod, forOrganization]);

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
  return value;
};
