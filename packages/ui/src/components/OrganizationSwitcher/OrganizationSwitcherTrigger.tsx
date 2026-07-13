import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';
import { forwardRef } from 'react';

import { LoadingBadge } from '@/ui/elements/Badge';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { withAvatarShimmer } from '@/ui/elements/withAvatarShimmer';

import { NotificationCountBadge, useProtect } from '../../common';
import { useEnvironment, useOrganizationSwitcherContext, useSubscription } from '../../contexts';
import { Badge, Box, Button, descriptors, Icon, localizationKeys, useLocalizations } from '../../customizables';
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

    const { primaryEmailAddress, primaryPhoneNumber, primaryWeb3Wallet, username, ...userWithoutIdentifiers } = user;

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
            badge={<PlanBadge />}
            avatarSx={t => ({ borderRadius: t.radii.$sm })}
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
          sx={t => ({ marginInlineStart: `${t.space.$2}` })}
        />
      </Button>
    );
  }),
);

const PlanBadge = () => {
  const { isLoading, isFetching, subscriptionItems } = useSubscription();
  const { showPlanName } = useOrganizationSwitcherContext();

  if (!showPlanName) {
    return null;
  }

  if (isLoading || isFetching) {
    // 5ch is specifically chosen to balance the size of "Free" versus paid plans in Inter
    return <LoadingBadge sx={{ width: '5ch' }} />;
  }

  const activeSubscriptionItem = subscriptionItems.find(si => si.status === 'active' || si.status === 'past_due');
  if (!activeSubscriptionItem) {
    return null;
  }

  const { slug, name, isDefault } = activeSubscriptionItem.plan;

  return (
    <Badge
      elementDescriptor={descriptors.organizationSwitcherTriggerBadge}
      elementId={descriptors.organizationSwitcherTriggerBadge.setId(slug)}
      colorScheme={isDefault ? 'primary' : 'secondary'}
      title={name}
      sx={{ minWidth: 0, maxWidth: '14ch' }}
    >
      <Box
        as='span'
        sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {name}
      </Box>
    </Badge>
  );
};

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
        insetInlineEnd: `calc(${t.space.$2} * -1)`,
      })}
      notificationCount={notificationCount}
    />
  );
};
