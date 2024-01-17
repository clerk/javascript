import { useOrganization } from '@clerk/shared/react';

import { NotificationCountBadge, useProtect } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Button, Col, descriptors, Flex, localizationKeys } from '../../customizables';
import {
  Card,
  Header,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  TabsList,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { Action } from '../../elements/Action';
import { mqu, type ThemableCssProp } from '../../styledSystem';
import { ActiveMembersList } from './ActiveMembersList';
import { InviteMembersScreen } from './InviteMembersScreen';
import { MembershipWidget } from './MembershipWidget';
import { OrganizationMembersTabInvitations } from './OrganizationMembersTabInvitations';
import { OrganizationMembersTabRequests } from './OrganizationMembersTabRequests';

export const InviteMembersButton = (props: { sx?: ThemableCssProp }) => {
  return (
    <Button
      {...props}
      elementDescriptor={descriptors.membersPageInviteButton}
      aria-label='Invite'
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
      gap={2}
    >
      <Card.Alert>{card.error}</Card.Alert>
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationMembers')}
        gap={4}
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
          {canReadMemberships && (
            <Action.Open value='invite'>
              <Action.Card>
                <InviteMembersScreen />
              </Action.Card>
            </Action.Open>
          )}
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
            </TabsList>
            {canManageMemberships && (
              <Flex
                justify='end'
                sx={{
                  marginLeft: 'auto',
                  [mqu.md]: {
                    display: 'none',
                  },
                }}
              >
                <Action.Trigger value='invite'>
                  <InviteMembersButton />
                </Action.Trigger>
              </Flex>
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
