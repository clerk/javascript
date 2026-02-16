import { isDevelopmentFromPublishableKey } from '@clerk/shared/keys';
import { useClerk } from '@clerk/shared/react';
import type { SessionTask } from '@clerk/shared/types';
import type { ComponentType } from 'react';
import { useEffect, useRef } from 'react';

import { warnings } from '@/core/warnings';
import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { useRouter } from '@/ui/router';
import type { AvailableComponentProps } from '@/ui/types';

/**
 * Triggers a redirect if current task is not the given task key on initial mount only.
 *
 * Unlike the standard withTaskGuard, this guard captures the redirect condition on mount
 * and does not re-evaluate it on subsequent renders. This allows tasks like setup-mfa to continue
 * to still show the success screen after the task is completed mid-flow.
 *
 * If there's a current session, it will redirect to the `redirectUrlComplete` prop.
 * If there's no current session, it will redirect to the sign in URL.
 *
 * @internal
 */
export const withTaskGuardOnlyOnMount = <P extends AvailableComponentProps>(
  Component: ComponentType<P>,
  taskKey: SessionTask['key'],
): ((props: P) => null | JSX.Element) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const ctx = useSessionTasksContext();
    const clerk = useClerk();
    const { navigate } = useRouter();

    const shouldRedirectOnMount = useRef<boolean | null>(null);

    if (shouldRedirectOnMount.current === null) {
      shouldRedirectOnMount.current =
        !clerk.session?.currentTask ||
        (clerk.session.currentTask.key !== taskKey && !clerk.__internal_setActiveInProgress);
    }

    useEffect(() => {
      if (shouldRedirectOnMount.current) {
        if (isDevelopmentFromPublishableKey(clerk.publishableKey)) {
          console.info(warnings.cannotRenderComponentWhenTaskDoesNotExist);
        }
        const redirectUrl = !clerk.session
          ? clerk.buildSignInUrl()
          : (ctx.redirectUrlComplete ?? clerk.buildAfterSignInUrl());
        void navigate(redirectUrl);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (shouldRedirectOnMount.current) {
      return null;
    }

    return <Component {...props} />;
  };

  HOC.displayName = `withTaskGuardOnlyOnMount(${displayName})`;

  return HOC;
};
