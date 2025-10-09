import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { useCoreSignUp, useSignUpContext } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { useFetch } from '@/ui/hooks';

/**
 * @experimental
 */
export const SignUpChooseEnterpriseConnection = () => {
  const signUp = useCoreSignUp();
  const ctx = useSignUpContext();
  const { data: enterpriseConnections, isLoading } = useFetch(signUp?.__experimental_getEnterpriseConnections, {
    signUpId: signUp.id,
  });

  const handleEnterpriseSSO = (enterpriseConnectionId: string) => {
    if (!signUp.emailAddress) {
      return;
    }

    const redirectUrl = ctx.ssoCallbackUrl;
    const redirectUrlComplete = ctx.afterSignUpUrl || '/';

    void signUp.authenticateWithRedirect({
      strategy: 'enterprise_sso',
      identifier: signUp.emailAddress,
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
    <Flow.Part part='chooseEnterpriseConnection'>
      {enterpriseConnections?.length ? (
        <ChooseEnterpriseConnectionCard
          title={localizationKeys('signUp.chooseEnterpriseConnection.title')}
          subtitle={localizationKeys('signUp.chooseEnterpriseConnection.subtitle')}
          onClick={handleEnterpriseSSO}
          enterpriseConnections={enterpriseConnections}
        />
      ) : isLoading ? (
        <LoadingCard />
      ) : null}
    </Flow.Part>
  );
};
