import { OrganizationList, OrganizationSwitcher } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <OrganizationSwitcher fallback={<>Loading organization switcher</>} />
    </div>
  );
}
