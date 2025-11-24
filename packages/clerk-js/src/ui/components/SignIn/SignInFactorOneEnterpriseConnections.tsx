import { useClerk } from '@clerk/shared/react/index';
import type { ComponentType } from 'react';

import { buildSSOCallbackURL, withRedirect } from '@/ui/common';
import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { useCoreSignIn, useEnvironment, useSignInContext } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';
import type { AvailableComponentProps } from '@/ui/types';

import { hasMultipleEnterpriseConnections } from './shared';

/**
 * @experimental
 */
const SignInFactorOneEnterpriseConnectionsInternal = () => {
  const ctx = useSignInContext();
  const { displayConfig } = useEnvironment();

  const clerk = useClerk();
  const signIn = clerk.client.signIn;

  if (!hasMultipleEnterpriseConnections(signIn.supportedFirstFactors)) {
    // This should not happen due to the HOC guard, but provides type safety
    return null;
  }

  const enterpriseConnections = signIn.supportedFirstFactors.map(ff => ({
    id: ff.enterpriseConnectionId,
    name: ff.enterpriseConnectionName,
  }));

  const handleEnterpriseSSO = (enterpriseConnectionId: string) => {
    const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
    const redirectUrlComplete = ctx.afterSignInUrl || '/';

    return signIn.authenticateWithRedirect({
      strategy: 'enterprise_sso',
      redirectUrl,
      redirectUrlComplete,
      oidcPrompt: ctx.oidcPrompt,
      continueSignIn: true,
      enterpriseConnectionId,
    });
  };

  return (
    <Flow.Part part='enterpriseConnections'>
      <ChooseEnterpriseConnectionCard
        title={localizationKeys('signIn.enterpriseConnections.title')}
        subtitle={localizationKeys('signIn.enterpriseConnections.subtitle')}
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
      'There are no enterprise connections available to sign-in. Clerk is redirecting to the `signInUrl` instead.',
    )(props);
  };

  HOC.displayName = `withEnterpriseConnectionsGuard(${displayName})`;

  return HOC;
};

export const SignInFactorOneEnterpriseConnections = withCardStateProvider(
  withEnterpriseConnectionsGuard(SignInFactorOneEnterpriseConnectionsInternal),
);
