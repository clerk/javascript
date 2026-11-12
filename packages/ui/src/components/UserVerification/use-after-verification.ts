import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import type { SessionVerificationResource } from '@clerk/shared/types';
import { useCallback } from 'react';

import { useUserVerification } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { isResetPasswordStrategy } from '../SignIn/utils';
import { useResetPasswordAttempt } from './useResetPasswordAttempt';
import { useUserVerificationSession } from './useUserVerificationSession';

const useAfterVerification = () => {
  const { afterVerification } = useUserVerification();
  const supportEmail = useSupportEmail();
  const { setActive } = useClerk();
  const { setCache } = useUserVerificationSession();
  const { navigate } = useRouter();
  const resetPasswordAttempt = useResetPasswordAttempt();

  const handleVerificationResponse = useCallback(
    async (sessionVerification: SessionVerificationResource) => {
      setCache({
        data: sessionVerification,
        isLoading: false,
        isValidating: false,
        error: null,
        cachedAt: Date.now(),
      });
      switch (sessionVerification.status) {
        case 'complete':
          await setActive({ session: sessionVerification.session.id });
          // A reset password code saves the new password when the verification completes.
          return afterVerification?.({
            passwordReset: isResetPasswordStrategy(sessionVerification.firstFactorVerification?.strategy)
              ? resetPasswordAttempt?.current
              : undefined,
          });

        case 'needs_second_factor':
          return navigate('./factor-two');
        default:
          return console.error(clerkInvalidFAPIResponse(sessionVerification.status, supportEmail));
      }
    },
    [navigate, setActive, supportEmail, resetPasswordAttempt],
  );

  return {
    handleVerificationResponse,
  };
};

export { useAfterVerification };
