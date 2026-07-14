import type { ReactElement } from 'react';

import { OrganizationBillingAccountCreditsSection } from './organization-billing-account-credits-section';
import { OrganizationBillingPanel } from './organization-billing-panel';
import { OrganizationBillingPaymentDetail } from './organization-billing-payment-detail';
import { OrganizationBillingPaymentsSection } from './organization-billing-payments-section';
import { OrganizationBillingStatementDetail } from './organization-billing-statement-detail';
import { OrganizationBillingStatementsSection } from './organization-billing-statements-section';
import { OrganizationBillingSubscriptionsSection } from './organization-billing-subscriptions-section';
import { useOrganizationProfileController } from './organization-profile.controller';
import { OrganizationProfileApiKeysPanel } from './organization-profile-api-keys-panel';
import { OrganizationProfileDeleteSection } from './organization-profile-delete-section';
import { OrganizationProfileDomainsSection } from './organization-profile-domains-section';
import { OrganizationProfileGeneralPanel } from './organization-profile-general-panel';
import { OrganizationProfileLeaveSection } from './organization-profile-leave-section';
import { OrganizationProfileMembersPanel } from './organization-profile-members-panel';
import { OrganizationProfileProfileSection } from './organization-profile-profile-section';
import { OrganizationProfileView } from './organization-profile-view';

function OrganizationProfileRoot(): ReactElement | null {
  const controller = useOrganizationProfileController();
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <OrganizationProfileView
      general={<OrganizationProfileGeneralPanel />}
      members={<OrganizationProfileMembersPanel />}
      billing={<OrganizationBillingPanel />}
      apiKeys={<OrganizationProfileApiKeysPanel />}
    />
  );
}

// Standalone parts of the profile, exposed via the compound namespace. Each part is
// self-gating and only needs a MosaicProvider ancestor, so consumers can render any of
// them on their own — there is no shared Root context to host.
//
// Attached with Object.assign rather than the in-repo `Card.Root = Root` statement form on
// purpose: this package ships `sideEffects` restricted to two files, so a consumer's
// tree-shaking bundler treats this module as side-effect-free and drops bare
// `OrganizationProfile.X = ...` statements, leaving the parts `undefined` at runtime. Folding
// them into the exported binding's initializer keeps them attached across that boundary.
export const OrganizationProfile = Object.assign(OrganizationProfileRoot, {
  GeneralPanel: OrganizationProfileGeneralPanel,
  ProfileSection: OrganizationProfileProfileSection,
  DomainsSection: OrganizationProfileDomainsSection,
  LeaveSection: OrganizationProfileLeaveSection,
  DeleteSection: OrganizationProfileDeleteSection,
  ApiKeysPanel: OrganizationProfileApiKeysPanel,
  MembersPanel: OrganizationProfileMembersPanel,
  BillingPanel: OrganizationBillingPanel,
  BillingSubscriptionsSection: OrganizationBillingSubscriptionsSection,
  BillingAccountCreditsSection: OrganizationBillingAccountCreditsSection,
  BillingStatementsSection: OrganizationBillingStatementsSection,
  BillingPaymentsSection: OrganizationBillingPaymentsSection,
  BillingStatementDetail: OrganizationBillingStatementDetail,
  BillingPaymentDetail: OrganizationBillingPaymentDetail,
});
