import { CreateOrganization } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <CreateOrganization fallback={<>Loading create organization</>} />
    </div>
  );
}
