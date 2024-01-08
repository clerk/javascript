import { OrganizationProfile, OrganizationSwitcher } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <OrganizationSwitcher />
      <OrganizationProfile path='/app-dir/organization' />
    </div>
  );
}
