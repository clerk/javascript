import { useClerk } from '@clerk/shared/react';

import { useAuthenticationRequestScopeModel } from '../../common/authentication-request-scope.model';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useRouter } from '../../router';

export const useSignInFactorOneSolanaWalletsCardModel = () => {
  const clerk = useClerk();
  const router = useRouter();
  const ctx = useSignInContext();
  const resource = useCoreSignIn();
  const scope = useAuthenticationRequestScopeModel(
    'signIn',
    resource,
    JSON.stringify(['choose-wallet', ctx.afterSignInUrl, ctx.isCombinedFlow, ctx.signUpContinueUrl]),
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
          redirectUrl: ctx.afterSignInUrl || '/',
          // This card is mounted one level deep at `/sign-in/choose-wallet`, so every
          // relative target needs to climb out of `choose-wallet` first (unlike
          // `SignInSocialButtons`, which lives at the sign-in root and omits the `../`).
          secondFactorUrl: '../factor-two',
          protectCheckUrl: '../protect-check',
          signUpProtectCheckUrl: ctx.isCombinedFlow ? '../create/protect-check' : undefined,
          signUpContinueUrl: ctx.isCombinedFlow ? '../create/continue' : ctx.signUpContinueUrl,
          strategy: 'web3_solana_signature',
          walletName,
        }),
      );
    },
  };
};
