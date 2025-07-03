import { APIKeys, OrganizationSwitcher } from '@clerk/nextjs';

export default function Page() {
  return (
    <>
      <OrganizationSwitcher />
      <APIKeys />
    </>
  );
}
