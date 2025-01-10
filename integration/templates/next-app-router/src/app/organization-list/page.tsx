import { OrganizationList } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <OrganizationList fallback={<>Loading organization list</>} />
    </div>
  );
}
