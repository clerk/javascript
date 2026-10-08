import { useClerk } from '@clerk/shared/react';
import type { OAuthStrategy, Web3Strategy } from '@clerk/shared/types';

import { useAuthenticationRequestScopeModel } from '@/ui/common/authentication-request-scope.model';
import { originPrefersPopup } from '@/ui/utils/originPrefersPopup';

import { useCoreSignUp, useSignUpContext } from '../../contexts';
import { useRouter } from '../../router';
import { buildSignUpOAuthTransportCallbackParams } from '../SignIn/buildOAuthCallbackParams';
import type { SignUpSocialButtonsProps } from './SignUpSocialButtons';

export const useSignUpSocialButtonsModel = ({
  continueSignUp = false,
  legalAccepted,
}: Pick<SignUpSocialButtonsProps, 'continueSignUp' | 'legalAccepted'> = {}) => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const ctx = useSignUpContext();
  const signUp = useCoreSignUp();
  const redirectUrl = ctx.ssoCallbackUrl;
  const redirectUrlComplete = ctx.afterSignUpUrl || '/';
  const shouldUsePopup =
    !clerk.__internal_hasOAuthTransport &&
    (ctx.oauthFlow === 'popup' || (ctx.oauthFlow === 'auto' && originPrefersPopup()));

  const { requestKey, canRun } = useAuthenticationRequestScopeModel(
    'signUp',
    signUp,
    JSON.stringify([shouldUsePopup, clerk.__internal_hasOAuthTransport, redirectUrl, redirectUrlComplete]),
  );

  return {
    requestKey,
    canRun,
    shouldUsePopup,
    hasOAuthTransport: clerk.__internal_hasOAuthTransport,
    authenticateWithPopup: async (strategy: OAuthStrategy, popup: Window | null) => {
      if (!canRun()) {
        return;
      }
      await signUp.authenticateWithPopup({
        strategy,
        redirectUrl,
        redirectUrlComplete,
        popup,
        continueSignUp,
        unsafeMetadata: ctx.unsafeMetadata,
        legalAccepted,
        oidcPrompt: ctx.oidcPrompt,
      });
    },
    authenticateWithRedirect: async (strategy: OAuthStrategy) => {
      if (!canRun()) {
        return;
      }
      await signUp.authenticateWithRedirect({
        continueSignUp,
        redirectUrl,
        redirectUrlComplete,
        strategy,
        unsafeMetadata: ctx.unsafeMetadata,
        legalAccepted,
        oidcPrompt: ctx.oidcPrompt,
        __internal_callbackParams: {
          ...buildSignUpOAuthTransportCallbackParams(ctx),
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
        signUpContinueUrl: 'continue',
        unsafeMetadata: ctx.unsafeMetadata,
        strategy,
        legalAccepted,
      });
    },
  };
};
