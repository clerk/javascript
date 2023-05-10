import { useCoreOrganization, useOrganizationProfileContext } from '../../contexts';
import { Col, descriptors, Flex, Icon, localizationKeys } from '../../customizables';
import {
  CardAlert,
  Header,
  IconButton,
  NavbarMenuButtonRow,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  TabsList,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { UserAdd } from '../../icons';
import { useRouter } from '../../router';
import { ActiveMembersList } from './ActiveMembersList';
import { InvitedMembersList } from './InvitedMembersList';
import { MembershipWidget } from './MembershipWidget';

export const OrganizationMembers = withCardStateProvider(() => {
  const { navigate } = useRouter();
  const card = useCardState();
  const { membership } = useCoreOrganization();
  //@ts-expect-error
  const { __unstable_manageBillingUrl } = useOrganizationProfileContext();
  const isAdmin = membership?.role === 'admin';

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
        <Flex
          justify={'between'}
          align={'center'}
        >
          <Header.Root>
            <Header.Title
              localizationKey={localizationKeys('organizationProfile.start.headerTitle__members')}
              textVariant='xxlargeMedium'
            />
            <Header.Subtitle localizationKey={localizationKeys('organizationProfile.start.headerSubtitle__members')} />
          </Header.Root>
          {isAdmin && (
            <IconButton
              elementDescriptor={descriptors.membersPageInviteButton}
              aria-label='Invite'
              onClick={() => navigate('invite-members')}
              icon={
                <Icon
                  icon={UserAdd}
                  size={'sm'}
                  sx={t => ({ marginRight: t.space.$2 })}
                />
              }
              textVariant='buttonExtraSmallBold'
              localizationKey={localizationKeys('organizationProfile.membersPage.action__invite')}
            />
          )}
        </Flex>
        <Tabs>
          <TabsList>
            <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__active')} />
            {isAdmin && (
              <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__invited')} />
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
                <Flex
                  direction='col'
                  gap={4}
                  sx={{
                    width: '100%',
                  }}
                >
                  {isAdmin && __unstable_manageBillingUrl && <MembershipWidget />}
                  <InvitedMembersList />
                </Flex>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Col>
    </Col>
  );
});
