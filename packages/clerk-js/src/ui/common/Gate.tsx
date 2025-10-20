import { useSession } from '@clerk/shared/react';
import type { CheckAuthorization, OrganizationCustomRoleKey, OrganizationPermissionKey } from '@clerk/shared/types';
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import React, { useEffect } from 'react';

import { useRouter } from '../router';

type ProtectParams = Parameters<CheckAuthorization>[0] | ((has: CheckAuthorization) => boolean);

type ProtectProps = PropsWithChildren<
  (
    | {
        condition?: never;
        role: OrganizationCustomRoleKey;
        permission?: never;
      }
    | {
        condition?: never;
        role?: never;
        permission: OrganizationPermissionKey;
      }
    | {
        condition: (has: CheckAuthorization) => boolean;
        role?: never;
        permission?: never;
      }
  ) & {
    fallback?: ReactNode;
    redirectTo?: string;
  }
>;

/**
 * `useProtect` is just an abstraction on top of `useSession` that improves the internal DX for authorization
 * @param params
 */
export const useProtect = (params: ProtectParams): boolean => {
  const { session } = useSession();

  if (!session?.id) {
    return false;
  }

  if (typeof params === 'function') {
    return params(session.checkAuthorization);
  }

  return session.checkAuthorization(params);
};

export const Protect = (protectProps: ProtectProps) => {
  const { children, fallback, redirectTo, ...restAuthorizedParams } = protectProps;

  const isAuthorizedUser = useProtect(
    typeof restAuthorizedParams.condition === 'function' ? restAuthorizedParams.condition : restAuthorizedParams,
  );

  const { navigate } = useRouter();

  useEffect(() => {
    if (!isAuthorizedUser && redirectTo) {
      void navigate(redirectTo);
    }
  }, [isAuthorizedUser, redirectTo]);

  if (!isAuthorizedUser && fallback) {
    return <>{fallback}</>;
  }

  if (isAuthorizedUser) {
    return <>{children}</>;
  }

  return null;
};

export function withProtect<P>(Component: ComponentType<P>, protectProps: ProtectProps): React.ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  const HOC = (props: P) => {
    return (
      <Protect {...protectProps}>
        <Component {...(props as any)} />
      </Protect>
    );
  };

  HOC.displayName = `withProtect(${displayName})`;

  return HOC;
}
