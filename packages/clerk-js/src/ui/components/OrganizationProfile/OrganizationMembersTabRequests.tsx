import { Header } from '@/ui/elements/Header';
import { ProfileSection } from '@/ui/elements/Section';

import { Protect } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, Flex, localizationKeys, Text } from '../../customizables';
import { mqu } from '../../styledSystem';
import { DomainList } from './DomainList';
import { MembersActionsRow } from './MembersActions';
import { MembershipWidget } from './MembershipWidget';
import { RequestToJoinList } from './RequestToJoinList';

export const OrganizationMembersTabRequests = () => {
  const { organizationSettings } = useEnvironment();
  //@ts-expect-error
  const { __unstable_manageBillingUrl, navigateToGeneralPageRoot } = useOrganizationProfileContext();

  const isDomainsEnabled = organizationSettings?.domains?.enabled;

  return (
    <Col
      gap={4}
      sx={{
        width: '100%',
      }}
    >
      {__unstable_manageBillingUrl && <MembershipWidget />}

      {isDomainsEnabled && (
        <Protect permission='org:sys_domains:manage'>
          <Flex
            sx={t => ({
              width: '100%',
              gap: t.space.$8,
              paddingBottom: t.space.$4,
              paddingLeft: t.space.$1,
              paddingRight: t.space.$1,
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
                    'organizationProfile.membersPage.requestsTab.autoSuggestions.headerTitle',
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
                        'organizationProfile.membersPage.requestsTab.autoSuggestions.primaryButton',
                      )}
                      sx={t => ({ gap: t.space.$2 })}
                      id='manageVerifiedDomains'
                      onClick={navigateToGeneralPageRoot}
                    />
                    <Text
                      localizationKey={localizationKeys(
                        'organizationProfile.membersPage.requestsTab.autoSuggestions.headerSubtitle',
                      )}
                      sx={t => ({
                        paddingLeft: t.space.$10,
                        color: t.colors.$colorMutedForeground,
                        [mqu.md]: {
                          paddingLeft: 0,
                        },
                      })}
                    />
                  </>
                }
                verificationStatus={'verified'}
                enrollmentMode={'automatic_suggestion'}
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
        <RequestToJoinList />
      </Flex>
    </Col>
  );
};
