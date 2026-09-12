import { ClerkRuntimeError } from '@clerk/shared/error';
import { navigateToNextStepSignUp } from '@clerk/shared/internal/clerk-js/navigateToNextStepSignUp';
import type { LoadedClerk } from '@clerk/shared/types';

import type { SignInContextType } from '../../contexts';
import type { RouteContextValue } from '../../router/RouteContext';
import { clerkWindowNavigate } from '../../utils/windowNavigate';

type HandleSignUpIfMissingTransferProps = {
  clerk: LoadedClerk;
  navigate: RouteContextValue['navigate'];
  afterSignUpUrl: string;
  navigateOnSetActive: SignInContextType['navigateOnSetActive'];
  unsafeMetadata?: SignUpUnsafeMetadata;
};

/**
 * Handles transferring from sign-in to sign-up when the backend returns
 * `firstFactorVerification.status === 'transferable'` (i.e. the user does not
 * exist and `signUpIfMissing` was used).
 *
 * This mirrors the OAuth transfer handling in `_handleRedirectCallback`, but
 * navigates with paths relative to the combined `<SignIn withSignUp>` flow so
 * the transferred sign-up stays inside the mounted component (an absolute
 * `signUpUrl`-based URL would leave the component and trigger a full page
 * reload, or break apps without a standalone SignUp route).
 *
 * `navigate` must come from a route mounted directly under the SignIn root
 * (e.g. `factor-one`), so the sign-up screens nested at `create/...` resolve
 * as `../create/...`.
 */
export async function handleSignUpIfMissingTransfer({
  clerk,
  navigate,
  afterSignUpUrl,
  navigateOnSetActive,
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
          // A pending task routes into the combined flow's `create/...` task routes, which are
          // mounted inside this component, so the in-component router is the right one to use.
          if (session.currentTask) {
            await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl, decorateUrl });
            return;
          }

          // Terminal redirect. The transfer consumed the sign-in, so `client.signIn` is now null
          // and the SignIn route guard is about to bounce this route to the component's start
          // path. An in-component navigate races that and loses, stranding the user on a blank
          // sign-in screen with the session already created. Leave the component outright
          // instead. decorateUrl still applies, for the Safari ITP cookie refresh.
          clerkWindowNavigate(clerk, decorateUrl(afterSignUpUrl));
        },
      });
    case 'missing_requirements':
      // Same routing logic as the OAuth transfer flow: if the sign-up is
      // protect-gated go to protect-check; if there are missing fields go to
      // continue; otherwise let completeSignUpFlow route any unverified
      // email/phone identifications to their verify pages.
      return navigateToNextStepSignUp({
        signUp: res,
        continueSignUpUrl: '../create/continue',
        verifyEmailAddressUrl: '../create/verify-email-address',
        verifyPhoneNumberUrl: '../create/verify-phone-number',
        signUpProtectCheckUrl: '../create/protect-check',
        navigate,
      });
    default:
      throw new ClerkRuntimeError(`Unexpected sign-up status after transfer: ${res.status}`, {
        code: 'sign_up_transfer_unexpected_status',
      });
  }
}
