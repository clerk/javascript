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
  //@ts-expect-error
  const { __unstable_manageBillingUrl } = useOrganizationProfileContext();

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
                textVariant='h2'
              />
              <Header.Subtitle
                localizationKey={localizationKeys(
                  'organizationProfile.membersPage.invitationsTab.autoInvitations.headerSubtitle',
                )}
                variant='subtitle'
              />
            </Header.Root>
            <DomainList
              fallback={
                <BlockButton
                  textLocalizationKey={localizationKeys(
                    'organizationProfile.membersPage.invitationsTab.autoInvitations.primaryButton',
                  )}
                  id='manageVerifiedDomains'
                  onClick={() => navigate('organization-settings/domain')}
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
              textVariant='h2'
            />
            <Header.Subtitle
              localizationKey={localizationKeys(
                'organizationProfile.membersPage.invitationsTab.manualInvitations.headerSubtitle',
              )}
              variant='subtitle'
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
            textVariant='buttonSmall'
            localizationKey={localizationKeys('organizationProfile.membersPage.action__invite')}
          />
        </Flex>
        <InvitedMembersList />
      </Flex>
    </Col>
  );
};
