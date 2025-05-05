import {
  InvoicesContextProvider,
  PlansContextProvider,
  PricingTableContext,
  SubscriberTypeContext,
  useSubscriptions,
} from '../../contexts';
import { Button, Col, descriptors, Flex, localizationKeys } from '../../customizables';
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
import { useRouter } from '../../router';
import { InvoicesList } from '../Invoices';
import { __experimental_PaymentSources } from '../PaymentSources';
import { PricingTable } from '../PricingTable';
import { SubscriptionsList } from '../Subscriptions';

const tabMap = {
  0: 'plans',
  1: 'invoices',
  2: 'payment-methods',
} as const;

const BillingPageInternal = withCardStateProvider(() => {
  const card = useCardState();
  const { data: subscriptions } = useSubscriptions();
  const { navigate } = useRouter();

  const { selectedTab, handleTabChange } = useTabState(tabMap);

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
            localizationKey={localizationKeys('userProfile.__experimental_billingPage.title')}
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
              localizationKey={
                subscriptions.data.length > 0
                  ? localizationKeys('userProfile.__experimental_billingPage.start.headerTitle__subscriptions')
                  : localizationKeys('userProfile.__experimental_billingPage.start.headerTitle__plans')
              }
            />
            <Tab
              localizationKey={localizationKeys('userProfile.__experimental_billingPage.start.headerTitle__invoices')}
            />
          </TabsList>
          <TabPanels>
            <TabPanel sx={_ => ({ width: '100%', flexDirection: 'column' })}>
              {subscriptions.data.length > 0 ? (
                <Flex
                  sx={{ width: '100%', flexDirection: 'column' }}
                  gap={4}
                >
                  <SubscriptionsList />
                  <Button
                    localizationKey='View all plans'
                    hasArrow
                    variant='ghost'
                    onClick={() => navigate('plans')}
                    sx={{
                      width: 'fit-content',
                    }}
                  />
                  <__experimental_PaymentSources />
                </Flex>
              ) : (
                <PricingTableContext.Provider value={{ componentName: 'PricingTable', mode: 'modal' }}>
                  <PricingTable />
                </PricingTableContext.Provider>
              )}
            </TabPanel>
            <TabPanel sx={{ width: '100%' }}>
              <InvoicesContextProvider>
                <InvoicesList />
              </InvoicesContextProvider>
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
      <PlansContextProvider>
        <BillingPageInternal />
      </PlansContextProvider>
    </SubscriberTypeContext.Provider>
  );
};
