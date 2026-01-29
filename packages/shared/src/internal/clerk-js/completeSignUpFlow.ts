import type { SignUpResource } from '../../types';
import { forwardClerkQueryParams } from './queryParams';

type CompleteSignUpFlowProps = {
  signUp: SignUpResource;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  continuePath?: string;
  navigate: (to: string, options?: { searchParams?: URLSearchParams }) => Promise<unknown>;
  handleComplete?: () => Promise<void>;
  redirectUrl?: string;
  redirectUrlComplete?: string;
  oidcPrompt?: string;
};

export const completeSignUpFlow = ({
  signUp,
  verifyEmailPath,
  verifyPhonePath,
  continuePath,
  navigate,
  handleComplete,
  redirectUrl = '',
  redirectUrlComplete = '',
  oidcPrompt,
}: CompleteSignUpFlowProps): Promise<unknown> | undefined => {
  if (signUp.status === 'complete') {
    return handleComplete && handleComplete();
  } else if (signUp.status === 'missing_requirements') {
    if (signUp.missingFields.some(mf => mf === 'enterprise_sso')) {
      return signUp.authenticateWithRedirect({
        strategy: 'enterprise_sso',
        redirectUrl,
        redirectUrlComplete,
        continueSignUp: true,
        oidcPrompt,
      });
    }

    const params = forwardClerkQueryParams();

    if (signUp.unverifiedFields?.includes('email_address') && verifyEmailPath) {
      return navigate(verifyEmailPath, { searchParams: params });
    }
    if (signUp.unverifiedFields?.includes('phone_number') && verifyPhonePath) {
      return navigate(verifyPhonePath, { searchParams: params });
    }

    if (continuePath) {
      return navigate(continuePath, { searchParams: params });
    }
  }
  return;
};
