import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { PricingTableContext } from '../../contexts';
import { localizationKeys } from '../../localization';
import { PricingTable } from '../PricingTable/PricingTable';
import type { usePlansPageController } from './plans-page.controller';

export const PlansPageView = ({ onBack }: ReturnType<typeof usePlansPageController>) => {
  return (
    <ProfileCard.Page>
      <Header.Root
        sx={t => ({
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$borderAlpha100,
          marginBlockEnd: t.space.$4,
          paddingBlockEnd: t.space.$4,
        })}
      >
        <Header.BackLink onClick={onBack}>
          <Header.Title
            localizationKey={localizationKeys('userProfile.plansPage.title')}
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>

      <PricingTableContext.Provider value={{ componentName: 'PricingTable', mode: 'modal' }}>
        <PricingTable />
      </PricingTableContext.Provider>
    </ProfileCard.Page>
  );
};
