import { useUser } from '@clerk/shared/react';
import type { __internal_SubscriptionDetailsProps, Appearance } from '@clerk/shared/types';

import { SubscriptionDetails } from '../components/SubscriptionDetails';
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
    props: null | __internal_SubscriptionDetailsProps;
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
      componentAppearance={subscriptionDetailsDrawer.props.appearance || {}}
      flowName={'subscriptionDetails'}
      open={subscriptionDetailsDrawer.open}
      onOpenChange={onOpenChange}
      componentName={'SubscriptionDetails'}
      portalId={subscriptionDetailsDrawer.props.portalId}
      portalRoot={subscriptionDetailsDrawer.props.portalRoot as HTMLElement | null | undefined}
    >
      <SubscriptionDetails {...subscriptionDetailsDrawer.props} />
    </LazyDrawerRenderer>
  );
}
