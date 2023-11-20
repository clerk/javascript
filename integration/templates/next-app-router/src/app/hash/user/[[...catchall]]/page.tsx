import { UserProfile } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <UserProfile routing={'hash'} />
    </div>
  );
}
