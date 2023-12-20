import { BlockButton, Gate } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, Flex, localizationKeys } from '../../customizables';
import { Header } from '../../elements';
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
                  onClick={() => navigate('../')}
                />
              }
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
        </Flex>
        <InvitedMembersList />
      </Flex>
    </Col>
  );
};
