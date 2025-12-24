import { useMemo } from 'react';

import { useRouter } from '../router';
import { signUpRedirectRules } from '../utils/redirectRules';
import { useRedirectEngine } from './useRedirectEngine';

export interface UseSignUpRedirectOptions {
  afterSignUpUrl?: string;
}

export interface UseSignUpRedirectReturn {
  isRedirecting: boolean;
}

export function useSignUpRedirect(options: UseSignUpRedirectOptions): UseSignUpRedirectReturn {
  const { queryParams } = useRouter();

  const additionalContext = useMemo(
    () => ({
      afterSignUpUrl: options.afterSignUpUrl,
      queryParams,
    }),
    [options.afterSignUpUrl, queryParams],
  );

  return useRedirectEngine({
    rules: signUpRedirectRules,
    additionalContext,
  });
}
