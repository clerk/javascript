import type { ReactElement } from 'react';

import { OrganizationProfileGeneral } from '../panels/organization-profile-general';
import { DeleteOrganization } from '../sections/delete-organization';
import { LeaveOrganization } from '../sections/leave-organization';
import { useOrganizationProfileController } from './organization-profile.controller';
import { OrganizationProfileView } from './organization-profile-view';

export function OrganizationProfile(): ReactElement | null {
  const controller = useOrganizationProfileController();
  if (controller.status !== 'ready') {
    return null;
  }
  return <OrganizationProfileView general={<OrganizationProfileGeneral />} />;
}

// Standalone parts of the profile, exposed via the compound namespace (mirrors the
// Card.Root/Tabs.Root convention). Each part is self-gating and only needs a
// MosaicProvider ancestor, so consumers can render any of them on their own — there
// is no shared Root context to host.
OrganizationProfile.GeneralPanel = OrganizationProfileGeneral;
OrganizationProfile.LeaveSection = LeaveOrganization;
OrganizationProfile.DeleteSection = DeleteOrganization;
