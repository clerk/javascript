import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { useCoreSignUp } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { useFetch } from '@/ui/hooks';

/**
 * @experimental
 */
export const SignUpChooseEnterpriseConnection = () => {
  const signUp = useCoreSignUp();
  const { data: enterpriseConnections, isLoading } = useFetch(signUp?.__experimental_getEnterpriseConnections, {
    signUpId: signUp.id,
  });

  const handleEnterpriseSSO = (connectionId: string) => {
    // TODO - Post sign-up with enterprise connection ID
    console.log('Signing up with enterprise connection:', connectionId);
  };

  return (
    /* TODO - Add as a shared component to reuse between sign-in/sign-up */
    <Flow.Part part='chooseEnterpriseConnection'>
      {isLoading ? (
        <LoadingCard />
      ) : (
        <ChooseEnterpriseConnectionCard
          title={localizationKeys('signUp.chooseEnterpriseConnection.title')}
          subtitle={localizationKeys('signUp.chooseEnterpriseConnection.subtitle')}
          onClick={handleEnterpriseSSO}
          enterpriseConnections={enterpriseConnections}
        />
      )}
    </Flow.Part>
  );
};
