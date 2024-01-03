import { useOrganization } from '@clerk/shared/react';

import { NotificationCountBadge, useProtect } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, descriptors, Flex, Icon, localizationKeys } from '../../customizables';
import {
  Card,
  Header,
  IconButton,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  TabsList,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { Action } from '../../elements/Action';
import { UserAdd } from '../../icons';
import { mqu, type ThemableCssProp } from '../../styledSystem';
import { ActiveMembersList } from './ActiveMembersList';
import { InviteMembersScreen } from './InviteMembersScreen';
import { MembershipWidget } from './MembershipWidget';
import { OrganizationMembersTabInvitations } from './OrganizationMembersTabInvitations';
import { OrganizationMembersTabRequests } from './OrganizationMembersTabRequests';

export const InviteMembersButton = (props: { sx?: ThemableCssProp }) => {
  return (
    <IconButton
      {...props}
      elementDescriptor={descriptors.membersPageInviteButton}
      aria-label='Invite'
      icon={
        <Icon
          icon={UserAdd}
          size={'sm'}
          sx={t => ({ marginRight: t.space.$2 })}
        />
      }
      textVariant='buttonSmall'
      localizationKey={localizationKeys('organizationProfile.membersPage.action__invite')}
    />
  );
};

export const OrganizationMembers = withCardStateProvider(() => {
  const { organizationSettings } = useEnvironment();
  const card = useCardState();
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });
  const canReadMemberships = useProtect({ permission: 'org:sys_memberships:read' });
  const isDomainsEnabled = organizationSettings?.domains?.enabled;
  const { membershipRequests } = useOrganization({
    membershipRequests: isDomainsEnabled || undefined,
  });

  // @ts-expect-error This property is not typed. It is used by our dashboard in order to render a billing widget.
  const { __unstable_manageBillingUrl } = useOrganizationProfileContext();

  if (canManageMemberships === null) {
    return null;
  }

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
    >
      <Card.Alert>{card.error}</Card.Alert>
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationMembers')}
        gap={8}
      >
        <Action.Root>
          <Header.Root sx={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
            <Header.Title
              localizationKey={localizationKeys('organizationProfile.start.headerTitle__members')}
              textVariant='h2'
            />
            {canManageMemberships && (
              <Action.Trigger value='invite'>
                <InviteMembersButton
                  sx={{
                    display: 'none',
                    [mqu.md]: {
                      display: 'inline-flex',
                    },
                  }}
                />
              </Action.Trigger>
            )}
          </Header.Root>
          <Tabs>
            <TabsList>
              {canReadMemberships && (
                <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__members')} />
              )}
              {canManageMemberships && (
                <Tab
                  localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__invitations')}
                />
              )}
              {canManageMemberships && isDomainsEnabled && (
                <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__requests')}>
                  <NotificationCountBadge notificationCount={membershipRequests?.count || 0} />
                </Tab>
              )}
              <Col
                justify='center'
                sx={{
                  marginLeft: 'auto',
                  [mqu.md]: {
                    display: 'none',
                  },
                }}
              >
                {canManageMemberships && (
                  <Action.Trigger value='invite'>
                    <InviteMembersButton />
                  </Action.Trigger>
                )}
              </Col>
            </TabsList>
            {canReadMemberships && (
              <Action.Open value='invite'>
                <Action.Card>
                  <InviteMembersScreen />
                </Action.Card>
              </Action.Open>
            )}
            <TabPanels>
              {canReadMemberships && (
                <TabPanel sx={{ width: '100%' }}>
                  <Flex
                    gap={4}
                    direction='col'
                    sx={{
                      width: '100%',
                    }}
                  >
                    {canManageMemberships && __unstable_manageBillingUrl && <MembershipWidget />}
                    <ActiveMembersList />
                  </Flex>
                </TabPanel>
              )}
              {canManageMemberships && (
                <TabPanel sx={{ width: '100%' }}>
                  <OrganizationMembersTabInvitations />
                </TabPanel>
              )}
              {canManageMemberships && isDomainsEnabled && (
                <TabPanel sx={{ width: '100%' }}>
                  <OrganizationMembersTabRequests />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Action.Root>
      </Col>
    </Col>
  );
});
