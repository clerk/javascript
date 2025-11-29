import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';
import { forwardRef } from 'react';

import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { withAvatarShimmer } from '@/ui/elements/withAvatarShimmer';

import { NotificationCountBadge, useProtect } from '../../common';
import { useEnvironment, useOrganizationSwitcherContext } from '../../contexts';
import { Button, descriptors, Icon, localizationKeys, useLocalizations } from '../../customizables';
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
    const { t } = useLocalizations();

    if (!user) {
      return null;
    }

    const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

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
            padding: `${t.space.$1} ${t.space.$2}`,
            position: 'relative',
          }),
          sx,
        ]}
        ref={ref}
        aria-label={`${props.isOpen ? t(localizationKeys('organizationSwitcher.action__closeOrganizationSwitcher')) : t(localizationKeys('organizationSwitcher.action__openOrganizationSwitcher'))}`}
        aria-expanded={props.isOpen}
        aria-haspopup='dialog'
        {...rest}
      >
        {organization && (
          <OrganizationPreview
            elementId={'organizationSwitcherTrigger'}
            gap={3}
            size='xs'
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
            sx={t => ({ color: t.colors.$colorMutedForeground })}
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
        top: `calc(${t.space.$2} * -1)`,
        right: `calc(${t.space.$2} * -1)`,
      })}
      notificationCount={notificationCount}
    />
  );
};
