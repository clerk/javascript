import {
  __experimental_PricingTableContext,
  InvoicesContextProvider,
  PlansContextProvider,
  SubscriberTypeContext,
  useSubscriptions,
} from '../../contexts';
import { Button, Col, descriptors, localizationKeys } from '../../customizables';
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
import { __experimental_PaymentSources } from '../PaymentSources/PaymentSources';
import { __experimental_PricingTable } from '../PricingTable';
import { SubscriptionsList } from '../Subscriptions';

const orgTabMap = {
  0: 'plans',
  1: 'invoices',
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
            <Tab
              localizationKey={localizationKeys(
                'userProfile.__experimental_billingPage.start.headerTitle__paymentMethods',
              )}
            />
          </TabsList>
          <TabPanels>
            <TabPanel sx={{ width: '100%', flexDirection: 'column' }}>
              {subscriptions.data.length > 0 ? (
                <>
                  <SubscriptionsList />
                  <Button
                    localizationKey='View all plans'
                    hasArrow
                    variant='ghost'
                    onClick={() => navigate('plans')}
                    sx={t => ({
                      width: 'fit-content',
                      marginTop: t.space.$4,
                    })}
                  />
                </>
              ) : (
                <__experimental_PricingTableContext.Provider value={{ componentName: 'PricingTable', mode: 'modal' }}>
                  <__experimental_PricingTable />
                </__experimental_PricingTableContext.Provider>
              )}
            </TabPanel>
            <TabPanel sx={{ width: '100%' }}>
              <InvoicesContextProvider>
                <InvoicesList />
              </InvoicesContextProvider>
            </TabPanel>
            <TabPanel sx={{ width: '100%' }}>
              <__experimental_PaymentSources />
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
