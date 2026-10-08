import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';

import { useCoreSignIn, useEnvironment } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { navigateOnSignInProtectGate } from './handleProtectCheck';

export function useResetPasswordModel() {
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const {
    userSettings: { passwordSettings },
  } = useEnvironment();

  const requiresNewPassword =
    signIn.status === 'needs_new_password' &&
    signIn.firstFactorVerification.strategy !== 'reset_password_email_code' &&
    signIn.firstFactorVerification.strategy !== 'reset_password_phone_code';

  const resetPassword = async (password: string, signOutOfOtherSessions: boolean | undefined) => {
    const result = await signIn.resetPassword({ password, signOutOfOtherSessions });
    const { status, createdSessionId } = result;

    if (navigateOnSignInProtectGate(result, navigate, '../protect-check')) {
      return;
    }

    switch (status) {
      case 'complete':
        if (createdSessionId) {
          const queryParams = new URLSearchParams();
          queryParams.set('createdSessionId', createdSessionId);
          return navigate(`../reset-password-success?${queryParams.toString()}`);
        }
        return console.error(clerkInvalidFAPIResponse(status, supportEmail));
      case 'needs_second_factor':
        return navigate('../factor-two');
      default:
        return console.error(clerkInvalidFAPIResponse(status, supportEmail));
    }
  };

  return {
    identifier: signIn.identifier,
    requiresNewPassword,
    passwordSettings,
    resetPassword,
    goBack: () => navigate('../'),
  };
}
