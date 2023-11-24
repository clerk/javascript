import type { experimental__CheckAuthorizationWithCustomPermissions } from '@clerk/types';
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

type GateServerComponentProps<
  Role extends string = string,
  Permission extends string = string,
> = React.PropsWithChildren<
  Parameters<experimental__CheckAuthorizationWithCustomPermissions<Role, Permission>>[0] & {
    fallback?: React.ReactNode;
  }
>;

/**
 * @experimental The component is experimental and subject to change in future releases.
 */
export function experimental__Gate<Role extends string = string, Permission extends string = string>(
  gateProps: GateServerComponentProps<Role, Permission>,
) {
  const { children, fallback, ...restAuthorizedParams } = gateProps;
  const { experimental__has } = auth<Role, Permission>();

  if (experimental__has(restAuthorizedParams)) {
    return <>{children}</>;
  }

  return <>{fallback ?? null}</>;
}
