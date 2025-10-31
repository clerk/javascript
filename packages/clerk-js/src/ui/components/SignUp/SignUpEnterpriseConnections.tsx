import { useClerk } from '@clerk/shared/react/index';

import { withRedirectToAfterSignUp } from '@/ui/common';
import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { useSignUpContext } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { useFetch } from '@/ui/hooks';

const SignUpEnterpriseConnectionsInternal = () => {
  const clerk = useClerk();
  const ctx = useSignUpContext();

  const signUp = clerk.client.signUp;
  const { data: enterpriseConnections, isLoading } = useFetch(signUp?.__experimental_getEnterpriseConnections, {
    signUpId: signUp.id,
  });

  const handleEnterpriseSSO = (enterpriseConnectionId: string) => {
    const redirectUrl = ctx.ssoCallbackUrl;
    const redirectUrlComplete = ctx.afterSignUpUrl || '/';

    return signUp.authenticateWithRedirect({
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
