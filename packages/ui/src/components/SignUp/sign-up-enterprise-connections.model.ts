import { useClerk } from '@clerk/shared/react/index';

import { useSignUpContext } from '@/ui/contexts';
import { useFetch } from '@/ui/hooks';

export const useSignUpEnterpriseConnectionsModel = () => {
  const clerk = useClerk();
  const ctx = useSignUpContext();
  const signUp = clerk.client.signUp;
  const { data, isLoading } = useFetch(signUp?.__experimental_getEnterpriseConnections, { signUpId: signUp.id });

  return {
    enterpriseConnections: data?.map(({ id, name, logoPublicUrl, provider }) => ({
      id,
      name,
      logoPublicUrl,
      provider,
    })),
    isLoading,
    authenticate: (enterpriseConnectionId: string) =>
      signUp.authenticateWithRedirect({
        strategy: 'enterprise_sso',
        redirectUrl: ctx.ssoCallbackUrl,
        redirectUrlComplete: ctx.afterSignUpUrl || '/',
        continueSignUp: true,
        enterpriseConnectionId,
      }),
  };
};
