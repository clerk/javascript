import { PlansContextProvider, PricingTableContext, SubscriberTypeContext } from '../../contexts';
import { Header } from '../../elements';
import { useRouter } from '../../router';
import { PricingTable } from '../PricingTable/PricingTable';

const OrganizationPlansPageInternal = () => {
  const { navigate } = useRouter();

  return (
    <>
      <Header.Root sx={t => ({ marginBlockEnd: t.space.$4 })}>
        <Header.BackLink onClick={() => void navigate('../', { searchParams: new URLSearchParams('tab=plans') })}>
          <Header.Title
            localizationKey='Available Plans'
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>

      <PricingTableContext.Provider value={{ componentName: 'PricingTable', mode: 'modal' }}>
        <PricingTable />
      </PricingTableContext.Provider>
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
