import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { useEnvironment } from '../contexts';
import { useRouter } from '../router';
import type { RedirectRule } from '../utils/redirectRules';
import { evaluateRedirectRules } from '../utils/redirectRules';

export interface UseAuthRedirectOptions<C extends Record<string, unknown> = Record<string, unknown>> {
  rules: RedirectRule[];
  additionalContext?: C;
}

export interface UseAuthRedirectReturn {
  isRedirecting: boolean;
}

/**
 * Hook to handle authentication redirects based on rules.
 *
 * **Important**: The `additionalContext` object should be memoized by the caller
 *
 * @template C - The type of additional context to pass to redirect rules
 */
export function useAuthRedirect<C extends Record<string, unknown> = Record<string, unknown>>(
  options: UseAuthRedirectOptions<C>,
): UseAuthRedirectReturn {
  const clerk = useClerk();
  const environment = useEnvironment();
  const { navigate, currentPath } = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  React.useEffect(() => {
    const context = {
      clerk,
      currentPath,
      environment,
      ...options.additionalContext,
    };

    const result = evaluateRedirectRules(options.rules, context);

    if (result) {
      // Execute any side effects
      result.onRedirect?.();

      // Only navigate if not explicitly skipped
      if (!result.skipNavigation) {
        setIsRedirecting(true);
        void navigate(result.destination);
      }
    } else {
      setIsRedirecting(false);
    }
  }, [
    clerk,
    clerk.isSignedIn,
    clerk.client?.sessions?.length,
    clerk.client?.signedInSessions?.length,
    currentPath,
    environment,
    environment.authConfig.singleSessionMode,
    navigate,
    options.additionalContext,
    options.rules,
  ]);

  return { isRedirecting };
}
