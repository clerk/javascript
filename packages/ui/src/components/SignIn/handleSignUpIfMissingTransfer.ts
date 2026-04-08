import { ClerkRuntimeError } from '@clerk/shared/error';
import { navigateToNextStepSignUp } from '@clerk/shared/internal/clerk-js/navigateToNextStepSignUp';
import { navigateIfTaskExists } from '@clerk/shared/internal/clerk-js/sessionTasks';
import { buildURL } from '@clerk/shared/internal/clerk-js/url';
import type { LoadedClerk } from '@clerk/shared/types';

import type { RouteContextValue } from '../../router/RouteContext';

type HandleSignUpIfMissingTransferProps = {
  clerk: LoadedClerk;
  navigate: RouteContextValue['navigate'];
  afterSignUpUrl: string;
  signUpUrl: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
};

/**
 * Handles transferring from sign-in to sign-up when the backend returns
 * `firstFactorVerification.status === 'transferable'` (i.e. the user does not
 * exist and `signUpIfMissing` was used).
 *
 * This mirrors the OAuth transfer handling in `_handleRedirectCallback`.
 */
export async function handleSignUpIfMissingTransfer({
  clerk,
  navigate,
  afterSignUpUrl,
  signUpUrl,
  unsafeMetadata,
}: HandleSignUpIfMissingTransferProps): Promise<unknown> {
  const res = await clerk.client.signUp.create({
    transfer: true,
    unsafeMetadata,
  });

  switch (res.status) {
    case 'complete':
      return clerk.setActive({
        session: res.createdSessionId,
        navigate: async ({ session, decorateUrl }) => {
          if (!session.currentTask) {
            // Absolute URL leaving the sign-in flow. Use clerk.navigate so we
            // don't depend on the component-tree router, which is in a
            // transitional state after setActive's #setTransitiveState. Wrap
            // the destination in decorateUrl so Safari ITP is handled.
            return clerk.navigate(decorateUrl(afterSignUpUrl));
          }

          // Pending task: route to the task within the sign-in component using
          // an absolute URL built from signUpUrl.
          await navigateIfTaskExists(session, {
            baseUrl: signUpUrl,
            navigate: clerk.navigate,
          });
        },
      });
    case 'missing_requirements':
      // Same routing logic as the OAuth transfer flow: if there are missing
      // fields, go to /continue; otherwise let completeSignUpFlow route any
      // unverified email/phone identifications to their verify pages.
      return navigateToNextStepSignUp({
        signUp: res,
        missingFields: res.missingFields,
        continueSignUpUrl: buildURL({ base: signUpUrl, hashPath: '/continue' }, { stringify: true }),
        verifyEmailAddressUrl: buildURL({ base: signUpUrl, hashPath: '/verify-email-address' }, { stringify: true }),
        verifyPhoneNumberUrl: buildURL({ base: signUpUrl, hashPath: '/verify-phone-number' }, { stringify: true }),
        navigate,
      });
    default:
      throw new ClerkRuntimeError(`Unexpected sign-up status after transfer: ${res.status}`, {
        code: 'sign_up_transfer_unexpected_status',
      });
  }
}
