import { Protect } from '../../common';
import {
  InvoicesContextProvider,
  PlansContextProvider,
  PricingTableContext,
  SubscriberTypeContext,
  useSubscriptions,
} from '../../contexts';
import { Button, Col, descriptors, Flex, localizationKeys } from '../../customizables';
import {
  Alert,
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
import { PaymentSources } from '../PaymentSources';
import { PricingTable } from '../PricingTable';
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
            <Tab
              localizationKey={
                subscriptions.data.length > 0
                  ? localizationKeys('userProfile.billingPage.start.headerTitle__subscriptions')
                  : localizationKeys('userProfile.billingPage.start.headerTitle__plans')
              }
            />
            <Tab localizationKey={localizationKeys('userProfile.billingPage.start.headerTitle__invoices')} />
          </TabsList>
          <TabPanels>
            <TabPanel sx={{ width: '100%', flexDirection: 'column' }}>
              {subscriptions.data.length > 0 ? (
                <Flex
                  sx={{ width: '100%', flexDirection: 'column' }}
                  gap={4}
                >
                  <Protect condition={has => !has({ permission: 'org:sys_billing:manage' })}>
                    <Alert
                      variant='info'
                      colorScheme='info'
                      title={localizationKeys(
                        'organizationProfile.__experimental_billingPage.alerts.noPemissionsToManageBilling',
                      )}
                    />
                  </Protect>
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
                  <Protect condition={has => has({ permission: 'org:sys_billing:manage' })}>
                    <PaymentSources />
                  </Protect>
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

export const OrganizationBillingPage = () => {
  return (
    <SubscriberTypeContext.Provider value='org'>
      <PlansContextProvider>
        <OrganizationBillingPageInternal />
      </PlansContextProvider>
    </SubscriberTypeContext.Provider>
  );
};
