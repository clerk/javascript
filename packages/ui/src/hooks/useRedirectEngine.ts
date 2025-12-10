import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { useEnvironment } from '../contexts';
import { useRouter } from '../router';
import type { RedirectContext, RedirectRule } from '../utils/redirectRules';
import { evaluateRedirectRules } from '../utils/redirectRules';

interface UseRedirectEngineOptions<C extends Record<string, unknown> = Record<string, unknown>> {
  additionalContext?: C;
  rules: RedirectRule<C>[];
}

interface UseRedirectEngineReturn {
  isRedirecting: boolean;
}

/**
 * Internal redirect engine - use dedicated hooks like useSignInRedirect instead
 * @internal
 */
export function useRedirectEngine<C extends Record<string, unknown> = Record<string, unknown>>(
  options: UseRedirectEngineOptions<C>,
): UseRedirectEngineReturn {
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
    } as RedirectContext & C;

    const result = evaluateRedirectRules(options.rules, context);

    if (result) {
      if (result.cleanupQueryParams && typeof window !== 'undefined' && window.history) {
        const params = new URLSearchParams(window.location.search);
        result.cleanupQueryParams.forEach(param => params.delete(param));
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, '', newUrl);
      }

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
    currentPath,
    environment.authConfig.singleSessionMode,
    navigate,
    options.additionalContext,
    options.rules,
  ]);

  return { isRedirecting };
}
