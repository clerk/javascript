import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { useEnvironment } from '../contexts';
import { useRouter } from '../router';
import type { RedirectResult, RedirectRule } from '../utils/redirectRules';
import { evaluateRedirectRules, isDevelopmentMode } from '../utils/redirectRules';

export interface UseAuthRedirectOptions {
  rules: RedirectRule[];
  additionalContext?: Record<string, any>;
}

export interface UseAuthRedirectReturn {
  isRedirecting: boolean;
}

/**
 * Hook to handle authentication redirects based on rules
 */
export function useAuthRedirect(options: UseAuthRedirectOptions): UseAuthRedirectReturn {
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

    const result = evaluateRedirectRules(options.rules, context, isDevelopmentMode(clerk));

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
    clerk.isSignedIn,
    clerk.client?.sessions?.length,
    clerk.client?.signedInSessions?.length,
    environment.authConfig.singleSessionMode,
    currentPath,
  ]);

  return { isRedirecting };
}

