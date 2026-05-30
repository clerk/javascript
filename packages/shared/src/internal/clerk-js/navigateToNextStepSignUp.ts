import type { SignUpField, SignUpResource } from '../../types';
import { completeSignUpFlow } from './completeSignUpFlow';

type NavigateToNextStepSignUpProps = {
  signUp: SignUpResource;
  missingFields: SignUpField[];
  continueSignUpUrl: string;
  verifyEmailAddressUrl: string;
  verifyPhoneNumberUrl: string;
  navigate: (to: string, options?: { searchParams?: URLSearchParams }) => Promise<unknown>;
};

/**
 * Routes a sign-up that's still in `missing_requirements` to the appropriate
 * next step:
 *
 * - If there are missing fields, go straight to the continue page so the user
 *   can fill them in.
 * - Otherwise, hand off to `completeSignUpFlow` which routes unverified email
 *   or phone identifications to their respective verify pages.
 *
 * Used by both the OAuth callback handler and the sign-in `signUpIfMissing`
 * transfer flow so they stay in lockstep.
 *
 * @internal
 */
export const navigateToNextStepSignUp = ({
  signUp,
  missingFields,
  continueSignUpUrl,
  verifyEmailAddressUrl,
  verifyPhoneNumberUrl,
  navigate,
}: NavigateToNextStepSignUpProps): Promise<unknown> | undefined => {
  if (missingFields.length) {
    return navigate(continueSignUpUrl);
  }

  return completeSignUpFlow({
    signUp,
    verifyEmailPath: verifyEmailAddressUrl,
    verifyPhonePath: verifyPhoneNumberUrl,
    navigate,
  });
};
