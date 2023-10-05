import { NotificationCountBadge, useGate } from '../../common';
import { useCoreOrganization, useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import {
  CardAlert,
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
  const { isAuthorizedUser: canManageMemberships } = useGate({ permission: 'org:memberships:manage' });
  const isDomainsEnabled = organizationSettings?.domains?.enabled;
  const { membershipRequests } = useCoreOrganization({
    membershipRequests: isDomainsEnabled || undefined,
  });

  // @ts-expect-error
  const { __unstable_manageBillingUrl } = useOrganizationProfileContext();

  if (canManageMemberships === null) {
    return null;
  }

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
    >
      <CardAlert>{card.error}</CardAlert>
      <NavbarMenuButtonRow />
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationMembers')}
        gap={8}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.start.headerTitle__members')}
            textVariant='xxlargeMedium'
          />
          <Header.Subtitle localizationKey={localizationKeys('organizationProfile.start.headerSubtitle__members')} />
        </Header.Root>
        <Tabs>
          <TabsList>
            <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__members')} />
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
