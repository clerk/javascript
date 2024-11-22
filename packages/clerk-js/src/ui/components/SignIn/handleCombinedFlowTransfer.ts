import { SIGN_UP_MODES } from '../../../core/constants';
import { completeSignUpFlow } from '../SignUp/util';

export function handleCombinedFlowTransfer({
  identifierAttribute,
  identifier,
  signUpMode,
  navigate,
  organizationTicket,
  redirectUrl,
  redirectUrlComplete,
  clerk,
}) {
  if (signUpMode === SIGN_UP_MODES.WAITLIST) {
    const waitlistUrl = clerk.buildWaitlistUrl(
      identifierAttribute === 'emailAddress'
        ? {
            initialValues: {
              [identifierAttribute]: identifier,
            },
          }
        : {},
    );
    return navigate(waitlistUrl);
  }

  clerk.client.signUp[identifierAttribute] = identifier;
  const paramsToForward = new URLSearchParams();
  if (organizationTicket) {
    paramsToForward.set('__clerk_ticket', organizationTicket);
  }

  if (identifierAttribute === 'emailAddress' || identifierAttribute === 'phoneNumber') {
    return clerk.client.signUp
      .create({
        [identifierAttribute]: identifier,
      })
      .then(res =>
        completeSignUpFlow({
          signUp: res,
          verifyEmailPath: 'create/verify-email-address',
          verifyPhonePath: 'create/verify-phone-number',
          handleComplete: () => clerk.setActive({ session: res.createdSessionId, redirectUrl: clerk.afterSignUpUrl }),
          navigate,
          redirectUrl,
          redirectUrlComplete,
        }),
      );
    // .catch(err => handleError(err, fieldsToSubmit, card.setError))
    // .finally(() => card.setIdle());
  }

  return navigate(`create?${paramsToForward.toString()}`);
}
