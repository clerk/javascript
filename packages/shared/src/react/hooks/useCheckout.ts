import type { CheckoutSignalValue } from '@clerk/types';
import { useCallback, useSyncExternalStore } from 'react';

import type { __experimental_CheckoutProvider } from '../contexts';
import { useCheckoutContext, useClerkInstanceContext } from '../contexts';
import { useOrganization } from './useOrganization';
import { useUser } from './useUser';

type Params = Parameters<typeof __experimental_CheckoutProvider>[0];

export const useCheckout = (options?: Params): CheckoutSignalValue => {
  const contextOptions = useCheckoutContext();
  const { for: forOrganization, planId, planPeriod } = options || contextOptions;

  const { organization } = useOrganization();
  const { isLoaded, user } = useUser();

  // TODO: Move authContext from `clerk-react` to `shared`
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
