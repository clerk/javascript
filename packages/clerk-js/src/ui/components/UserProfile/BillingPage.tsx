import { StatementsContextProvider, SubscriberTypeContext } from '../../contexts';
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

const tabMap = {
  0: 'plans',
  1: 'statements',
  2: 'payment-methods',
} as const;

const BillingPageInternal = withCardStateProvider(() => {
  const card = useCardState();
  const { selectedTab, handleTabChange } = useTabState(tabMap);

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
            localizationKey={localizationKeys('userProfile.billingPage.title')}
            textVariant='h2'
          />
        </Header.Root>

        <Card.Alert>{card.error}</Card.Alert>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
        >
          <TabsList sx={t => ({ gap: t.space.$6 })}>
            <Tab localizationKey={localizationKeys('userProfile.billingPage.start.headerTitle__subscriptions')} />
            <Tab localizationKey={localizationKeys('userProfile.billingPage.start.headerTitle__statements')} />
          </TabsList>
          <TabPanels>
            <TabPanel sx={_ => ({ width: '100%', flexDirection: 'column' })}>
              <SubscriptionsList
                title={localizationKeys('userProfile.billingPage.subscriptionsListSection.title')}
                arrowButtonText={localizationKeys(
                  'userProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan',
                )}
                arrowButtonEmptyText={localizationKeys(
                  'userProfile.billingPage.subscriptionsListSection.actionLabel__newSubscription',
                )}
              />
              <PaymentSources />
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

export const BillingPage = () => {
  return (
    <SubscriberTypeContext.Provider value='user'>
      <BillingPageInternal />
    </SubscriberTypeContext.Provider>
  );
};
