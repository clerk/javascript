import type { SessionResource, SessionTask } from '@clerk/types';

import { buildURL } from '../utils';

/**
 * @internal
 */
export const INTERNAL_SESSION_TASK_ROUTE_BY_KEY: Record<SessionTask['key'], string> = {
  'choose-organization': 'choose-organization',
} as const;

/**
 * @internal
 */
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
export function navigateToTask(
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

  return navigate(buildTaskURL(currentTask, { base: baseUrl }));
}
