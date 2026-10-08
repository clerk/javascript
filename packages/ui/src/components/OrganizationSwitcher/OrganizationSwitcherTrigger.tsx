import { forwardRef } from 'react';

import { withAvatarShimmer } from '@/ui/elements/withAvatarShimmer';

import {
  useOrganizationSwitcherNotificationModel,
  useOrganizationSwitcherTriggerModel,
} from './organization-switcher-trigger.model';
import {
  OrganizationSwitcherNotificationView,
  type OrganizationSwitcherTriggerProps,
  OrganizationSwitcherTriggerView,
} from './organization-switcher-trigger.view';

export const OrganizationSwitcherTrigger = withAvatarShimmer(
  forwardRef<HTMLButtonElement, OrganizationSwitcherTriggerProps>((props, ref) => {
    const model = useOrganizationSwitcherTriggerModel(props.isOpen);

    return (
      <OrganizationSwitcherTriggerView
        {...props}
        {...model}
        badge={<NotificationCountBadgeSwitcherTrigger />}
        ref={ref}
      />
    );
  }),
);

const NotificationCountBadgeSwitcherTrigger = () => {
  const model = useOrganizationSwitcherNotificationModel();

  return <OrganizationSwitcherNotificationView {...model} />;
};
