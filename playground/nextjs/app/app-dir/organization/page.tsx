import { OrganizationProfile, OrganizationSwitcher } from '@clerk/nextjs/app-beta';

export default function Page() {
  return (
    <div>
      <OrganizationSwitcher />
      <OrganizationProfile />
    </div>
  );
}
