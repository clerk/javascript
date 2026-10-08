import type { ComponentType } from 'react';

import { withRedirect } from '@/ui/common';
import { withCardStateProvider } from '@/ui/elements/contexts';
import type { AvailableComponentProps } from '@/ui/types';

import { useSignInFactorOneEnterpriseConnectionsModel } from './sign-in-factor-one-enterprise-connections.model';
import { SignInFactorOneEnterpriseConnectionsView } from './sign-in-factor-one-enterprise-connections.view';

/**
 * @experimental
 */
const SignInFactorOneEnterpriseConnectionsInternal = () => {
  const model = useSignInFactorOneEnterpriseConnectionsModel();
  return (
    <SignInFactorOneEnterpriseConnectionsView
      hasEnterpriseConnections={model.hasEnterpriseConnections}
      enterpriseConnections={model.enterpriseConnections}
      authenticate={model.authenticate}
    />
  );
};

const withEnterpriseConnectionsGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const model = useSignInFactorOneEnterpriseConnectionsModel();

    return withRedirect(
      Component,
      () => !model.hasEnterpriseConnections,
      model.getSignInUrl,
      'There are no enterprise connections available to sign-in. Clerk is redirecting to the `signInUrl` instead.',
    )(props);
  };

  HOC.displayName = `withEnterpriseConnectionsGuard(${displayName})`;

  return HOC;
};

export const SignInFactorOneEnterpriseConnections = withCardStateProvider(
  withEnterpriseConnectionsGuard(SignInFactorOneEnterpriseConnectionsInternal),
);
