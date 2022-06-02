import { SignUpResource } from '@clerk/types';

type CompleteSignUpFlowProps = {
  signUp: SignUpResource;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  navigate: (to: string) => Promise<void>;
  handleComplete?: () => Promise<void>;
};

export const completeSignUpFlow = ({
  signUp,
  verifyEmailPath,
  verifyPhonePath,
  navigate,
  handleComplete,
}: CompleteSignUpFlowProps): Promise<void> | undefined => {
  if (signUp.status === 'complete') {
    return handleComplete && handleComplete();
  } else if (signUp.status === 'missing_requirements') {
    if (signUp.unverifiedFields?.includes('email_address') && verifyEmailPath) {
      return navigate(verifyEmailPath);
    }
    if (signUp.unverifiedFields?.includes('phone_number') && verifyPhonePath) {
      return navigate(verifyPhonePath);
    }
  }
  return;
};
