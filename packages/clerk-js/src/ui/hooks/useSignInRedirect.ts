import { useEffect, useMemo, useRef } from 'react';

import { useRouter } from '../router';
import { signInRedirectRules } from '../utils/redirectRules';
import { useRedirectEngine } from './useRedirectEngine';

export interface UseSignInRedirectOptions {
  afterSignInUrl?: string;
  organizationTicket?: string;
}

export interface UseSignInRedirectReturn {
  isRedirecting: boolean;
}

export function useSignInRedirect(options: UseSignInRedirectOptions): UseSignInRedirectReturn {
  const hasInitializedRef = useRef(false);
  const { queryParams } = useRouter();

  useEffect(() => {
    hasInitializedRef.current = true;
  }, []);

  const additionalContext = useMemo(
    () => ({
      afterSignInUrl: options.afterSignInUrl,
      hasInitializedRef,
      organizationTicket: options.organizationTicket,
      queryParams,
    }),
    [options.afterSignInUrl, options.organizationTicket, queryParams],
  );

  return useRedirectEngine({
    rules: signInRedirectRules,
    additionalContext,
  });
}
