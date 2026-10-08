import { forwardRef } from 'react';

import type { PopoverCard } from '@/ui/elements/PopoverCard';

import { withProtect } from '../../common';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';
import { useOrganizationSwitcherPopoverController } from './organization-switcher-popover.controller';
import {
  useOrganizationSwitcherManageNotificationModel,
  useOrganizationSwitcherPopoverModel,
} from './organization-switcher-popover.model';
import {
  OrganizationSwitcherManageNotificationView,
  OrganizationSwitcherPopoverView,
} from './organization-switcher-popover.view';

type OrganizationSwitcherPopoverProps = { close?: (open: boolean) => void } & PropsOfComponent<typeof PopoverCard.Root>;

export const OrganizationSwitcherPopover = forwardRef<HTMLDivElement, OrganizationSwitcherPopoverProps>(
  (props, ref) => {
    const { close, ...rest } = props;
    const model = useOrganizationSwitcherPopoverModel();
    const controller = useOrganizationSwitcherPopoverController(model, close);

    return (
      <OrganizationSwitcherPopoverView
        {...rest}
        {...controller}
        manageBadge={<NotificationCountBadgeManageButton />}
        ref={ref}
      />
    );
  },
);

const NotificationCountBadgeManageButton = withProtect(
  ({ sx }: { sx?: ThemableCssProp }) => {
    const model = useOrganizationSwitcherManageNotificationModel();

    return (
      <OrganizationSwitcherManageNotificationView
        {...model}
        sx={sx}
      />
    );
  },
  { permission: 'org:sys_memberships:manage' },
);
