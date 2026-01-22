import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import type { SessionVerificationResource } from '@clerk/shared/types';
import { useCallback } from 'react';

import { useUserVerification } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { useUserVerificationSession } from './useUserVerificationSession';

const useAfterVerification = () => {
  const { afterVerification } = useUserVerification();
  const supportEmail = useSupportEmail();
  const { setSelected } = useClerk();
  const { setCache } = useUserVerificationSession();
  const { navigate } = useRouter();

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
          await setSelected({ session: sessionVerification.session.id });
          return afterVerification?.();

        case 'needs_second_factor':
          return navigate('./factor-two');
        default:
          return console.error(clerkInvalidFAPIResponse(sessionVerification.status, supportEmail));
      }
    },
    [navigate, setSelected, supportEmail],
  );

  return {
    handleVerificationResponse,
  };
};

export { useAfterVerification };
