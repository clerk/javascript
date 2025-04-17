import {
  __experimental_PaymentSourcesContext,
  __experimental_PricingTableContext,
  InvoicesContextProvider,
  usePlansContext,
  withPlans,
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
import { InvoicesList } from '../Invoices';
import { __experimental_PaymentSources } from '../PaymentSources/PaymentSources';
import { __experimental_PricingTable } from '../PricingTable';

const orgTabMap = {
  0: 'plans',
  1: 'invoices',
  2: 'payment-sources',
} as const;

export const OrganizationBillingPage = withPlans(
  withCardStateProvider(() => {
    const card = useCardState();
    const { subscriptions } = usePlansContext();
    const { selectedTab, handleTabChange } = useTabState(orgTabMap);

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
                  subscriptions.length > 0
                    ? localizationKeys('userProfile.__experimental_billingPage.start.headerTitle__subscriptions')
                    : localizationKeys('userProfile.__experimental_billingPage.start.headerTitle__plans')
                }
              />
              <Tab
                localizationKey={localizationKeys('userProfile.__experimental_billingPage.start.headerTitle__invoices')}
              />
              <Tab
                localizationKey={localizationKeys(
                  'userProfile.__experimental_billingPage.start.headerTitle__paymentSources',
                )}
              />
            </TabsList>
            <TabPanels>
              <TabPanel sx={{ width: '100%' }}>
                <__experimental_PricingTableContext.Provider
                  value={{ componentName: 'PricingTable', mode: 'modal', subscriberType: 'org' }}
                >
                  <__experimental_PricingTable />
                </__experimental_PricingTableContext.Provider>
              </TabPanel>
              <TabPanel sx={{ width: '100%' }}>
                <InvoicesContextProvider subscriberType='org'>
                  <InvoicesList />
                </InvoicesContextProvider>
              </TabPanel>
              <TabPanel sx={{ width: '100%' }}>
                <__experimental_PaymentSourcesContext.Provider
                  value={{ componentName: 'PaymentSources', subscriberType: 'org' }}
                >
                  <__experimental_PaymentSources />
                </__experimental_PaymentSourcesContext.Provider>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Col>
      </Col>
    );
  }),
);
