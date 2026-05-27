import type { ComponentType } from 'react';

import { withRedirect } from '@/ui/common';
import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { useCoreSignIn, useSignInContext } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';
import type { AvailableComponentProps } from '@/ui/types';

import { hasMultipleEnterpriseConnections } from './shared';

type EnterpriseConnection = { id: string; name: string };

type SignInFactorOneEnterpriseConnectionsInternalProps = {
  enterpriseConnections: EnterpriseConnection[];
  onEnterpriseSSO: (enterpriseConnectionId: string) => Promise<void> | void;
};

export const SignInFactorOneEnterpriseConnectionsCard = (props: SignInFactorOneEnterpriseConnectionsInternalProps) => {
  return (
    <Flow.Part part='enterpriseConnections'>
      <ChooseEnterpriseConnectionCard
        title={localizationKeys('signIn.enterpriseConnections.title')}
        subtitle={localizationKeys('signIn.enterpriseConnections.subtitle')}
        onClick={props.onEnterpriseSSO as (id: string) => Promise<void>}
        enterpriseConnections={props.enterpriseConnections}
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
      'There are no enterprise connections available to sign-in. Clerk is redirecting to the `signInUrl` instead.',
    )(props);
  };

  HOC.displayName = `withEnterpriseConnectionsGuard(${displayName})`;

  return HOC;
};

export { type EnterpriseConnection };

export const SignInFactorOneEnterpriseConnections = withCardStateProvider(
  withEnterpriseConnectionsGuard(SignInFactorOneEnterpriseConnectionsCard as any),
);
