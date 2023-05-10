import { useEffect } from 'react';

import { useCoreClerk, useSignInContext } from '../contexts';
import { useRouter } from '../router';

export const useSetSessionWithTimeout = (delay = 2000) => {
  const { queryString } = useRouter();
  const { setActive } = useCoreClerk();
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
