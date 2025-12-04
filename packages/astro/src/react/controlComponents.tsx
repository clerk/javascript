import type { HandleOAuthCallbackParams, PendingSessionOptions } from '@clerk/shared/types';
import { computed } from 'nanostores';
import type { PropsWithChildren } from 'react';
import React, { useEffect, useState } from 'react';

import { $csrState } from '../stores/internal';
import type { ProtectProps as _ProtectProps } from '../types';
import { useAuth } from './hooks';
import type { WithClerkProp } from './utils';
import { withClerk } from './utils';

export function SignedOut({ children, treatPendingAsSignedOut }: PropsWithChildren<PendingSessionOptions>) {
  const { userId } = useAuth({ treatPendingAsSignedOut });

  if (userId) {
    return null;
  }
  return children;
}

export function SignedIn({ children, treatPendingAsSignedOut }: PropsWithChildren<PendingSessionOptions>) {
  const { userId } = useAuth({ treatPendingAsSignedOut });
  if (!userId) {
    return null;
  }
  return children;
}

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

export type ProtectProps = React.PropsWithChildren<
  _ProtectProps & { fallback?: React.ReactNode } & PendingSessionOptions
>;

/**
 * Use `<Protect/>` in order to prevent unauthenticated or unauthorized users from accessing the children passed to the component.
 *
 * Examples:
 * ```
 * <Protect permission="a_permission_key" />
 * <Protect role="a_role_key" />
 * <Protect condition={(has) => has({permission:"a_permission_key"})} />
 * <Protect condition={(has) => has({role:"a_role_key"})} />
 * <Protect fallback={<p>Unauthorized</p>} />
 * ```
 */
export const Protect = ({ children, fallback, treatPendingAsSignedOut, ...restAuthorizedParams }: ProtectProps) => {
  const { isLoaded, has, userId } = useAuth({ treatPendingAsSignedOut });

  /**
   * Avoid flickering children or fallback while clerk is loading sessionId or userId
   */
  if (!isLoaded) {
    return null;
  }

  /**
   * Fallback to UI provided by user or `null` if authorization checks failed
   */
  const unauthorized = <>{fallback ?? null}</>;

  const authorized = <>{children}</>;

  if (!userId) {
    return unauthorized;
  }

  /**
   * Check against the results of `has` called inside the callback
   */
  if (typeof restAuthorizedParams.condition === 'function') {
    if (restAuthorizedParams.condition(has)) {
      return authorized;
    }
    return unauthorized;
  }

  if (
    restAuthorizedParams.role ||
    restAuthorizedParams.permission ||
    restAuthorizedParams.feature ||
    restAuthorizedParams.plan
  ) {
    if (has?.(restAuthorizedParams)) {
      return authorized;
    }
    return unauthorized;
  }

  /**
   * If neither of the authorization params are passed behave as the `<SignedIn/>`.
   * If fallback is present render that instead of rendering nothing.
   */
  return authorized;
};

/**
 * Use `<AuthenticateWithRedirectCallback/>` to complete a custom OAuth flow.
 */
export const AuthenticateWithRedirectCallback = withClerk(
  ({ clerk, ...handleRedirectCallbackParams }: WithClerkProp<HandleOAuthCallbackParams>) => {
    React.useEffect(() => {
      void clerk?.handleRedirectCallback(handleRedirectCallbackParams);
    }, []);

    return null;
  },
  'AuthenticateWithRedirectCallback',
);
