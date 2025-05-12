import { Protect } from '../../common';
import {
  PlansContextProvider,
  StatementsContextProvider,
  SubscriberTypeContext,
  useSubscriptions,
} from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import {
  Card,
  Header,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  TabsList,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useTabState } from '../../hooks/useTabState';
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
              <SubscriptionsList />
              <Protect condition={has => has({ permission: 'org:sys_billing:manage' })}>
                <PaymentSources />
              </Protect>
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
