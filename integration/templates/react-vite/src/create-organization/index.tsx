import { CreateOrganization } from '@clerk/react';

export default function Page() {
  return (
    <div>
      <CreateOrganization fallback={<>Loading create organization</>} />
    </div>
  );
}
