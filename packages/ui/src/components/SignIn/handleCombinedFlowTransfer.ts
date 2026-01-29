import { SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';
import type {
  DecorateUrl,
  LoadedClerk,
  PhoneCodeChannel,
  PhoneCodeStrategy,
  SessionResource,
  SignUpModes,
  SignUpResource,
  SignUpUnsafeMetadata,
} from '@clerk/shared/types';

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
  alternativePhoneCodeChannel?: PhoneCodeChannel | null;
  navigateOnSetActive: (opts: {
    session: SessionResource;
    redirectUrl: string;
    decorateUrl: DecorateUrl;
  }) => Promise<unknown>;
  unsafeMetadata?: SignUpUnsafeMetadata;
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
  navigateOnSetActive,
  alternativePhoneCodeChannel,
  unsafeMetadata,
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
  const alternativePhoneCodeChannelParams = alternativePhoneCodeChannel
    ? {
        strategy: 'phone_code' as PhoneCodeStrategy,
        channel: alternativePhoneCodeChannel,
      }
    : {};

  // Attempt to transfer directly to sign up verification if email or phone was used, there are no optional fields, and password is not enabled. The signUp.create() call will
  // inform us if the instance is eligible for moving directly to verification.
  if (
    !passwordEnabled &&
    !hasOptionalFields(clerk.client.signUp, identifierAttribute) &&
    (identifierAttribute === 'emailAddress' || identifierAttribute === 'phoneNumber')
  ) {
    return clerk.client.signUp
      .create({
        [identifierAttribute]: identifierValue,
        ...alternativePhoneCodeChannelParams,
        unsafeMetadata,
      })
      .then(async res => {
        const completeSignUpFlow = await lazyCompleteSignUpFlow();
        return completeSignUpFlow({
          signUp: res,
          verifyEmailPath: 'create/verify-email-address',
          verifyPhonePath: 'create/verify-phone-number',
          handleComplete: () =>
            clerk.setActive({
              session: res.createdSessionId,
              navigate: async ({ session, decorateUrl }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl, decorateUrl });
              },
            }),
          navigate,
          redirectUrl,
          redirectUrlComplete,
        });
      })
      .catch(err => handleError(err));
  }

  return navigate(`create`, { searchParams: paramsToForward });
}

export function hasOptionalFields(
  signUp: SignUpResource,
  identifierAttribute: 'emailAddress' | 'phoneNumber' | 'username',
) {
  const filteredFields = signUp.optionalFields.filter(field => {
    // OAuth, Web3, and Enterprise SSO fields, while optional, are not relevant once sign up has been initiated with an identifier.
    if (field.startsWith('oauth_') || field.startsWith('web3_') || field === 'enterprise_sso') {
      return false;
    }

    // We already check for whether password is enabled, so we don't consider it an optional field.
    if (field === 'password') {
      return false;
    }

    // If a phone number is used as the identifier, we don't need to consider the phone_number field.
    if (identifierAttribute === 'phoneNumber' && field === 'phone_number') {
      return false;
    }

    return true;
  });

  return filteredFields.length > 0;
}
