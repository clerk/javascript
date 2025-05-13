import type { LoadedClerk, PhoneCodeChannelData, PhoneCodeStrategy, SignUpModes, SignUpResource } from '@clerk/types';

import { SIGN_UP_MODES } from '../../../core/constants';
import type { RouteContextValue } from '../../router/RouteContext';
import { lazyCompleteSignUpFlow } from './lazy-sign-up';

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
  alternativePhoneCodeProvider?: PhoneCodeChannelData | null;
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
  alternativePhoneCodeProvider,
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

  // We need to send the alternative phone code provider channel in the sign up request
  // together with the phone_code strategy, in order for FAPI to create a Verification.
  const alternativePhoneCodeProviderParams = alternativePhoneCodeProvider
    ? {
        strategy: 'phone_code' as PhoneCodeStrategy,
        channel: alternativePhoneCodeProvider.channel,
      }
    : {};

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
        ...alternativePhoneCodeProviderParams,
      })
      .then(async res => {
        const completeSignUpFlow = await lazyCompleteSignUpFlow();
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
