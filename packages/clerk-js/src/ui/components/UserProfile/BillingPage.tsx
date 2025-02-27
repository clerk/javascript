import { __experimental_PricingTableContext } from '../../contexts';
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
import { __experimental_PricingTable } from '../PricingTable';

export const BillingPage = withCardStateProvider(() => {
  const card = useCardState();

  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8, color: t.colors.$colorText })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('account')}
        gap={4}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('userProfile.billingPage.title')}
            textVariant='h2'
          />
        </Header.Root>

        <Card.Alert>{card.error}</Card.Alert>

        <Tabs>
          <TabsList sx={t => ({ gap: t.space.$6 })}>
            <Tab localizationKey={localizationKeys('userProfile.billingPage.start.headerTitle__plans')} />
            <Tab localizationKey={localizationKeys('userProfile.billingPage.start.headerTitle__invoices')} />
            <Tab localizationKey={localizationKeys('userProfile.billingPage.start.headerTitle__paymentSources')} />
          </TabsList>
          <TabPanels>
            <TabPanel sx={{ width: '100%' }}>
              <__experimental_PricingTableContext.Provider value={{ componentName: 'PricingTable', mode: 'modal' }}>
                <__experimental_PricingTable />
              </__experimental_PricingTableContext.Provider>
            </TabPanel>
            <TabPanel sx={{ width: '100%' }}>Invoices</TabPanel>
            <TabPanel sx={{ width: '100%' }}>Payment Sources</TabPanel>
          </TabPanels>
        </Tabs>
      </Col>
    </Col>
  );
});
