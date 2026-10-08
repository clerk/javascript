import { forwardRef, type ReactNode } from 'react';

import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';

import { NotificationCountBadge } from '../../common';
import { Button, descriptors, Icon } from '../../customizables';
import { ChevronDown } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { organizationSwitcherMessages } from './organization-switcher.messages';
import type { OrganizationSwitcherTriggerData } from './organization-switcher.types';

export type OrganizationSwitcherTriggerProps = PropsOfComponent<typeof Button> & { isOpen: boolean };

export const OrganizationSwitcherTriggerView = forwardRef<
  HTMLButtonElement,
  OrganizationSwitcherTriggerProps &
    OrganizationSwitcherTriggerData & {
      badge: ReactNode;
    }
>((props, ref) => {
  const { sx, isVisible, hidePersonal, organization, user, ariaLabel, isOpen, badge, ...rest } = props;

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherTrigger}
      elementId={descriptors.organizationSwitcherTrigger.setId(organization ? 'organization' : 'personal')}
      variant='ghost'
      colorScheme='neutral'
      hoverAsFocus
      focusRing={false}
      sx={[
        t => ({
          padding: `${t.space.$1} ${t.space.$2} ${t.space.$1} ${t.space.$1}`,
          position: 'relative',
          '&[aria-expanded="true"]': {
            backgroundColor: 'var(--alpha)',
            color: 'var(--accentHover)',
          },
        }),
        sx,
      ]}
      ref={ref}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      aria-haspopup='dialog'
      {...rest}
    >
      {organization && (
        <OrganizationPreview
          elementId={'organizationSwitcherTrigger'}
          gap={3}
          size='xs'
          organization={organization}
          avatarSx={t => ({ borderRadius: t.radii.$sm })}
          sx={{ maxWidth: '30ch' }}
        />
      )}

      {!organization && (
        <PersonalWorkspacePreview
          size='xs'
          gap={3}
          user={user}
          showAvatar={!hidePersonal}
          sx={t => ({ color: t.colors.$colorMutedForeground })}
          title={
            hidePersonal
              ? organizationSwitcherMessages.organizations.notSelected
              : organizationSwitcherMessages.organizations.personal
          }
        />
      )}

      {badge}

      <Icon
        elementDescriptor={descriptors.organizationSwitcherTriggerIcon}
        icon={ChevronDown}
        sx={t => ({ marginInlineStart: `${t.space.$2}` })}
      />
    </Button>
  );
});

export const OrganizationSwitcherNotificationView = ({ notificationCount }: { notificationCount: number }) => {
  if (!notificationCount) {
    return null;
  }

  return (
    <NotificationCountBadge
      containerSx={t => ({
        position: 'absolute',
        top: `calc(${t.space.$2} * -1)`,
        insetInlineEnd: `calc(${t.space.$2} * -1)`,
      })}
      notificationCount={notificationCount}
    />
  );
};
