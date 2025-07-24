import type {
  __internal_ComponentNavigationContext,
  ClerkOptions,
  EnvironmentResource,
  SessionTask,
} from '@clerk/types';

export const INTERNAL_SESSION_TASK_ROUTE_BY_KEY: Record<SessionTask['key'], string> = {
  'select-organization': 'select-organization',
} as const;

interface NavigateToTaskOptions {
  componentNavigationContext: __internal_ComponentNavigationContext | null;
  globalNavigate: (to: string) => Promise<unknown>;
  options: ClerkOptions;
  environment: EnvironmentResource;
}

/**
 * Handles navigation to the tasks URL based on the application context such
 * as internal component routing or framework router-based navigation.
 * @internal
 */
export function navigateToTask(
  routeKey: keyof typeof INTERNAL_SESSION_TASK_ROUTE_BY_KEY,
  { componentNavigationContext, globalNavigate, options, environment }: NavigateToTaskOptions,
) {
  const taskRoute = `/tasks/${INTERNAL_SESSION_TASK_ROUTE_BY_KEY[routeKey]}`;

  if (componentNavigationContext?.routing === 'virtual') {
    return componentNavigationContext.navigate(componentNavigationContext.indexPath + taskRoute);
  }

  // Use the framework's native navigation function to maintain proper router state and caching.
  // This ensures that subsequent navigation calls (e.g., Next.js router.refresh, router.push)
  // work correctly and don't cause unnecessary re-renders or cache invalidation.
  return globalNavigate(options.taskUrls?.[routeKey] ?? resolveTaskUrl(taskRoute, options, environment));
}

/**
 * Resolves the URL for a session task by determining the current authentication context
 * (sign-in or sign-up) and appending the task route.
 * @internal
 */
function resolveTaskUrl(taskRoute: string, options: ClerkOptions, environment: EnvironmentResource): string {
  const signInUrl = options['signInUrl'] || environment.displayConfig.signInUrl;
  const signUpUrl = options['signUpUrl'] || environment.displayConfig.signUpUrl;

  // Extract the path portion from the sign-in/sign-up URLs from Clerk options
  const getPathFromUrl = (url: string): string => {
    try {
      return new URL(url, window.location.origin).pathname;
    } catch {
      // If it's already a path, return as-is
      return url.startsWith('/') ? url : `/${url}`;
    }
  };

  const signInPath = getPathFromUrl(signInUrl);
  const signUpPath = getPathFromUrl(signUpUrl);

  const currentAbsoluteUrl = new URL(window.location.href);
  const currentPath = currentAbsoluteUrl.pathname;

  let basePath: string;
  if (currentPath.startsWith(signInPath)) {
    basePath = signInPath;
  } else if (currentPath.startsWith(signUpPath)) {
    basePath = signUpPath;
  } else {
    // Fallback to sign-in if we can't determine the current context
    basePath = signInPath;
  }

  // Remove trailing slash from base path if it exists
  basePath = basePath.replace(/\/$/, '');

  const newPath = `${basePath}${taskRoute}`;
  const tasksUrl = new URL(newPath, currentAbsoluteUrl.origin);

  // Preserve existing query parameters
  tasksUrl.search = currentAbsoluteUrl.search;

  return tasksUrl.href;
}
