import type { PendingSessionOptions, ProtectParams, ShowWhenCondition } from '@clerk/shared/types';
import React from 'react';

import { auth } from './auth';

export type AppRouterProtectProps = React.PropsWithChildren<
  ProtectParams & {
    fallback?: React.ReactNode;
  } & PendingSessionOptions
>;

export type AppRouterShowProps = React.PropsWithChildren<
  PendingSessionOptions & {
    fallback?: React.ReactNode;
    when: ShowWhenCondition;
  }
>;

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
export async function Protect(props: AppRouterProtectProps): Promise<React.JSX.Element | null> {
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

/**
 * Use `<Show/>` to render children based on authorization or sign-in state.
 */
export async function Show(props: AppRouterShowProps): Promise<React.JSX.Element | null> {
  const { children, fallback, treatPendingAsSignedOut, when } = props;
  const { has, userId } = await auth({ treatPendingAsSignedOut });

  const resolvedWhen = when;
  const authorized = <>{children}</>;
  const unauthorized = fallback ? <>{fallback}</> : null;

  if (typeof resolvedWhen === 'string') {
    if (resolvedWhen === 'signedOut') {
      return userId ? unauthorized : authorized;
    }
    return userId ? authorized : unauthorized;
  }

  if (!userId) {
    return unauthorized;
  }

  if (typeof resolvedWhen === 'function') {
    return resolvedWhen(has) ? authorized : unauthorized;
  }

  return has(resolvedWhen) ? authorized : unauthorized;
}
