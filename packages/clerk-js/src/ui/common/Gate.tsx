import type { IsAuthorized } from '@clerk/types';
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import React, { useEffect } from 'react';

import { useCoreSession } from '../contexts';
import { useFetch } from '../hooks';
import { useRouter } from '../router';

type GateParams = Parameters<IsAuthorized>[0];
type GateProps = PropsWithChildren<
  GateParams & {
    fallback?: ReactNode;
    redirectTo?: string;
  }
>;

export const useGate = (params: GateParams) => {
  const { isAuthorized } = useCoreSession();
  const { data: isAuthorizedUser } = useFetch(isAuthorized, params);

  return {
    isAuthorizedUser,
  };
};

export const Gate = (gateProps: GateProps) => {
  const { children, fallback, redirectTo, ...restAuthorizedParams } = gateProps;

  const { isAuthorizedUser } = useGate(restAuthorizedParams);

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
