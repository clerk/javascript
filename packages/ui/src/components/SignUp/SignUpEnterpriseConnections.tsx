import { useClerk } from '@clerk/shared/react/index';

import { withRedirectToAfterSignUp } from '@/ui/common';
import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { useOptions, useSignUpContext } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { useFetch } from '@/ui/hooks';
import { useRouter } from '@/ui/router';
import { runExternalSignUpFlow } from '@/ui/utils/externalAuthFlow';

const SignUpEnterpriseConnectionsInternal = () => {
  const clerk = useClerk();
  const ctx = useSignUpContext();
  const { navigate } = useRouter();
  const externalAuth = useOptions().experimental?.externalAuth;

  const signUp = clerk.client.signUp;
  const { data: enterpriseConnections, isLoading } = useFetch(signUp?.__experimental_getEnterpriseConnections, {
    signUpId: signUp.id,
  });

  const handleEnterpriseSSO = async (enterpriseConnectionId: string) => {
    const redirectUrl = ctx.ssoCallbackUrl;
    const redirectUrlComplete = ctx.afterSignUpUrl || '/';

    if (externalAuth) {
      await runExternalSignUpFlow({
        clerk,
        continueSignUp: true,
        enterpriseConnectionId,
        externalAuth,
        handleRedirectCallbackParams: {
          signUpUrl: ctx.signUpUrl,
          signInUrl: ctx.signInUrl,
          signUpForceRedirectUrl: ctx.afterSignUpUrl,
          signInForceRedirectUrl: ctx.afterSignInUrl,
          secondFactorUrl: ctx.secondFactorUrl,
          continueSignUpUrl: '../continue',
          verifyEmailAddressUrl: '../verify-email-address',
          verifyPhoneNumberUrl: '../verify-phone-number',
          unsafeMetadata: ctx.unsafeMetadata,
        },
        navigate,
        oidcPrompt: ctx.oidcPrompt,
        redirectUrl,
        redirectUrlComplete,
        signUp,
        strategy: 'enterprise_sso',
        unsafeMetadata: ctx.unsafeMetadata,
      });
      return;
    }

    await signUp.authenticateWithRedirect({
      strategy: 'enterprise_sso',
      redirectUrl,
      redirectUrlComplete,
      continueSignUp: true,
      enterpriseConnectionId,
    });
  };

  if (!isLoading && !enterpriseConnections?.length) {
    return null;
  }

  return (
    <Flow.Part part='enterpriseConnections'>
      {enterpriseConnections?.length ? (
        <ChooseEnterpriseConnectionCard
          title={localizationKeys('signUp.enterpriseConnections.title')}
          subtitle={localizationKeys('signUp.enterpriseConnections.subtitle')}
          onClick={handleEnterpriseSSO}
          enterpriseConnections={enterpriseConnections}
        />
      ) : isLoading ? (
        <LoadingCard />
      ) : null}
    </Flow.Part>
  );
};

/**
 * @experimental
 */
export const SignUpEnterpriseConnections = withRedirectToAfterSignUp(
  withCardStateProvider(SignUpEnterpriseConnectionsInternal),
);
