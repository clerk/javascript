import { useClerk } from '@clerk/shared/react';

import { useCoreSignIn, useEnvironment } from '../../contexts';
import { useEnabledThirdPartyProviders } from '../../hooks/useEnabledThirdPartyProviders';
import { useRouter } from '../../router';
import { getSSOBypassFactor, SIGN_IN_RESET_PASSWORD_INTENT_PARAM } from './shared';
import { useResetPasswordFactor } from './useResetPasswordFactor';

export const useSignInFactorOneModel = () => {
  const { __internal_setActiveInProgress } = useClerk();
  const signIn = useCoreSignIn();
  const { preferredSignInStrategy } = useEnvironment().displayConfig;
  const router = useRouter();
  const { strategies } = useEnabledThirdPartyProviders();
  const resetPasswordFactor = useResetPasswordFactor();

  return {
    supportedFirstFactors: signIn.supportedFirstFactors,
    firstFactorVerificationChannel: signIn.firstFactorVerification.channel,
    identifier: signIn.identifier,
    preferredSignInStrategy,
    status: signIn.status,
    ssoBypassFactor: getSSOBypassFactor(signIn),
    resetPasswordFactor,
    resetPasswordIntent: router.queryParams[SIGN_IN_RESET_PASSWORD_INTENT_PARAM] === 'true',
    thirdPartyStrategyCount: strategies.length,
    setActiveInProgress: __internal_setActiveInProgress,
    navigateToStart: () => router.navigate('../'),
  };
};
