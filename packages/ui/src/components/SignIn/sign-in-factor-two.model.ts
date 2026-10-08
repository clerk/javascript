import { useClerk } from '@clerk/shared/react';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useRouter } from '../../router';

export function useSignInFactorTwoModel() {
  const clerk = useClerk();
  const signIn = useCoreSignIn();
  const router = useRouter();
  const { afterSignInUrl } = useSignInContext();

  const redirectIfInvalid = () => {
    if (clerk.__internal_setActiveInProgress) {
      return;
    }

    // If the sign-in doesn't need second factor verification, redirect away.
    // Don't redirect for 'complete' status - setActive will handle navigation.
    if (signIn.status === null || signIn.status === 'needs_identifier' || signIn.status === 'needs_first_factor') {
      // If the user is already signed in (e.g. multi-session app, page reload after
      // successful verification), redirect forward to afterSignInUrl instead of
      // back to sign-in start.
      if (clerk.isSignedIn) {
        void router.navigate(afterSignInUrl);
      } else {
        void router.navigate('../');
      }
    }
  };

  return {
    supportedSecondFactors: signIn.supportedSecondFactors,
    setActiveInProgress: clerk.__internal_setActiveInProgress,
    redirectIfInvalid,
  };
}
