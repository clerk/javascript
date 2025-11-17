import type { __experimental_CheckoutButtonProps } from '@clerk/types';
import React from 'react';

import { mergePortalProps, normalizePortalRoot } from './portalProps';
import type { WithClerkProp } from './utils';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute, withClerk } from './utils';

export type { __experimental_CheckoutButtonProps as CheckoutButtonProps };

export const CheckoutButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<__experimental_CheckoutButtonProps>>) => {
    const {
      planId,
      planPeriod,
      for: _for,
      onSubscriptionComplete,
      newSubscriptionRedirectUrl,
      checkoutProps,
      ...rest
    } = props;

    // Note: Auth checks are moved to runtime since Astro React components
    // don't have access to auth context at render time like Vue/React apps do

    children = normalizeWithDefaultValue(children, 'Checkout');
    const child = assertSingleChild(children)('CheckoutButton');

    const clickHandler = () => {
      if (!clerk) {
        return;
      }

      // Merge portal config: top-level props take precedence over nested checkoutProps
      // Note: checkoutProps.portalRoot is PortalRoot (HTMLElement | null | undefined) which is
      // incompatible with PortalProps.portalRoot, so we handle portalRoot separately
      // Also note: __internal_CheckoutProps only supports portalId and portalRoot, not disablePortal
      const topLevelPortalConfig = mergePortalProps(props);

      // Get portalRoot from top-level props first, then fallback to checkoutProps
      const portalRootValue = topLevelPortalConfig.portalRoot
        ? normalizePortalRoot(topLevelPortalConfig.portalRoot)
        : (checkoutProps?.portalRoot ?? undefined);

      return clerk.__internal_openCheckout({
        planId,
        planPeriod,
        for: _for,
        onSubscriptionComplete,
        newSubscriptionRedirectUrl,
        ...checkoutProps,
        portalId: topLevelPortalConfig.portalId ?? checkoutProps?.portalId,
        portalRoot: portalRootValue,
      });
    };

    const wrappedChildClickHandler: React.MouseEventHandler = e => {
      if (child && typeof child === 'object' && 'props' in child) {
        void safeExecute(child.props.onClick)(e);
      }
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  'CheckoutButton',
);
