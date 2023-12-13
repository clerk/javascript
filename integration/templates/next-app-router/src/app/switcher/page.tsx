import { OrganizationSwitcher } from '@clerk/nextjs';

export default function Page() {
  return <OrganizationSwitcher hidePersonal={true} />;
}
