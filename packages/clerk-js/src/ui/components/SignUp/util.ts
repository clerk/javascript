import type { SignUpResource } from '@clerk/types';

type CompleteSignUpFlowProps = {
  signUp: SignUpResource;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  navigate: (to: string) => Promise<unknown>;
  handleComplete?: () => Promise<void>;
  redirectUrl?: string;
  redirectUrlComplete?: string;
};

export const handleMissingRequirements = ({
  signUp,
  verifyEmailPath,
  verifyPhonePath,
  navigate,
  redirectUrl = '',
  redirectUrlComplete = '',
}: CompleteSignUpFlowProps): Promise<unknown> | undefined => {
  if (signUp.missingFields.some(mf => mf === 'saml')) {
    return signUp.authenticateWithRedirect({
      strategy: 'saml',
      redirectUrl,
      redirectUrlComplete,
      continueSignUp: true,
    });
  }

  if (signUp.unverifiedFields?.includes('email_address') && verifyEmailPath) {
    return navigate(verifyEmailPath);
  }
  if (signUp.unverifiedFields?.includes('phone_number') && verifyPhonePath) {
    return navigate(verifyPhonePath);
  }
  return;
};

export const completeSignUpFlow = ({
  signUp,
  verifyEmailPath,
  verifyPhonePath,
  navigate,
  handleComplete,
  redirectUrl = '',
  redirectUrlComplete = '',
}: CompleteSignUpFlowProps): Promise<unknown> | undefined => {
  switch (signUp.status) {
    case 'complete':
      return handleComplete && handleComplete();
    case 'missing_requirements':
      return handleMissingRequirements({
        signUp,
        verifyEmailPath,
        verifyPhonePath,
        navigate,
        redirectUrl,
        redirectUrlComplete,
      });
  }
  return;
};
