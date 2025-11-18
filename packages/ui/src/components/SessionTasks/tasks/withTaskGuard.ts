import { warnings } from '@clerk/shared/internal/clerk-js/warnings';
import type { ComponentType } from 'react';

import { withRedirect } from '@/ui/common';
import { useTaskChooseOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import type { AvailableComponentProps } from '@/ui/types';

export const withTaskGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const ctx = useTaskChooseOrganizationContext();
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
