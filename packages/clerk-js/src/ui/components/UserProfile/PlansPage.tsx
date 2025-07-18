import { Header } from '@/ui/elements/Header';

import { PricingTableContext, SubscriberTypeContext } from '../../contexts';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { PricingTable } from '../PricingTable/PricingTable';

const PlansPageInternal = () => {
  const { navigate } = useRouter();

  return (
    <>
      <Header.Root
        sx={t => ({
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$borderAlpha100,
          marginBlockEnd: t.space.$4,
          paddingBlockEnd: t.space.$4,
        })}
      >
        <Header.BackLink
          onClick={() => void navigate('../', { searchParams: new URLSearchParams('tab=subscriptions') })}
        >
          <Header.Title
            localizationKey={localizationKeys('userProfile.plansPage.title')}
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

export const PlansPage = () => {
  return (
    <SubscriberTypeContext.Provider value='user'>
      <PlansPageInternal />
    </SubscriberTypeContext.Provider>
  );
};
