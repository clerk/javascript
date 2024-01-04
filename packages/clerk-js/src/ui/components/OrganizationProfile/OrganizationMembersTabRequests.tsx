import { BlockButton, Protect } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, Flex, localizationKeys } from '../../customizables';
import { Header } from '../../elements';
import { Plus } from '../../icons';
import { useRouter } from '../../router';
import { DomainList } from './DomainList';
import { MembershipWidget } from './MembershipWidget';
import { RequestToJoinList } from './RequestToJoinList';

export const OrganizationMembersTabRequests = () => {
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
        <Protect permission='org:sys_domains:manage'>
          <Col
            gap={2}
            sx={{
              width: '100%',
            }}
          >
            <Header.Root>
              <Header.Title
                localizationKey={localizationKeys(
                  'organizationProfile.membersPage.requestsTab.autoSuggestions.headerTitle',
                )}
                textVariant='h3'
              />
              <Header.Subtitle
                localizationKey={localizationKeys(
                  'organizationProfile.membersPage.requestsTab.autoSuggestions.headerSubtitle',
                )}
                variant='subtitle'
              />
            </Header.Root>
            <DomainList
              fallback={
                <BlockButton
                  textLocalizationKey={localizationKeys(
                    'organizationProfile.membersPage.requestsTab.autoSuggestions.primaryButton',
                  )}
                  leftIcon={Plus}
                  sx={t => ({ gap: t.space.$2 })}
                  leftIconSx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
                  id='manageVerifiedDomains'
                  onClick={() => navigate('../')}
                />
              }
              verificationStatus={'verified'}
              enrollmentMode={'automatic_suggestion'}
            />
          </Col>
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
              localizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.requests.headerTitle')}
              textVariant='h3'
            />
            <Header.Subtitle
              localizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.requests.headerSubtitle')}
              variant='subtitle'
            />
          </Header.Root>
        </Flex>
        <RequestToJoinList />
      </Flex>
    </Col>
  );
};
