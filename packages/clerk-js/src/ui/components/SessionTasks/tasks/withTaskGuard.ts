import type { ComponentType } from 'react';

import { warnings } from '@/core/warnings';
import { withRedirect } from '@/ui/common';
import { useTaskSelectOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import type { AvailableComponentProps } from '@/ui/types';

export const withTaskGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const ctx = useTaskSelectOrganizationContext();
    return withRedirect(
      Component,
      clerk => !clerk.session?.currentTask,
      ({ clerk }) => ctx.redirectUrlComplete || clerk.buildAfterSignInUrl(),
      warnings.cannotRenderComponentWhenTaskDoesNotExist,
    )(props);
  };

  HOC.displayName = `withTaskGuard(${displayName})`;

  return HOC;
};
