import { SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';
import { useClerk } from '@clerk/shared/react';

import { useEnvironment, useSignUpContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';

export const useSignUpRestrictedAccessModel = () => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { signInUrl, waitlistUrl } = useSignUpContext();
  const supportEmail = useSupportEmail();
  const { userSettings } = useEnvironment();
  const { mode } = userSettings.signUp;

  return {
    isRestricted: mode === SIGN_UP_MODES.RESTRICTED,
    isWaitlist: mode === SIGN_UP_MODES.WAITLIST,
    supportEmail,
    signInHref: clerk.buildUrlWithAuth(signInUrl),
    navigateToWaitlist: () => navigate(clerk.buildUrlWithAuth(waitlistUrl)),
  };
};
