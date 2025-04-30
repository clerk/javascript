import { __experimental_PricingTableContext, PlansContextProvider, SubscriberTypeContext } from '../../contexts';
import { Header } from '../../elements';
import { useRouter } from '../../router';
import { __experimental_PricingTable } from '../PricingTable/PricingTable';

const PlansPageInternal = () => {
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

      <__experimental_PricingTableContext.Provider value={{ componentName: 'PricingTable', mode: 'modal' }}>
        <__experimental_PricingTable />
      </__experimental_PricingTableContext.Provider>
    </>
  );
};

export const PlansPage = () => {
  return (
    <SubscriberTypeContext.Provider value='user'>
      <PlansContextProvider>
        <PlansPageInternal />
      </PlansContextProvider>
    </SubscriberTypeContext.Provider>
  );
};
