import type { ComponentType } from 'react';

import { withRedirect } from '@/ui/common';
import { useCoreSignIn, useSignInContext } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import type { AvailableComponentProps } from '@/ui/types';

import { hasMultipleEnterpriseConnections } from './shared';

/**
 * @experimental
 */
const SignInChooseEnterpriseConnectionInternal = () => {
  const signIn = useCoreSignIn();

  if (!hasMultipleEnterpriseConnections(signIn.supportedFirstFactors)) {
    // This should not happen due to the HOC guard, but provides type safety
    return null;
  }

  const enterpriseConnections = signIn.supportedFirstFactors.map(ff => ({
    id: ff.enterpriseConnectionId,
    name: ff.enterpriseConnectionName,
  }));

  const handleEnterpriseSSO = (connectionId: string) => {
    // TODO - Post sign-in with enterprise connection ID
    console.log('Signing in with enterprise connection:', connectionId);
  };

  return (
    <Flow.Part part='chooseEnterpriseConnection'>
      <ChooseEnterpriseConnectionCard
        title={localizationKeys('signIn.chooseEnterpriseConnection.title')}
        subtitle={localizationKeys('signIn.chooseEnterpriseConnection.subtitle')}
        onClick={handleEnterpriseSSO}
        enterpriseConnections={enterpriseConnections}
      />
    </Flow.Part>
  );
};

const withEnterpriseConnectionsGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const signIn = useCoreSignIn();
    const signInCtx = useSignInContext();

    return withRedirect(
      Component,
      () => !hasMultipleEnterpriseConnections(signIn.supportedFirstFactors),
      ({ clerk }) => signInCtx.signInUrl || clerk.buildSignInUrl(),
      'There are no enterprise connections available to sign-in. Clerk is redirecting to the `signInUrl` URL instead.',
    )(props);
  };

  HOC.displayName = `withEnterpriseConnectionsGuard(${displayName})`;

  return HOC;
};

export const SignInChooseEnterpriseConnection = withEnterpriseConnectionsGuard(
  SignInChooseEnterpriseConnectionInternal,
);
