import { warnings } from '@clerk/shared/internal/clerk-js/warnings';
import type { SessionTask } from '@clerk/shared/types';
import type { ComponentType } from 'react';

import { withRedirect } from '@/ui/common';
import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import type { AvailableComponentProps } from '@/ui/types';

type TaskGuardOptions = {
  /**
   * If true, allows the component to render even when the task is no longer active.
   * Useful for tasks that need to display completion state (e.g., backup codes) after the task is resolved.
   */
  allowAfterTaskComplete?: boolean;
};

/**
 * Triggers a redirect if current task is not the given task key.
 *
 * If there's a current session, it will redirect to the `redirectUrlComplete` prop.
 * If there's no current session, it will redirect to the sign in URL.
 *
 * @internal
 */
export const withTaskGuard = <P extends AvailableComponentProps>(
  Component: ComponentType<P>,
  taskKey: SessionTask['key'],
  options?: TaskGuardOptions,
): ((props: P) => null | JSX.Element) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const ctx = useSessionTasksContext();
    return withRedirect(
      Component,
      clerk => {
        if (options?.allowAfterTaskComplete && ctx.shouldAutoNavigateAway?.current === false) {
          return false;
        }
        return (
          !clerk.session?.currentTask ||
          (clerk.session.currentTask.key !== taskKey && !clerk.__internal_setActiveInProgress)
        );
      },
      ({ clerk }) =>
        !clerk.session ? clerk.buildSignInUrl() : (ctx.redirectUrlComplete ?? clerk.buildAfterSignInUrl()),
      warnings.cannotRenderComponentWhenTaskDoesNotExist,
    )(props);
  };

  HOC.displayName = `withTaskGuard(${displayName})`;

  return HOC;
};
