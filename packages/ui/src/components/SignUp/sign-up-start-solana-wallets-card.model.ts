import { useClerk } from '@clerk/shared/react';

import { useCoreSignUp, useSignUpContext } from '@/contexts';
import { useRouter } from '@/router';

import { useAuthenticationRequestScopeModel } from '../../common/authentication-request-scope.model';

export const useSignUpStartSolanaWalletsCardModel = () => {
  const clerk = useClerk();
  const router = useRouter();
  const ctx = useSignUpContext();
  const resource = useCoreSignUp();
  const scope = useAuthenticationRequestScopeModel(
    'signUp',
    resource,
    JSON.stringify(['choose-wallet', ctx.afterSignUpUrl, ctx.unsafeMetadata]),
  );

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    navigateBack: async () => {
      if (scope.canRun()) {
        await router.navigate('../');
      }
    },
    authenticate: async (walletName: string) => {
      await scope.run(() =>
        clerk.authenticateWithWeb3({
          customNavigate: async path => {
            if (scope.canRun()) {
              await router.navigate(path);
            }
          },
          redirectUrl: ctx.afterSignUpUrl || '/',
          signUpContinueUrl: 'continue',
          strategy: 'web3_solana_signature',
          unsafeMetadata: ctx.unsafeMetadata,
          walletName,
        }),
      );
    },
  };
};
