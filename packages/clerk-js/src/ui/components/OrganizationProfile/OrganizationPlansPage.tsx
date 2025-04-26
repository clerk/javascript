import { __experimental_PricingTableContext, withPlans } from '../../contexts';
import { Header } from '../../elements';
import { useRouter } from '../../router';
import { __experimental_PricingTable } from '../PricingTable/PricingTable';

export const OrganizationPlansPage = withPlans(() => {
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

      <__experimental_PricingTableContext.Provider
        value={{ componentName: 'PricingTable', mode: 'modal', subscriberType: 'org' }}
      >
        <__experimental_PricingTable />
      </__experimental_PricingTableContext.Provider>
    </>
  );
});
