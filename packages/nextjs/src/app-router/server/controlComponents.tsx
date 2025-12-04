import type { ProtectProps } from '@clerk/react';
import type { PendingSessionOptions } from '@clerk/shared/types';
import React from 'react';

import { auth } from './auth';

export async function SignedIn(
  props: React.PropsWithChildren<PendingSessionOptions>,
): Promise<React.JSX.Element | null> {
  const { children } = props;
  const { userId } = await auth({ treatPendingAsSignedOut: props.treatPendingAsSignedOut });
  return userId ? <>{children}</> : null;
}

export async function SignedOut(
  props: React.PropsWithChildren<PendingSessionOptions>,
): Promise<React.JSX.Element | null> {
  const { children } = props;
  const { userId } = await auth({ treatPendingAsSignedOut: props.treatPendingAsSignedOut });
  return userId ? null : <>{children}</>;
}

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
export async function Protect(props: ProtectProps): Promise<React.JSX.Element | null> {
  const { children, fallback, ...restAuthorizedParams } = props;
  const { has, userId } = await auth({ treatPendingAsSignedOut: props.treatPendingAsSignedOut });

  /**
   * Fallback to UI provided by user or `null` if authorization checks failed
   */
  const unauthorized = fallback ? <>{fallback}</> : null;

  const authorized = <>{children}</>;

  if (!userId) {
    return unauthorized;
  }

  /**
   * Check against the results of `has` called inside the callback
   */
  if (typeof restAuthorizedParams.condition === 'function') {
    return restAuthorizedParams.condition(has) ? authorized : unauthorized;
  }

  if (
    restAuthorizedParams.role ||
    restAuthorizedParams.permission ||
    restAuthorizedParams.feature ||
    restAuthorizedParams.plan
  ) {
    return has(restAuthorizedParams) ? authorized : unauthorized;
  }

  /**
   * If neither of the authorization params are passed behave as the `<SignedIn/>`.
   * If fallback is present render that instead of rendering nothing.
   */
  return authorized;
}
