import { useClerk } from '@clerk/shared/react/index';
import type { ComponentType } from 'react';

import { withRedirect } from '@/ui/common';
import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { useCoreSignIn, useSignInContext } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';
import type { AvailableComponentProps } from '@/ui/types';

import { useRouter } from '../../router';
import { navigateOnSignInProtectGate } from './handleProtectCheck';
import { hasMultipleEnterpriseConnections } from './shared';

/**
 * @experimental
 */
const SignInFactorOneEnterpriseConnectionsInternal = () => {
  const ctx = useSignInContext();
  const clerk = useClerk();
  const { navigate } = useRouter();
  const signIn = clerk.client.signIn;

  if (!hasMultipleEnterpriseConnections(signIn.supportedFirstFactors)) {
    // This should not happen due to the HOC guard, but provides type safety
    return null;
  }

  const enterpriseConnections = signIn.supportedFirstFactors.map(ff => ({
    id: ff.enterpriseConnectionId,
    name: ff.enterpriseConnectionName,
  }));

  const handleEnterpriseSSO = async (enterpriseConnectionId: string) => {
    const redirectUrl = ctx.ssoCallbackUrl;
    const redirectUrlComplete = ctx.afterSignInUrl || '/';

    await signIn.authenticateWithRedirect({
      strategy: 'enterprise_sso',
      redirectUrl,
      redirectUrlComplete,
      oidcPrompt: ctx.oidcPrompt,
      continueSignIn: true,
      enterpriseConnectionId,
    });

    // Preparing the hand-off can itself raise a challenge, in which case no redirect was issued
    // and the sign-in is sitting on the gate instead. Without this the picker looks inert: the
    // user clicks their connection and nothing happens.
    navigateOnSignInProtectGate(signIn, navigate, '../protect-check');
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
