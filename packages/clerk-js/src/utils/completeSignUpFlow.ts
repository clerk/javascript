import type { SignUpResource } from '@clerk/types';

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
    if (signUp.missingFields.some(mf => mf === 'saml' || mf === 'enterprise_sso')) {
      return signUp.authenticateWithRedirect({
        strategy: 'enterprise_sso',
        redirectUrl,
        redirectUrlComplete,
        continueSignUp: true,
        oidcPrompt,
      });
    }

    const currentSearchParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();

    if (currentSearchParams.has('__clerk_ticket')) {
      const ticket = currentSearchParams.get('__clerk_ticket');
      if (ticket) params.set('__clerk_ticket', ticket);
    }
    if (currentSearchParams.has('__clerk_status')) {
      const status = currentSearchParams.get('__clerk_status');
      if (status) params.set('__clerk_status', status);
    }

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
