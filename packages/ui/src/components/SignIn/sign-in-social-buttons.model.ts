import { isClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import { useClerk } from '@clerk/shared/react';
import type { OAuthStrategy, Web3Strategy } from '@clerk/shared/types';

import { useAuthenticationRequestScopeModel } from '@/ui/common/authentication-request-scope.model';
import { originPrefersPopup } from '@/ui/utils/originPrefersPopup';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useRouter } from '../../router';
import { buildSignInOAuthTransportCallbackParams } from './buildOAuthCallbackParams';

export function useSignInSocialButtonsModel() {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const redirectUrl = ctx.ssoCallbackUrl;
  const redirectUrlComplete = ctx.afterSignInUrl || '/';
  const hasOAuthTransport = clerk.__internal_hasOAuthTransport;
  const shouldUsePopup =
    !hasOAuthTransport && (ctx.oauthFlow === 'popup' || (ctx.oauthFlow === 'auto' && originPrefersPopup()));
  const { requestKey, canRun } = useAuthenticationRequestScopeModel(
    'signIn',
    signIn,
    JSON.stringify([shouldUsePopup, hasOAuthTransport, redirectUrl, redirectUrlComplete]),
  );

  return {
    requestKey,
    canRun,
    shouldUsePopup,
    hasOAuthTransport,
    recoverSessionExists: (error: unknown) => {
      if (
        canRun() &&
        isClerkAPIResponseError(error) &&
        error.errors.some(item => item.code === ERROR_CODES.SESSION_EXISTS)
      ) {
        return clerk.setActive({
          session: clerk.client.lastActiveSessionId,
          navigate: async ({ session, decorateUrl }) => {
            await ctx.navigateOnSetActive({ session, redirectUrl: ctx.afterSignInUrl, decorateUrl });
          },
        });
      }
      return undefined;
    },
    authenticateWithPopup: async (strategy: OAuthStrategy, popup: Window | null) => {
      if (canRun()) {
        await signIn.authenticateWithPopup({
          strategy,
          redirectUrl,
          redirectUrlComplete,
          popup,
          oidcPrompt: ctx.oidcPrompt,
        });
      }
    },
    authenticateWithRedirect: async (strategy: OAuthStrategy) => {
      if (!canRun()) {
        return;
      }
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete,
        oidcPrompt: ctx.oidcPrompt,
        __internal_callbackParams: {
          ...buildSignInOAuthTransportCallbackParams(ctx),
          __internal_navigateOnSetActive: ctx.navigateOnSetActive,
          __internal_navigate: navigate,
        },
      });
    },
    authenticateWithWeb3: async (strategy: Web3Strategy) => {
      if (!canRun()) {
        return;
      }
      if (strategy === 'web3_solana_signature') {
        await navigate(`choose-wallet?strategy=${strategy}`);
        return;
      }

      await clerk.authenticateWithWeb3({
        customNavigate: navigate,
        redirectUrl: redirectUrlComplete,
        signUpContinueUrl: ctx.isCombinedFlow ? 'create/continue' : ctx.signUpContinueUrl,
        strategy,
        secondFactorUrl: 'factor-two',
        protectCheckUrl: 'protect-check',
        signUpProtectCheckUrl: ctx.isCombinedFlow ? 'create/protect-check' : undefined,
      });
    },
  };
}
