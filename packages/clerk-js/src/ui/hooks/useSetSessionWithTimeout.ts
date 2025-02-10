import { useClerk } from '@clerk/shared/react';
import { useEffect } from 'react';

import { useSignInContext } from '../contexts';
import { useRouter } from '../router';

export const useSetSessionWithTimeout = (delay = 2000) => {
  const { queryString } = useRouter();
  const { setActive } = useClerk();
  const { afterSignInUrl } = useSignInContext();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const queryParams = new URLSearchParams(queryString);
    const createdSessionId = queryParams.get('createdSessionId');
    if (createdSessionId) {
      timeoutId = setTimeout(() => {
        void setActive({ session: createdSessionId, redirectUrl: afterSignInUrl });
      }, delay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [setActive, afterSignInUrl, queryString]);
};
