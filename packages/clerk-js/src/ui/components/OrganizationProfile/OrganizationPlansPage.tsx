import { Protect } from '../../common';
import { PlansContextProvider, PricingTableContext, SubscriberTypeContext } from '../../contexts';
import { Flex } from '../../customizables';
import { Alert, Header } from '../../elements';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { PricingTable } from '../PricingTable/PricingTable';

const OrganizationPlansPageInternal = () => {
  const { navigate } = useRouter();

  return (
    <>
      <Header.Root
        sx={t => ({
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$neutralAlpha100,
          marginBlockEnd: t.space.$4,
          paddingBlockEnd: t.space.$4,
        })}
      >
        <Header.BackLink onClick={() => void navigate('../', { searchParams: new URLSearchParams('tab=plans') })}>
          <Header.Title
            localizationKey='Available Plans'
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>

      <Flex
        direction='col'
        gap={4}
      >
        <Protect condition={has => !has({ permission: 'org:sys_billing:manage' })}>
          <Alert
            variant='info'
            colorScheme='info'
            title={localizationKeys('organizationProfile.billingPage.alerts.noPermissionsToManageBilling')}
          />
        </Protect>
        <PricingTableContext.Provider value={{ componentName: 'PricingTable', mode: 'modal' }}>
          <PricingTable />
        </PricingTableContext.Provider>
      </Flex>
    </>
  );
};

export const OrganizationPlansPage = () => {
  return (
    <SubscriberTypeContext.Provider value='org'>
      <PlansContextProvider>
        <OrganizationPlansPageInternal />
      </PlansContextProvider>
    </SubscriberTypeContext.Provider>
  );
};
