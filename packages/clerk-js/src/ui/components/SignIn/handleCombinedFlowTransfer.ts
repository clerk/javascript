import type { LoadedClerk, SignUpModes } from '@clerk/types';

import { SIGN_UP_MODES } from '../../../core/constants';
import { completeSignUpFlow } from '../SignUp/util';

type HandleCombinedFlowTransferProps = {
  identifierAttribute: 'emailAddress' | 'phoneNumber';
  identifierValue: string;
  signUpMode: SignUpModes;
  navigate: (to: string) => Promise<unknown>;
  organizationTicket?: string;
  redirectUrl?: string;
  redirectUrlComplete?: string;
  clerk: LoadedClerk;
  handleError: (err: any) => void;
};

/**
 * This function is used to handle transfering from a sign in to a sign up when SignIn is rendered as the combined flow.
 * There is special logic to handle transfer email-based sign ups directly to verification, bypassing the initial sign up form.
 */
export function handleCombinedFlowTransfer({
  identifierAttribute,
  identifierValue,
  signUpMode,
  navigate,
  organizationTicket,
  redirectUrl,
  redirectUrlComplete,
  clerk,
  handleError,
}: HandleCombinedFlowTransferProps): Promise<unknown> | void {
  if (signUpMode === SIGN_UP_MODES.WAITLIST) {
    const waitlistUrl = clerk.buildWaitlistUrl(
      identifierAttribute === 'emailAddress'
        ? {
            initialValues: {
              [identifierAttribute]: identifierValue,
            },
          }
        : {},
    );
    return navigate(waitlistUrl);
  }

  clerk.client.signUp[identifierAttribute] = identifierValue;
  const paramsToForward = new URLSearchParams();
  if (organizationTicket) {
    paramsToForward.set('__clerk_ticket', organizationTicket);
  }

  // Attempt to transfer directly to sign up verification if email or phone was used. The signUp.create() call will
  // inform us if the instance is eligible for moving directly to verification.
  if (identifierAttribute === 'emailAddress' || identifierAttribute === 'phoneNumber') {
    return clerk.client.signUp
      .create({
        [identifierAttribute]: identifierValue,
      })
      .then(res =>
        completeSignUpFlow({
          signUp: res,
          verifyEmailPath: 'create/verify-email-address',
          verifyPhonePath: 'create/verify-phone-number',
          handleComplete: () => clerk.setActive({ session: res.createdSessionId, redirectUrl: redirectUrlComplete }),
          navigate,
          redirectUrl,
          redirectUrlComplete,
        }),
      )
      .catch(err => handleError(err));
  }

  return navigate(`create?${paramsToForward.toString()}`);
}
