import type { ReactElement } from 'react';

import { OrganizationProfileGeneralPanel } from '../panels/organization-profile-general-panel';
import { OrganizationProfileDeleteSection } from '../sections/organization-profile-delete-section';
import { OrganizationProfileLeaveSection } from '../sections/organization-profile-leave-section';
import { useOrganizationProfileController } from './organization-profile.controller';
import { OrganizationProfileView } from './organization-profile-view';

function OrganizationProfileRoot(): ReactElement | null {
  const controller = useOrganizationProfileController();
  if (controller.status !== 'ready') {
    return null;
  }
  return <OrganizationProfileView general={<OrganizationProfileGeneralPanel />} />;
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
  LeaveSection: OrganizationProfileLeaveSection,
  DeleteSection: OrganizationProfileDeleteSection,
});
