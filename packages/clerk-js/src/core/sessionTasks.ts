import type { ClerkOptions, EnvironmentResource, SessionTask } from '@clerk/types';

import { buildURL } from '../utils';

export const SESSION_TASK_ROUTE_BY_KEY: Record<SessionTask['key'], string> = {
  org: '/add-organization',
} as const;

function buildTasksUrl(task: SessionTask, options: ClerkOptions, environment: EnvironmentResource): string {
  const signInUrl = options['signInUrl'] || environment.displayConfig.signInUrl;
  const signUpUrl = options['signUpUrl'] || environment.displayConfig.signUpUrl;
  const isReferrerSignUpUrl = window.location.href.startsWith(signUpUrl);

  return buildURL(
    // TODO - Accept custom URL option for custom flows in order to eject out of `signInUrl/signUpUrl`
    {
      base: isReferrerSignUpUrl ? signUpUrl : signInUrl,
      hashPath: SESSION_TASK_ROUTE_BY_KEY[task.key],
    },
    { stringify: true },
  );
}

interface NavigateToTaskOptions {
  isInternalNavigation: boolean;
  navigate: (to: string) => Promise<unknown>;
  options: ClerkOptions;
  environment: EnvironmentResource;
}

/**
 * Initiates navigation to the tasks URL based on the application context such
 * as internal component routing or custom flows.
 * @internal
 */
export function navigateToTask(
  task: SessionTask,
  { isInternalNavigation, navigate, options, environment }: NavigateToTaskOptions,
) {
  if (!isInternalNavigation) {
    // Handles navigation for custom flows, which is triggered outside of UI components routing context
    return navigate(buildTasksUrl(task, options, environment));
  } else {
    return navigate(SESSION_TASK_ROUTE_BY_KEY['org']);
  }
}
