import { Alert } from '@/ui/elements/Alert';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { Protect } from '../../common';
import { PricingTableContext } from '../../contexts';
import { Flex } from '../../customizables';
import { localizationKeys } from '../../localization';
import { PricingTable } from '../PricingTable/PricingTable';
import type { useOrganizationPlansPageController } from './organization-plans-page.controller';

export const OrganizationPlansPageView = ({ onBack }: ReturnType<typeof useOrganizationPlansPageController>) => {
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
            localizationKey={localizationKeys('organizationProfile.plansPage.title')}
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
            title={localizationKeys('organizationProfile.plansPage.alerts.noPermissionsToManageBilling')}
          />
        </Protect>
        <PricingTableContext.Provider value={{ componentName: 'PricingTable', mode: 'modal' }}>
          <PricingTable />
        </PricingTableContext.Provider>
      </Flex>
    </ProfileCard.Page>
  );
};
