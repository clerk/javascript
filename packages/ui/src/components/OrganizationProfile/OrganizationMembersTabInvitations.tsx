import { withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { ProfileSection } from '@/ui/elements/Section';

import { Protect } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, Flex, localizationKeys, Text } from '../../customizables';
import { mqu } from '../../styledSystem';
import { DomainList } from './DomainList';
import { InvitedMembersList } from './InvitedMembersList';
import { MembersActionsRow } from './MembersActions';

export const OrganizationMembersTabInvitations = withCardStateProvider(() => {
  const { organizationSettings } = useEnvironment();
  const { navigateToGeneralPageRoot } = useOrganizationProfileContext();

  const isDomainsEnabled = organizationSettings?.domains?.enabled;

  return (
    <Col
      gap={4}
      sx={{
        width: '100%',
      }}
    >
      {isDomainsEnabled && (
        <Protect permission={'org:sys_domains:manage'}>
          <Flex
            sx={t => ({
              width: '100%',
              gap: t.space.$8,
              paddingBottom: t.space.$4,
              paddingInlineStart: t.space.$1,
              paddingInlineEnd: t.space.$1,
              borderBottomWidth: t.borderWidths.$normal,
              borderBottomStyle: t.borderStyles.$solid,
              borderBottomColor: t.colors.$borderAlpha100,
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
                    <ProfileSection.ArrowButton
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
                        paddingInlineStart: t.space.$10,
                        color: t.colors.$colorMutedForeground,
                        [mqu.md]: {
                          paddingInlineStart: 0,
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
        gap={2}
        sx={{
          width: '100%',
        }}
      >
        <MembersActionsRow />
        <InvitedMembersList />
      </Flex>
    </Col>
  );
});
