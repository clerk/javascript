import { logger } from '../../logger';
import type { ClerkOptions, SessionResource, SessionTask, SetActiveParams } from '../../types';
import { forwardClerkQueryParams } from './queryParams';
import { buildURL } from './url';

/**
 * @internal
 */
export const INTERNAL_SESSION_TASK_ROUTE_BY_KEY: Record<SessionTask['key'], string> = {
  'choose-organization': 'choose-organization',
  'reset-password': 'reset-password',
  'setup-mfa': 'setup-mfa',
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

/**
 * Warns when a session is in the `pending` state. Mirrors the behavior of
 * `SessionStatusLogger` on iOS / Android so developers across platforms get the
 * same heads-up that the SDK is treating their signed-in user as signed out
 * until the remaining session task is resolved.
 *
 * Dedupe is per-session/per-task: a new pending session or a task transition
 * within the same session both surface a fresh log line.
 */
export function warnPendingSessionStatus(session: Pick<SessionResource, 'id' | 'status' | 'currentTask'>) {
  if (session.status !== 'pending') {
    return;
  }

  const taskKey = session.currentTask?.key;
  const tasksDescription = taskKey ? ` Remaining session tasks: [${taskKey}].` : '';

  logger.warnOnce(
    `Clerk: Session ${session.id} is currently pending. ` +
      `\`isSignedIn\` will return false and \`useAuth\` will report the user as signed out ` +
      `until the remaining session tasks are completed.${tasksDescription}`,
  );
}
