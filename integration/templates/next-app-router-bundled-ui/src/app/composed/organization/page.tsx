import {
  OrganizationProfileDeleteSection,
  OrganizationProfileGeneralPanel,
  OrganizationProfileLeaveSection,
  OrganizationProfileProfileSection,
  OrganizationProfileProvider,
} from '@clerk/ui/experimental';

import { EnsureActiveOrganization } from '../ensure-active-organization';

export default function Page() {
  return (
    <>
      <EnsureActiveOrganization />
      <OrganizationProfileProvider>
        <OrganizationProfileGeneralPanel>
          <OrganizationProfileProfileSection />
          <OrganizationProfileLeaveSection />
          <OrganizationProfileDeleteSection />
        </OrganizationProfileGeneralPanel>
      </OrganizationProfileProvider>
    </>
  );
}
