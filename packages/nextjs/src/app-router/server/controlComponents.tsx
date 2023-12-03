import type {
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermission,
  OrganizationCustomRole,
} from '@clerk/types';
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

type GateServerComponentProps = React.PropsWithChildren<
  (
    | {
        condition?: never;
        role: OrganizationCustomRole;
        permission?: never;
      }
    | {
        condition?: never;
        role?: never;
        permission: OrganizationCustomPermission;
      }
    | {
        condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
        role?: never;
        permission?: never;
      }
    | {
        condition?: never;
        role?: never;
        permission?: never;
      }
  ) & {
    fallback?: React.ReactNode;
  }
>;

/**
 * @experimental The component is experimental and subject to change in future releases.
 */
export function Protect(gateProps: GateServerComponentProps) {
  const { children, fallback, ...restAuthorizedParams } = gateProps;
  const { has, userId, sessionId } = auth();

  /**
   * If neither of the authorization params are passed behave as the `<SignedIn/>`
   */
  if (!restAuthorizedParams.condition && !restAuthorizedParams.role && !restAuthorizedParams.permission) {
    if (userId && sessionId) {
      return <>{children}</>;
    }
    return <>{fallback ?? null}</>;
  }

  /**
   * Check against the results of `has` called inside the callback
   */
  if (typeof restAuthorizedParams.condition === 'function') {
    if (restAuthorizedParams.condition(has)) {
      return <>{children}</>;
    }
    return <>{fallback ?? null}</>;
  }

  if (has(restAuthorizedParams)) {
    return <>{children}</>;
  }

  /**
   * Fallback to custom ui or null if authorization checks failed
   */
  return <>{fallback ?? null}</>;
}
