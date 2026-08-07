/** @jsxImportSource @emotion/react */
import { OrganizationBillingAccountCreditsSectionView } from '@clerk/ui/mosaic/organization/organization-billing-account-credits-section.view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationBillingAccountCreditsSection',
  source: 'packages/ui/src/mosaic/organization/organization-billing-account-credits-section.tsx',
};

export function Default() {
  return (
    <OrganizationBillingAccountCreditsSectionView
      title='Account credits'
      balanceLabel='$50.00'
      viewHistory={{ label: 'View credit history' }}
      onViewHistory={() => undefined}
    />
  );
}
