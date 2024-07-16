import type { CheckAuthorizationWithCustomPermissions, HandleOAuthCallbackParams } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React from 'react';

import type { ProtectComponentDefaultProps } from '../types';
import { useAuth } from './hooks';
import type { WithClerkProp } from './utils';
import { withClerk } from './utils';

export function SignedOut(props: PropsWithChildren) {
  const { userId } = useAuth();

  if (userId) {
    return null;
  }
  return props.children;
}

export function SignedIn(props: PropsWithChildren) {
  const { userId } = useAuth();
  if (!userId) {
    return null;
  }
  return props.children;
}

export type ProtectProps = React.PropsWithChildren<
  ProtectComponentDefaultProps & {
    fallback?: React.ReactNode;
  }
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
export const Protect = ({ children, fallback, ...restAuthorizedParams }: ProtectProps) => {
  const { isLoaded, has, userId } = useAuth();

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
    if (restAuthorizedParams.condition(has as CheckAuthorizationWithCustomPermissions)) {
      return authorized;
    }
    return unauthorized;
  }

  if (restAuthorizedParams.role || restAuthorizedParams.permission) {
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
