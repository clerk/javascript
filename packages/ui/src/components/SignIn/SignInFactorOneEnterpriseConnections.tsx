import { useClerk } from '@clerk/shared/react/index';
import type { ComponentType } from 'react';

import { withRedirect } from '@/ui/common';
import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { useCoreSignIn, useOptions, useSignInContext } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { useRouter } from '@/ui/router';
import type { AvailableComponentProps } from '@/ui/types';
import { authenticateWithNativeRedirect } from '@/ui/utils/nativeRedirect';

import { hasMultipleEnterpriseConnections } from './shared';

/**
 * @experimental
 */
const SignInFactorOneEnterpriseConnectionsInternal = () => {
  const ctx = useSignInContext();
  const clerk = useClerk();
  const { navigate } = useRouter();
  const externalAuth = useOptions().experimental?.externalAuth;
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

    if (externalAuth) {
      await authenticateWithNativeRedirect({
        clerk,
        resource: signIn,
        params: {
          strategy: 'enterprise_sso',
          redirectUrl,
          redirectUrlComplete,
          continueSignIn: true,
          enterpriseConnectionId,
          transport: externalAuth,
          oidcPrompt: ctx.oidcPrompt,
        },
        callbackParams: {
          signUpUrl: ctx.signUpUrl,
          signInUrl: ctx.signInUrl,
          signInForceRedirectUrl: ctx.afterSignInUrl,
          signUpForceRedirectUrl: ctx.afterSignUpUrl,
          continueSignUpUrl: ctx.signUpContinueUrl,
          transferable: ctx.transferable,
          firstFactorUrl: '../factor-one',
          secondFactorUrl: '../factor-two',
          resetPasswordUrl: '../reset-password',
          navigateOnSetActive: ctx.navigateOnSetActive,
          unsafeMetadata: ctx.unsafeMetadata,
        },
        navigate,
      });
      return;
    }

    await signIn.authenticateWithRedirect({
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
