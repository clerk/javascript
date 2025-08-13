import type {
  __internal_ComponentNavigationContext,
  ClerkOptions,
  EnvironmentResource,
  SessionTask,
} from '@clerk/types';

import { buildURL } from '../utils';

export const INTERNAL_SESSION_TASK_ROUTE_BY_KEY: Record<SessionTask['key'], string> = {
  'choose-organization': 'choose-organization',
} as const;

interface NavigateToTaskOptions {
  componentNavigationContext: __internal_ComponentNavigationContext | null;
  globalNavigate: (to: string) => Promise<unknown>;
  options: ClerkOptions;
  environment: EnvironmentResource;
}

/**
 * Handles navigation to the tasks URL based on the application context such
 * as internal component routing or custom flows.
 * @internal
 */
export function navigateToTask(
  routeKey: keyof typeof INTERNAL_SESSION_TASK_ROUTE_BY_KEY,
  { componentNavigationContext, globalNavigate, options, environment }: NavigateToTaskOptions,
) {
  const customTaskUrl = options?.taskUrls?.[routeKey];
  const internalTaskRoute = `/tasks/${INTERNAL_SESSION_TASK_ROUTE_BY_KEY[routeKey]}`;

  if (componentNavigationContext && !customTaskUrl) {
    return componentNavigationContext.navigate(componentNavigationContext.indexPath + internalTaskRoute);
  }

  const signInUrl = options['signInUrl'] || environment.displayConfig.signInUrl;
  const signUpUrl = options['signUpUrl'] || environment.displayConfig.signUpUrl;
  const isReferrerSignUpUrl = window.location.href.startsWith(signUpUrl);

  return globalNavigate(
    customTaskUrl ??
      buildURL(
        {
          base: isReferrerSignUpUrl ? signUpUrl : signInUrl,
          hashPath: internalTaskRoute,
        },
        { stringify: true },
      ),
  );
}
