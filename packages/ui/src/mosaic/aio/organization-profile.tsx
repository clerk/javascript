import type { ReactElement } from 'react';

import { OrganizationProfileGeneral } from '../panels/organization-profile-general';
import { DeleteOrganization } from '../sections/delete-organization';
import { LeaveOrganization } from '../sections/leave-organization';
import { useOrganizationProfileController } from './organization-profile.controller';
import { OrganizationProfileView } from './organization-profile-view';

function OrganizationProfileRoot(): ReactElement | null {
  const controller = useOrganizationProfileController();
  if (controller.status !== 'ready') {
    return null;
  }
  return <OrganizationProfileView general={<OrganizationProfileGeneral />} />;
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
  GeneralPanel: OrganizationProfileGeneral,
  LeaveSection: LeaveOrganization,
  DeleteSection: DeleteOrganization,
});
