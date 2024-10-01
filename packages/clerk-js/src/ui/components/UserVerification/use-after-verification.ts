import { useClerk } from '@clerk/shared/react';
import type { __experimental_SessionVerificationResource } from '@clerk/types';
import { useCallback } from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useUserVerification } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { useUserVerificationSession } from './useUserVerificationSession';

const useAfterVerification = () => {
  const { afterVerification, routing } = useUserVerification();
  const supportEmail = useSupportEmail();
  const { setActive } = useClerk();
  const { setCache } = useUserVerificationSession();
  const { navigate } = useRouter();

  const beforeEmit = useCallback(async () => {
    if (routing === 'virtual') {
      /**
       * Moves the code below into the task queue and ensures that client and fva has been updated correctly before triggering the events
       */
      setTimeout(() => {
        afterVerification?.();
      }, 0);
    } else {
      throw 'afterVerification is only triggered in modals';
    }
  }, [afterVerification, routing]);

  const handleVerificationResponse = useCallback(
    async (sessionVerification: __experimental_SessionVerificationResource) => {
      setCache({
        data: sessionVerification,
        isLoading: false,
        isValidating: false,
        error: null,
        cachedAt: Date.now(),
      });
      switch (sessionVerification.status) {
        case 'complete':
          return setActive({ session: sessionVerification.session.id, beforeEmit });
        case 'needs_second_factor':
          return navigate('./factor-two');
        default:
          return console.error(clerkInvalidFAPIResponse(sessionVerification.status, supportEmail));
      }
    },
    [beforeEmit, navigate, setActive, supportEmail],
  );

  return {
    handleVerificationResponse,
  };
};

export { useAfterVerification };
