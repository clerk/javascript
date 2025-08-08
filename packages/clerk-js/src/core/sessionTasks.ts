import type { ClerkOptions, PendingSessionResource, SessionTask } from '@clerk/types';

import { buildURL } from '../utils';

export const INTERNAL_SESSION_TASK_ROUTE_BY_KEY: Record<SessionTask['key'], string> = {
  'choose-organization': 'choose-organization',
} as const;

interface NavigateToTaskOptions {
  navigate: (to: string) => Promise<unknown>;
  baseUrl: string;
  options?: ClerkOptions;
}

export function buildTaskURL(task: SessionTask, opts: Pick<Parameters<typeof buildURL>[0], 'base'>) {
  return buildURL(
    {
      base: opts.base,
      hashPath: `/tasks/${INTERNAL_SESSION_TASK_ROUTE_BY_KEY[task.key]}`,
    },
    { stringify: true },
  );
}

/**
 * @internal
 */
export function navigateToTask(session: PendingSessionResource, { options, navigate, baseUrl }: NavigateToTaskOptions) {
  const currentTaskKey = session.currentTask.key;

  return navigate(options?.taskUrls?.[currentTaskKey] ?? buildTaskURL(session.currentTask, { base: baseUrl }));
}
