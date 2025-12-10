import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { Tab, TabPanel, TabPanels, Tabs, TabsList } from '@/ui/elements/Tabs';

import { Protect } from '../../common';
import { SubscriberTypeContext } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { useTabState } from '../../hooks/useTabState';
import { PaymentAttemptsList } from '../PaymentAttempts';
import { PaymentMethods } from '../PaymentMethods';
import { StatementsList } from '../Statements';
import { SubscriptionsList } from '../Subscriptions';

const orgTabMap = {
  0: 'subscriptions',
  1: 'statements',
  2: 'payments',
} as const;

const OrganizationBillingPageInternal = withCardStateProvider(() => {
  const card = useCardState();

  const { selectedTab, handleTabChange } = useTabState(orgTabMap);

  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8, color: t.colors.$colorForeground })}
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
            <Tab localizationKey={localizationKeys('organizationProfile.billingPage.start.headerTitle__payments')} />
          </TabsList>
          <TabPanels>
            <TabPanel sx={{ width: '100%', flexDirection: 'column' }}>
              <SubscriptionsList
                title={localizationKeys('organizationProfile.billingPage.subscriptionsListSection.title')}
                switchPlansLabel={localizationKeys(
                  'organizationProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan',
                )}
                newSubscriptionLabel={localizationKeys(
                  'organizationProfile.billingPage.subscriptionsListSection.actionLabel__newSubscription',
                )}
                manageSubscriptionLabel={localizationKeys(
                  'organizationProfile.billingPage.subscriptionsListSection.actionLabel__manageSubscription',
                )}
              />
              <Protect condition={has => has({ permission: 'org:sys_billing:manage' })}>
                <PaymentMethods />
              </Protect>
            </TabPanel>
            <TabPanel sx={{ width: '100%' }}>
              <StatementsList />
            </TabPanel>
            <TabPanel sx={{ width: '100%' }}>
              <PaymentAttemptsList />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Col>
    </Col>
  );
});

export const OrganizationBillingPage = () => {
  return (
    <SubscriberTypeContext.Provider value='organization'>
      <OrganizationBillingPageInternal />
    </SubscriberTypeContext.Provider>
  );
};
