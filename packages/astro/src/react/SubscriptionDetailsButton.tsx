import type { __experimental_SubscriptionDetailsButtonProps } from '@clerk/types';
import React from 'react';

import type { WithClerkProp } from './utils';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute, withClerk } from './utils';
import { mergePortalProps, normalizePortalRoot } from './portalProps';

export type { __experimental_SubscriptionDetailsButtonProps as SubscriptionDetailsButtonProps };

export const SubscriptionDetailsButton = withClerk(
  ({
    clerk,
    children,
    ...props
  }: WithClerkProp<React.PropsWithChildren<__experimental_SubscriptionDetailsButtonProps>>) => {
    const { for: _for, subscriptionDetailsProps, onSubscriptionCancel, ...rest } = props;
    children = normalizeWithDefaultValue(children, 'Subscription details');
    const child = assertSingleChild(children)('SubscriptionDetailsButton');

    // Note: Auth checks are moved to runtime since Astro React components
    // don't have access to auth context at render time like Vue/React apps do

    const clickHandler = () => {
      if (!clerk) {
        return;
      }

      // Merge portal config: top-level props take precedence over nested subscriptionDetailsProps
      // Note: subscriptionDetailsProps.portalRoot is PortalRoot (HTMLElement | null | undefined) which is
      // incompatible with PortalProps.portalRoot, so we handle portalRoot separately
      const topLevelPortalConfig = mergePortalProps(props);

      // Get portalRoot from top-level props first, then fallback to subscriptionDetailsProps
      const portalRootValue = topLevelPortalConfig.portalRoot
        ? normalizePortalRoot(topLevelPortalConfig.portalRoot)
        : (subscriptionDetailsProps?.portalRoot ?? undefined);

      return clerk.__internal_openSubscriptionDetails({
        for: _for,
        onSubscriptionCancel,
        ...subscriptionDetailsProps,
        portalId: topLevelPortalConfig.portalId ?? subscriptionDetailsProps?.portalId,
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
  'SubscriptionDetailsButton',
);
