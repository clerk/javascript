import { useUser } from '@clerk/shared/react';
import type { __internal_CheckoutProps, Appearance } from '@clerk/shared/types';

import { Checkout } from './components';
import { LazyDrawerRenderer } from './providers';

export function MountedCheckoutDrawer({
  appearance,
  checkoutDrawer,
  onOpenChange,
}: {
  appearance?: Appearance;
  onOpenChange: (open: boolean) => void;
  checkoutDrawer: {
    open: false;
    props: null | __internal_CheckoutProps;
  };
}) {
  const { user } = useUser();
  if (!checkoutDrawer.props) {
    return null;
  }

  return (
    <LazyDrawerRenderer
      // We set `key` to be the user id to "reset" floating ui portals on session switch.
      // Without this, the drawer would not be rendered after a session switch.
      key={user?.id}
      globalAppearance={appearance}
      appearanceKey={'checkout'}
      componentAppearance={checkoutDrawer.props.appearance || {}}
      flowName={'checkout'}
      open={checkoutDrawer.open}
      onOpenChange={onOpenChange}
      componentName={'Checkout'}
      portalId={checkoutDrawer.props?.portalId}
      portalRoot={checkoutDrawer.props?.portalRoot as HTMLElement | null | undefined}
    >
      {checkoutDrawer.props && (
        <Checkout
          planId={checkoutDrawer.props.planId}
          planPeriod={checkoutDrawer.props.planPeriod}
          for={checkoutDrawer.props.for}
          onSubscriptionComplete={checkoutDrawer.props.onSubscriptionComplete}
          portalRoot={checkoutDrawer.props.portalRoot}
          appearance={checkoutDrawer.props.appearance}
          newSubscriptionRedirectUrl={checkoutDrawer.props.newSubscriptionRedirectUrl}
        />
      )}
    </LazyDrawerRenderer>
  );
}
