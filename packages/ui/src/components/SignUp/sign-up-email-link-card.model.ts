import type { SignUpResource } from '@clerk/shared/types';

import { useCoreSignUp, useSignUpContext } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import { useEmailLink } from '../../hooks/useEmailLink';
import { useCompleteSignUpFlow } from './useCompleteSignUpFlow';

export const useSignUpEmailLinkCardModel = () => {
  const { t } = useLocalizations();
  const signUp = useCoreSignUp();
  const signUpContext = useSignUpContext();
  const completeSignUpFlow = useCompleteSignUpFlow();
  const { startEmailLinkFlow, cancelEmailLinkFlow } = useEmailLink(signUp);

  return {
    emailAddress: signUp.emailAddress,
    startVerification: () => startEmailLinkFlow({ redirectUrl: signUpContext.emailLinkRedirectUrl }),
    cancelVerification: cancelEmailLinkFlow,
    getVerificationResult: (resource: SignUpResource) => {
      const verification = resource.verifications.emailAddress;
      return verification.status === 'expired'
        ? 'expired'
        : verification.verifiedFromTheSameClient()
          ? 'verifiedSwitchTab'
          : 'complete';
    },
    expiredError: () => t(localizationKeys('formFieldError__verificationLinkExpired')),
    completeVerification: (resource: SignUpResource) =>
      completeSignUpFlow({
        signUp: resource,
        continuePath: '../continue',
        verifyEmailPath: '../verify-email-address',
        verifyPhonePath: '../verify-phone-number',
        protectCheckPath: '../protect-check',
      }),
  };
};
