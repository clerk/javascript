import { OrganizationProfileBillingPanelView } from '@clerk/ui/mosaic/organization-profile/organization-profile-billing-panel.view';

import type { StoryMeta } from '@/lib/types';

import { invoices } from './organization-profile-invoices-section.stories';
import { paymentMethods } from './organization-profile-payment-methods-section.stories';
import { subscription } from './organization-profile-subscription-section.stories';

export { default as __source } from './organization-profile-billing-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileBillingPanel',
  label: 'Billing panel',
  navigation: { category: 'Panels' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-billing-panel.view.tsx',
};

export function Default() {
  return (
    <OrganizationProfileBillingPanelView
      invoices={{
        invoices,
        pagination: { page: 1, pageCount: 2, pageSize: 10, pageSizeOptions: [10, 25, 50] },
        onDownloadAll: () => undefined,
        onPageChange: () => undefined,
        onPageSizeChange: () => undefined,
        onView: () => undefined,
      }}
      paymentMethods={{ paymentMethods, onAdd: () => undefined, onManage: () => undefined }}
      subscription={{
        subscription,
        onChangePlan: () => undefined,
        onManagePlan: () => undefined,
        onManageSeats: () => undefined,
      }}
    />
  );
}
