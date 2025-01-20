import type { LoadedClerk, SignUpModes, SignUpResource } from '@clerk/types';

import { SIGN_UP_MODES } from '../../../core/constants';
import type { RouteContextValue } from '../../router/RouteContext';
import { completeSignUpFlow } from '../SignUp/util';

type HandleCombinedFlowTransferProps = {
  identifierAttribute: 'emailAddress' | 'phoneNumber' | 'username';
  identifierValue: string;
  signUpMode: SignUpModes;
  navigate: RouteContextValue['navigate'];
  organizationTicket?: string;
  afterSignUpUrl: string;
  clerk: LoadedClerk;
  handleError: (err: any) => void;
  redirectUrl?: string;
  redirectUrlComplete?: string;
  passwordEnabled: boolean;
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
  afterSignUpUrl,
  clerk,
  handleError,
  redirectUrl,
  redirectUrlComplete,
  passwordEnabled,
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

  // Attempt to transfer directly to sign up verification if email or phone was used, there are no optional fields, and password is not enabled. The signUp.create() call will
  // inform us if the instance is eligible for moving directly to verification.
  if (
    !passwordEnabled &&
    !hasOptionalFields(clerk.client.signUp) &&
    (identifierAttribute === 'emailAddress' || identifierAttribute === 'phoneNumber')
  ) {
    return clerk.client.signUp
      .create({
        [identifierAttribute]: identifierValue,
      })
      .then(res => {
        return completeSignUpFlow({
          signUp: res,
          verifyEmailPath: 'create/verify-email-address',
          verifyPhonePath: 'create/verify-phone-number',
          handleComplete: () => clerk.setActive({ session: res.createdSessionId, redirectUrl: afterSignUpUrl }),
          navigate,
          redirectUrl,
          redirectUrlComplete,
        });
      })
      .catch(err => handleError(err));
  }

  return navigate(`create`, { searchParams: paramsToForward });
}

function hasOptionalFields(signUp: SignUpResource) {
  const filteredFields = signUp.optionalFields.filter(
    field =>
      !field.startsWith('oauth_') &&
      !field.startsWith('web3_') &&
      field !== 'password' &&
      field !== 'enterprise_sso' &&
      field !== 'saml',
  );
  return filteredFields.length > 0;
}
