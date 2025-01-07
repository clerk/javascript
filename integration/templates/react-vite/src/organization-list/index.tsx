import { OrganizationList } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div>
      <OrganizationList fallback={<>Loading organization list</>} />
    </div>
  );
}
