import { Protect } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, Flex, localizationKeys, Text } from '../../customizables';
import { Header, ProfileSection } from '../../elements';
import { mqu } from '../../styledSystem';
import { DomainList } from './DomainList';
import { InvitedMembersList } from './InvitedMembersList';
import { MembershipWidget } from './MembershipWidget';

export const OrganizationMembersTabInvitations = () => {
  const { organizationSettings } = useEnvironment();
  //@ts-expect-error
  const { __unstable_manageBillingUrl, navigateToGeneralPageRoot } = useOrganizationProfileContext();

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
        <Protect permission={'org:sys_domains:manage'}>
          <Flex
            sx={t => ({
              width: '100%',
              gap: t.space.$8,
              [mqu.md]: {
                flexDirection: 'column',
                gap: t.space.$2,
              },
            })}
          >
            <Col sx={t => ({ width: t.space.$66, marginTop: t.space.$2 })}>
              <Header.Root>
                <Header.Title
                  localizationKey={localizationKeys(
                    'organizationProfile.membersPage.invitationsTab.autoInvitations.headerTitle',
                  )}
                  textVariant='h3'
                />
              </Header.Root>
            </Col>
            <Col sx={{ width: '100%' }}>
              <DomainList
                fallback={
                  <>
                    <ProfileSection.Button
                      localizationKey={localizationKeys(
                        'organizationProfile.membersPage.invitationsTab.autoInvitations.primaryButton',
                      )}
                      id='manageVerifiedDomains'
                      sx={t => ({ gap: t.space.$2 })}
                      onClick={navigateToGeneralPageRoot}
                    />
                    <Text
                      localizationKey={localizationKeys(
                        'organizationProfile.membersPage.invitationsTab.autoInvitations.headerSubtitle',
                      )}
                      sx={t => ({
                        paddingLeft: t.space.$10,
                        color: t.colors.$colorTextSecondary,
                        [mqu.md]: {
                          paddingLeft: 0,
                        },
                      })}
                    />
                  </>
                }
                verificationStatus={'verified'}
                enrollmentMode={'automatic_invitation'}
              />
            </Col>
          </Flex>
        </Protect>
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
              textVariant='h3'
            />
            <Header.Subtitle
              localizationKey={localizationKeys(
                'organizationProfile.membersPage.invitationsTab.manualInvitations.headerSubtitle',
              )}
              variant='body'
            />
          </Header.Root>
        </Flex>
        <InvitedMembersList />
      </Flex>
    </Col>
  );
};
