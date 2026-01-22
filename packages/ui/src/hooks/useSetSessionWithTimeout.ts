import { useClerk } from '@clerk/shared/react';
import { useEffect } from 'react';

import { useSignInContext } from '../contexts';
import { useRouter } from '../router';

export const useSelectSessionWithTimeout = (delay = 2000) => {
  const { queryString } = useRouter();
  const { selectSession } = useClerk();
  const { afterSignInUrl } = useSignInContext();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const queryParams = new URLSearchParams(queryString);
    const createdSessionId = queryParams.get('createdSessionId');
    if (createdSessionId) {
      timeoutId = setTimeout(() => {
        void selectSession(createdSessionId, { redirectUrl: afterSignInUrl });
      }, delay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [selectSession, afterSignInUrl, queryString]);
};

/**
 * @deprecated Use `useSelectSessionWithTimeout` instead.
 */
export const useSetSessionWithTimeout = useSelectSessionWithTimeout;
