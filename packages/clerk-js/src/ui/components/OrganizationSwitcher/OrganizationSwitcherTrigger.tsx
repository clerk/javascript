import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';
import { forwardRef } from 'react';

import { NotificationCountBadge, useProtect } from '../../common';
import { useEnvironment, useOrganizationSwitcherContext } from '../../contexts';
import { Button, descriptors, Icon, localizationKeys } from '../../customizables';
import { OrganizationPreview, PersonalWorkspacePreview, withAvatarShimmer } from '../../elements';
import { ChevronDown } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { organizationListParams } from './utils';

type OrganizationSwitcherTriggerProps = PropsOfComponent<typeof Button> & {
  isOpen: boolean;
};

export const OrganizationSwitcherTrigger = withAvatarShimmer(
  forwardRef<HTMLButtonElement, OrganizationSwitcherTriggerProps>((props, ref) => {
    const { sx, ...rest } = props;

    const { user } = useUser();
    const { organization } = useOrganization();
    const { hidePersonal } = useOrganizationSwitcherContext();

    if (!user) {
      return null;
    }

    const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

    return (
      <Button
        elementDescriptor={descriptors.organizationSwitcherTrigger}
        variant='ghost'
        colorScheme='neutral'
        hoverAsFocus
        focusRing={false}
        sx={[
          t => ({
            padding: `${t.space.$1} ${t.space.$2}`,
            position: 'relative',
          }),
          sx,
        ]}
        ref={ref}
        aria-label={`${props.isOpen ? 'Close' : 'Open'} organization switcher`}
        aria-expanded={props.isOpen}
        aria-haspopup='dialog'
        {...rest}
      >
        {organization && (
          <OrganizationPreview
            elementId={'organizationSwitcherTrigger'}
            gap={3}
            size='xs'
            fetchRoles
            organization={organization}
            sx={{ maxWidth: '30ch' }}
          />
        )}
        {!organization && (
          <PersonalWorkspacePreview
            size='xs'
            gap={3}
            user={userWithoutIdentifiers}
            showAvatar={!hidePersonal}
            sx={t => ({ color: t.colors.$colorTextSecondary })}
            title={
              hidePersonal
                ? localizationKeys('organizationSwitcher.notSelected')
                : localizationKeys('organizationSwitcher.personalWorkspace')
            }
          />
        )}

        <NotificationCountBadgeSwitcherTrigger />

        <Icon
          elementDescriptor={descriptors.organizationSwitcherTriggerIcon}
          icon={ChevronDown}
          sx={t => ({ marginLeft: `${t.space.$2}` })}
        />
      </Button>
    );
  }),
);

const NotificationCountBadgeSwitcherTrigger = () => {
  /**
   * Prefetch user invitations and suggestions
   */
  const { userInvitations, userSuggestions } = useOrganizationList(organizationListParams);
  const { organizationSettings } = useEnvironment();
  const canAcceptRequests = useProtect({
    permission: 'org:sys_memberships:manage',
  });
  const isDomainsEnabled = organizationSettings?.domains?.enabled;
  const { membershipRequests } = useOrganization({
    membershipRequests: (isDomainsEnabled && canAcceptRequests) || undefined,
  });

  const notificationCount =
    (userInvitations.count || 0) + (userSuggestions.count || 0) + (membershipRequests?.count || 0);

  if (!notificationCount) {
    return null;
  }

  return (
    <NotificationCountBadge
      containerSx={t => ({
        position: 'absolute',
        top: `-${t.space.$2}`,
        right: `-${t.space.$2}`,
      })}
      notificationCount={notificationCount}
    />
  );
};
