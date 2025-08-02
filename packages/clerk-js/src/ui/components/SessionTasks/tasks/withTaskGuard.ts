import type { ComponentType } from 'react';

import { warnings } from '@/core/warnings';
import { withRedirect } from '@/ui/common';
import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import type { AvailableComponentProps } from '@/ui/types';

export const withTaskGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const ctx = useSessionTasksContext();
    return withRedirect(
      Component,
      clerk => !clerk.session?.currentTask,
      ({ clerk }) =>
        !clerk.session ? clerk.buildSignInUrl() : (ctx.redirectUrlComplete ?? clerk.buildAfterSignInUrl()),
      warnings.cannotRenderComponentWhenTaskDoesNotExist,
    )(props);
  };

  HOC.displayName = `withTaskGuard(${displayName})`;

  return HOC;
};
