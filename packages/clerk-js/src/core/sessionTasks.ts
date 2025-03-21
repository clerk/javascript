import type {
  __internal_ComponentNavigationContext,
  ClerkOptions,
  EnvironmentResource,
  SessionTask,
} from '@clerk/types';

import { buildURL } from '../utils';

export const SESSION_TASK_ROUTE_BY_KEY: Record<SessionTask['key'] | 'root', string> = {
  root: 'tasks',
  org: 'add-organization',
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
  routeKey: keyof typeof SESSION_TASK_ROUTE_BY_KEY,
  { componentNavigationContext, globalNavigate, options, environment }: NavigateToTaskOptions,
) {
  const taskRoute = `/${SESSION_TASK_ROUTE_BY_KEY[routeKey]}`;

  if (componentNavigationContext) {
    return componentNavigationContext.navigate(componentNavigationContext.indexPath + routeKey);
  }

  const signInUrl = options['signInUrl'] || environment.displayConfig.signInUrl;
  const signUpUrl = options['signUpUrl'] || environment.displayConfig.signUpUrl;
  const isReferrerSignUpUrl = window.location.href.startsWith(signUpUrl);

  const sessionTaskUrl = buildURL(
    // TODO - Accept custom URL option for custom flows in order to eject out of `signInUrl/signUpUrl`
    {
      base: isReferrerSignUpUrl ? signUpUrl : signInUrl,
      hashPath: taskRoute,
    },
    { stringify: true },
  );

  return globalNavigate(sessionTaskUrl);
}
