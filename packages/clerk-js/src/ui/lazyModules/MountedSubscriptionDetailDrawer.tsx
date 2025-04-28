import { useUser } from '@clerk/shared/react';
import type { __experimental_PlanDetailsProps, Appearance } from '@clerk/types';

import { PlanDetails } from './components';
import { LazyDrawerRenderer } from './providers';

export function MountedSubscriptionDetailDrawer({
  appearance,
  planDetailsDrawer,
  onOpenChange,
}: {
  appearance?: Appearance;
  onOpenChange: (open: boolean) => void;
  planDetailsDrawer: {
    open: false;
    props: null | __experimental_PlanDetailsProps;
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
      componentAppearance={{}}
      flowName={'planDetails'}
      open={planDetailsDrawer.open}
      onOpenChange={onOpenChange}
      componentName={'PlanDetails'}
      portalId={planDetailsDrawer.props.portalId}
    >
      <PlanDetails
        {...planDetailsDrawer.props}
        subscriberType={planDetailsDrawer.props.subscriberType || 'user'}
        onSubscriptionCancel={planDetailsDrawer.props.onSubscriptionCancel || (() => {})}
      />
    </LazyDrawerRenderer>
  );
}
