/** @jsxImportSource @emotion/react */
import type { StatementRow } from '@clerk/ui/mosaic/organization/organization-billing-statements-section.view';
import { OrganizationBillingStatementsSectionView } from '@clerk/ui/mosaic/organization/organization-billing-statements-section.view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationBillingStatementsSection',
  source: 'packages/ui/src/mosaic/organization/organization-billing-statements-section.tsx',
};

const DEMO_ROWS: StatementRow[] = [
  { id: 'stmt_1', dateLabel: 'March 2026', idLabel: 'stmt…f8a2', amountLabel: '$50.00' },
  { id: 'stmt_2', dateLabel: 'February 2026', idLabel: 'stmt…c41d', amountLabel: '$50.00' },
];

export function Default() {
  return (
    <OrganizationBillingStatementsSectionView
      columnHeaders={{ date: 'Date', amount: 'Amount' }}
      rows={DEMO_ROWS}
      emptyLabel='No statements to display'
      onSelectRow={() => undefined}
    />
  );
}
