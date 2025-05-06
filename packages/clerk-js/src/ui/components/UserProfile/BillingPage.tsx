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

const tabMap = {
  0: 'plans',
  1: 'statements',
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
              <>
                <ProfileSection.Root
                  id='subscriptionsList'
                  title={localizationKeys('userProfile.billingPage.subscriptionsListSection.title')}
                  centered={false}
                  sx={t => ({
                    borderTop: 'none',
                    paddingTop: t.space.$1,
                  })}
                >
                  <SubscriptionsList />
                  <ProfileSection.ArrowButton
                    id='subscriptionsList'
                    textLocalizationKey={localizationKeys(
                      'userProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan',
                    )}
                    sx={[
                      t => ({
                        justifyContent: 'start',
                        height: t.sizes.$8,
                      }),
                    ]}
                    leftIcon={ArrowsUpDown}
                    leftIconSx={t => ({
                      width: t.sizes.$4,
                      height: t.sizes.$4,
                    })}
                    onClick={() => void navigate('plans')}
                  />
                </ProfileSection.Root>
                <PaymentSources />
              </>
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
      <PlansContextProvider>
        <BillingPageInternal />
      </PlansContextProvider>
    </SubscriberTypeContext.Provider>
  );
};
