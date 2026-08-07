import type { ReactElement } from 'react';

import { useOrganizationBillingStatementsSectionController } from './organization-billing-statements-section.controller';
import { OrganizationBillingStatementsSectionView } from './organization-billing-statements-section.view';

/**
 * The organization billing statements list: a table of billing statements that navigates to a
 * statement's detail screen on row select. Renders nothing until the first page resolves. Self-gating
 * via `useStatements` (which only fetches with the right permission); requires the surrounding billing
 * contexts (`SubscriberTypeContext`). Exposed on the compound namespace as
 * `OrganizationProfile.BillingStatementsSection`.
 */
export function OrganizationBillingStatementsSection(): ReactElement | null {
  const controller = useOrganizationBillingStatementsSectionController();

  if (controller.status !== 'ready') {
    return null;
  }

  return (
    <OrganizationBillingStatementsSectionView
      columnHeaders={controller.columnHeaders}
      rows={controller.rows}
      emptyLabel={controller.emptyLabel}
      onSelectRow={controller.onSelectRow}
    />
  );
}
