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

type GateServerComponentProps = React.PropsWithChildren<
  Parameters<experimental__CheckAuthorizationWithCustomPermissions>[0] & {
    fallback?: React.ReactNode;
  }
>;

/**
 * @experimental The component is experimental and subject to change in future releases.
 */
export function experimental__Gate(gateProps: GateServerComponentProps) {
  const { children, fallback, ...restAuthorizedParams } = gateProps;
  const { experimental__has } = auth();

  if (experimental__has(restAuthorizedParams)) {
    return <>{children}</>;
  }

  return <>{fallback ?? null}</>;
}
