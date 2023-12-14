import { useOrganization } from '@clerk/shared/react';

import { NotificationCountBadge, useGate } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import {
  Card,
  Header,
  NavbarMenuButtonRow,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  TabsList,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { ActiveMembersList } from './ActiveMembersList';
import { MembershipWidget } from './MembershipWidget';
import { OrganizationMembersTabInvitations } from './OrganizationMembersTabInvitations';
import { OrganizationMembersTabRequests } from './OrganizationMembersTabRequests';

export const OrganizationMembers = withCardStateProvider(() => {
  const { organizationSettings } = useEnvironment();
  const card = useCardState();
  const { isAuthorizedUser: canManageMemberships } = useGate({ permission: 'org:sys_memberships:manage' });
  const { isAuthorizedUser: canReadMemberships } = useGate({ permission: 'org:sys_memberships:read' });
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
      <NavbarMenuButtonRow />
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationMembers')}
        gap={8}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.start.headerTitle__members')}
            textVariant='h1'
          />
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
          </TabsList>
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
      </Col>
    </Col>
  );
});
