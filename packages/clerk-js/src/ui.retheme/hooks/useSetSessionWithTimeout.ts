import { useClerk } from '@clerk/shared/react';
import { useEffect } from 'react';

import { useSignInContext } from '../contexts';
import { useRouter } from '../router';

export const useSetSessionWithTimeout = (delay = 2000) => {
  const { queryString } = useRouter();
  const { setActive } = useClerk();
  const { navigateAfterSignIn } = useSignInContext();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const queryParams = new URLSearchParams(queryString);
    const createdSessionId = queryParams.get('createdSessionId');
    if (createdSessionId) {
      timeoutId = setTimeout(() => {
        void setActive({ session: createdSessionId, beforeEmit: navigateAfterSignIn });
      }, delay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [setActive, navigateAfterSignIn, queryString]);
};
