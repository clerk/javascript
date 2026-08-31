import type { SignUpResource } from '../../types';
import { forwardClerkQueryParams, removeClerkQueryParam } from './queryParams';

type CompleteSignUpFlowProps = {
  signUp: SignUpResource;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  protectCheckPath?: string;
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
  protectCheckPath,
  continuePath,
  navigate,
  handleComplete,
  redirectUrl,
  redirectUrlComplete,
  oidcPrompt,
}: CompleteSignUpFlowProps): Promise<unknown> | undefined => {
  if (signUp.status === 'complete') {
    removeClerkQueryParam('__clerk_ticket');
    removeClerkQueryParam('__clerk_invitation_token');
    return handleComplete && handleComplete();
  } else if (signUp.status === 'missing_requirements') {
    const params = forwardClerkQueryParams();

    // The protect_check field is the authoritative gating signal. Sign-up also surfaces it
    // via a missing_fields entry; treat either as equivalent.
    //
    // This runs before the enterprise SSO hand-off below, which is the order
    // `navigateToNextStepSignUp` already uses: both fields can be missing at once, and handing
    // the sign-up to the identity provider first defers the challenge until the round trip is
    // over. Resolving it here returns to this function with only the hand-off left to do.
    const isProtectGated = !!signUp.protectCheck || signUp.missingFields.some(mf => mf === 'protect_check');
    if (isProtectGated && protectCheckPath) {
      return navigate(protectCheckPath, { searchParams: params });
    }

    if (signUp.missingFields.some(mf => mf === 'enterprise_sso')) {
      if (!redirectUrl || !redirectUrlComplete) {
        throw new Error(
          'completeSignUpFlow: `redirectUrl` and `redirectUrlComplete` are required to continue a sign-up that is missing `enterprise_sso`.',
        );
      }

      return signUp.authenticateWithRedirect({
        strategy: 'enterprise_sso',
        redirectUrl,
        redirectUrlComplete,
        continueSignUp: true,
        oidcPrompt,
      });
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
