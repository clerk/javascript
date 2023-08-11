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
  const { membership } = useCoreOrganization();
  //@ts-expect-error
  const { __unstable_manageBillingUrl } = useOrganizationProfileContext();
  const isAdmin = membership?.role === 'admin';

  const allowRequests = organizationSettings?.domains?.enabled && isAdmin;

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
            {isAdmin && (
              <Tab
                localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__invitations')}
              />
            )}
            {allowRequests && (
              <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__requests')} />
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
                {isAdmin && __unstable_manageBillingUrl && <MembershipWidget />}
                <ActiveMembersList />
              </Flex>
            </TabPanel>
            {isAdmin && (
              <TabPanel sx={{ width: '100%' }}>
                <OrganizationMembersTabInvitations />
              </TabPanel>
            )}
            {allowRequests && (
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
