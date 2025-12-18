import type { HandleOAuthCallbackParams, PendingSessionOptions, ShowWhenCondition } from '@clerk/shared/types';
import { computed } from 'nanostores';
import React, { useEffect, useState } from 'react';

import { $csrState } from '../stores/internal';
import { useAuth } from './hooks';
import { withClerk, type WithClerkProp } from './utils';

const $isLoadingClerkStore = computed($csrState, state => state.isLoaded);

/*
 * It is not guaranteed that hydration will occur before clerk-js has loaded. If Clerk is loaded by the time a React component hydrates,
 * then we **hydration error** will be thrown for any control component that renders conditionally.
 *
 * This hook ensures that `isLoaded` will always be false on the first render,
 * preventing potential hydration errors and race conditions.
 */
const useSafeIsLoaded = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsub = $isLoadingClerkStore.subscribe(() => {
      setIsLoaded(true);
    });

    return () => unsub();
  }, []);

  return isLoaded;
};

export const ClerkLoaded = ({ children }: React.PropsWithChildren): JSX.Element | null => {
  const isLoaded = useSafeIsLoaded();

  if (!isLoaded) {
    return null;
  }

  return <>{children}</>;
};

export const ClerkLoading = ({ children }: React.PropsWithChildren): JSX.Element | null => {
  const isLoaded = useSafeIsLoaded();

  if (isLoaded) {
    return null;
  }

  return <>{children}</>;
};

export type ShowProps = React.PropsWithChildren<
  {
    fallback?: React.ReactNode;
    when: ShowWhenCondition;
  } & PendingSessionOptions
>;

export const Show = ({ children, fallback, treatPendingAsSignedOut, when }: ShowProps) => {
  if (typeof when === 'undefined') {
    throw new Error('@clerk/astro: <Show /> requires a `when` prop.');
  }

  const { has, isLoaded, userId } = useAuth({ treatPendingAsSignedOut });

  if (!isLoaded) {
    return null;
  }

  const authorized = <>{children}</>;
  const unauthorized = <>{fallback ?? null}</>;

  if (when === 'signedOut') {
    return userId ? unauthorized : authorized;
  }

  if (!userId) {
    return unauthorized;
  }

  if (when === 'signedIn') {
    return authorized;
  }

  if (typeof when === 'function') {
    return when(has) ? authorized : unauthorized;
  }

  return has(when) ? authorized : unauthorized;
};

/**
 * Use `<AuthenticateWithRedirectCallback/>` to complete a custom OAuth flow.
 */
export const AuthenticateWithRedirectCallback = withClerk(
  ({ clerk, ...handleRedirectCallbackParams }: WithClerkProp<HandleOAuthCallbackParams>) => {
    useEffect(() => {
      void clerk?.handleRedirectCallback(handleRedirectCallbackParams);
    }, []);

    return null;
  },
  'AuthenticateWithRedirectCallback',
);
