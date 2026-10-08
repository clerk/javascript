import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { Tab, TabPanel, TabPanels, Tabs, TabsList } from '@/ui/elements/Tabs';

import { Protect } from '../../common';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { AccountCredits } from '../AccountCredits';
import { PaymentAttemptsList } from '../PaymentAttempts';
import { PaymentMethods } from '../PaymentMethods';
import { StatementsList } from '../Statements';
import { SubscriptionsList } from '../Subscriptions';
import type { BillingPageData } from './billing-page.types';

export const BillingPageView = ({ subscriberType, error, selectedTab, handleTabChange }: BillingPageData) => {
  return (
    <ProfileCard.Page>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ gap: t.space.$8, color: t.colors.$colorForeground, isolation: 'isolate' })}
      >
        <Col
          elementDescriptor={descriptors.profilePage}
          elementId={descriptors.profilePage.setId('billing')}
          gap={4}
        >
          <Header.Root>
            <Header.Title
              localizationKey={
                subscriberType === 'organization'
                  ? localizationKeys('organizationProfile.billingPage.title')
                  : localizationKeys('userProfile.billingPage.title')
              }
              textVariant='h2'
            />
          </Header.Root>

          <Card.Alert>{error}</Card.Alert>

          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
          >
            <TabsList sx={t => ({ gap: t.space.$6 })}>
              <Tab
                localizationKey={
                  subscriberType === 'organization'
                    ? localizationKeys('organizationProfile.billingPage.start.headerTitle__subscriptions')
                    : localizationKeys('userProfile.billingPage.start.headerTitle__subscriptions')
                }
              />
              <Tab
                localizationKey={
                  subscriberType === 'organization'
                    ? localizationKeys('organizationProfile.billingPage.start.headerTitle__statements')
                    : localizationKeys('userProfile.billingPage.start.headerTitle__statements')
                }
              />
              <Tab
                localizationKey={
                  subscriberType === 'organization'
                    ? localizationKeys('organizationProfile.billingPage.start.headerTitle__payments')
                    : localizationKeys('userProfile.billingPage.start.headerTitle__payments')
                }
              />
            </TabsList>
            <TabPanels>
              <TabPanel
                sx={
                  subscriberType === 'organization'
                    ? { width: '100%', flexDirection: 'column' }
                    : _ => ({ width: '100%', flexDirection: 'column' })
                }
              >
                <SubscriptionsList
                  title={
                    subscriberType === 'organization'
                      ? localizationKeys('organizationProfile.billingPage.subscriptionsListSection.title')
                      : localizationKeys('userProfile.billingPage.subscriptionsListSection.title')
                  }
                  switchPlansLabel={
                    subscriberType === 'organization'
                      ? localizationKeys(
                          'organizationProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan',
                        )
                      : localizationKeys('userProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan')
                  }
                  newSubscriptionLabel={
                    subscriberType === 'organization'
                      ? localizationKeys(
                          'organizationProfile.billingPage.subscriptionsListSection.actionLabel__newSubscription',
                        )
                      : localizationKeys(
                          'userProfile.billingPage.subscriptionsListSection.actionLabel__newSubscription',
                        )
                  }
                  manageSubscriptionLabel={
                    subscriberType === 'organization'
                      ? localizationKeys(
                          'organizationProfile.billingPage.subscriptionsListSection.actionLabel__manageSubscription',
                        )
                      : localizationKeys(
                          'userProfile.billingPage.subscriptionsListSection.actionLabel__manageSubscription',
                        )
                  }
                />
                {subscriberType === 'organization' ? (
                  <Protect condition={has => has({ permission: 'org:sys_billing:manage' })}>
                    <PaymentMethods />
                  </Protect>
                ) : (
                  <PaymentMethods />
                )}
                <AccountCredits />
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
    </ProfileCard.Page>
  );
};
