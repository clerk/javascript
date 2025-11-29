import { logger } from '@clerk/shared/logger';
import type { ClerkOptions, SessionResource, SessionTask, SetActiveParams } from '@clerk/shared/types';

import { buildURL, forwardClerkQueryParams } from '../utils';

/**
 * @internal
 */
export const INTERNAL_SESSION_TASK_ROUTE_BY_KEY: Record<SessionTask['key'], string> = {
  'choose-organization': 'choose-organization',
  'reset-password': 'reset-password',
} as const;

/**
 * @internal
 */
export const getTaskEndpoint = (task: SessionTask) => `/tasks/${INTERNAL_SESSION_TASK_ROUTE_BY_KEY[task.key]}`;

/**
 * @internal
 */
export function buildTaskUrl(task: SessionTask, opts: Pick<Parameters<typeof buildURL>[0], 'base'>) {
  const params = forwardClerkQueryParams();

  return buildURL(
    {
      base: opts.base,
      hashPath: getTaskEndpoint(task),
      searchParams: params,
    },
    { stringify: true },
  );
}

/**
 * @internal
 */
export function navigateIfTaskExists(
  session: SessionResource,
  {
    navigate,
    baseUrl,
  }: {
    navigate: (to: string) => Promise<unknown>;
    baseUrl: string;
  },
) {
  const currentTask = session.currentTask;
  if (!currentTask) {
    return;
  }

  return navigate(buildTaskUrl(currentTask, { base: baseUrl }));
}

export function warnMissingPendingTaskHandlers(options: Record<string, unknown>) {
  const taskOptions = ['taskUrls', 'navigate'] as Array<
    keyof (Pick<SetActiveParams, 'navigate'> & Pick<ClerkOptions, 'taskUrls'>)
  >;

  const hasAtLeastOneOption = Object.keys(options).some(option => taskOptions.includes(option as any));
  if (hasAtLeastOneOption) {
    return;
  }

  // TODO - Link to after-auth docs once it gets released
  logger.warnOnce(
    `Clerk: Session has pending tasks but no handling is configured. To handle pending tasks, provide either "taskUrls" for navigation to custom URLs or "navigate" for programmatic navigation. Without these options, users may get stuck on incomplete flows.`,
  );
}
