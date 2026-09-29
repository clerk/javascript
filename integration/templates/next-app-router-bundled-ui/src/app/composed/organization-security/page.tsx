import { OrganizationProfileProvider, OrganizationProfileSecurityPanel } from '@clerk/ui/experimental';

import { EnsureActiveOrganization } from '../ensure-active-organization';

export default function Page() {
  return (
    <>
      <EnsureActiveOrganization />
      <OrganizationProfileProvider>
        <OrganizationProfileSecurityPanel />
      </OrganizationProfileProvider>
    </>
  );
}
