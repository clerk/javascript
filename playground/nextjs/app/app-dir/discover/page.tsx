import { OrganizationList } from '@clerk/nextjs';

export default function Page() {
  return (
    <OrganizationList
      afterSelectPersonalUrl='/app-dir/user'
      afterSelectOrganizationUrl='/app-dir/organization'
    />
  );
}
