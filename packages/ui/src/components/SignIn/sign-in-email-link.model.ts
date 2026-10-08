import { isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { EmailLinkFactor, SignInResource } from '@clerk/shared/types';

import { handleError } from '@/ui/utils/errorHandler';

import { buildVerificationRedirectUrl } from '../../common/redirects';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { useEmailLink } from '../../hooks/useEmailLink';
import { useRouter } from '../../router';
import { navigateOnSignInProtectGate } from './handleProtectCheck';
import { handleSignUpIfMissingTransfer } from './handleSignUpIfMissingTransfer';

export type SignInEmailLinkVariant = 'first' | 'second';

// Retained for backwards compatibility.
const isNewDevice = (resource: SignInResource) => resource.clientTrustState === 'new';

export function useSignInEmailLinkModel(factor: EmailLinkFactor, variant: SignInEmailLinkVariant) {
  const { t } = useLocalizations();
  const card = useCardState();
  const signIn = useCoreSignIn();
  const signInContext = useSignInContext();
  const { signInUrl, afterSignInUrl, afterSignUpUrl, signUpIfMissingEnabled, navigateOnSetActive } = signInContext;
  const { navigate } = useRouter();
  const clerk = useClerk();
  const { startEmailLinkFlow, cancelEmailLinkFlow } = useEmailLink(signIn);

  const completeFirstFactor = async (result: SignInResource) => {
    // An email-link verification can resolve into a protect_check gate; route to it before
    // dispatching on the underlying status, otherwise the user is stranded on the link card.
    if (navigateOnSignInProtectGate(result, navigate, '../protect-check')) {
      return;
    }
    if (result.status === 'complete') {
      await clerk.setActive({ session: result.createdSessionId, redirectUrl: afterSignInUrl });
    } else if (result.status === 'needs_second_factor') {
      await navigate('../factor-two');
    }
  };

  const handleResult = async (result: SignInResource): Promise<'verified_switch_tab' | null> => {
    const verification = variant === 'first' ? result.firstFactorVerification : result.secondFactorVerification;
    if (verification.status === 'expired') {
      card.setError(t(localizationKeys('formFieldError__verificationLinkExpired')));
    } else if (variant === 'first') {
      if (signUpIfMissingEnabled && verification.status === 'transferable') {
        // This tab is the sole consumer of the banked account transfer, whichever tab the link
        // opened in. `verifiedFromTheSameClient()` cannot arbitrate that: it compares
        // `verifiedAtClient` against this client, and on a development instance the link click
        // reaches FAPI without dev-browser context, so it reports false even when the link opened
        // in a tab of this same browser. Letting the opened tab transfer as well makes both fire,
        // and the loser's rejected create detaches the winner's sign-up server-side (cleanUpClient
        // in the FAPI sign-up create handler), stranding the flow with no sign-up at all.
        await handleSignUpIfMissingTransfer({
          clerk,
          navigate,
          afterSignUpUrl,
          navigateOnSetActive,
          unsafeMetadata: signInContext.unsafeMetadata,
        });
      } else if (verification.verifiedFromTheSameClient()) {
        return 'verified_switch_tab';
      } else {
        await completeFirstFactor(result);
      }
    } else if (navigateOnSignInProtectGate(result, navigate, '../protect-check')) {
      // A Protect gate can surface when the 2FA email link resolves. Unlike the other second-factor
      // cards this one finalizes inline (no `completeSignInFlow`), so route to the challenge here
      // instead of falling through to `setActive` with a null `createdSessionId`.
      return null;
    } else if (verification.verifiedFromTheSameClient()) {
      return 'verified_switch_tab';
    } else {
      await clerk.setActive({ session: result.createdSessionId, redirectUrl: afterSignInUrl });
    }
    return null;
  };

  const start = async (): Promise<'verified_switch_tab' | null> => {
    try {
      const result = await startEmailLinkFlow({
        emailAddressId: factor.emailAddressId,
        redirectUrl: buildVerificationRedirectUrl({ ctx: signInContext, baseUrl: signInUrl, intent: 'sign-in' }),
      });
      return await handleResult(result);
    } catch (error) {
      if (isUserLockedError(error)) {
        // @ts-expect-error -- private method for the time being
        await clerk.__internal_navigateWithError('..', error.errors[0]);
      } else {
        handleError(error as Error, [], card.setError);
      }
      return null;
    }
  };

  return {
    safeIdentifier: factor.safeIdentifier,
    profileImageUrl: signIn.userData.imageUrl,
    showNewDeviceNotice: isNewDevice(signIn),
    start,
    cancel: cancelEmailLinkFlow,
  };
}
