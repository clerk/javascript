import { useUser } from '@clerk/shared/react';
import type { __internal_PlanDetailsProps, Appearance } from '@clerk/shared/types';

import { PlanDetails } from './components';
import { LazyDrawerRenderer } from './providers';

export function MountedPlanDetailDrawer({
  appearance,
  planDetailsDrawer,
  onOpenChange,
}: {
  appearance?: Appearance;
  onOpenChange: (open: boolean) => void;
  planDetailsDrawer: {
    open: false;
    props: null | __internal_PlanDetailsProps;
  };
}) {
  const { user } = useUser();
  if (!planDetailsDrawer.props) {
    return null;
  }

  return (
    <LazyDrawerRenderer
      // We set `key` to be the user id to "reset" floating ui portals on session switch.
      // Without this, the drawer would not be rendered after a session switch.
      key={user?.id}
      globalAppearance={appearance}
      appearanceKey={'planDetails' as any}
      componentAppearance={planDetailsDrawer.props.appearance || {}}
      flowName={'planDetails'}
      open={planDetailsDrawer.open}
      onOpenChange={onOpenChange}
      componentName={'PlanDetails'}
      portalId={planDetailsDrawer.props.portalId}
      portalRoot={planDetailsDrawer.props.portalRoot as HTMLElement | null | undefined}
    >
      <PlanDetails {...planDetailsDrawer.props} />
    </LazyDrawerRenderer>
  );
}
