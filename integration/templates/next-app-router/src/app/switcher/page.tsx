import { OrganizationSwitcher } from '@clerk/nextjs';

export default function Page() {
  return (
    <OrganizationSwitcher
      hidePersonal={true}
      fallback={<>Loading organization switcher</>}
    />
  );
}
