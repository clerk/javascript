import { CalloutWithAction } from '../../common';
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
import { DomainList } from './DomainList';
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
                <Col
                  gap={8}
                  sx={{
                    width: '100%',
                  }}
                >
                  {isAdmin && __unstable_manageBillingUrl && <MembershipWidget />}
                  <Col
                    gap={2}
                    sx={{
                      width: '100%',
                    }}
                  >
                    <Header.Root>
                      <Header.Title
                        localizationKey={localizationKeys(
                          'organizationProfile.membersPage.invitationsTab.autoInvitations.headerTitle',
                        )}
                        textVariant='largeMedium'
                      />
                      <Header.Subtitle
                        localizationKey={localizationKeys(
                          'organizationProfile.membersPage.invitationsTab.autoInvitations.headerSubtitle',
                        )}
                        variant='regularRegular'
                      />
                    </Header.Root>
                    <DomainList
                      fallback={
                        <CalloutWithAction
                          text={localizationKeys(
                            'organizationProfile.membersPage.invitationsTab.autoInvitations.calloutTextLabel',
                          )}
                          actionLabel={localizationKeys(
                            'organizationProfile.membersPage.invitationsTab.autoInvitations.calloutActionLabel',
                          )}
                          onClick={() => navigate('organization-settings/domain')}
                        />
                      }
                      redirectSubPath={'organization-settings/domain/'}
                      verificationStatus={'verified'}
                      enrollmentMode={'automatic_invitation'}
                    />
                  </Col>

                  <Flex
                    direction='col'
                    gap={4}
                    sx={{
                      width: '100%',
                    }}
                  >
                    <Flex
                      justify={'between'}
                      align={'center'}
                    >
                      <Header.Root>
                        <Header.Title
                          localizationKey={localizationKeys(
                            'organizationProfile.membersPage.invitationsTab.manualInvitations.headerTitle',
                          )}
                          textVariant='largeMedium'
                        />
                        <Header.Subtitle
                          localizationKey={localizationKeys(
                            'organizationProfile.membersPage.invitationsTab.manualInvitations.headerSubtitle',
                          )}
                          variant='regularRegular'
                        />
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
                    <InvitedMembersList />
                  </Flex>
                </Col>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Col>
    </Col>
  );
});
