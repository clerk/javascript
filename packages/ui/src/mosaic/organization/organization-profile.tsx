import type { ReactElement } from 'react';

import { useOrganizationProfileController } from './organization-profile.controller';
import { OrganizationProfileApiKeysPanel } from './organization-profile-api-keys-panel';
import { OrganizationProfileDeleteSection } from './organization-profile-delete-section';
import { OrganizationProfileDomainsSection } from './organization-profile-domains-section';
import { OrganizationProfileGeneralPanel } from './organization-profile-general-panel';
import { OrganizationProfileLeaveSection } from './organization-profile-leave-section';
import { OrganizationProfileMembersPanel } from './organization-profile-members-panel';
import { OrganizationProfileProfileSection } from './organization-profile-profile-section';
import { OrganizationProfileSecurityPanel } from './organization-profile-security-panel';
import { useOrganizationProfileSecurityGate } from './organization-profile-security-panel.controller';
import { OrganizationProfileView } from './organization-profile-view';

function OrganizationProfileRoot(): ReactElement | null {
  const controller = useOrganizationProfileController();
  // Gate the Security tab on the same decision the panel gates its body on; only pass
  // the slot once the gate is definitively `visible` so the tab never appears then hides.
  const securityGate = useOrganizationProfileSecurityGate();
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <OrganizationProfileView
      general={<OrganizationProfileGeneralPanel />}
      members={<OrganizationProfileMembersPanel />}
      apiKeys={<OrganizationProfileApiKeysPanel />}
      security={securityGate.status === 'visible' ? <OrganizationProfileSecurityPanel /> : undefined}
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
  SecurityPanel: OrganizationProfileSecurityPanel,
});
