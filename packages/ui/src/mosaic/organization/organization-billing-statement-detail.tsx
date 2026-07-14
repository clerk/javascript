import type { ReactElement } from 'react';

import { useOrganizationBillingStatementDetailController } from './organization-billing-statement-detail.controller';
import { OrganizationBillingStatementDetailView } from './organization-billing-statement-detail.view';

/**
 * A single billing statement's detail screen: header, dated groups of charges with their credit and
 * discount adjustments, and a total. Reads the statement id from the router (`statementId`) and
 * fetches via `useStatement`. Renders nothing until the fetch resolves; on a missing statement it
 * renders the error message. Exposed on the compound namespace as
 * `OrganizationProfile.BillingStatementDetail`.
 */
export function OrganizationBillingStatementDetail(): ReactElement | null {
  const controller = useOrganizationBillingStatementDetailController();

  if (controller.status === 'loading') {
    return null;
  }

  if (controller.status === 'error') {
    return <div role='alert'>{controller.message}</div>;
  }

  return (
    <OrganizationBillingStatementDetailView
      title={controller.title}
      idLabel={controller.idLabel}
      statusLabel={controller.statusLabel}
      backLabel={controller.backLabel}
      onBack={controller.onBack}
      sections={controller.sections}
      totalLabel={controller.totalLabel}
      totalValue={controller.totalValue}
      currency={controller.currency}
    />
  );
}
