import type { Protect as ProtectClientComponent } from '@clerk/clerk-react';
import React from 'react';

import { auth } from './auth';

export function SignedIn(props: React.PropsWithChildren) {
  const { children } = props;
  const { userId } = auth();
  return userId ? <>{children}</> : null;
}

export function SignedOut(props: React.PropsWithChildren) {
  const { children } = props;
  const { userId } = auth();
  return userId ? null : <>{children}</>;
}

type ProtectServerComponentProps = React.ComponentProps<typeof ProtectClientComponent>;

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
export function Protect(props: ProtectServerComponentProps) {
  const { children, fallback, ...restAuthorizedParams } = props;
  const { has, userId } = auth();

  /**
   * If neither of the authorization params are passed behave as the `<SignedIn/>`.
   * If fallback is present render that instead of rendering nothing.
   */
  if (!restAuthorizedParams.condition && !restAuthorizedParams.role && !restAuthorizedParams.permission) {
    if (userId) {
      return <>{children}</>;
    }
    return <>{fallback ?? null}</>;
  }

  /**
   * Check against the results of `has` called inside the callback
   */
  if (typeof restAuthorizedParams.condition === 'function') {
    if (userId && restAuthorizedParams.condition(has)) {
      return <>{children}</>;
    }
    return <>{fallback ?? null}</>;
  }

  if (userId && has(restAuthorizedParams)) {
    return <>{children}</>;
  }

  /**
   * Fallback to UI provided by user or `null` if authorization checks failed
   */
  return <>{fallback ?? null}</>;
}
