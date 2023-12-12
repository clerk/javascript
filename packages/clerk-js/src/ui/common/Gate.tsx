import type { CheckAuthorization, MembershipRole, OrganizationPermissionKey } from '@clerk/types';
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import React, { useEffect } from 'react';

import { useCoreSession } from '../contexts';
import { useRouter } from '../router';

type GateParams = Parameters<CheckAuthorization>[0] | ((has: CheckAuthorization) => boolean);
type GateProps = PropsWithChildren<
  (
    | {
        condition?: never;
        role: MembershipRole;
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

export const useGate = (params: GateParams) => {
  const { checkAuthorization, id } = useCoreSession();

  if (!id) {
    return { isAuthorizedUser: false };
  }

  /**
   * if a function is passed and returns false then throw not found
   */
  if (typeof params === 'function') {
    if (params(checkAuthorization)) {
      return { isAuthorizedUser: true };
    }
    return { isAuthorizedUser: false };
  }

  return {
    isAuthorizedUser: checkAuthorization(params),
  };
};

export const Gate = (gateProps: GateProps) => {
  const { children, fallback, redirectTo, ...restAuthorizedParams } = gateProps;

  const { isAuthorizedUser } = useGate(
    typeof restAuthorizedParams.condition === 'function' ? restAuthorizedParams.condition : restAuthorizedParams,
  );

  const { navigate } = useRouter();

  useEffect(() => {
    // wait for promise to resolve
    if (typeof isAuthorizedUser === 'boolean' && !isAuthorizedUser && redirectTo) {
      void navigate(redirectTo);
    }
  }, [isAuthorizedUser, redirectTo]);

  // wait for promise to resolve
  if (typeof isAuthorizedUser === 'boolean' && !isAuthorizedUser && fallback) {
    return <>{fallback}</>;
  }

  if (isAuthorizedUser) {
    return <>{children}</>;
  }

  return null;
};

export function withGate<P>(Component: ComponentType<P>, gateProps: GateProps): React.ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  const HOC = (props: P) => {
    return (
      <Gate {...gateProps}>
        <Component {...(props as any)} />
      </Gate>
    );
  };

  HOC.displayName = `withGate(${displayName})`;

  return HOC;
}
