import { useUser } from '@clerk/shared/react';
import type { __experimental_SubscriptionDetailsProps, Appearance } from '@clerk/types';

import { SubscriptionDetails } from './components';
import { LazyDrawerRenderer } from './providers';

export function MountedSubscriptionDetailDrawer({
  appearance,
  subscriptionDetailsDrawer,
  onOpenChange,
}: {
  appearance?: Appearance;
  onOpenChange: (open: boolean) => void;
  subscriptionDetailsDrawer: {
    open: false;
    props: null | __experimental_SubscriptionDetailsProps;
  };
}) {
  const { user } = useUser();
  if (!subscriptionDetailsDrawer.props) {
    return null;
  }

  return (
    <LazyDrawerRenderer
      // We set `key` to be the user id to "reset" floating ui portals on session switch.
      // Without this, the drawer would not be rendered after a session switch.
      key={user?.id}
      globalAppearance={appearance}
      appearanceKey={'subscriptionDetails' as any}
      componentAppearance={{}}
      flowName={'subscriptionDetails'}
      open={subscriptionDetailsDrawer.open}
      onOpenChange={onOpenChange}
      componentName={'SubscriptionDetails'}
      portalId={subscriptionDetailsDrawer.props.portalId}
    >
      <SubscriptionDetails
        {...subscriptionDetailsDrawer.props}
        subscriberType={subscriptionDetailsDrawer.props.subscriberType || 'user'}
        onSubscriptionCancel={subscriptionDetailsDrawer.props.onSubscriptionCancel || (() => {})}
      />
    </LazyDrawerRenderer>
  );
}
