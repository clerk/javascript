import type {
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
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

type ProtectServerComponentProps = React.PropsWithChildren<
  (
    | {
        condition?: never;
        role: OrganizationCustomRoleKey;
        permission?: never;
      }
    | {
        condition?: never;
        role?: never;
        permission: OrganizationCustomPermissionKey;
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

export function Protect(props: ProtectServerComponentProps) {
  const { children, fallback, ...restAuthorizedParams } = props;
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
