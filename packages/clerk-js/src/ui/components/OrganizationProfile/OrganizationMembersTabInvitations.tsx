import { BlockButton, Gate } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, descriptors, Flex, Icon, localizationKeys } from '../../customizables';
import { Header, IconButton } from '../../elements';
import { UserAdd } from '../../icons';
import { useRouter } from '../../router';
import { DomainList } from './DomainList';
import { InvitedMembersList } from './InvitedMembersList';
import { MembershipWidget } from './MembershipWidget';

export const OrganizationMembersTabInvitations = () => {
  const { organizationSettings } = useEnvironment();
  const { navigate } = useRouter();
  const {
    //@ts-expect-error
    __unstable_manageBillingUrl,
    navigateToAddDomainPage,
  } = useOrganizationProfileContext();

  const isDomainsEnabled = organizationSettings?.domains?.enabled;

  return (
    <Col
      gap={8}
      sx={{
        width: '100%',
      }}
    >
      {__unstable_manageBillingUrl && <MembershipWidget />}

      {isDomainsEnabled && (
        <Gate permission={'org:sys_domains:manage'}>
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
                <BlockButton
                  colorScheme='primary'
                  textLocalizationKey={localizationKeys(
                    'organizationProfile.membersPage.invitationsTab.autoInvitations.primaryButton',
                  )}
                  id='manageVerifiedDomains'
                  onClick={navigateToAddDomainPage}
                />
              }
              redirectSubPath={'organization-settings/domain'}
              verificationStatus={'verified'}
              enrollmentMode={'automatic_invitation'}
            />
          </Col>
        </Gate>
      )}

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
        </Flex>
        <InvitedMembersList />
      </Flex>
    </Col>
  );
};
