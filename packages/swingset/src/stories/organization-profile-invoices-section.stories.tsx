import { OrganizationProfileInvoicesSectionView } from '@clerk/ui/mosaic/organization-profile/organization-profile-invoices-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-invoices-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileInvoicesSection',
  label: 'Invoices',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-invoices-section.view.tsx',
};

export const invoices = [
  {
    id: 'may-26',
    dateLabel: 'May 26, 2026',
    invoiceLabel: 'stmt_202605_0s64a',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'jun-03',
    dateLabel: 'Jun 3, 2026',
    invoiceLabel: 'stmt_202606_n392f',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'jun-10',
    dateLabel: 'Jun 10, 2026',
    invoiceLabel: 'stmt_202606_q18bd',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'jun-18',
    dateLabel: 'Jun 18, 2026',
    invoiceLabel: 'stmt_202606_76mkr',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
  {
    id: 'jul-01',
    dateLabel: 'Jul 1, 2026',
    invoiceLabel: 'stmt_202607_h90ap',
    amountLabel: '$25.00',
    statusLabel: 'Paid',
  },
];

export function Default() {
  return (
    <OrganizationProfileInvoicesSectionView
      invoices={invoices}
      pagination={{ page: 1, pageCount: 2, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
      onDownloadAll={() => undefined}
      onPageChange={() => undefined}
      onPageSizeChange={() => undefined}
      onView={() => undefined}
    />
  );
}

export function Empty() {
  return <OrganizationProfileInvoicesSectionView invoices={[]} />;
}
