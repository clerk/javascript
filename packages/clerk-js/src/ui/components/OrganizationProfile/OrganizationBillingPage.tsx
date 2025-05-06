import { Protect } from '../../common';
import {
  PlansContextProvider,
  StatementsContextProvider,
  SubscriberTypeContext,
  useSubscriptions,
} from '../../contexts';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import {
  Alert,
  Card,
  Header,
  ProfileSection,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  TabsList,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useTabState } from '../../hooks/useTabState';
import { ArrowsUpDown } from '../../icons';
import { useRouter } from '../../router';
import { PaymentSources } from '../PaymentSources';
import { StatementsList } from '../Statements';
import { SubscriptionsList } from '../Subscriptions';

const orgTabMap = {
  0: 'plans',
  1: 'statements',
  2: 'payment-methods',
} as const;

const OrganizationBillingPageInternal = withCardStateProvider(() => {
  const card = useCardState();
  const { data: subscriptions } = useSubscriptions('org');
  const { selectedTab, handleTabChange } = useTabState(orgTabMap);
  const { navigate } = useRouter();
  if (!Array.isArray(subscriptions?.data)) {
    return null;
  }

  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8, color: t.colors.$colorText })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('billing')}
        gap={4}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.billingPage.title')}
            textVariant='h2'
          />
        </Header.Root>

        <Card.Alert>{card.error}</Card.Alert>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
        >
          <TabsList sx={t => ({ gap: t.space.$6 })}>
            <Tab
              localizationKey={localizationKeys('organizationProfile.billingPage.start.headerTitle__subscriptions')}
            />
            <Tab localizationKey={localizationKeys('organizationProfile.billingPage.start.headerTitle__statements')} />
          </TabsList>
          <TabPanels>
            <TabPanel sx={{ width: '100%', flexDirection: 'column' }}>
              <Flex
                sx={{ width: '100%', flexDirection: 'column' }}
                gap={4}
              >
                <ProfileSection.Root
                  id='subscriptionsList'
                  title={localizationKeys('organizationProfile.billingPage.subscriptionsListSection.title')}
                  centered={false}
                  sx={t => ({
                    borderTop: 'none',
                    paddingTop: t.space.$1,
                  })}
                >
                  <Protect condition={has => !has({ permission: 'org:sys_billing:manage' })}>
                    <Alert
                      variant='info'
                      colorScheme='info'
                      title={localizationKeys('organizationProfile.billingPage.alerts.noPermissionsToManageBilling')}
                    />
                  </Protect>
                  <SubscriptionsList />
                  <ProfileSection.ArrowButton
                    id='subscriptionsList'
                    textLocalizationKey={localizationKeys(
                      'organizationProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan',
                    )}
                    sx={[
                      t => ({
                        justifyContent: 'start',
                        height: t.sizes.$8,
                      }),
                    ]}
                    leftIcon={ArrowsUpDown}
                    leftIconSx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
                    onClick={() => void navigate('plans')}
                  />
                </ProfileSection.Root>
                <Protect condition={has => has({ permission: 'org:sys_billing:manage' })}>
                  <PaymentSources />
                </Protect>
              </Flex>
            </TabPanel>
            <TabPanel sx={{ width: '100%' }}>
              <StatementsContextProvider>
                <StatementsList />
              </StatementsContextProvider>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Col>
    </Col>
  );
});

export const OrganizationBillingPage = () => {
  return (
    <SubscriberTypeContext.Provider value='org'>
      <PlansContextProvider>
        <OrganizationBillingPageInternal />
      </PlansContextProvider>
    </SubscriberTypeContext.Provider>
  );
};
